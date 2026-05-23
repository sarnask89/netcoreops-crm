param(
  [string]$ListenAddress = "0.0.0.0",
  [int]$ListenPort = 2055,
  [string]$ForwardAddress = "10.0.87.224",
  [int]$ForwardPort = 2055,
  [string]$IngestUrl = "http://127.0.0.1:3000/api/netflow/ingest-aggregate",
  [string]$IngestToken = "",
  [int]$FlushSeconds = 10,
  [string]$LogPath = "$env:TEMP\netcoreops-netflow-udp-relay.log"
)

$ErrorActionPreference = "Stop"

$listenIp = [System.Net.IPAddress]::Parse($ListenAddress)
$forwardIp = [System.Net.IPAddress]::Parse($ForwardAddress)
$listenEndpoint = [System.Net.IPEndPoint]::new($listenIp, $ListenPort)
$forwardEndpoint = [System.Net.IPEndPoint]::new($forwardIp, $ForwardPort)
$client = [System.Net.Sockets.UdpClient]::new($listenEndpoint)
$client.Client.ReceiveTimeout = 1000
$sender = [System.Net.Sockets.UdpClient]::new()
$remote = [System.Net.IPEndPoint]::new([System.Net.IPAddress]::Any, 0)
$aggregates = @{}
$templates = @{}
$lastFlush = Get-Date

function Write-RelayLog([string]$Message) {
  $line = "$(Get-Date -Format o) $Message"
  Add-Content -LiteralPath $LogPath -Value $line
}

function Read-UInt16BE([byte[]]$Bytes, [int]$Offset) {
  return (($Bytes[$Offset] -shl 8) -bor $Bytes[$Offset + 1])
}

function Read-UInt32BE([byte[]]$Bytes, [int]$Offset) {
  return (($Bytes[$Offset] -shl 24) -bor ($Bytes[$Offset + 1] -shl 16) -bor ($Bytes[$Offset + 2] -shl 8) -bor $Bytes[$Offset + 3])
}

function Read-UIntBE([byte[]]$Bytes, [int]$Offset, [int]$Length) {
  [UInt64]$value = 0
  for ($i = 0; $i -lt $Length; $i++) {
    $value = ($value -shl 8) -bor $Bytes[$Offset + $i]
  }
  return $value
}

function Convert-UnixSecondsToIso([int64]$Seconds) {
  if ($Seconds -le 0) { return $null }
  return ([DateTimeOffset]::FromUnixTimeSeconds($Seconds)).UtcDateTime.ToString("o")
}

function Get-Aggregate([System.Net.IPEndPoint]$Remote, [int]$Version, [string]$ExportedAt, [Nullable[UInt32]]$Sequence, [Nullable[UInt32]]$SourceId) {
  $key = "$($Remote.Address)/v$Version"
  if (-not $aggregates.ContainsKey($key)) {
    $aggregates[$key] = [ordered]@{
      exporterAddress = $Remote.Address.ToString()
      version = $Version
      packetCount = 0
      recordCount = 0
      bytes = 0
      firstExportedAt = $ExportedAt
      lastExportedAt = $ExportedAt
      windowMs = $FlushSeconds * 1000
      lastSequence = $Sequence
      sourceIds = @()
      relayAddress = $ListenAddress
      interfaceFlows = @{}
    }
  }

  $aggregate = $aggregates[$key]
  if (-not $aggregate.firstExportedAt) { $aggregate.firstExportedAt = $ExportedAt }
  if ($ExportedAt) { $aggregate.lastExportedAt = $ExportedAt }
  if ($null -ne $Sequence) { $aggregate.lastSequence = $Sequence }
  if ($null -ne $SourceId -and -not ($aggregate.sourceIds -contains $SourceId)) {
    $aggregate.sourceIds = @($aggregate.sourceIds) + $SourceId
  }
  return $aggregate
}

function Add-InterfaceFlow($Aggregate, [string]$Direction, [UInt64]$IfIndex, [UInt64]$Bytes, [UInt64]$Packets) {
  if ($IfIndex -le 0) { return }
  $key = "$Direction`:$IfIndex"
  if (-not $Aggregate.interfaceFlows.ContainsKey($key)) {
    $Aggregate.interfaceFlows[$key] = [ordered]@{
      direction = $Direction
      ifIndex = [int64]$IfIndex
      bytes = 0
      packets = 0
      records = 0
    }
  }
  $flow = $Aggregate.interfaceFlows[$key]
  $flow.bytes += [int64]$Bytes
  $flow.packets += [int64]$Packets
  $flow.records += 1
}

function Read-NetflowV9Flowsets([byte[]]$Packet, [System.Net.IPEndPoint]$Remote, $Aggregate, [UInt32]$SourceId) {
  $offset = 20
  $templateScope = "$($Remote.Address):$SourceId"
  while ($offset + 4 -le $Packet.Length) {
    $flowSetId = Read-UInt16BE $Packet $offset
    $length = Read-UInt16BE $Packet ($offset + 2)
    if ($length -lt 4 -or $offset + $length -gt $Packet.Length) { break }

    if ($flowSetId -eq 0) {
      $templateOffset = $offset + 4
      $end = $offset + $length
      while ($templateOffset + 4 -le $end) {
        $templateId = Read-UInt16BE $Packet $templateOffset
        $fieldCount = Read-UInt16BE $Packet ($templateOffset + 2)
        $templateOffset += 4
        $fields = @()
        for ($i = 0; $i -lt $fieldCount -and $templateOffset + 4 -le $end; $i++) {
          $fields += [ordered]@{
            type = Read-UInt16BE $Packet $templateOffset
            length = Read-UInt16BE $Packet ($templateOffset + 2)
          }
          $templateOffset += 4
        }
        $templates["$templateScope`:$templateId"] = $fields
      }
    }
    elseif ($flowSetId -ge 256) {
      $fields = $templates["$templateScope`:$flowSetId"]
      if ($fields) {
        $recordLength = 0
        foreach ($field in $fields) { $recordLength += $field.length }
        if ($recordLength -gt 0) {
          $recordOffset = $offset + 4
          $end = $offset + $length
          while ($recordOffset + $recordLength -le $end) {
            [UInt64]$inputIf = 0
            [UInt64]$outputIf = 0
            [UInt64]$bytes = 0
            [UInt64]$packets = 0
            $fieldOffset = $recordOffset
            foreach ($field in $fields) {
              if ($fieldOffset + $field.length -gt $Packet.Length) { break }
              if ($field.type -eq 1) { $bytes = Read-UIntBE $Packet $fieldOffset $field.length }
              elseif ($field.type -eq 2) { $packets = Read-UIntBE $Packet $fieldOffset $field.length }
              elseif ($field.type -eq 10) { $inputIf = Read-UIntBE $Packet $fieldOffset $field.length }
              elseif ($field.type -eq 14) { $outputIf = Read-UIntBE $Packet $fieldOffset $field.length }
              $fieldOffset += $field.length
            }
            Add-InterfaceFlow $Aggregate "input" $inputIf $bytes $packets
            Add-InterfaceFlow $Aggregate "output" $outputIf $bytes $packets
            $recordOffset += $recordLength
          }
        }
      }
    }

    $offset += $length
  }
}

function Add-NetflowPacket([byte[]]$Packet, [System.Net.IPEndPoint]$Remote) {
  if ($Packet.Length -lt 4) { return }
  $version = Read-UInt16BE $Packet 0
  $recordCount = 0
  $exportedAt = $null
  $sequence = $null
  $sourceId = $null

  if ($version -eq 5 -and $Packet.Length -ge 24) {
    $recordCount = Read-UInt16BE $Packet 2
    $exportedAt = Convert-UnixSecondsToIso (Read-UInt32BE $Packet 8)
    $sequence = Read-UInt32BE $Packet 16
    $sourceId = Read-UInt32BE $Packet 20
  }
  elseif ($version -eq 9 -and $Packet.Length -ge 20) {
    $recordCount = Read-UInt16BE $Packet 2
    $exportedAt = Convert-UnixSecondsToIso (Read-UInt32BE $Packet 8)
    $sequence = Read-UInt32BE $Packet 12
    $sourceId = Read-UInt32BE $Packet 16
  }
  elseif ($version -eq 10 -and $Packet.Length -ge 16) {
    $recordCount = 0
    $exportedAt = Convert-UnixSecondsToIso (Read-UInt32BE $Packet 4)
    $sequence = Read-UInt32BE $Packet 8
    $sourceId = Read-UInt32BE $Packet 12
  }
  else {
    Write-RelayLog "unsupported bytes=$($Packet.Length) from=$($Remote.Address):$($Remote.Port) version=$version"
    return
  }

  $aggregate = Get-Aggregate $Remote $version $exportedAt $sequence $sourceId
  $aggregate.packetCount += 1
  $aggregate.recordCount += $recordCount
  $aggregate.bytes += $Packet.Length
  if ($version -eq 9) {
    Read-NetflowV9Flowsets $Packet $Remote $aggregate $sourceId
  }
}

function Flush-NetflowAggregates {
  if (-not $IngestUrl -or $aggregates.Count -eq 0) { return }
  $keys = @($aggregates.Keys)
  foreach ($key in $keys) {
    $aggregate = $aggregates[$key]
    try {
      $aggregate.interfaceFlows = @($aggregate.interfaceFlows.Values)
      $body = $aggregate | ConvertTo-Json -Depth 6 -Compress
      $headers = @{}
      if ($IngestToken) { $headers["x-netcoreops-netflow-token"] = $IngestToken }
      Invoke-RestMethod -Uri $IngestUrl -Method Post -ContentType "application/json" -Headers $headers -Body $body | Out-Null
      Write-RelayLog "ingested key=$key packets=$($aggregate.packetCount) bytes=$($aggregate.bytes)"
      $aggregates.Remove($key)
    }
    catch {
      Write-RelayLog "ingest-failed key=$key error=$($_.Exception.Message)"
    }
  }
}

Write-RelayLog "listening=$ListenAddress`:$ListenPort forward=$ForwardAddress`:$ForwardPort ingest=$IngestUrl token=$([bool]$IngestToken) pid=$PID"

try {
  while ($true) {
    try {
      $packet = $client.Receive([ref]$remote)
      if ($ForwardAddress) {
        [void]$sender.Send($packet, $packet.Length, $forwardEndpoint)
      }
      Add-NetflowPacket $packet $remote
    }
    catch [System.Net.Sockets.SocketException] {
      if ($_.Exception.SocketErrorCode -ne [System.Net.Sockets.SocketError]::TimedOut) { throw }
    }

    if (((Get-Date) - $lastFlush).TotalSeconds -ge $FlushSeconds) {
      Flush-NetflowAggregates
      $lastFlush = Get-Date
    }
  }
}
finally {
  Flush-NetflowAggregates
  $sender.Close()
  $client.Close()
  Write-RelayLog "stopped pid=$PID"
}

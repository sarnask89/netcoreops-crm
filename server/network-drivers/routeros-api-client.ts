import { Socket } from 'node:net'

export interface RouterOsClientOptions {
  host: string
  port: number
  username: string
  password: string
  timeoutMs?: number
}

export class RouterOsApiClient {
  private socket: Socket | null = null
  private buffer = Buffer.alloc(0)
  private waitingForData: (() => void) | null = null

  constructor(private options: RouterOsClientOptions) {}

  async connect() {
    if (this.socket) return

    this.socket = new Socket()
    this.socket.setTimeout(this.options.timeoutMs || 12000)
    this.socket.on('data', (chunk) => {
      const payload = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      this.buffer = Buffer.concat([this.buffer, payload])
      this.waitingForData?.()
      this.waitingForData = null
    })

    await new Promise<void>((resolve, reject) => {
      if (!this.socket) return reject(new Error('RouterOS socket not initialized'))
      const onError = (error: Error) => reject(error)
      this.socket.once('error', onError)
      this.socket.once('timeout', () => reject(new Error('RouterOS API timeout')))
      this.socket.connect(this.options.port, this.options.host, () => {
        this.socket?.off('error', onError)
        resolve()
      })
    })

    await this.write('/login', [`=name=${this.options.username}`, `=password=${this.options.password}`])
  }

  close() {
    this.socket?.destroy()
    this.socket = null
  }

  async write(command: string, args: string[] = []) {
    if (!this.socket) throw new Error('RouterOS API is not connected')

    for (const word of [command, ...args]) this.writeWord(word)
    this.writeWord('')

    const rows: Record<string, string>[] = []
    while (true) {
      const sentence = await this.readSentence()
      const reply = sentence[0]
      if (!reply) continue
      if (reply === '!re') rows.push(this.parseRow(sentence.slice(1)))
      if (reply === '!empty') continue
      if (reply === '!done') return rows
      if (reply === '!trap' || reply === '!fatal') {
        const row = this.parseRow(sentence.slice(1))
        throw new Error(row.message || row.category || reply)
      }
    }
  }

  private writeWord(word: string) {
    if (!this.socket) throw new Error('RouterOS API is not connected')
    const payload = Buffer.from(word, 'utf8')
    this.socket.write(Buffer.concat([this.encodeLength(payload.length), payload]))
  }

  private encodeLength(length: number) {
    if (length < 0x80) return Buffer.from([length])
    if (length < 0x4000) return Buffer.from([(length >> 8) | 0x80, length & 0xFF])
    if (length < 0x200000) return Buffer.from([(length >> 16) | 0xC0, (length >> 8) & 0xFF, length & 0xFF])
    if (length < 0x10000000) return Buffer.from([(length >> 24) | 0xE0, (length >> 16) & 0xFF, (length >> 8) & 0xFF, length & 0xFF])
    return Buffer.from([0xF0, (length >> 24) & 0xFF, (length >> 16) & 0xFF, (length >> 8) & 0xFF, length & 0xFF])
  }

  private async readSentence() {
    const words = []
    while (true) {
      const word = await this.readWord()
      if (word === '') return words
      words.push(word)
    }
  }

  private async readWord() {
    while (true) {
      const parsed = this.tryReadWord()
      if (parsed !== null) return parsed
      await this.waitForMoreData()
    }
  }

  private tryReadWord() {
    const length = this.tryReadLength()
    if (!length) return null
    const [byteCount, wordLength] = length
    if (this.buffer.length < byteCount + wordLength) return null

    const word = this.buffer.subarray(byteCount, byteCount + wordLength).toString('utf8')
    this.buffer = this.buffer.subarray(byteCount + wordLength)
    return word
  }

  private tryReadLength(): [number, number] | null {
    if (this.buffer.length < 1) return null
    const first = this.buffer[0]
    if (first === undefined) return null

    if ((first & 0x80) === 0x00) return [1, first]
    if ((first & 0xC0) === 0x80) {
      if (this.buffer.length < 2) return null
      return [2, ((first & ~0xC0) << 8) + this.buffer[1]!]
    }
    if ((first & 0xE0) === 0xC0) {
      if (this.buffer.length < 3) return null
      return [3, ((first & ~0xE0) << 16) + (this.buffer[1]! << 8) + this.buffer[2]!]
    }
    if ((first & 0xF0) === 0xE0) {
      if (this.buffer.length < 4) return null
      return [4, ((first & ~0xF0) << 24) + (this.buffer[1]! << 16) + (this.buffer[2]! << 8) + this.buffer[3]!]
    }
    if (this.buffer.length < 5) return null
    return [5, (this.buffer[1]! << 24) + (this.buffer[2]! << 16) + (this.buffer[3]! << 8) + this.buffer[4]!]
  }

  private async waitForMoreData() {
    if (!this.socket) throw new Error('RouterOS API is not connected')

    await new Promise<void>((resolve, reject) => {
      const socket = this.socket
      if (!socket) return reject(new Error('RouterOS API is not connected'))
      const cleanup = () => {
        socket.off('error', onError)
        socket.off('timeout', onTimeout)
        socket.off('close', onClose)
      }
      const onError = (error: Error) => {
        cleanup()
        reject(error)
      }
      const onTimeout = () => {
        cleanup()
        reject(new Error('RouterOS API timeout'))
      }
      const onClose = () => {
        cleanup()
        reject(new Error('RouterOS API connection closed'))
      }

      this.waitingForData = () => {
        cleanup()
        resolve()
      }
      socket.once('error', onError)
      socket.once('timeout', onTimeout)
      socket.once('close', onClose)
    })
  }

  private parseRow(words: string[]) {
    const row: Record<string, string> = {}
    for (const word of words) {
      const match = word.match(/^=([^=]+)=(.*)$/)
      if (!match) continue
      row[match[1]!] = match[2]!
    }
    return row
  }
}

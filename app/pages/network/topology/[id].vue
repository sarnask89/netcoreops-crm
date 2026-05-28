<script setup lang="ts">
interface NodeData {
  id: string
  inventoryId: string
  name: string
  nodeType: string
  status: string
  latitude: number | null
  longitude: number | null
  address: string | null
  customerDeviceCount: number
  equipmentCount: number
}

interface ConnectedLine {
  id: string
  inventoryId: string
  nodeStartId: string
  nodeEndId: string
  status: string
  lengthMeters: number | null
  fiberCount: number | null
}

interface ConnectedNode {
  id: string
  name: string
  nodeType: string
  status: string
  latitude: number | null
  longitude: number | null
  address: string | null
}

interface TopologyCustomerDevice {
  id: string
  hostname: string
  ipAddress: string | null
  macAddress: string | null
  status: string
  customer: { fullName: string }
  subscriptions: Array<{ status: string, tariff: { name: string } }>
}

interface EquipmentItem {
  id: string
  inventoryId: string
  hostname: string | null
  managementIp: string | null
  equipmentRole: string
  isOnline: boolean
  status: string
  model: { id: number, manufacturer: string, modelName: string } | null
  customerDevices: TopologyCustomerDevice[]
  onuCustomerDevices: TopologyCustomerDevice[]
}

interface NodeDetail {
  node: NodeData | null
  connectedLines: ConnectedLine[]
  connectedNodes: ConnectedNode[]
  equipment: EquipmentItem[]
}

const route = useRoute()
const nodeId = computed(() => route.params.id as string)

const { data } = await useFetch<{ success: boolean, data: NodeDetail }>(`/api/network/topology/${nodeId.value}`, {
  default: () => ({ success: false, data: { node: null, connectedLines: [], connectedNodes: [], equipment: [] } })
})

const miniContainer = ref<HTMLDivElement>()
const miniReady = ref(false)

const nodeTypeLabels: Record<string, string> = {
  SZKIELETOWY: 'Szkieletowy',
  DYSTRYBUCYJNY: 'Dystrybucyjny'
}

const statusColors: Record<string, string> = {
  ACTIVE: '#22c55e',
  PLANNED: '#a1a1aa',
  DECOMMISSIONED: '#ef4444'
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Aktywny',
  PLANNED: 'Planowany',
  DECOMMISSIONED: 'Wycofany'
}

function statusBadgeColor(status: string) {
  if (status === 'ACTIVE') return 'success'
  if (status === 'DECOMMISSIONED') return 'error'
  return 'neutral'
}

// ── Mini 3D Map ──

let miniMapInstance: import('maplibre-gl').Map | null = null

onMounted(async () => {
  if (data.value.data.node?.latitude && data.value.data.node?.longitude) {
    await initMiniMap()
  } else {
    miniReady.value = true
  }
})

onUnmounted(() => {
  if (miniMapInstance) {
    miniMapInstance.remove()
    miniMapInstance = null
  }
})

async function initMiniMap() {
  const ML = await import('maplibre-gl')

  // Start preloading Three.js in parallel with map creation
  const threePromise = import('three')
  const gltfLoaderPromise = import('three/addons/loaders/GLTFLoader.js')

  const node = data.value.data.node!
  const connected = data.value.data.connectedNodes
  const lines = data.value.data.connectedLines

  const centerLng = node.longitude!
  const centerLat = node.latitude!

  miniMapInstance = new ML.Map({
    container: miniContainer.value!,
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank">CARTO</a>'
        }
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
    },
    center: [centerLng, centerLat],
    zoom: 14,
    pitch: 50,
    bearing: 0,
    interactive: false
  })

  async function buildMiniScene() {
    const THREE = await threePromise
    const gltfMod = await gltfLoaderPromise
    const scene = new THREE.Scene()
    const camera = new THREE.Camera()
    let renderer!: import('three').WebGLRenderer

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const sun = new THREE.DirectionalLight(0xffffff, 0.8)
    sun.position.set(1, 0.5, 1)
    scene.add(sun)

    miniMapInstance!.addLayer({
      id: 'mini-3d',
      type: 'custom',
      renderingMode: '3d',
      onAdd(_m: import('maplibre-gl').Map, gl: WebGLRenderingContext | WebGL2RenderingContext) {
        renderer = new THREE.WebGLRenderer({
          canvas: miniMapInstance!.getCanvas(),
          context: gl,
          antialias: true
        })
        renderer.autoClear = false
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      },
      render(_gl: WebGLRenderingContext | WebGL2RenderingContext, options: { modelViewProjectionMatrix: ArrayLike<number> }) {
        camera.projectionMatrix = new THREE.Matrix4().fromArray(options.modelViewProjectionMatrix)
        renderer.state.reset()
        renderer.render(scene, camera)
      }
    } as unknown as import('maplibre-gl').CustomLayerInterface)

    // Load models
    const loader = new gltfMod.GLTFLoader()
    const modelPromises = {
      SZKIELETOWY: loader.loadAsync('/3d_models/server/server.gltf').then(g => g.scene).catch(() => null),
      DYSTRYBUCYJNY: loader.loadAsync('/3d_models/switch/switch.gltf').then(g => g.scene).catch(() => null),
      __default: loader.loadAsync('/3d_models/antenna/model.gltf').then(g => g.scene).catch(() => null)
    }
    const loaded = {
      SZKIELETOWY: await modelPromises.SZKIELETOWY,
      DYSTRYBUCYJNY: await modelPromises.DYSTRYBUCYJNY,
      __default: await modelPromises.__default
    }

    function getModel(type: string): import('three').Group | null {
      return loaded[type as keyof typeof loaded] || loaded.__default
    }

    function placeModel(
      targetNode: { latitude: number | null, longitude: number | null, nodeType: string, status: string }
    ) {
      if (targetNode.latitude == null || targetNode.longitude == null) return
      const coord = ML.MercatorCoordinate.fromLngLat([targetNode.longitude, targetNode.latitude], 0)
      const meterScale = coord.meterInMercatorCoordinateUnits()

      const group = new THREE.Group()
      group.position.set(coord.x, coord.y, 0)

      const model = getModel(targetNode.nodeType)
      if (model && model.children.length > 0) {
        const clone = model.clone(true)
        clone.scale.setScalar(meterScale * 30)
        group.add(clone)
      } else {
        const geo = new THREE.BoxGeometry(0.00002, 0.00003, 0.00002)
        const mat = new THREE.MeshStandardMaterial({ color: statusColors[targetNode.status] || 0x6b7280 })
        group.add(new THREE.Mesh(geo, mat))
      }

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.000015, 0.000022, 32),
        new THREE.MeshBasicMaterial({
          color: statusColors[targetNode.status] || 0x6b7280,
          transparent: true,
          opacity: targetNode.status === 'ACTIVE' ? 0.9 : 0.4,
          side: THREE.DoubleSide
        })
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.set(0, 0, 0.000002)
      group.add(ring)

      scene.add(group)
    }

    // Place central node
    placeModel(node)

    // Place connected nodes and edge tubes
    for (const line of lines) {
      const otherId = line.nodeStartId === node.id ? line.nodeEndId : line.nodeStartId
      const otherNode = connected.find(cn => cn.id === otherId)
      if (!otherNode) continue
      if (otherNode.latitude == null || otherNode.longitude == null) continue

      placeModel(otherNode)

      const nodeInMerc = ML.MercatorCoordinate.fromLngLat([node.longitude!, node.latitude!], 0)
      const otherInMerc = ML.MercatorCoordinate.fromLngLat([otherNode.longitude, otherNode.latitude], 0)

      const isStartFromNode = otherId === line.nodeStartId
      const fromCoord = isStartFromNode ? nodeInMerc : otherInMerc
      const toCoord = isStartFromNode ? otherInMerc : nodeInMerc

      const start = new THREE.Vector3(fromCoord.x, fromCoord.y, 0)
      const end = new THREE.Vector3(toCoord.x, toCoord.y, 0)
      const mid = new THREE.Vector3((fromCoord.x + toCoord.x) / 2, (fromCoord.y + toCoord.y) / 2, 0.00008)
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      const colorVal = statusColors[line.status] || '#6b7280'

      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 12, 0.00001, 5, false),
        new THREE.MeshStandardMaterial({ color: colorVal, transparent: true, opacity: line.status === 'ACTIVE' ? 0.7 : 0.3, depthWrite: false })
      )
      scene.add(tube)
    }
  }

  miniMapInstance.on('load', async () => {
    await buildMiniScene()
    miniReady.value = true
  })

  // Fallback timeout
  setTimeout(async () => {
    if (!miniReady.value && miniMapInstance) {
      await buildMiniScene()
      miniReady.value = true
    }
  }, 15000)
}

// Table columns
const equipmentColumns = [
  { accessorKey: 'inventoryId', header: 'Inwentarz' },
  { accessorKey: 'hostname', header: 'Hostname' },
  { accessorKey: 'managementIp', header: 'IP' },
  { accessorKey: 'equipmentRole', header: 'Rola' },
  { accessorKey: 'isOnline', header: 'Online' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'model.modelName', header: 'Model' },
  {
    id: 'customerDevices',
    header: 'Urządzenia klienta',
    cell: ({ row }: { row: { original: EquipmentItem } }) => row.original.customerDevices.length + row.original.onuCustomerDevices.length
  }
]

const linesColumns = [
  { accessorKey: 'inventoryId', header: 'Inwentarz' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'lengthMeters', header: 'Długość (m)' },
  { accessorKey: 'fiberCount', header: 'Włókna' }
]
</script>

<template>
  <UDashboardPanel v-if="data.data.node" id="network-topology-detail">
    <template #header>
      <UDashboardNavbar :title="data.data.node.name || 'Węzeł'">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            to="/network/topology"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="p-6 space-y-6">
      <!-- Node info card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">Informacje o węźle</span>
            <UBadge :color="statusBadgeColor(data.data.node.status)" variant="subtle">
              {{ statusLabels[data.data.node.status] || data.data.node.status }}
            </UBadge>
          </div>
        </template>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-muted-foreground block">Typ</span>
            <span class="font-medium">{{ nodeTypeLabels[data.data.node.nodeType] || data.data.node.nodeType }}</span>
          </div>
          <div>
            <span class="text-muted-foreground block">Status</span>
            <span class="font-medium">{{ statusLabels[data.data.node.status] || data.data.node.status }}</span>
          </div>
          <div>
            <span class="text-muted-foreground block">ID</span>
            <span class="font-medium">{{ data.data.node.inventoryId }}</span>
          </div>
          <div>
            <span class="text-muted-foreground block">Urządzenia klienta</span>
            <span class="font-medium">{{ data.data.node.customerDeviceCount }}</span>
          </div>
          <div v-if="data.data.node.address">
            <span class="text-muted-foreground block">Adres</span>
            <span class="font-medium">{{ data.data.node.address }}</span>
          </div>
          <div v-if="data.data.node.latitude && data.data.node.longitude">
            <span class="text-muted-foreground block">Współrzędne</span>
            <span class="font-medium">{{ data.data.node.latitude }}, {{ data.data.node.longitude }}</span>
          </div>
        </div>
      </UCard>

      <!-- Mini 3D map card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <span class="font-medium">Mapa 3D</span>
            <span v-if="data.data.connectedNodes.length > 0" class="text-xs text-muted-foreground">
              ({{ data.data.connectedNodes.length }} sąsiednich węzłów, {{ data.data.connectedLines.length }} łączy)
            </span>
          </div>
        </template>
        <ClientOnly>
          <div
            v-if="data.data.node.latitude && data.data.node.longitude"
            ref="miniContainer"
            class="w-full rounded overflow-hidden"
            :class="{ 'opacity-0': !miniReady }"
            style="height: 400px;"
          >
            <div v-if="!miniReady" class="flex items-center justify-center h-full bg-muted/30">
              <div class="flex flex-col items-center gap-2 text-muted-foreground">
                <span class="i-lucide-loader-circle animate-spin text-xl" />
                <span class="text-xs">Ładowanie...</span>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-60 bg-muted/30 rounded text-muted-foreground text-sm">
            Węzeł nie ma współrzędnych geograficznych
          </div>
        </ClientOnly>
      </UCard>

      <!-- Lines table -->
      <UCard>
        <template #header>
          <span class="font-medium">Łącza ({{ data.data.connectedLines.length }})</span>
        </template>
        <AppDataTable :data="data.data.connectedLines" :columns="linesColumns" />
      </UCard>

      <!-- Equipment table -->
      <UCard>
        <template #header>
          <span class="font-medium">Urządzenia ({{ data.data.equipment.length }})</span>
        </template>
        <AppDataTable :data="data.data.equipment" :columns="equipmentColumns" />
      </UCard>

      <UCard>
        <template #header>
          <span class="font-medium">Widoczność klientów per urządzenie</span>
        </template>
        <div class="space-y-3">
          <div
            v-for="item in data.data.equipment"
            :key="item.id"
            class="rounded-lg border p-3 text-sm"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="font-medium">
                  {{ item.inventoryId }}
                </div>
                <div class="text-muted-foreground">
                  {{ item.hostname || item.managementIp || item.equipmentRole }}
                </div>
              </div>
              <UBadge variant="subtle">
                {{ item.customerDevices.length + item.onuCustomerDevices.length }} urządzeń klienta
              </UBadge>
            </div>
            <div class="mt-3 grid gap-2 md:grid-cols-2">
              <div
                v-for="device in [...item.customerDevices, ...item.onuCustomerDevices]"
                :key="device.id"
                class="rounded-md bg-muted/40 p-2"
              >
                <div class="font-medium">
                  {{ device.customer.fullName }}
                </div>
                <div class="text-muted-foreground">
                  {{ device.hostname }} · {{ device.ipAddress || device.macAddress || 'brak IP/MAC' }}
                </div>
                <div class="text-muted-foreground">
                  {{ device.subscriptions.map(sub => sub.tariff.name).join(', ') || 'Brak aktywnych taryf' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UDashboardPanel>
</template>

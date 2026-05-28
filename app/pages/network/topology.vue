<script setup lang="ts">
import type { Map as MLMap, CustomLayerInterface } from 'maplibre-gl'
import type * as threeTypes from 'three'

interface TopologyNode {
  id: string
  label: string
  inventoryId: string
  type: string
  status: string
  latitude: number | null
  longitude: number | null
  address: string | null
  equipmentCount: number
  onlineCount: number
  customerDeviceCount: number
  equipmentRoles: string[]
}

interface TopologyEdge {
  id: string
  from: string
  to: string
  label: string | null
  status: string
  lengthMeters: number | null
  fiberCount: number | null
  statusOrder: number
}

interface TopologyData {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
}

const { data, status, refresh } = await useFetch<{ success: boolean, data: TopologyData }>('/api/network/topology', {
  default: () => ({ success: false, data: { nodes: [], edges: [] } })
})

const selectedNode = ref<TopologyNode | null>(null)
const infoPanelOpen = ref(false)
const mapContainer = ref<HTMLDivElement>()
const mapReady = ref(false)
const sceneReady = ref(false)

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

const nodeTypeOptions = ['SZKIELETOWY', 'DYSTRYBUCYJNY']

const typeFilter = ref<string>('all')
const statusFilter = ref<string>('all')

const filteredNodes = computed(() => {
  const all = data.value.data.nodes || []
  return all.filter((n) => {
    if (typeFilter.value !== 'all' && n.type !== typeFilter.value) return false
    if (statusFilter.value !== 'all' && n.status !== statusFilter.value) return false
    return true
  })
})

const filteredNodeIds = computed(() => new Set(filteredNodes.value.map(n => n.id)))

const filteredEdges = computed(() => {
  const all = data.value.data.edges || []
  return all.filter(e => filteredNodeIds.value.has(e.from) && filteredNodeIds.value.has(e.to))
})

function nodeBadgeColor(type: string) {
  return type === 'SZKIELETOWY' ? 'primary' : 'success'
}

function statusBadgeColor(status: string) {
  if (status === 'ACTIVE') return 'success'
  if (status === 'PLANNED') return 'neutral'
  if (status === 'DECOMMISSIONED') return 'error'
  return 'neutral'
}

async function refreshTopology() {
  await refresh()
  sceneReady.value = false
  mapReady.value = false
}

function findCenter(): { lat: number, lng: number } {
  const coords = data.value.data.nodes.filter(n => n.latitude != null && n.longitude != null)
  if (coords.length === 0) return { lat: 50.68, lng: 21.75 }
  const lat = coords.reduce((s, n) => s + n.latitude!, 0) / coords.length
  const lng = coords.reduce((s, n) => s + n.longitude!, 0) / coords.length
  return { lat, lng }
}

// ── Map + Three.js initialization ──

interface SceneObjects {
  nodeMeshes: Map<string, threeTypes.Object3D[]>
  edgeMeshes: threeTypes.Mesh[]
  nodeGroups: Map<string, threeTypes.Group>
}

let mapInstance: MLMap | null = null
let mlModule: typeof import('maplibre-gl') | null = null
let sceneData: SceneObjects | null = null

onMounted(async () => {
  await initMap()
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
  mlModule = null
  sceneData = null
})

async function initMap() {
  const ML = await import('maplibre-gl')
  mlModule = ML

  const center = findCenter()

  // Start preloading Three.js in parallel with map creation
  const threePromise = import('three')
  const gltfLoaderPromise = import('three/addons/loaders/GLTFLoader.js')

  mapInstance = new ML.Map({
    container: mapContainer.value!,
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
      layers: [{
        id: 'osm',
        type: 'raster',
        source: 'osm'
      }]
    },
    center: [center.lng, center.lat],
    zoom: 12,
    pitch: 55,
    bearing: 0,
    attributionControl: { compact: true }
  })

  // Navigation controls (zoom, compass)
  mapInstance.addControl(new ML.NavigationControl(), 'top-right')

  mapInstance.on('load', async () => {
    await initThreeScene(mapInstance!, threePromise, gltfLoaderPromise)
    mapReady.value = true
  })

  // Fallback: init scene even if map 'load' doesn't fire (e.g. tile server unreachable)
  setTimeout(async () => {
    if (!mapReady.value && mapInstance) {
      await initThreeScene(mapInstance!, threePromise, gltfLoaderPromise)
      mapReady.value = true
    }
  }, 15000)
}

async function initThreeScene(
  map: MLMap,
  threePromise: Promise<typeof import('three')>,
  gltfLoaderPromise: Promise<typeof import('three/addons/loaders/GLTFLoader.js')>
) {
  const THREE = await threePromise
  const gltfMod = await gltfLoaderPromise

  const scene = new THREE.Scene()
  const camera = new THREE.Camera()
  let renderer: import('three').WebGLRenderer | undefined

  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sun = new THREE.DirectionalLight(0xffffff, 0.9)
  sun.position.set(1, 0.5, 1)
  scene.add(sun)

  const topoLayer: CustomLayerInterface = {
    id: 'topo-3d',
    type: 'custom',
    renderingMode: '3d',
    onAdd(_m, gl: WebGLRenderingContext | WebGL2RenderingContext) {
      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
      })
      renderer.autoClear = false
      renderer.setPixelRatio(window.devicePixelRatio)
    },
    render(_gl: WebGLRenderingContext | WebGL2RenderingContext, options: { modelViewProjectionMatrix: ArrayLike<number> }) {
      camera.projectionMatrix = new THREE.Matrix4().fromArray(options.modelViewProjectionMatrix)
      if (renderer) {
        renderer.state.reset()
        renderer.render(scene, camera)
      }
    }
  }

  map.addLayer(topoLayer)

  // Load GLTF models
  const models = await loadModels(new gltfMod.GLTFLoader())
  const objects = buildScene(scene, map, THREE, models)
  sceneData = objects

  // Click handlers
  map.on('click', (e: { lngLat?: { lat: number, lng: number } }) => {
    if (!e.lngLat) return
    let closest: TopologyNode | null = null
    let minDeg = 0.002
    for (const node of filteredNodes.value) {
      if (node.latitude == null || node.longitude == null) continue
      const dlat = node.latitude - e.lngLat.lat
      const dlng = node.longitude - e.lngLat.lng
      const d = Math.sqrt(dlat * dlat + dlng * dlng)
      if (d < minDeg) {
        minDeg = d
        closest = node
      }
    }
    if (closest) {
      selectedNode.value = closest
      infoPanelOpen.value = true
    } else {
      selectedNode.value = null
      infoPanelOpen.value = false
    }
  })

  map.on('dblclick', (e: { lngLat?: { lat: number, lng: number } }) => {
    if (!e.lngLat) return
    for (const node of filteredNodes.value) {
      if (node.latitude == null || node.longitude == null) continue
      const dlat = node.latitude - e.lngLat.lat
      const dlng = node.longitude - e.lngLat.lng
      if (Math.sqrt(dlat * dlat + dlng * dlng) < 0.001) {
        void navigateTo(`/network/topology/${node.id}`)
        return
      }
    }
  })

  sceneReady.value = true
}

async function loadModels(loader: import('three/addons/loaders/GLTFLoader.js').GLTFLoader): Promise<Map<string, import('three').Group>> {
  const models = new Map<string, import('three').Group>()

  const entries = [
    { key: 'SZKIELETOWY', url: '/3d_models/server/server.gltf' },
    { key: 'DYSTRYBUCYJNY', url: '/3d_models/switch/switch.gltf' },
    { key: '__default', url: '/3d_models/antenna/model.gltf' }
  ]

  for (const entry of entries) {
    try {
      const gltf = await loader.loadAsync(entry.url)
      models.set(entry.key, gltf.scene)
    } catch {
      // Model might fail individually; fallback to box mesh
    }
  }

  return models
}

function buildScene(
  scene: import('three').Scene,
  map: MLMap,
  THREE: typeof import('three'),
  models: Map<string, import('three').Group>
): SceneObjects {
  const ML = mlModule!
  const nodeMeshes = new Map<string, import('three').Object3D[]>()
  const edgeMeshes: import('three').Mesh[] = []
  const nodeGroups = new Map<string, import('three').Group>()

  const validNodes = data.value.data.nodes.filter(n => n.latitude != null && n.longitude != null)
  const nodeMap = new Map(data.value.data.nodes.map(n => [n.id, n]))

  for (const node of validNodes) {
    const coord = ML.MercatorCoordinate.fromLngLat([node.longitude!, node.latitude!], 0)
    const meterScale = coord.meterInMercatorCoordinateUnits()

    const group = new THREE.Group()
    group.position.set(coord.x, coord.y, 0)

    const modelKey = models.has(node.type) ? node.type : '__default'
    let modelGroup: import('three').Group

    if (models.has(modelKey) && models.get(modelKey)!.children.length > 0) {
      modelGroup = models.get(modelKey)!.clone(true)
    } else {
      const geo = new THREE.BoxGeometry(0.00002, 0.00003, 0.00002)
      const mat = new THREE.MeshStandardMaterial({
        color: statusColors[node.status] || 0x6b7280
      })
      modelGroup = new THREE.Group()
      modelGroup.add(new THREE.Mesh(geo, mat))
    }

    const modelScale = meterScale * 50
    modelGroup.scale.setScalar(modelScale)

    const box = new THREE.Box3().setFromObject(modelGroup)
    const size = box.getSize(new THREE.Vector3())
    modelGroup.position.y += size.y / 2

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.00001, 0.000015, 32),
      new THREE.MeshBasicMaterial({
        color: statusColors[node.status] || 0x6b7280,
        transparent: true,
        opacity: node.status === 'ACTIVE' ? 0.9 : 0.4,
        side: THREE.DoubleSide
      })
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.set(0, 0, 0.000002)

    group.add(modelGroup)
    group.add(ring)
    scene.add(group)

    nodeMeshes.set(node.id, [modelGroup, ring])
    nodeGroups.set(node.id, group)
  }

  const validEdgeData = data.value.data.edges.filter((e) => {
    const from = nodeMap.get(e.from)
    const to = nodeMap.get(e.to)
    return from?.latitude != null && from?.longitude != null
      && to?.latitude != null && to?.longitude != null
  })

  for (const edge of validEdgeData) {
    const from = nodeMap.get(edge.from)!
    const to = nodeMap.get(edge.to)!

    const fromCoord = ML.MercatorCoordinate.fromLngLat([from.longitude!, from.latitude!], 0)
    const toCoord = ML.MercatorCoordinate.fromLngLat([to.longitude!, to.latitude!], 0)

    const startVec = new THREE.Vector3(fromCoord.x, fromCoord.y, 0)
    const endVec = new THREE.Vector3(toCoord.x, toCoord.y, 0)
    const midVec = new THREE.Vector3(
      (fromCoord.x + toCoord.x) / 2,
      (fromCoord.y + toCoord.y) / 2,
      0.00005
    )

    const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec)
    const colorVal = statusColors[edge.status] || '#6b7280'

    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 16, 0.000008, 5, false),
      new THREE.MeshStandardMaterial({
        color: colorVal,
        transparent: true,
        opacity: edge.status === 'ACTIVE' ? 0.8 : (edge.status === 'DECOMMISSIONED' ? 0.2 : 0.4),
        depthWrite: false
      })
    )
    scene.add(tube)
    edgeMeshes.push(tube)
  }

  applyFilterVisibility(nodeGroups, edgeMeshes)

  return { nodeMeshes, edgeMeshes, nodeGroups }
}

function applyFilterVisibility(
  nodeGroups: Map<string, import('three').Group>,
  edgeMeshes: import('three').Mesh[]
) {
  const visibleIds = filteredNodeIds.value
  const edgeData = data.value.data.edges

  for (const [id, group] of nodeGroups) {
    group.visible = visibleIds.has(id)
  }

  edgeMeshes.forEach((mesh, i) => {
    const edge = edgeData[i]
    if (!edge) return
    mesh.visible = visibleIds.has(edge.from) && visibleIds.has(edge.to)
  })
}

watch([filteredNodes, filteredEdges], () => {
  if (sceneData) {
    applyFilterVisibility(sceneData.nodeGroups, sceneData.edgeMeshes)
  }
}, { deep: true })

const router = useRouter()
function navigateTo(path: string) {
  void router.push(path)
}
</script>

<template>
  <UDashboardPanel id="network-topology">
    <template #header>
      <UDashboardNavbar title="Topologia sieci">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USelect
            v-model="typeFilter"
            :items="[{ label: 'Wszystkie typy', value: 'all' }, ...nodeTypeOptions.map(t => ({ label: nodeTypeLabels[t] || t, value: t }))]"
            class="w-40"
            size="sm"
          />
          <USelect
            v-model="statusFilter"
            :items="[{ label: 'Wszystkie statusy', value: 'all' }, ...Object.keys(statusColors).map(s => ({ label: statusLabels[s] || s, value: s }))]"
            class="w-44"
            size="sm"
          />
          <UButton
            color="primary"
            variant="outline"
            icon="i-lucide-refresh-cw"
            @click="refreshTopology"
          />
          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-map-pinned"
            label="Klienci"
            to="/network/customer-map"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="relative flex-1">
      <div v-if="!sceneReady" class="absolute inset-0 flex items-center justify-center bg-background z-20">
        <div class="flex flex-col items-center gap-2 text-muted-foreground">
          <span class="i-lucide-loader-circle animate-spin text-2xl" />
          <span class="text-sm">Ładowanie mapy 3D...</span>
        </div>
      </div>

      <ClientOnly>
        <div ref="mapContainer" class="h-full w-full" style="min-height: calc(100vh - 160px);" />
      </ClientOnly>

      <!-- Legend -->
      <div class="absolute top-3 left-3 bg-background/90 backdrop-blur border rounded-lg p-3 shadow-md text-sm space-y-2 z-10">
        <div class="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Legenda
        </div>
        <div v-for="(label, type) in nodeTypeLabels" :key="type" class="flex items-center gap-2">
          <span
            class="w-5 h-5 shrink-0 rounded"
            :style="{ backgroundColor: type === 'SZKIELETOWY' ? '#3b82f6' : '#10b981' }"
          />
          <span class="text-xs">{{ label }} ({{ type }})</span>
        </div>
        <div class="pt-1 border-t mt-1">
          <div class="flex items-center gap-2 text-xs">
            <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: statusColors.ACTIVE }" />
            <span>Aktywny</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="w-3 h-3 rounded-full shrink-0" :style="{ opacity: 0.5, backgroundColor: statusColors.PLANNED }" />
            <span>Planowany</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="w-3 h-3 rounded-full shrink-0" :style="{ opacity: 0.3, backgroundColor: statusColors.DECOMMISSIONED }" />
            <span>Wycofany</span>
          </div>
        </div>
        <div class="text-xs text-muted-foreground pt-1">
          <span class="i-lucide-mouse-pointer-2 inline-block w-3 h-3" /> Kliknij — podgląd
          <br>
          <span class="i-lucide-mouse-pointer-click inline-block w-3 h-3" /> 2x kliknij — szczegóły
        </div>
      </div>

      <!-- Bottom stats -->
      <div class="absolute bottom-3 left-3 bg-background/90 backdrop-blur border rounded-lg p-3 shadow-md text-sm z-10">
        <div class="text-xs text-muted-foreground">
          Węzły: {{ data.data.nodes.length }} | Łącza: {{ data.data.edges.length }} |
          <span v-if="!status || status === 'success'" class="text-green-500">&#9679;</span>
          <span v-else class="text-red-500">&#9679;</span>
          {{ status === 'success' ? 'gotowe' : status }}
        </div>
      </div>

      <!-- Info panel -->
      <USlideover v-model:open="infoPanelOpen">
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ selectedNode?.label }}
          </h3>
        </template>
        <template v-if="selectedNode" #body>
          <div class="space-y-4 p-4">
            <UCard>
              <template #header>
                <span class="font-medium">Informacje o węźle</span>
              </template>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Typ</span>
                  <UBadge
                    :color="nodeBadgeColor(selectedNode.type)"
                    variant="subtle"
                  >
                    {{ nodeTypeLabels[selectedNode.type] || selectedNode.type }}
                  </UBadge>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Status</span>
                  <UBadge
                    :color="statusBadgeColor(selectedNode.status)"
                    variant="subtle"
                  >
                    {{ statusLabels[selectedNode.status] || selectedNode.status }}
                  </UBadge>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Urządzenia</span>
                  <span>{{ selectedNode.equipmentCount }} ({{ selectedNode.onlineCount }} online)</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Urządzenia klienta</span>
                  <span>{{ selectedNode.customerDeviceCount }}</span>
                </div>
                <div v-if="selectedNode.address" class="flex justify-between gap-4">
                  <span class="text-muted-foreground">Adres</span>
                  <span class="text-right">{{ selectedNode.address }}</span>
                </div>
                <div v-if="selectedNode.latitude && selectedNode.longitude" class="flex justify-between gap-4">
                  <span class="text-muted-foreground">Współrzędne</span>
                  <span class="text-right">{{ selectedNode.latitude }}, {{ selectedNode.longitude }}</span>
                </div>
                <div v-if="selectedNode.equipmentRoles.length > 0" class="flex justify-between">
                  <span class="text-muted-foreground">Role urządzeń</span>
                  <div class="flex flex-wrap gap-1">
                    <UBadge
                      v-for="role in selectedNode.equipmentRoles"
                      :key="role"
                      size="xs"
                      variant="subtle"
                    >
                      {{ role }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </UCard>

            <UButton
              color="primary"
              :to="`/network/topology/${selectedNode.id}`"
              label="Szczegóły węzła"
              icon="i-lucide-external-link"
              trailing
              class="w-full"
            />
          </div>
        </template>
      </USlideover>
    </div>
  </UDashboardPanel>
</template>

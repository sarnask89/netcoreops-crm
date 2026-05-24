export const ALL_SECTION_KEYS = [
  'dashboard',
  'network',
  'network.ftth',
  'network.imports',
  'crm',
  'billing',
  'automation',
  'system',
  'pit',
  'settings',
  'settings.users',
  'settings.security'
] as const

export type SectionKey = typeof ALL_SECTION_KEYS[number]

export interface AccessPrincipal {
  isAdmin: boolean
  permissions: string[]
  actions?: string[]
}

export interface PermissionNavigationItem {
  label?: string
  section?: string
  children?: PermissionNavigationItem[]
  [key: string]: unknown
}

export interface PermissionMenuItem {
  label?: string
  permission?: string
  disabled?: boolean
  [key: string]: unknown
}

const pathSections: Array<[RegExp, SectionKey]> = [
  [/^\/(?:api\/)?network\/ftth(?:\/|$)/, 'network.ftth'],
  [/^\/(?:api\/)?ftth(?:\/|$)/, 'network.ftth'],
  [/^\/(?:api\/)?network\/imports(?:\/|$)/, 'network.imports'],
  [/^\/(?:api\/)?import(?:\/|$)/, 'network.imports'],
  [/^\/(?:api\/)?network(?:\/|$)/, 'network'],
  [/^\/(?:api\/)?crm(?:\/|$)/, 'crm'],
  [/^\/(?:api\/)?customers(?:\/|$)/, 'crm'],
  [/^\/(?:api\/)?billing(?:\/|$)/, 'billing'],
  [/^\/(?:api\/)?automation(?:\/|$)/, 'automation'],
  [/^\/(?:api\/)?system(?:\/|$)/, 'system'],
  [/^\/(?:api\/)?pit(?:\/|$)/, 'pit'],
  [/^\/settings\/members(?:\/|$)/, 'settings.users'],
  [/^\/api\/members(?:\/|$)/, 'settings.users'],
  [/^\/api\/authz(?:\/|$)/, 'settings.users'],
  [/^\/settings\/security(?:\/|$)/, 'settings.security'],
  [/^\/api\/account\/password(?:\/|$)/, 'settings.security'],
  [/^\/settings(?:\/|$)/, 'settings'],
  [/^\/api\/account(?:\/|$)/, 'settings'],
  [/^\/api\/dashboard(?:\/|$)/, 'dashboard'],
  [/^\/$/, 'dashboard']
]

export function sectionForPath(pathname: string): SectionKey | null {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return pathSections.find(([pattern]) => pattern.test(normalized))?.[1] || null
}

export function canAccessSection(principal: AccessPrincipal, section: string | null | undefined) {
  if (!section) return true
  if (principal.isAdmin) return true
  return principal.permissions.includes(section)
}

export function canUseAction(principal: AccessPrincipal, permission: string | null | undefined) {
  if (!permission) return true
  if (principal.isAdmin) return true
  return (principal.actions || []).includes(permission)
}

export function filterNavigationItems<T extends PermissionNavigationItem>(groups: T[][], principal: AccessPrincipal): T[][] {
  return groups
    .map(group => group
      .map(item => filterNavigationItem(item, principal))
      .filter((item): item is T => Boolean(item)))
    .filter(group => group.length > 0)
}

function filterNavigationItem<T extends PermissionNavigationItem>(item: T, principal: AccessPrincipal): T | null {
  const children = item.children
    ?.map(child => filterNavigationItem(child, principal))
    .filter((child): child is PermissionNavigationItem => Boolean(child))

  if (children?.length) {
    return { ...item, children } as T
  }

  if (!canAccessSection(principal, item.section)) return null
  return item
}

export function filterRowContextItems<T extends PermissionMenuItem>(groups: T[][], principal: AccessPrincipal): T[][] {
  return groups
    .map(group => group.filter(item => canUseAction(principal, item.permission)))
    .filter(group => group.length > 0)
}

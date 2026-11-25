import { useEventListener } from 'runed'

// Responsive layout store for tiled/narrow windows
// Three modes: full (>1024px), medium (768-1024px), narrow (<768px)

export type LayoutMode = 'full' | 'medium' | 'narrow'
export type ResponsiveView = 'default' | 'viewer' | 'sidebar'

let layoutMode = $state<LayoutMode>('full')
let responsiveView = $state<ResponsiveView>('default')

export function initLayout() {
  const narrow = window.matchMedia('(max-width: 767px)')
  const medium = window.matchMedia('(max-width: 1024px)')

  function updateMode() {
    layoutMode = narrow.matches ? 'narrow' : medium.matches ? 'medium' : 'full'
    if (layoutMode === 'full') responsiveView = 'default'
  }

  updateMode()
  useEventListener(narrow, 'change', updateMode)
  useEventListener(medium, 'change', updateMode)
}

export function getLayoutMode(): LayoutMode {
  return layoutMode
}

export function getResponsiveView(): ResponsiveView {
  return responsiveView
}

export function isResponsive(): boolean {
  return layoutMode !== 'full'
}

export function showViewer() {
  if (layoutMode === 'full') return
  responsiveView = 'viewer'
}

export function hideViewer() {
  if (layoutMode === 'full') return
  responsiveView = 'default'
}

export function showSidebar() {
  if (layoutMode !== 'narrow') return
  responsiveView = 'sidebar'
}

export function hideSidebar() {
  if (layoutMode !== 'narrow') return
  if (responsiveView === 'sidebar') {
    responsiveView = 'default'
  }
}

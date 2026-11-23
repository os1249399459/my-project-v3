/**
 * Layout state: collapsed sidebar, persisted across reloads.
 *
 * Persistence is done by hand rather than through a plugin: it is six lines,
 * it keeps the persisted key and shape explicit, and it avoids a dependency
 * whose `persist` option is invisible to this project's type-check.
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'admin-console:layout'

interface PersistedLayout {
  collapsed: boolean
}

function readPersisted(): PersistedLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { collapsed: false }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null && 'collapsed' in parsed) {
      return { collapsed: Boolean((parsed as PersistedLayout).collapsed) }
    }
  } catch {
    // Corrupted storage must not break boot; fall back to the default.
  }
  return { collapsed: false }
}

export const useLayoutStore = defineStore('layout', () => {
  const collapsed = ref(readPersisted().collapsed)
  const sidebarWidth = computed(() => (collapsed.value ? '64px' : '220px'))

  function toggleSidebar(): void {
    collapsed.value = !collapsed.value
  }

  watch(collapsed, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed: value }))
    } catch {
      // Private mode / quota: persistence is a nicety, not a requirement.
    }
  })

  return { collapsed, sidebarWidth, toggleSidebar }
})

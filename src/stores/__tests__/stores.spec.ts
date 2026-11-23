import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSessionStore } from '../session'
import { useLayoutStore } from '../layout'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('session store', () => {
  it('starts unauthenticated', () => {
    const session = useSessionStore()
    expect(session.isAuthenticated).toBe(false)
    expect(session.displayName).toBe('未登录')
  })

  it('signs in and persists the token only', () => {
    const session = useSessionStore()
    session.signIn('tkn', { id: '1', name: 'Admin', role: 'admin' })
    expect(session.isAuthenticated).toBe(true)
    expect(session.displayName).toBe('Admin')
    expect(localStorage.getItem('access_token')).toBe('tkn')
  })

  it('sign out clears both the token and the profile', () => {
    const session = useSessionStore()
    session.signIn('tkn', { id: '1', name: 'Admin', role: 'admin' })
    session.signOut()
    expect(session.isAuthenticated).toBe(false)
    expect(session.user).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
  })
})

describe('layout store', () => {
  it('toggles the sidebar and reports its width', () => {
    const layout = useLayoutStore()
    expect(layout.collapsed).toBe(false)
    expect(layout.sidebarWidth).toBe('220px')

    layout.toggleSidebar()
    expect(layout.collapsed).toBe(true)
    expect(layout.sidebarWidth).toBe('64px')
  })
})

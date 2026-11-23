/** Session state: token in localStorage, profile in memory only. */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SessionUser {
  id: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  avatar?: string
}

/**
 * Session state. `token` lives in localStorage because the axios interceptor
 * reads it synchronously; the user object stays in memory so a stale token
 * cannot resurrect an old profile.
 */
export const useSessionStore = defineStore('session', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const user = ref<SessionUser | null>(null)

  const isAuthenticated = computed(() => token.value !== null)
  const displayName = computed(() => user.value?.name ?? '未登录')

  function setToken(value: string | null): void {
    token.value = value
    if (value === null) localStorage.removeItem('access_token')
    else localStorage.setItem('access_token', value)
  }

  function signIn(nextToken: string, nextUser: SessionUser): void {
    setToken(nextToken)
    user.value = nextUser
  }

  function signOut(): void {
    setToken(null)
    user.value = null
  }

  return { token, user, isAuthenticated, displayName, setToken, signIn, signOut }
})

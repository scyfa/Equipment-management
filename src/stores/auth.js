import { computed, reactive } from 'vue'

const TOKEN_KEY = 'mesbid_token'

function loadUser() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export const authState = reactive({
  user: loadUser()
})

export function setUser(user) {
  authState.user = user
  if (user) localStorage.setItem(TOKEN_KEY, JSON.stringify(user))
  else localStorage.removeItem(TOKEN_KEY)
}

export function logout() {
  setUser(null)
}

export const currentUser = computed(() => authState.user)
export const isLoggedIn = computed(() => !!authState.user)
export const currentRole = computed(() => authState.user?.role || '')

export function hasRole(...roles) {
  return !!authState.user && roles.includes(authState.user.role)
}

/** 各角色控制台首页 */
export function consoleHome(role) {
  if (role === 'admin') return '/console/admin'
  if (role === 'tenderer') return '/console/tenderer/tenders'
  if (role === 'supplier') return '/console/supplier/bids'
  return '/'
}

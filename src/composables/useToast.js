import { reactive } from 'vue'

let seq = 0

export const toastState = reactive({
  items: []
})

export function toast(message, type = 'success', duration = 2400) {
  const id = ++seq
  toastState.items.push({ id, message, type })
  setTimeout(() => {
    const idx = toastState.items.findIndex((i) => i.id === id)
    if (idx > -1) toastState.items.splice(idx, 1)
  }, duration)
}

toast.success = (msg) => toast(msg, 'success')
toast.error = (msg) => toast(msg, 'error')
toast.info = (msg) => toast(msg, 'info')

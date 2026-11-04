import { reactive } from 'vue'

export const confirmState = reactive({
  visible: false,
  title: '操作确认',
  message: '',
  confirmText: '确定',
  danger: false,
  resolver: null
})

export function confirm({ title = '操作确认', message = '', confirmText = '确定', danger = false }) {
  return new Promise((resolve) => {
    confirmState.visible = true
    confirmState.title = title
    confirmState.message = message
    confirmState.confirmText = confirmText
    confirmState.danger = danger
    confirmState.resolver = resolve
  })
}

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/composables/useService' {
  export function useService(): any
}

declare module '@/composables/useApi' {
  const api: any
  export default api
}

declare module '@/composables/useAuth' {
  export function useAuth(): any
}

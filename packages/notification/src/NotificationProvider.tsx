import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface NotificationContextProps {
  classNames?: {
    notice?: string
    list?: string
  }
}
export const NotificationContext: InjectionKey<NotificationContextProps> = Symbol('NotificationContext')

export function useNotificationProvider(props: NotificationContextProps) {
  provide(NotificationContext, props)
  return props
}

export function useNotificationContext() {
  return inject(NotificationContext, {})
}

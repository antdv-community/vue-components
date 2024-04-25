import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export type QueueCreate = (appendFunc: VoidFunction) => void
export const QueueContextKey: InjectionKey<ComputedRef<QueueCreate>> = Symbol('QueueContextKey')
export function useContextProvider(appendFunc: ComputedRef<QueueCreate>) {
  const queueCreate = appendFunc
  provide(QueueContextKey, queueCreate)
  return queueCreate
}

export function useContextState() {
  return inject(QueueContextKey, undefined)
}

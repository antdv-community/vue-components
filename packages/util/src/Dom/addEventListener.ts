export type WindowEventName = keyof WindowEventMap
export type DocumentEventName = keyof DocumentEventMap
export function addEventListener<E extends WindowEventName = WindowEventName>(target: Window, eventType: E, cb: WindowEventMap[E], option?: AddEventListenerOptions): {
  remove: () => void
}
export function addEventListener<E extends DocumentEventName = DocumentEventName>(target: Document, eventType: E, cb: DocumentEventMap[E], option?: AddEventListenerOptions): {
  remove: () => void
}

export function addEventListener(...args: any[]) {
  const [target, eventType, cb, option] = args
  if (target?.addEventListener)
    target.addEventListener(eventType as any, cb, option)

  return {
    remove() {
      target?.removeEventListener?.(eventType as any, cb, option)
    },
  }
}

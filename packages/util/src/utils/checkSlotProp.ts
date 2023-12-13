export function checkSlotProp(props: Record<string, any>, slots: Record<string, any>, name: string, ...args: any[]) {
  if (slots[name])
    return slots[name]?.(...args)
  if (name in props) {
    if (typeof props[name] === 'function')
      return props[name]?.(...args)
    return props[name]
  }
  return null
}

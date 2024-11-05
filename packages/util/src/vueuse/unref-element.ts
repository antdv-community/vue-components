import type { ComponentPublicInstance, MaybeRef } from 'vue'
import { toValue } from 'vue'

export type VueInstance = ComponentPublicInstance
/**
 * Get the dom element of a ref of element or Vue component instance
 *
 * @param elRef
 */
export function unrefElement<T extends Element>(elRef: MaybeRef<T>): T {
  const plain = toValue(elRef)
  return (plain as VueInstance)?.$el ?? plain
}

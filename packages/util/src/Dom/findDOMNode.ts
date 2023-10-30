import type { ComponentPublicInstance, MaybeRef } from 'vue'
import { unref } from 'vue'

export function isDOM(node: any): node is HTMLElement | SVGElement {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element
  // Since XULElement is also subclass of Element, we only need HTMLElement and SVGElement
  return node instanceof HTMLElement || node instanceof SVGElement
}

/**
 * Return if a node is a DOM node. Else will return by `findDOMNode`
 */
export default function findDOMNode<T = Element | Text>(
  _node: MaybeRef<ComponentPublicInstance | HTMLElement | SVGElement>,
): T {
  const node = unref(_node)
  if (isDOM(node))
    return (node as unknown) as T
  else if (node && '$el' in node)
    return (node.$el as unknown) as T

  return null
}

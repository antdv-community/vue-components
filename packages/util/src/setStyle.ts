import type { CSSProperties } from 'vue'

export interface SetStyleOptions {
  element?: HTMLElement
}

/**
 * Easy to set element style, return previous style
 * IE browser compatible(IE browser doesn't merge overflow style, need to set it separately)
 * https://github.com/ant-design/ant-design/issues/19393
 *
 */

function setStyle(
  style: CSSProperties,
  options: SetStyleOptions = {},
): CSSProperties {
  if (!style)
    return {}

  const { element = document.body } = options
  const oldStyle: CSSProperties = {}

  const styleKeys = Object.keys(style)

  // IE browser compatible
  styleKeys.forEach((key: any) => {
    oldStyle[key] = element.style[key]
  })

  styleKeys.forEach((key: any) => {
    (element as any).style[key] = style[key]
  })

  return oldStyle
}

export default setStyle

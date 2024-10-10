import canUseDom from './canUseDom'

function isStyleNameSupport(styleName: string | string[]): boolean {
  if (canUseDom() && window.document.documentElement) {
    const styleNameList = Array.isArray(styleName) ? styleName : [styleName]
    const { documentElement } = window.document

    return styleNameList.some(name => name in documentElement.style)
  }
  return false
}

function isStyleValueSupport(styleName: string, value: any) {
  if (!isStyleNameSupport(styleName))
    return false

  const ele: any = document.createElement('div')
  const origin = ele.style[styleName]
  ele.style[styleName] = value
  return ele.style[styleName] !== origin
}

export function isStyleSupport(styleName: string | string[]): boolean
export function isStyleSupport(styleName: string, styleValue: any): boolean

export function isStyleSupport(styleName: string | string[], styleValue?: any) {
  if (!Array.isArray(styleName) && styleValue !== undefined)
    return isStyleValueSupport(styleName, styleValue)

  return isStyleNameSupport(styleName)
}

import { Fragment } from 'vue'

export function filterEmpty(children = []) {
  const res = []
  children.forEach((child) => {
    if (Array.isArray(child))
      res.push(...child)
    else if (child?.type === Fragment)
      res.push(...filterEmpty(child.children))
    else
      res.push(child)
  })
  return res.filter(c => !isEmptyElement(c))
}

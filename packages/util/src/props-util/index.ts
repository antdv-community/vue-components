import { Fragment } from 'vue'

export function isEmptyElement(c: any) {
  return (
    c
    && (c.type === Comment
    || (c.type === Fragment && c.children.length === 0)
    || (c.type === Text && c.children.trim() === ''))
  )
}
export function filterEmpty(children: any[] = []) {
  const res: any[] = []
  children.forEach((child: any) => {
    if (Array.isArray(child))
      res.push(...child)
    else if (child?.type === Fragment)
      res.push(...filterEmpty(child.children))
    else
      res.push(child)
  })
  return res.filter(c => !isEmptyElement(c))
}

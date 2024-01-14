import type { RenderFunc, SharedConfig } from '../interface.ts'
import Item from '../Item.tsx'

export default function useChildren<T>(list: T[], startIndex: number, endIndex: number, scrollWidth: number, setNodeRef: (item: T, element: HTMLElement) => void, renderFunc: RenderFunc<T>, { getKey }: SharedConfig<T>) {
  console.log(startIndex, endIndex)
  return list.slice(startIndex, endIndex + 1).map((item, index) => {
    const eleIndex = startIndex + index
    const node = renderFunc({
      item,
      index: eleIndex,
      props: {
        style: {
          width: `${scrollWidth}px`,
        },
      },
    })
    const key = getKey(item, eleIndex)
    return (
      <Item key={key} setRef={ele => setNodeRef(item, ele)}>
        {node}
      </Item>
    )
  })
}

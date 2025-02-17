import type {
  CollapsePanelProps,
  CollapseProps,
  ItemType,
  Key,
} from '../interface'
import CollapsePanel from '../Panel'

type Props = Pick<
  CollapsePanelProps,
  | 'prefixCls'
  | 'onItemClick'
  | 'openMotion'
  | 'expandIcon'
  | 'classNames'
  | 'styles'
> &
Pick<CollapseProps, 'accordion' | 'collapsible' | 'destroyInactivePanel'> & {
  activeKey: Key[]
}

function convertItemsToNodes(items: ItemType[], props: Props) {
  const {
    prefixCls,
    accordion,
    collapsible,
    destroyInactivePanel,
    onItemClick,
    activeKey,
    openMotion,
    expandIcon,
    classNames: collapseClassNames,
    styles,
  } = props

  return items.map((item, index) => {
    const {
      label,
      key: rawKey,
      collapsible: rawCollapsible,
      onItemClick: rawOnItemClick,
      destroyInactivePanel: rawDestroyInactivePanel,
      ...restProps
    } = item

    const key = String(rawKey ?? index)
    const mergeCollapsible = rawCollapsible ?? collapsible
    const mergeDestroyInactivePanel
      = rawDestroyInactivePanel ?? destroyInactivePanel

    const handleItemClick = (value: Key) => {
      if (mergeCollapsible === 'disabled')
        return

      onItemClick?.(value)
      rawOnItemClick?.(value)
    }

    let isActive = false

    if (accordion) {
      isActive = activeKey?.[0] === key
    }
    else {
      isActive = activeKey.includes(key)
    }

    return (
      <CollapsePanel
        {...restProps}
        classNames={collapseClassNames}
        styles={styles}
        prefixCls={prefixCls}
        key={key}
        panelKey={key}
        isActive={isActive}
        accordion={accordion}
        openMotion={openMotion}
        expandIcon={expandIcon}
        header={label}
        collapsible={mergeCollapsible}
        onItemClick={handleItemClick}
        destroyInactivePanel={mergeDestroyInactivePanel}
      />
    )
  })
}

export function useItems(items?: ItemType[], props?: Props) {
  if (Array.isArray(items)) {
    return convertItemsToNodes(items, props!)
  }
}

import type { RendererElement, RendererNode, VNode, VNodeNormalizedChildren } from 'vue'
import type {
  CollapsePanelProps,
  CollapseProps,
  ItemType,
  Key,
} from '../interface'
import { flattenChildren, isEmptyElement } from '@v-c/util/dist/props-util'
import { cloneElement } from '@v-c/util/dist/vnode'
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

/**
 * @deprecated The next major version will be removed
 */
function getNewChild(
  child: VNode<RendererNode, RendererElement, CollapsePanelProps>,
  index: number,
  props: Props,
) {
  if (isEmptyElement(child) || !child)
    return null

  if (
    typeof child === 'boolean'
    || typeof child === 'number'
    || typeof child === 'string'
  ) {
    return child
  }

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

  const key = child.key || String(index)

  const {
    header,
    headerClass,
    destroyInactivePanel: childDestroyInactivePanel,
    collapsible: childCollapsible,
    onItemClick: childOnItemClick,
  } = child.props || {}

  let isActive = false
  if (accordion) {
    isActive = activeKey[0] === key
  }
  else {
    isActive = activeKey.includes(key as Key)
  }

  const mergeCollapsible = childCollapsible ?? collapsible

  const handleItemClick = (value: Key) => {
    if (mergeCollapsible === 'disabled')
      return
    onItemClick?.(value)
    childOnItemClick?.(value)
  }

  const childProps = {
    key,
    panelKey: key,
    header,
    headerClass,
    classNames: collapseClassNames,
    styles,
    isActive,
    prefixCls,
    destroyInactivePanel: childDestroyInactivePanel ?? destroyInactivePanel,
    openMotion,
    accordion,
    children: child.props?.children,
    onItemClick: handleItemClick,
    expandIcon,
    collapsible: mergeCollapsible,
  }

  Object.keys(childProps).forEach((propName) => {
    if (
      typeof childProps[propName as keyof typeof childProps] === 'undefined'
    ) {
      delete childProps[propName as keyof typeof childProps]
    }
  })

  return cloneElement(child, childProps)
}

export function useItems(items?: ItemType[], children?: () => VNode | VNodeNormalizedChildren, props?: Props) {
  if (Array.isArray(items)) {
    return convertItemsToNodes(items, props!)
  }

  return flattenChildren(children?.()).map((target, index) => getNewChild(target, index, props!))
}

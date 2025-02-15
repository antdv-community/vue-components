import type {
  CollapsePanelProps,
  CollapseProps,
  ItemType,
  Key,
} from '../interface'

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
  // TODO:
}

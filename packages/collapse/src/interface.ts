import type { VueNode } from '@v-c/util/dist/type'
import type {
  CSSProperties,
  ExtractPropTypes,
  PropType,
  Ref,
  TransitionProps,
  VNode,
} from 'vue'

export type CollapsibleType = 'header' | 'icon' | 'disabled'

export type SemanticName = 'header' | 'title' | 'body' | 'icon'

export function generatorCollapsePanelProps() {
  return {
    id: String,
    header: [String, Object] as PropType<string | VNode>,
    prefixCls: String,
    headerClass: String,
    showArrow: Boolean,
    className: String,
    classNames: Object as PropType<Partial<Record<SemanticName, string>>>,
    style: Object as PropType<Record<string, string>>,
    styles: Object as PropType<Partial<Record<SemanticName, CSSProperties>>>,
    isActive: Boolean,
    openMotion: Object as PropType<Partial<TransitionProps>>,
    destroyInactivePanel: Boolean,
    accordion: Boolean,
    forceRender: Boolean,
    onItemClick: Function as PropType<(props: string | number) => void>,
    extra: [String, Object] as PropType<string | VNode>,
    panelKey: [String, Number],
    collapsible: String as PropType<CollapsibleType>,
    expandIcon: Function as PropType<(props: object) => VueNode>,
    role: String,
  }
}

export type Key = string | number | bigint

export type CollapsePanelProps = ExtractPropTypes<
  ReturnType<typeof generatorCollapsePanelProps>
>

export interface ItemType
  extends Omit<
    CollapsePanelProps,
    | 'header' // alias of label
    | 'prefixCls'
    | 'panelKey' // alias of key
    | 'isActive'
    | 'accordion'
    | 'openMotion'
    | 'expandIcon'
  > {
  key?: CollapsePanelProps['panelKey']
  label?: CollapsePanelProps['header']
  ref?: Ref<HTMLDivElement>
}

export function generatorCollapseProps() {
  return {
    prefixCls: String,
    activeKey: [String, Number, Array] as PropType<Key | Key[]>,
    defaultActiveKey: [String, Number, Array] as PropType<Key | Key[]>,
    openMotion: Object,
    onChange: Function as PropType<(key: Key[]) => void>,
    accordion: Boolean,
    className: String,
    classNames: Object as PropType<Partial<Record<SemanticName, string>>>,
    style: Object,
    styles: Object as PropType<Partial<Record<SemanticName, string>>>,
    destroyInactivePanel: Boolean,
    expandIcon: Function as PropType<(props: object) => VueNode>,
    collapsible: String as PropType<CollapsibleType>,
    items: Array as PropType<ItemType[]>,
  }
}

export type CollapseProps = ExtractPropTypes<
  ReturnType<typeof generatorCollapseProps>
>

import type { CSSProperties, PropType, VNode } from 'vue'

export type CollapsibleType = 'header' | 'icon' | 'disabled'

export function generatorCollapsePanelProps() {
  return {
    id: String,
    header: [String, Object] as PropType<string | VNode>,
    prefixCls: String,
    headerClass: String,
    showArrow: Boolean,
    className: String,
    classNemes: Object as PropType<{ header?: string, body?: string }>,
    style: Object as PropType<Record<string, string>>,
    styles: Object as PropType<{ header?: CSSProperties, body?: CSSProperties }>,
    isActive: Boolean,
    // openMotion: Object as PropType<CSSMotionProps>,
    destroyInactivePanel: Boolean,
    accordion: Boolean,
    forceRender: Boolean,
    onItemClick: Function as PropType<(props: string | number) => void>,
    extra: [String, Object] as PropType<string | VNode>,
    panelKey: [String, Number],
    collapsible: String as PropType<CollapsibleType>,

    role: String,
  }
}

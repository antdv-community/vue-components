import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, PropType, VNode } from 'vue'

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
    // openMotion: Object as PropType<CSSMotionProps>,
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

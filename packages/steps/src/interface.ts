import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, PropType } from 'vue'

export type Status = 'error' | 'process' | 'finish' | 'wait'

export interface Icons {
  finish: VueNode
  error: VueNode
}

export type StepIconRender = (info: {
  index: number
  status: Status
  title: VueNode
  description: VueNode
  node: VueNode
}) => VueNode

export type ProgressDotRender = (
  iconDot: VueNode,
  info: {
    index: number
    status: Status
    title: VueNode
    description: VueNode
  },
) => VueNode

export interface StepProps {
  prefixCls?: string
  className?: string
  style?: CSSProperties
  wrapperStyle?: CSSProperties
  iconPrefix?: string
  active?: boolean
  disabled?: boolean
  stepIndex: number
  stepNumber: number
  status?: Status
  title?: VueNode
  subTitle?: VueNode
  description?: VueNode
  tailContent?: VueNode
  icon?: VueNode
  icons?: Icons
  onClick?: (e: MouseEvent) => void
  onStepClick?: (index: number) => void
  progressDot?: ProgressDotRender | boolean
  stepIcon?: StepIconRender
  render?: (stepItem: VueNode) => VueNode
  refixCls?: string
}

// export interface StepsProps {
//   prefixCls?: string
//   style?: CSSProperties
//   className?: string
//   children?: VueNode
//   direction?: 'horizontal' | 'vertical'
//   type?: 'default' | 'navigation' | 'inline'
//   labelPlacement?: 'horizontal' | 'vertical'
//   iconPrefix?: string
//   status?: Status
//   size?: 'default' | 'small'
//   current?: number
//   progressDot?: ProgressDotRender | boolean
//   stepIcon?: StepIconRender
//   initial?: number
//   icons?: Icons
//   items?: StepProps[]
//   itemRender?: (item: StepProps, stepItem: VueNode) => VueNode
//   onChange?: (current: number) => void
// }

export function generatorStepsProps() {
  return {
    prefixCls: {
      type: String,
      default: 'vc-steps',
    },
    className: String,
    style: {
      type: Object,
      default: () => ({}),
    },
    iconPrefix: {
      type: String,
      default: 'vc',
    },
    status: {
      type: String as PropType<Status>,
      default: 'process',
    },
    icons: Object as PropType<Icons>,
    progressDot: {
      type: [Boolean, Function] as PropType<boolean | ProgressDotRender>,
      default: false,
    },
    stepIcon: Function as PropType<StepIconRender>,
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
    type: {
      type: String as PropType<'default' | 'navigation' | 'inline'>,
      default: 'default',
    },
    labelPlacement: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
    size: {
      type: String as PropType<'default' | 'small'>,
    },
    current: {
      type: Number,
      default: 0,
    },
    initial: {
      type: Number,
      default: 0,
    },
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    onChange: Function as PropType<((current: number) => void) | undefined>,
    itemRender: Function as PropType<(item: StepProps, stepItem: VueNode) => VueNode>,
  }
}

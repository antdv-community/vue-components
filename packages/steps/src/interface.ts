import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

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

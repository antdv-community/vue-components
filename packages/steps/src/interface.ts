import type { VueNode } from '@v-c/util/dist/type'

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

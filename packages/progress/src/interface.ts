import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'

export interface ProgressProps {
  id?: string
  strokeWidth?: number
  trailWidth?: number
  className?: string
  percent?: number | number[]
  strokeColor?: StrokeColorType
  trailColor?: string
  strokeLinecap?: StrokeLinecapType
  prefixCls?: string
  // style?: CSSProperties
  gapDegree?: number
  gapPosition?: GapPositionType
  transition?: string
  onClick?: MouseEventHandler
  steps?: number | { count: number, gap: number }
}

export type StrokeColorObject = Record<string, string | boolean>

export type BaseStrokeColorType = string | StrokeColorObject

export type StrokeColorType = BaseStrokeColorType | BaseStrokeColorType[]

export type GapPositionType = 'top' | 'right' | 'bottom' | 'left'

export type StrokeLinecapType = 'round' | 'butt' | 'square'

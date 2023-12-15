import type { CSSProperties } from 'vue'
import type { ScrollPos, ScrollTarget } from './hooks/useScrollTo'

const EMPTY_DATA = []

const ScrollStyle: CSSProperties = {
  overflowY: 'auto',
  overflowAnchor: 'none',
}

export interface ScrollInfo {
  x: number
  y: number
}

export type ScrollConfig = ScrollTarget | ScrollPos

export type ScrollTo = (arg: number | ScrollConfig) => void

export interface ListRef {
  scrollTo: ScrollTo
  getScrollInfo: () => ScrollInfo
}

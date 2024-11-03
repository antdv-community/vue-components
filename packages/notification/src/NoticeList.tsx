import type { Key, OpenConfig, Placement, StackConfig } from './interface.ts'
import { defineComponent } from 'vue'

export interface NoticeListProps {
  configList?: OpenConfig[]
  placement?: Placement
  prefixCls?: string
  motion?: any | ((placement: Placement) => any)
  stack?: StackConfig

  // Events
  onAllNoticeRemoved?: (placement: Placement) => void
  onNoticeClose?: (key: Key) => void
}

const NoticeList = defineComponent(
  () => {
    return () => {
      return null
    }
  },
  {
    name: 'NoticeList',
  },
)

import type { Ref } from 'vue'
import type { ProgressProps } from './interface.ts'
import { onMounted, ref, shallowRef } from 'vue'

export const defaultProps: Partial<ProgressProps> = {
  percent: 0,
  prefixCls: 'vc-progress',
  strokeColor: '#2db7f5',
  strokeLinecap: 'round',
  strokeWidth: 1,
  trailColor: '#D9D9D9',
  trailWidth: 1,
  gapPosition: 'bottom',
}

export function useTransitionDuration(): Ref<SVGPathElement[]> {
  const pathsRef = ref<SVGPathElement[]>([])
  const prevTimeStamp = shallowRef()
  onMounted(() => {
    const now = Date.now()
    let updated = false
    pathsRef.value.forEach((path) => {
      if (!path) {
        return
      }
      updated = true

      const pathStyle = path.style
      pathStyle.transitionDuration = '.3s, .3s, .3s, .06s'

      if (prevTimeStamp.value && now - prevTimeStamp.value < 100) {
        pathStyle.transitionDuration = '0s, 0s'
      }

      if (updated) {
        prevTimeStamp.value = Date.now()
      }
    })
  })
  return pathsRef
}

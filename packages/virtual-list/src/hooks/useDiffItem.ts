import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { shallowRef, watch } from 'vue'
import type { GetKey } from '../interface.ts'
import { findListDiffIndex } from '../utils/algorithmUtil.ts'

export default function useDiffItem<T>(
  data: ComputedRef<T[]> | ShallowRef<T[]> | Ref<T[]>,
  getKey: GetKey<T>,
  onDiff?: (diffIndex: number) => void,
) {
  const prevData = shallowRef(data)
  const diffItem = shallowRef<T | null>(null)
  watch(data, () => {
    console.log(data)
    const diff = findListDiffIndex(prevData.value || [], data.value || [], getKey)
    if (diff?.index !== undefined) {
      onDiff?.(diff.index)
      diffItem.value = data.value[diff.index]
    }
    prevData.value = data.value
  }, {
    immediate: true,
  })
  return [diffItem]
}

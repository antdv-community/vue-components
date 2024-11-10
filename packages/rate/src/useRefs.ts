import type { Key } from '@v-c/util/dist/type'
import type { ComponentPublicInstance, Ref } from 'vue'
import { onBeforeUpdate, ref } from 'vue'

type RefType = HTMLElement | ComponentPublicInstance
export type RefsValue = Map<Key, RefType>
type UseRef = [(key: Key) => (el: RefType) => void, Ref<RefsValue>]
function useRefs(): UseRef {
  const refs = ref<RefsValue>(new Map())

  const setRef = (key: Key) => (el: RefType) => {
    refs.value.set(key, el)
  }
  onBeforeUpdate(() => {
    refs.value = new Map()
  })
  return [setRef, refs]
}

export default useRefs

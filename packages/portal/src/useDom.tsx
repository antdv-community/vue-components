import type { ComputedRef } from 'vue'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import canUseDom from '@vue-components/util/Dom/canUseDom'
import type { QueueCreate } from './Context.tsx'
import { useContextState } from './Context.tsx'

const EMPTY_LIST: VoidFunction[] = []

/**
 * Will add `div` to document. Nest call will keep order
 * @param render Render DOM in document
 * @param debug
 */
export default function useDom(
  render: ComputedRef<boolean>,
  debug?: string,
): [ComputedRef<HTMLDivElement | null>, ComputedRef<QueueCreate>] {
  const ele = computed(() => {
    if (!canUseDom())
      return null

    const defaultEle = document.createElement('div')

    if (process.env.NODE_ENV !== 'production' && debug)
      defaultEle.setAttribute('data-debug', debug)

    return defaultEle
  })

  // ========================== Order ==========================
  const appendedRef = shallowRef(false)
  const queueCreate = useContextState()
  const queue = shallowRef<VoidFunction[]>(EMPTY_LIST)

  const mergedQueueCreate = computed(() => queueCreate?.value || (appendedRef.value
    ? undefined
    : (appendFn: VoidFunction) => {
        queue.value = [appendFn, ...queue.value]
      }))

  // =========================== DOM ===========================
  function append() {
    if (!ele?.value?.parentElement)
      document.body.appendChild(ele.value!)

    appendedRef.value = true
  }

  function cleanup() {
    ele.value?.parentElement?.removeChild(ele.value)

    appendedRef.value = false
  }

  watch(render, () => {
    if (render.value) {
      if (queueCreate?.value)
        queueCreate.value(append)
      else
        append()
    }
    else {
      cleanup()
    }
  }, {
    flush: 'post',
    immediate: true,
  })

  onBeforeUnmount(cleanup)

  watch(queue, () => {
    if (queue.value.length) {
      queue.value.forEach(fn => fn())
      queue.value = EMPTY_LIST
    }
  }, {
    flush: 'post',
    immediate: true,
  })
  return [ele, mergedQueueCreate as ComputedRef<QueueCreate>]
}

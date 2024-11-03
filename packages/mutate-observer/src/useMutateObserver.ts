import type { Ref, ShallowRef } from 'vue'
import { ref, watchEffect } from 'vue'

const defaultOptions: Ref<MutationObserverInit> = ref({
  subtree: true,
  childList: true,
  attributeFilter: ['style', 'class'],
})

export default function useMutateObserver(
  nodeOrList: ShallowRef<Element | Text | Element[] | null>,
  callback: MutationCallback,
  options: Ref<MutationObserverInit | undefined>,
) {
  watchEffect((onCleanup) => {
    if (!nodeOrList.value) {
      return
    }
    let ins: MutationObserver

    const nodeList = Array.isArray(nodeOrList.value) ? nodeOrList.value : [nodeOrList.value]

    if ('MutationObserver' in window) {
      ins = new MutationObserver(callback)
      nodeList.forEach(node => ins.observe(node, options.value || defaultOptions.value))
    }

    onCleanup(() => {
      ins?.takeRecords()
      ins?.disconnect()
    })
  })
}

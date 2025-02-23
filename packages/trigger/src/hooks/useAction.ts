import type { MaybeRef, ShallowRef } from 'vue'
import type { ActionType } from '../interface'
import { shallowRef, unref, watch } from 'vue'

type ActionTypes = ActionType | ActionType[]

function toArray<T>(val?: T | T[]) {
  return val ? (Array.isArray(val) ? val : [val]) : []
}

export default function useAction(
  mobile: MaybeRef< boolean>,
  action: MaybeRef<ActionTypes>,
  showAction?: MaybeRef<ActionTypes>,
  hideAction?: MaybeRef<ActionTypes>,
): [showAction: ShallowRef<Set<ActionType>>, hideAction: ShallowRef<Set<ActionType>>] {
  const showActionSet = shallowRef<Set<ActionType>>(new Set())
  const hideActionSet = shallowRef<Set<ActionType>>(new Set())
  watch([
    () => unref(mobile),
    () => unref(action),
    () => unref(showAction),
    () => unref(hideAction),
  ], () => {
    const mergedShowAction = toArray(unref(showAction) ?? unref(action))
    const mergedHideAction = toArray(unref(hideAction) ?? unref(action))
    const _showAction = new Set(mergedShowAction)
    const _hideAction = new Set(mergedHideAction)
    if (unref(mobile)) {
      if (_showAction.has('hover')) {
        _showAction.delete('hover')
        _showAction.add('click')
      }

      if (_hideAction.has('hover')) {
        _hideAction.delete('hover')
        _hideAction.add('click')
      }
    }
    showActionSet.value = _showAction
    hideActionSet.value = _hideAction
  }, {
    immediate: true,
  })

  return [showActionSet, hideActionSet]
}

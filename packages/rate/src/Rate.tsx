import type { FocusEventHandler, KeyboardEventHandler } from '@v-c/util/dist/EventInterface'
import type { ExtractPropTypes, PropType, VNode } from 'vue'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import KeyCode from '@v-c/util/dist/KeyCode'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import PropTypes from '@v-c/util/dist/vue-types'
import classNames from 'classnames'
import { computed, defineComponent, onMounted, ref } from 'vue'
import Star from './Star'
import useRefs from './useRefs'
import { getOffsetLeft } from './util'

// TODO: Import from other components
export type Direction = 'ltr' | 'rtl'

export function rateProps() {
  return {
    'prefixCls': String,
    'className': PropTypes.string,
    'defaultValue': Number,
    'value': Number,
    'count': Number,
    'allowHalf': { type: Boolean, default: undefined },
    'allowClear': { type: Boolean, default: undefined },
    'keyboard': Boolean,
    'character': PropTypes.any,
    'characterRender': Function,
    'disabled': { type: Boolean, default: undefined },
    'direction': String as PropType<Direction>,
    'tabIndex': PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    'autoFocus': { type: Boolean, default: undefined },
    'onHoverChange': Function as PropType<(value: number) => void>,
    'onChange': Function as PropType<(value: number) => void>,
    'onFocus': Function as PropType<() => void>,
    'onBlur': Function as PropType<() => void>,
    'onKeyDown': Function as PropType<KeyboardEventHandler>,
    'onMouseLeave': Function as PropType<FocusEventHandler>,
    'onUpdate:value': Function as PropType<(value: number) => void>,
  }
}

export type RateProps = Partial<ExtractPropTypes<ReturnType<typeof rateProps>>>

export default defineComponent({
  name: 'ARate',
  inheritAttrs: false,
  props: rateProps(),
  setup(props, { expose }) {
    const {
      // Base
      prefixCls = 'vc-rate',
      className,

      // Value
      defaultValue,
      value: propValue,
      count = 5,
      allowHalf = false,
      allowClear = true,
      keyboard = true,

      // Display
      character = '★',
      characterRender,

      // Meta
      disabled,
      direction = 'ltr',
      tabIndex = 0,
      autoFocus,

      // Events
      onHoverChange,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onMouseLeave,

      ...restProps
    } = props

    const [setStarRef, starRefs] = useRefs()
    const rateRef = ref<HTMLUListElement | null>(null)

    const triggerFocus = () => {
      if (!props.disabled) {
        rateRef.value.focus()
      }
    }

    const triggerBlur = () => {
      if (!props.disabled) {
        rateRef.value.blur()
      }
    }

    expose({
      focus: triggerFocus,
      blur: triggerBlur,
    })

    const [state, setStateValue] = useMergedState(defaultValue || 0, {
      value: computed(() => propValue),
    })

    const [cleanedValue, setCleanedValue] = useMergedState<number | null>(null)

    const getStarValue = (index: number, x: number) => {
      const reverse = direction === 'rtl'
      let starValue = index + 1
      if (allowHalf) {
        const starEle = starRefs.value.get(index) as HTMLElement
        const leftDis = getOffsetLeft(starEle)
        const width = starEle.clientWidth
        if (reverse && x - leftDis > width / 2) {
          starValue -= 0.5
        }
        else if (!reverse && x - leftDis < width / 2) {
          starValue -= 0.5
        }
      }
      return starValue
    }

    const changeValue = (nextValue: number) => {
      setStateValue(nextValue)
      onChange?.(nextValue)
    }

    const focused = ref(false)

    const onInternalFocus = () => {
      focused.value = true
      onFocus?.()
    }

    const onInternalBlur = () => {
      focused.value = false
      onBlur?.()
    }

    const hoverValue = ref<number>(null)

    const onHover = (event: MouseEvent, index: number) => {
      const nextHoverValue = getStarValue(index, event.pageX)
      if (nextHoverValue !== cleanedValue.value) {
        hoverValue.value = nextHoverValue
        setCleanedValue(null)
      }
      onHoverChange?.(nextHoverValue)
    }

    const onMouseLeaveCallback = (event?: MouseEvent) => {
      if (!disabled) {
        hoverValue.value = null
        setCleanedValue(null)
        onHoverChange?.(undefined)
      }
      if (event) {
        onMouseLeave?.(event)
      }
    }

    const onClick = (event: MouseEvent | KeyboardEvent, index: number) => {
      const newValue = getStarValue(index, (event as MouseEvent).pageX)
      let isReset = false
      if (allowClear) {
        isReset = newValue === state.value
      }
      onMouseLeaveCallback()
      changeValue(isReset ? 0 : newValue)
      setCleanedValue(isReset ? newValue : null)
    }

    const onInternalKeyDown: KeyboardEventHandler = (event) => {
      const { keyCode } = event
      const { value } = state
      const reverse = direction === 'rtl'
      const step = allowHalf ? 0.5 : 1

      if (keyboard) {
        if (keyCode === KeyCode.RIGHT && value < count && !reverse) {
          changeValue(value + step)
          event.preventDefault()
        }
        else if (keyCode === KeyCode.LEFT && value > 0 && !reverse) {
          changeValue(value - step)
          event.preventDefault()
        }
        else if (keyCode === KeyCode.RIGHT && value > 0 && reverse) {
          changeValue(value - step)
          event.preventDefault()
        }
        else if (keyCode === KeyCode.LEFT && value < count && reverse) {
          changeValue(value + step)
          event.preventDefault()
        }
      }

      onKeyDown?.(event)
    }

    onMounted(() => {
      if (autoFocus && !disabled) {
        triggerFocus()
      }
    })

    const starNodes = Array.from({ length: count })
      .fill(0)
      .map((_, index) => (
        <Star
          ref={setStarRef(index) as () => VNode}
          index={index}
          count={count}
          disabled={disabled}
          prefixCls={`${prefixCls}-star`}
          allowHalf={allowHalf}
          value={hoverValue.value === null ? state.value : hoverValue.value}
          onClick={onClick}
          onHover={onHover}
          key={index}
          character={character}
          characterRender={characterRender}
          focused={focused.value}
        />
      ))

    const classString = classNames(prefixCls, className, {
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-rtl`]: direction === 'rtl',
    })

    return () => (
      <ul
        class={classString}
        onMouseleave={onMouseLeaveCallback}
        tabindex={disabled ? -1 : tabIndex}
        onFocus={disabled ? null : onInternalFocus}
        onBlur={disabled ? null : onInternalBlur}
        onKeydown={disabled ? null : onInternalKeyDown}
        ref={rateRef}
        role="radiogroup"
        {...pickAttrs(restProps, { aria: true, data: true, attr: true })}
      >
        {starNodes}
      </ul>
    )
  },
})

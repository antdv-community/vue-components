import type { FocusEventHandler, KeyboardEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSProperties, ExtractPropTypes, PropType, VNode } from 'vue'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import KeyCode from '@v-c/util/dist/KeyCode'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { initDefaultProps } from '@v-c/util/dist/props-util'
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
  props: initDefaultProps(rateProps(), {
    prefixCls: 'vc-rate',
    count: 5,
    allowHalf: false,
    allowClear: true,
    keyboard: true,
    character: '★',
    direction: 'ltr',
    tabIndex: 0,
  }),
  setup(props, { attrs, emit, expose }) {
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

    const [state, setStateValue] = useMergedState(props.defaultValue || 0, {
      value: computed(() => props.value),
    })

    const [cleanedValue, setCleanedValue] = useMergedState<number | null>(null)

    const getStarValue = (index: number, x: number) => {
      const { direction, allowHalf } = props
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
      emit('change', nextValue)
    }

    const focused = ref(false)

    const onInternalFocus = () => {
      focused.value = true
      emit('focus')
    }

    const onInternalBlur = () => {
      focused.value = false
      emit('blur')
    }

    const hoverValue = ref<number>(null)

    const onHover = (event: MouseEvent, index: number) => {
      const nextHoverValue = getStarValue(index, event.pageX)
      if (nextHoverValue !== cleanedValue.value) {
        hoverValue.value = nextHoverValue
        setCleanedValue(null)
      }
      emit('hoverChange', hoverValue)
    }

    const onMouseLeaveCallback = (event?: MouseEvent) => {
      const { disabled } = props
      if (!disabled) {
        hoverValue.value = null
        setCleanedValue(null)
        emit('hoverChange', undefined)
      }
      if (event) {
        emit('mouseLeave', event)
      }
    }

    const onClick = (event: MouseEvent | KeyboardEvent, index: number) => {
      const { allowClear } = props
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
      const { keyboard, count, direction, allowHalf } = props
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

      emit('keyDown', event)
    }

    onMounted(() => {
      const { autoFocus, disabled } = props
      if (autoFocus && !disabled) {
        triggerFocus()
      }
    })

    return () => {
      const { count, allowHalf, disabled, prefixCls, direction, character, characterRender, tabIndex, ...restProps } = props
      const { class: className, style } = attrs
      const classString = classNames(prefixCls, className, {
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-rtl`]: direction === 'rtl',
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

      return (
        <ul
          class={classString}
          style={style as CSSProperties}
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
    }
  },
})

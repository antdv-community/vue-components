import type { ExtractPropTypes, PropType, VueElement } from 'vue'
import type { ChangeEventHandler, CompositionEventHandler, FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from '@v-c/util/EventInterface'
import type { VueNode } from '@v-c/util/type'
import type { InputFocusOptions } from './utils/commonUtils'

export type SizeType = 'small' | 'middle' | 'large' | undefined
const InputStatuses = ['warning', 'error', ''] as const

export type InputStatus = (typeof InputStatuses)[number]

export function commonInputProps() {
  return {
    addonBefore: Function,
    addonAfter: Function,
    prefix: Function,
    suffix: Function,
    clearIcon: Function,
    affixWrapperClassName: String,
    groupClassName: String,
    wrapperClassName: String,
    inputClassName: String,
    allowClear: { type: Boolean, default: undefined },
  }
}

export function baseInputProps() {
  return {
    ...commonInputProps(),
    value: {
      type: [String, Number, Symbol] as PropType<string | number>,
      default: undefined,
    },
    defaultValue: {
      type: [String, Number, Symbol] as PropType<string | number>,
      default: undefined,
    },
    inputElement: Object,
    prefixCls: String,
    disabled: { type: Boolean, default: undefined },
    focused: { type: Boolean, default: undefined },
    triggerFocus: Function as PropType<() => void>,
    readonly: { type: Boolean, default: undefined },
    handleReset: Function as PropType<MouseEventHandler>,
    hidden: { type: Boolean, default: undefined },
  }
}

export type ShowCountFormatter = (args: {
  value: string
  count: number
  maxLength?: number
}) => VueElement

export type ExceedFormatter = (
  value: string,
  config: { max: number },
) => string

export interface CountConfig {
  max?: number
  strategy?: (value: string) => number
  show?: boolean | ShowCountFormatter
  /** Trigger when content larger than the `max` limitation */
  exceedFormatter?: ExceedFormatter
}

export function inputProps() {
  return {
    ...baseInputProps(),
    id: String,
    placeholder: {
      type: [String, Number] as PropType<string | number>,
    },
    autocomplete: String,
    type: String,
    name: String,
    size: { type: String as PropType<SizeType> },
    autofocus: { type: Boolean, default: undefined },
    lazy: { type: Boolean, default: true },
    maxlength: Number,
    loading: { type: Boolean, default: undefined },
    bordered: { type: Boolean, default: undefined },
    showCount: { type: [Boolean, Object] as PropType<boolean | ShowCountProps> },
    htmlSize: Number,
    onPressEnter: Function as PropType<KeyboardEventHandler>,
    onKeydown: Function as PropType<KeyboardEventHandler>,
    onKeyup: Function as PropType<KeyboardEventHandler>,
    onFocus: Function as PropType<FocusEventHandler>,
    onBlur: Function as PropType<FocusEventHandler>,
    onChange: Function as PropType<ChangeEventHandler>,
    onInput: Function as PropType<ChangeEventHandler>,
    'onUpdate:value': Function as PropType<(val: string) => void>,
    onCompositionstart: Function as PropType<CompositionEventHandler>,
    onCompositionend: Function as PropType<CompositionEventHandler>,
    valueModifiers: Object,
    hidden: { type: Boolean, default: undefined },
    status: String as PropType<InputStatus>,
  }
}
export type InputProps = Partial<ExtractPropTypes<ReturnType<typeof inputProps>>>

export interface ShowCountProps {
  formatter: (args: { count: number, maxlength?: number, value?: string }) => VueNode
}

export interface InputRef {
  focus: (options?: InputFocusOptions) => void
  blur: () => void
  setSelectionRange: (
    start: number,
    end: number,
    direction?: 'forward' | 'backward' | 'none',
  ) => void
  select: () => void
  input: HTMLInputElement | null
}

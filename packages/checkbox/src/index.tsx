import classNames from 'classnames'
import useMergedState from '@vue-components/util/hooks/useMergedState'
import { computed, defineComponent, shallowRef } from 'vue'

export interface InputHTMLAttributes {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  type?: string
  title?: string
  onChange?: (e: Event) => void
}

export interface CheckboxChangeEvent {
  target: CheckboxChangeEventTarget
  stopPropagation: () => void
  preventDefault: () => void
  nativeEvent: any
}

export interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean
}

export interface CheckBoxInstance {
  focus: () => void
  blur: () => void
  input: HTMLInputElement | null
}

export interface CheckboxProps extends Omit<InputHTMLAttributes, 'onChange'> {
  prefixCls?: string
  onChange?: (e: CheckboxChangeEvent) => void
}

export const Checkbox = defineComponent<CheckboxProps>((props, { expose, attrs }) => {
  const inputRef = shallowRef<HTMLInputElement>()
  const [rawValue, setRawValue] = useMergedState(defaultChecked, {
    value: computed(() => props.checked),
  })

  expose({
    focus: () => {
      inputRef.value?.focus()
    },
    blur: () => {
      inputRef.value?.blur()
    },
    input: inputRef,
  })

  const handleChange = (e: MouseEvent & { [key: string] }) => {
    if (props.disabled)
      return

    if (!('checked' in props))
      setRawValue(e.target?.checked)

    props?.onChange?.({
      target: {
        ...props,
        type,
        checked: e.target.checked,
      },
      stopPropagation() {
        e.stopPropagation()
      },
      preventDefault() {
        e.preventDefault()
      },
      nativeEvent: e,
    })
  }

  return () => {
    const {
      prefixCls = 'rc-checkbox',
      disabled,
      type = 'checkbox',
      title,

    } = props
    const classString = classNames(prefixCls, attrs.class as any, {
      [`${prefixCls}-checked`]: rawValue,
      [`${prefixCls}-disabled`]: disabled,
    })
    return (
      <span class={classString} title={title} style={[(attrs as any).style]}>
        <input
          class={`${prefixCls}-input`}
          ref={inputRef}
          onChange={handleChange}
          disabled={disabled}
          checked={!!rawValue}
          type={type}
        />
        <span class={`${prefixCls}-inner`} />
      </span>
    )
  }
})

export default Checkbox

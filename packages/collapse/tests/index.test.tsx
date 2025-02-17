import type { Mock } from 'vitest'
import type { CollapseProps } from '../src'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import Collapse from '../src/index'

describe('collapse', () => {
  let changeHook: Mock<any> | null

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    changeHook = null
  })

  function onChange(this: any, ...args: any[]) {
    if (changeHook) {
      changeHook.apply(this, args)
    }
  }

  function runNormalTest(element: any) {
    let collapse: ReturnType<typeof mount>

    beforeEach(() => {
      collapse = mount(element)
    })

    // afterEach(() => {
    //   collapse.unmount()
    // })

    it('add className', () => {
      const el = collapse.findAll('.vc-collapse-item')?.[2]

      expect(el.classes()).toContain('vc-collapse-item')
      expect(el.classes()).toContain('important')
    })

    it('create works', () => {
      expect(collapse.findAll('.vc-collapse')).toHaveLength(1)
    })

    it('header works', () => {
      expect(collapse.findAll('.vc-collapse-header')).toHaveLength(3)
    })

    it('panel works', () => {
      expect(collapse.findAll('.vc-collapse-item')).toHaveLength(3)
      expect(collapse.findAll('.vc-collapse-panel')).toHaveLength(0)
    })

    it('should render custom arrow icon correctly', () => {
      expect(collapse.find('.vc-collapse-header')?.text()).toContain('text>')
    })

    it('default active works', () => {
      expect(collapse.findAll('.vc-collapse-item-active').length).toBeFalsy()
    })

    it('extra works', () => {
      const extraNodes = collapse.findAll('.vc-collapse-extra')
      expect(extraNodes.length).toBe(1)
      expect(extraNodes[0].html()).toContain('<span>Extra span</span>')
    })

    it('onChange works', async () => {
      changeHook = vi.fn()
      const headerNode = collapse.findAll('.vc-collapse-header')?.[1]
      await headerNode?.trigger('click')
      expect(changeHook.mock.calls[0][0]).toEqual(['2'])
    })

    it('click should toggle panel state', async () => {
      const header = collapse.findAll('.vc-collapse-header')?.[1]
      await header?.trigger('click')
      expect(collapse.findAll('.vc-collapse-panel-active')).toHaveLength(1)
      await header?.trigger('click')
      expect(
        collapse.find('.vc-collapse-panel-inactive')?.element.innerHTML,
      ).toBe('<div class="vc-collapse-body">second</div>')
      expect(collapse.findAll('.vc-collapse-panel-active').length).toBeFalsy()
    })

    it('click should not toggle disabled panel state', async () => {
      const header = collapse.find('.vc-collapse-header')
      expect(header).toBeTruthy()
      await header.trigger('click')
      expect(collapse.findAll('.vc-collapse-panel-active').length).toBeFalsy()
    })

    it('should not have role', () => {
      const item = collapse.find('.vc-collapse')
      expect(item).toBeTruthy()
      expect(item.attributes().role).toBe(undefined)
    })

    it('should set button role on panel title', () => {
      const item = collapse.find('.vc-collapse-header')
      expect(item).toBeTruthy()
      expect(item.attributes().role).toBe('button')
    })
  }

  describe('collapse', () => {
    const expandIcon = () => (
      <span>
        text
        {'>'}
      </span>
    )

    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',
        collapsible: 'disabled',
        children: 'first',
      },
      {
        label: 'collapse 2',
        key: '2',
        extra: <span>Extra span</span>,
        children: 'second',
      },
      {
        label: 'collapse 3',
        key: '3',
        className: 'important',
        children: 'third',
      },
    ]
    const element = (
      <Collapse items={items} expandIcon={expandIcon} onChange={onChange} />
    )

    runNormalTest(element)

    it('controlled', async () => {
      const onChangeSpy = vi.fn()

      const ControlledCollapse = defineComponent(() => {
        const activeKey = ref(['2'])
        const handleChange: CollapseProps['onChange'] = (key) => {
          activeKey.value = key
          onChangeSpy(key)
        }

        const items: CollapseProps['items'] = [
          {
            label: 'collapse 1',
            key: '1',
            children: 'first',
          },
          {
            label: 'collapse 2',
            key: '2',
            children: 'second',
          },
          {
            label: 'collapse 3',
            key: '3',
            children: 'third',
          },
        ]
        return () => (
          <Collapse
            onChange={handleChange}
            activeKey={activeKey.value}
            items={items}
          />
        )
      })

      const el = mount(ControlledCollapse)

      expect(el.findAll('.vc-collapse-panel-active')).toHaveLength(1)
      const header = el.find('.vc-collapse-header')
      expect(header).toBeTruthy()
      await header.trigger('click')
      expect(el.findAll('.vc-collapse-panel-active')).toHaveLength(2)
      expect(onChangeSpy).toBeCalledWith(['2', '1'])
    })
  })

  describe('it should support number key', () => {
    const expandIcon = () => (
      <span>
        text
        {'>'}
      </span>
    )
    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',
        collapsible: 'disabled',
        children: 'first',
      },
      {
        label: 'collapse 2',
        key: '2',
        extra: <span>Extra span</span>,
        children: 'second',
      },
      {
        label: 'collapse 3',
        key: '3',
        className: 'important',
        children: 'third',
      },
    ]

    const element = (
      <Collapse onChange={onChange} expandIcon={expandIcon} items={items} />
    )
    runNormalTest(element)
  })

  describe('prop: headerClass', () => {
    it('applies the passed headerClass to the header', () => {
      const items = [
        {
          label: 'collapse 1',
          key: '1',
          headerClass: 'custom-class',
          children: 'first',
        },
      ]
      const element = <Collapse onChange={onChange} items={items} />

      const wrapper = mount(element)
      const header = wrapper.find('.vc-collapse-header')

      expect(header.element?.classList.contains('custom-class')).toBeTruthy()
    })

    it('should support extra whit number 0', () => {
      const items = [
        {
          label: 'collapse 0',
          key: 0,
          extra: 0,
          children: 'zero',
        },
      ]
      const wrapper = mount(
        <Collapse onChange={onChange} activeKey={0} items={items}></Collapse>,
      )

      const extraNodes = wrapper.findAll('.vc-collapse-extra')
      expect(extraNodes).toHaveLength(1)
      expect(extraNodes[0].element.innerHTML).toBe('0')
    })

    it('should support activeKey number 0', () => {
      const items = [
        {
          label: 'collapse 0',
          key: 0,
          children: 'zero',
        },
        {
          label: 'collapse 1',
          key: 1,
          children: 'first',
        },
        {
          label: 'collapse 2',
          key: 2,
          children: 'second',
        },
      ]
      const wrapper = mount(
        <Collapse onChange={onChange} activeKey={0} items={items} />,
      )

      // activeKey number 0, should open one item
      expect(wrapper.findAll('.vc-collapse-panel-active')).toHaveLength(1)
    })

    it('click should toggle panel state', async () => {
      const items = [
        {
          label: 'collapse 1',
          key: '1',
          children: 'first',
        },
        {
          label: 'collapse 2',
          key: '2',
          children: 'second',
        },
        {
          label: 'collapse 3',
          key: '3',
          children: 'second',
          className: 'important',
        },
      ]

      const wrapper = mount(
        <Collapse
          onChange={onChange}
          destroyInactivePanel
          items={items}
        >
        </Collapse>,
      )

      const header = wrapper.findAll('.vc-collapse-header')?.[1]
      await header.trigger('click')
      expect(wrapper.findAll('.vc-collapse-panel-active')).toHaveLength(1)
      await header.trigger('click')
      expect(wrapper.findAll('.vc-collapse-panel-inactive').length).toBeFalsy()
    })
  })
})

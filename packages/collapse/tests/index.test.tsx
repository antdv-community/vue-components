import type { Mock } from 'vitest'
import type { CollapseProps } from '../src'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

    it ('header works', () => {
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
      // const header = collapse.findAll('.vc-collapse-header')?.[1]
      // await header?.trigger('click')
      // // 等待 1 s
      // const ret = sleep(1000)
      // vi.runAllTimers()
      // await ret
      // console.log(collapse.html())
      // expect(collapse.findAll('.vc-collapse-panel-active').length).toHaveLength(1)
      // await header?.trigger('click')
      // vi.runAllTimers()
      // expect(collapse.find('.vc-collapse-panel-inactive')?.text()).toBe('<div class="vc-collapse-body">second</div>')
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
      },
      {
        label: 'collapse 2',
        key: '2',
        extra: <span>Extra span</span>,
      },
      {
        label: 'collapse 3',
        key: '3',
        className: 'important',
      },
    ]
    const element = (
      <Collapse items={items} expandIcon={expandIcon} onChange={onChange} />
    )

    runNormalTest(element)
  })
})

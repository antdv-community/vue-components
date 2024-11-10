import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Pagination from '../src/index'

describe('default Pagination', () => {
  let wrapper: VueWrapper
  const onChange = vi.fn()

  const $$ = (selector: string) => wrapper.findAll(selector)
  beforeEach(() => {
    wrapper = mount(Pagination, {
      onChange,
    })
  })

  afterEach(() => {
    wrapper.unmount()
    onChange.mockReset()
  })

  it('onChange should be forbidden when total is default', async () => {
    const pages = $$('.vc-pagination-item')
    await pages[0].trigger('click')
    expect(onChange).not.toHaveBeenCalled()
  })
})

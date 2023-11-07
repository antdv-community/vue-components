import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, onMounted, ref } from 'vue'
import { mount } from '@vue/test-utils'
import PortalWrapper, { getOpenCount } from '../src/PortalWrapper'
import Portal from '../src/Portal'

describe('portal', () => {
  let domContainer: HTMLDivElement

  window.requestAnimationFrame = callback => window.setTimeout(callback)
  window.cancelAnimationFrame = id => window.clearTimeout(id)

  beforeEach(() => {
    domContainer = document.createElement('div')
    document.body.appendChild(domContainer)
  })

  afterEach(() => {
    document.body.removeChild(domContainer)
  })
  it('forceRender', () => {
    const divRef = ref<HTMLDivElement>()

    const wrapper = mount(
      <PortalWrapper forceRender>
        {{
          default: () => <div ref={divRef as any}>2333</div>,
        }}
      </PortalWrapper>,
    )

    expect(divRef.value).toBeTruthy()
    wrapper.unmount()
  })

  it('didUpdate', () => {
    let times = 0
    const didUpdate = () => {
      ++times
    }

    let wrapper = mount(
      <Portal
        didUpdate={didUpdate}
        getContainer={() => document.createElement('div')}
      >
        light
      </Portal>,
    )
    expect(times).toEqual(0)
    wrapper.unmount()
    wrapper = mount(
      <Portal
        didUpdate={didUpdate}
        getContainer={() => document.createElement('div')}
        {...{ justForceUpdate: true }}
      >
        light
      </Portal>,
    )
    expect(times).toEqual(1)
    wrapper.unmount()
  })

  describe('getContainer', () => {
    it('string', () => {
      const div = document.createElement('div')
      div.id = 'bamboo-light'
      document.body.appendChild(div)

      const wrapper = mount(
        <PortalWrapper visible getContainer="#bamboo-light">
          {() => <div>2333</div>}
        </PortalWrapper>,
      )

      expect((document as any).querySelector?.('#bamboo-light').childElementCount)
        .toEqual(1)

      document.body.removeChild(div)
      wrapper.unmount()
    })

    it('function', () => {
      const div = document.createElement('div')

      const wrapper = mount(
        <PortalWrapper visible getContainer={() => div}>
          {() => <div>2333</div>}
        </PortalWrapper>,
      )

      expect(div.childElementCount).toEqual(1)

      wrapper.unmount()
    })

    it('htmlElement', () => {
      const div = document.createElement('div')

      const wrapper = mount(
        <PortalWrapper visible getContainer={div}>
          {() => <div>2333</div>}
        </PortalWrapper>,
      )

      expect(div.childElementCount).toEqual(1)
      wrapper.unmount()
    })

    it('delay', () => {
      let dom: any
      const wrapper = mount(defineComponent({
        setup() {
          const divRef = ref<HTMLDivElement>()
          onMounted(() => {
            dom = divRef.value as any
          })
          return () => {
            return (
              <div>
                <PortalWrapper visible getContainer={() => divRef.value!}>
                  {() => <div />}
                </PortalWrapper>
                <div ref={divRef as any} />
              </div>
            )
          }
        },
      }))

      expect(dom?.childElementCount).toEqual(1)
      wrapper.unmount()
    })
  })

  describe('openCount', () => {
    it('start as 0', () => {
      expect(getOpenCount()).toEqual(0)

      const wrapper = mount(
        <PortalWrapper visible={false}>{() => <div>2333</div>}</PortalWrapper>,
      )
      expect(getOpenCount()).toEqual(0)

      const wrapper1 = mount(<PortalWrapper visible>{() => <div>2333</div>}</PortalWrapper>)
      expect(getOpenCount()).toEqual(1)

      wrapper.unmount()
      wrapper1.unmount()
    })

    it('correct count', () => {
      const Demo = defineComponent({
        props: {
          count: Number,
          visible: Boolean,
        },
        setup(props) {
          return () => {
            const { count, visible } = props
            const getItem = (index: number) => {
              return (
                <>
                  <PortalWrapper key={index} visible={visible}>
                    {() => <div>2333</div>}
                  </PortalWrapper>
                </>
              )
            }
            return (
              <>
                {Array.from({ length: count as any }).fill(null).map((_, index) => getItem(index))}
              </>
            )
          }
        },
      })

      expect(getOpenCount()).toEqual(0)

      let wrapper = mount(<Demo count={1} visible />)
      expect(getOpenCount()).toEqual(1)
      wrapper.unmount()

      wrapper = mount(<Demo count={2} visible />)
      expect(getOpenCount()).toEqual(2)
      wrapper.unmount()

      wrapper = mount(<Demo count={1} visible />)
      expect(getOpenCount()).toEqual(1)
      wrapper.unmount()

      wrapper = mount(<Demo count={1} visible={false} />)
      expect(getOpenCount()).toEqual(0)
      wrapper.unmount()
    })
  })
})

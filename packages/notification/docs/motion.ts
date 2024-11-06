import type { TransitionGroupProps } from 'vue'

const motion: TransitionGroupProps = {
  appear: true,
  enterFromClass: 'vc-notification-fade-appear-start vc-notification-fade-appear-prepare',
  enterActiveClass: 'vc-notification-fade',
  enterToClass: 'vc-notification-fade-appear-active',
  leaveFromClass: 'vc-notification-fade-appear-active',
  leaveToClass: 'vc-notification-fade-appear-start vc-notification-fade-appear-prepare',
  leaveActiveClass: 'vc-notification-fade vc-notification-fade-appear-leave',
  moveClass: 'vc-notification-fade',
  onBeforeLeave: (el) => {
    const _el = el as HTMLDivElement
    _el.style.height = `${_el.offsetHeight}px`
  },
  onLeave(el, done) {
    const _el = el as HTMLDivElement
    _el.style.height = '0'
    _el.style.opacity = '0'
    _el.style.margin = '0'
    done()
  },
}

export default motion

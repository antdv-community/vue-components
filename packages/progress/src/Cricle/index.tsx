import type { ProgressProps } from '../interface.ts'
import { computed, defineComponent } from 'vue'
import { defaultProps, useTransitionDuration } from '../common.ts'
import useId from '../hooks/useId.ts'
import PtgCircle from './PtgCircle.tsx'
import { getCircleStyle, VIEW_BOX_SIZE } from './util.ts'

function toArray<T>(value: T | T[]): T[] {
  const mergedValue = value ?? []
  return Array.isArray(mergedValue) ? mergedValue : [mergedValue]
}

const Circle = defineComponent<ProgressProps>((props = defaultProps) => {
  const halfSize = VIEW_BOX_SIZE / 2
  const mergedId = useId(props.id)
  const gradientId = `${mergedId}-gradient`
  const gapDegree = computed(() => props.gapDegree ?? 0)
  const radius = computed(() => halfSize - props.strokeWidth! / 2)
  const perimeter = computed(() => Math.PI * 2 * radius.value)
  const rotateDeg = computed(() => gapDegree.value > 0 ? 90 + gapDegree.value / 2 : -90)
  const perimeterWithoutGap = computed(() => perimeter.value * ((360 - gapDegree.value) / 360))
  const stepObj = computed(() => typeof props.steps === 'object' ? props.steps : { count: props.steps, gap: 2 })
  const percentList = computed(() => toArray(props.percent))
  const strokeColorList = computed(() => toArray(props.strokeColor))
  const gradient = computed(() => strokeColorList.value.find(color => color && typeof color === 'object') as Record<
    string,
    string
  >)
  const isConicGradient = computed(() => gradient.value && typeof gradient.value === 'object')
  const mergedStrokeLinecap = computed(() => isConicGradient.value ? 'butt' : props.strokeLinecap)
  const paths = useTransitionDuration()

  const getStokeList = () => {
    let stackPtg = 0
    return percentList.value
      .map((ptg, index) => {
        const color = strokeColorList.value[index] || strokeColorList.value[strokeColorList.value.length - 1]
        const circleStyleForStack = getCircleStyle(
          perimeter.value,
          perimeterWithoutGap.value,
          stackPtg,
          ptg!,
          rotateDeg.value,
          gapDegree.value,
          props.gapPosition!,
          color!,
          mergedStrokeLinecap.value,
          props.strokeWidth!,
        )
        stackPtg += ptg!

        return (
          <PtgCircle
            key={index}
            color={color!}
            ptg={ptg!}
            radius={radius.value}
            prefixCls={props.prefixCls!}
            gradientId={gradientId}
            style={circleStyleForStack}
            strokeLinecap={mergedStrokeLinecap.value}
            strokeWidth={props.strokeWidth!}
            gapDegree={gapDegree.value}
            ref={(elem) => {
              // https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
              // React will call the ref callback with the DOM element when the component mounts,
              // and call it with `null` when it unmounts.
              // Refs are guaranteed to be up-to-date before componentDidMount or componentDidUpdate fires.

              paths.value[index] = elem as SVGPathElement
            }}
            size={VIEW_BOX_SIZE}
          />
        )
      })
      .reverse()
  }

  const getStepStokeList = () => {
    // only show the first percent when pass steps
    const current = Math.round(stepCount * (percentList[0] / 100))
    const stepPtg = 100 / stepCount

    let stackPtg = 0
    return new Array(props.stepCount).fill(null).map((_, index) => {
      const color = index <= current - 1 ? strokeColorList[0] : trailColor
      const stroke = color && typeof color === 'object' ? `url(#${gradientId})` : undefined
      const circleStyleForStack = getCircleStyle(
        perimeter,
        perimeterWithoutGap,
        stackPtg,
        stepPtg,
        rotateDeg,
        gapDegree,
        gapPosition,
        color,
        'butt',
        strokeWidth,
        stepGap,
      )
      stackPtg += ((perimeterWithoutGap - (circleStyleForStack.strokeDashoffset as number) + stepGap) * 100)
        / perimeterWithoutGap

      return (
        <circle
          key={index}
          className={`${prefixCls}-circle-path`}
          r={radius}
          cx={halfSize}
          cy={halfSize}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={1}
          style={circleStyleForStack}
          ref={(elem) => {
            paths[index] = elem
          }}
        />
      )
    })
  }
  return () => {
    const circleStyle = getCircleStyle(
      perimeter.value,
      perimeterWithoutGap.value,
      0,
      100,
      rotateDeg.value,
      gapDegree.value,
      props.gapPosition,
      props.trailColor!,
      mergedStrokeLinecap.value,
      props.strokeWidth!,
    )
    return <div></div>
  }
})

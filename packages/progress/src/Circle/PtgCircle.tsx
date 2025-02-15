import type { ProgressProps } from '..'
import type { StrokeColorObject } from '../interface.ts'
import { computed, defineComponent, shallowRef } from 'vue'

interface BlockProps {
  bg: string
}
const Block = defineComponent<BlockProps>((props, { slots }) => {
  return () => {
    return <div style={{ width: '100%', height: '100%', background: props.bg }}>{slots.default?.()}</div>
  }
})

function getPtgColors(color: Record<string, string | boolean>, scale: number) {
  return Object.keys(color).map((key) => {
    const parsedKey = parseFloat(key)
    const ptgKey = `${Math.floor(parsedKey * scale)}%`

    return `${color[key]} ${ptgKey}`
  })
}

export interface ColorGradientProps {
  prefixCls: string
  gradientId: string
  // style: ColorGradientPropsSSProperties;
  ptg: number
  radius: number
  strokeLinecap: ProgressProps['strokeLinecap']
  strokeWidth: ProgressProps['strokeWidth']
  size: number
  color: string | StrokeColorObject
  gapDegree: number
}

const PtgCircle = defineComponent<ColorGradientProps>((props, ctx) => {
  const isGradient = computed(() => props.color && typeof props.color === 'object')
  const stroke = computed(() => isGradient.value ? `#FFF` : undefined)

  const circleRef = shallowRef<SVGCircleElement>()
  ctx.expose({
    circleRef,
  })
  return () => {
    const {
      prefixCls,
      color,
      gradientId,
      radius,
      ptg,
      strokeLinecap,
      strokeWidth,
      size,
      gapDegree,
    } = props
    // ========================== Circle ==========================
    const halfSize = size / 2

    const circleNode = (
      <circle
        class={`${prefixCls}-circle-path`}
        r={radius}
        cx={halfSize}
        cy={halfSize}
        stroke={stroke.value}
        stroke-linecap={strokeLinecap!}
        stroke-width={strokeWidth}
        opacity={ptg === 0 ? 0 : 1}
        style={ctx.attrs?.style as any}
      />
    )

    // ========================== Render ==========================
    if (!isGradient.value) {
      return circleNode
    }

    const maskId = `${gradientId}-conic`

    const fromDeg = gapDegree ? `${180 + gapDegree / 2}deg` : '0deg'

    const conicColors = getPtgColors(color as any, (360 - gapDegree) / 360)
    const linearColors = getPtgColors(color as any, 1)

    const conicColorBg = `conic-gradient(from ${fromDeg}, ${conicColors.join(', ')})`
    const linearColorBg = `linear-gradient(to ${gapDegree ? 'bottom' : 'top'}, ${linearColors.join(
      ', ',
    )})`
    return (
      <>
        <mask id={maskId}>{circleNode}</mask>
        <foreignObject x={0} y={0} width={size} height={size} mask={`url(#${maskId})`}>
          <Block bg={linearColorBg}>
            <Block bg={conicColorBg} />
          </Block>
        </foreignObject>
      </>
    )
  }
}, {
  name: 'PtgCircle',
  inheritAttrs: false,
})

export default PtgCircle

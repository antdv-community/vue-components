import { computed, defineComponent, shallowRef, watch, watchEffect } from 'vue'
import type { CSSProperties, VNode } from 'vue'
import { useQRCode } from './hooks/useQRCode'
import { qrProps } from './interface'
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FRONT_COLOR,
  DEFAULT_LEVEL,
  DEFAULT_MINVERSION,
  DEFAULT_NEED_MARGIN,
  DEFAULT_SIZE,
  excavateModules,
  generatePath,
  isSupportPath2d,
} from './utils'

export const QRCodeCanvas = defineComponent({
  name: 'QRCodeCanvas',
  inheritAttrs: false,
  props: { ...qrProps(), value: { type: String, required: true } },
  setup(props, { attrs, expose }) {
    const imgSrc = computed(() => props.imageSettings?.src)
    const _canvas = shallowRef<HTMLCanvasElement | null>(null)
    const _image = shallowRef<HTMLImageElement | null>(null)
    const isImgLoaded = shallowRef(false)
    let img: VNode | null = null

    watchEffect(() => {
      const {
        value,
        level = DEFAULT_LEVEL,
        includeMargin = DEFAULT_NEED_MARGIN,
        minVersion = DEFAULT_MINVERSION,
        marginSize,
        imageSettings,
        size = DEFAULT_SIZE,
        bgColor = DEFAULT_BACKGROUND_COLOR,
        fgColor = DEFAULT_FRONT_COLOR,
      } = props

      const { margin, cells, numCells, calculatedImageSettings } = useQRCode({ value, level, minVersion, includeMargin, marginSize, imageSettings, size })
      if (_canvas.value != null) {
        const canvas = _canvas.value

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return
        }

        let cellsToDraw = cells
        const image = _image.value
        const haveImageToRender = isImgLoaded.value
          && calculatedImageSettings != null
          && image !== null
          && image.complete
          && image.naturalHeight !== 0
          && image.naturalWidth !== 0

        if (haveImageToRender) {
          if (calculatedImageSettings.excavation != null) {
            cellsToDraw = excavateModules(
              cells,
              calculatedImageSettings.excavation,
            )
          }
        }

        // We're going to scale this so that the number of drawable units
        // matches the number of cells. This avoids rounding issues, but does
        // result in some potentially unwanted single pixel issues between
        // blocks, only in environments that don't support Path2D.
        const pixelRatio = window.devicePixelRatio || 1
        canvas.height = canvas.width = size * pixelRatio
        const scale = (size / numCells) * pixelRatio
        ctx.scale(scale, scale)

        // Draw solid background, only paint dark modules.
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, numCells, numCells)

        ctx.fillStyle = fgColor
        if (isSupportPath2d) {
          ctx.fill(new Path2D(generatePath(cellsToDraw, margin)))
        }
        else {
          cells.forEach((row, rdx) => {
            row.forEach((cell, cdx) => {
              if (cell) {
                ctx.fillRect(cdx + margin, rdx + margin, 1, 1)
              }
            })
          })
        }

        if (calculatedImageSettings) {
          ctx.globalAlpha = calculatedImageSettings.opacity
        }

        if (haveImageToRender) {
          ctx.drawImage(
            image,
            calculatedImageSettings.x + margin,
            calculatedImageSettings.y + margin,
            calculatedImageSettings.w,
            calculatedImageSettings.h,
          )
        }
      }

      if (imgSrc.value != null) {
        img = (
          <img
            src={imgSrc.value}
            key={imgSrc.value}
            style={{ display: 'none' }}
            onLoad={() => {
              isImgLoaded.value = true
            }}
            ref={_image}
            // when crossOrigin is not set, the image will be tainted
            // and the canvas cannot be exported to an image
            crossorigin={calculatedImageSettings?.crossOrigin}
            alt=""
          />
        )
      }
    }, { flush: 'post' })

    watch(imgSrc, () => {
      isImgLoaded.value = false
    })

    expose({
      toDataURL: (type?: string, quality?: any) => {
        return _canvas.value?.toDataURL(type, quality)
      },
    })
    return () => {
      const { size = DEFAULT_SIZE } = props
      const canvasStyle = { height: `${size}px`, width: `${size}px` }
      return (
        <>
          <canvas
            {...attrs}
            style={[canvasStyle, attrs.style as CSSProperties]}
            ref={_canvas}
            role="img"
          />
          {img}
        </>
      )
    }
  },
})

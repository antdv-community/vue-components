<script setup>
import { QRCodeCanvas, QRCodeSVG } from '../src'
</script>

<template>
  <Story title="QRCode">
    <Variant title="canvas">
      <QRCodeCanvas value="https://www.baidu.com" />
    </Variant>
    <Variant title="svg">
      <QRCodeSVG value="https://www.baidu.com" />
    </Variant>
  </Story>
</template>

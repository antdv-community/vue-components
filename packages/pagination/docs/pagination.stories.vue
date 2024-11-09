<script setup lang="ts">
import Pagination from '../src/index'
import '../assets/index.less'
</script>

<template>
  <Story title="Pagination">
    <Variant title="align">
      <Pagination align="start" />
      <Pagination align="center" />
      <Pagination align="end" />
    </Variant>

    <Variant title="basic">
      <!-- <Pagination :total="25" />
      <Pagination :total="50" />
      <Pagination :total="60" />
      <Pagination :total="70" />
      <Pagination :total="80" />
      <Pagination :total="90" />
      <Pagination :total="100" />
      <Pagination :total="120" /> -->
      <Pagination :total="500" />
    </Variant>
  </Story>
</template>

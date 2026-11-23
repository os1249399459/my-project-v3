<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="nf">
    <p class="nf__code">404</p>
    <p class="nf__text">页面不存在</p>
    <RouterLink to="/dashboard"><el-button type="primary">回到仪表盘</el-button></RouterLink>
  </div>
</template>

<style scoped>
.nf {
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 100vh;
}
.nf__code {
  font-size: 56px;
  font-weight: 700;
  margin: 0;
}
.nf__text {
  color: var(--el-text-color-secondary);
  margin: 0 0 16px;
}
</style>

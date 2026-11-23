<script setup lang="ts">
/**
 * Admin shell: fixed sidebar, sticky header, routed content.
 *
 * Layout lives here rather than in each page so a new page cannot drift away
 * from the padding and scroll behaviour of its neighbours.
 */
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useLayoutStore } from '@/stores/layout'

const layout = useLayoutStore()
</script>

<template>
  <el-container class="shell">
    <el-aside :width="layout.sidebarWidth" class="shell__aside">
      <AppSidebar />
    </el-aside>
    <el-container>
      <el-header class="shell__header">
        <AppHeader />
      </el-header>
      <el-main class="shell__main">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.shell {
  height: 100vh;
}
.shell__aside {
  background: var(--app-aside-bg);
  transition: width 0.2s ease;
  overflow: hidden;
}
.shell__header {
  height: 56px;
  padding: 0;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}
.shell__main {
  background: var(--app-main-bg);
  padding: 16px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

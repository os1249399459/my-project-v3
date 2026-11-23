<script setup lang="ts">
/**
 * Sidebar navigation. Routes and icons come from the route table's meta, so
 * adding a page means editing one file, not two.
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElIcon } from 'element-plus'
import { Odometer, Tickets, User, Setting } from '@element-plus/icons-vue'
import { useLayoutStore } from '@/stores/layout'

const layout = useLayoutStore()
const route = useRoute()
const router = useRouter()

const ICONS = { Odometer, Tickets, User, Setting } as const

interface NavItem {
  path: string
  title: string
  icon: keyof typeof ICONS
}

const items = computed<NavItem[]>(() =>
  router
    .getRoutes()
    .filter((record) => Boolean(record.meta['nav']) && typeof record.meta['icon'] === 'string')
    .map((record) => ({
      path: record.path,
      title: String(record.meta['nav']),
      icon: record.meta['icon'] as keyof typeof ICONS,
    })),
)

const active = computed(() => route.path)
</script>

<template>
  <div class="nav">
    <h1 class="nav__brand">
      <span class="nav__mark">C</span>
      <span v-show="!layout.collapsed" class="nav__title">Console</span>
    </h1>
    <el-menu :default-active="active" :collapse="layout.collapsed" router class="nav__menu">
      <el-menu-item v-for="item in items" :key="item.path" :index="item.path">
        <el-icon><component :is="ICONS[item.icon]" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.nav {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 16px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--app-aside-fg);
  white-space: nowrap;
}
.nav__mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 15px;
}
.nav__menu {
  flex: 1;
  border-right: none;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: var(--app-aside-fg-dim);
  --el-menu-active-color: #fff;
  --el-menu-hover-bg-color: rgb(255 255 255 / 8%);
}
</style>

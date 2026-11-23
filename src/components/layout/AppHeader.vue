<script setup lang="ts">
/** Header: collapse toggle, breadcrumb from route meta, account menu. */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Expand, Fold, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLayoutStore } from '@/stores/layout'
import { useSessionStore } from '@/stores/session'

const layout = useLayoutStore()
const session = useSessionStore()
const route = useRoute()
const router = useRouter()

const crumbs = computed(() => {
  const nav = route.meta['nav']
  const parent = route.meta['parent']
  return [parent, nav].filter((part): part is string => typeof part === 'string')
})

async function signOut(): Promise<void> {
  session.signOut()
  ElMessage.success('已退出登录')
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="header">
    <div class="header__left">
      <el-button text :icon="layout.collapsed ? Expand : Fold" @click="layout.toggleSidebar()" />
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="crumb in crumbs" :key="crumb">{{ crumb }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header__right">
      <el-dropdown trigger="click">
        <span class="header__user">{{ session.displayName }}</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :icon="SwitchButton" @click="signOut">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}
.header__left,
.header__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header__user {
  cursor: pointer;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>

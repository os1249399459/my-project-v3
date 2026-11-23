<script setup lang="ts">
/** Settings: a form that writes to the persisted layout store and env info. */
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { env } from '@/config/env'
import { useLayoutStore } from '@/stores/layout'

const layout = useLayoutStore()
const form = reactive({
  collapsed: layout.collapsed,
  notify: true,
})

function save(): void {
  layout.collapsed = form.collapsed
  ElMessage.success('已保存')
}
</script>

<template>
  <el-card shadow="never">
    <template #header>设置</template>
    <el-form label-width="120px" class="form">
      <el-form-item label="默认折叠侧栏">
        <el-switch v-model="form.collapsed" />
      </el-form-item>
      <el-form-item label="邮件通知">
        <el-switch v-model="form.notify" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <el-descriptions :column="1" border size="small" title="构建信息">
      <el-descriptions-item label="API 地址">{{ env.apiBaseUrl }}</el-descriptions-item>
      <el-descriptions-item label="请求超时">{{ env.apiTimeout }} ms</el-descriptions-item>
      <el-descriptions-item label="日志级别">{{ env.logLevel }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style scoped>
.form {
  max-width: 420px;
}
</style>

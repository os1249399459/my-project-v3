<script setup lang="ts">
/** User management: searchable table, role tag, destructive action guarded. */
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApi } from '@/composables/useApi'
import { api } from '@/api/client'

interface UserRow {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  active: boolean
}

const keyword = ref('')
const { data, loading, error, execute } = useApi<UserRow[]>(() => api.get<UserRow[]>('/users'), {
  immediate: true,
  fallback: [],
})

const rows = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  const all = data.value ?? []
  if (term === '') return all
  return all.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(term))
})

const ROLE_TAG = { admin: 'danger', editor: 'warning', viewer: 'info' } as const

async function remove(user: UserRow): Promise<void> {
  const confirmed = await ElMessageBox.confirm(`确定停用 ${user.name}？`, '确认', { type: 'warning' })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) return

  try {
    await api.delete(`/users/${user.id}`)
    ElMessage.success('已停用')
    await execute()
  } catch {
    ElMessage.error('操作失败')
  }
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="head">
        <span>用户</span>
        <el-input v-model="keyword" placeholder="搜索姓名或邮箱" clearable size="small" style="width: 220px" />
      </div>
    </template>

    <el-alert v-if="error" :title="error.message" type="warning" show-icon :closable="false" class="alert" />

    <el-table v-loading="loading" :data="rows" empty-text="暂无用户">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="角色" width="110">
        <template #default="{ row }">
          <el-tag :type="ROLE_TAG[row.role as UserRow['role']]" size="small">{{ row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.active ? 'success' : 'info'" size="small" effect="plain">
            {{ row.active ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90" align="center">
        <template #default="{ row }">
          <el-button link type="danger" size="small" @click="remove(row as UserRow)">停用</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.alert {
  margin-bottom: 12px;
}
</style>

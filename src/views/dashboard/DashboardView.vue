<script setup lang="ts">
/** Dashboard: stat tiles plus a table, shaped like a real back office. */
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useApi } from '@/composables/useApi'
import { api } from '@/api/client'
import type { Order, OrderStatus } from '@/types/order'

interface Stat {
  label: string
  value: string
  delta: number
}

const { data, loading, error, execute } = useApi<Stat[]>(() => api.get<Stat[]>('/dashboard/stats'), {
  immediate: true,
  fallback: [
    { label: '今日订单', value: '1,284', delta: 12.4 },
    { label: '成交额', value: '¥382,910', delta: 8.1 },
    { label: '新用户', value: '96', delta: -3.2 },
    { label: '退货率', value: '0.84%', delta: -0.2 },
  ],
})

const orders = ref<Order[]>([])
const statusFilter = ref<OrderStatus | 'all'>('all')

const filtered = computed(() =>
  statusFilter.value === 'all' ? orders.value : orders.value.filter((o) => o.status === statusFilter.value),
)

async function refresh(): Promise<void> {
  await execute()
  // Kept as a single try/catch at the call site: a page decides how loudly to
  // fail, the api layer only normalizes.
  try {
    orders.value = await api.get<Order[]>('/orders', { params: { page: 1, size: 20 } })
    ElMessage.success('已刷新')
  } catch (cause) {
    ElMessage.warning('订单列表暂时不可用，显示演示数据')
    void cause
  }
}
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="16">
      <el-col v-for="stat in data ?? []" :key="stat.label" :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat">
          <p class="stat__label">{{ stat.label }}</p>
          <p class="stat__value">{{ stat.value }}</p>
          <p class="stat__delta" :class="stat.delta >= 0 ? 'is-up' : 'is-down'">
            {{ stat.delta >= 0 ? '+' : '' }}{{ stat.delta }}%
          </p>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="panel">
      <template #header>
        <div class="panel__header">
          <span>最近订单</span>
          <div class="panel__actions">
            <el-select v-model="statusFilter" size="small" style="width: 120px">
              <el-option label="全部" value="all" />
              <el-option label="待付款" value="pending" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已完成" value="completed" />
            </el-select>
            <el-button size="small" :loading="loading" @click="refresh">刷新</el-button>
          </div>
        </div>
      </template>

      <el-alert v-if="error" :title="error.message" type="warning" show-icon :closable="false" class="panel__alert" />

      <el-table v-loading="loading" :data="filtered" empty-text="暂无数据">
        <el-table-column prop="id" label="订单号" width="180" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="amount" label="金额" width="120" align="right" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard > * + * {
  margin-top: 16px;
}
.stat__label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  margin: 0;
}
.stat__value {
  font-size: 24px;
  font-weight: 600;
  margin: 8px 0 4px;
}
.stat__delta {
  margin: 0;
  font-size: 12px;
}
.stat__delta.is-up {
  color: var(--el-color-success);
}
.stat__delta.is-down {
  color: var(--el-color-danger);
}
.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel__actions {
  display: flex;
  gap: 8px;
}
.panel__alert {
  margin-bottom: 12px;
}
</style>

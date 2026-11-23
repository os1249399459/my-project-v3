<script setup lang="ts">
/** Order list: paged table with a status filter, wired to the typed client. */
import { computed, ref } from 'vue'
import { useApi } from '@/composables/useApi'
import { api } from '@/api/client'
import type { Order, OrderStatus, Paged } from '@/types/order'

const page = ref(1)
const size = ref(20)
const status = ref<OrderStatus | 'all'>('all')

const { data, loading, error, execute } = useApi<Paged<Order>>(
  () =>
    api.get<Paged<Order>>('/orders', {
      params: { page: page.value, size: size.value, status: status.value === 'all' ? undefined : status.value },
    }),
  { immediate: true, fallback: { items: [], total: 0, page: 1, size: 20 } },
)

const rows = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.total ?? 0)

async function onPageChange(next: number): Promise<void> {
  page.value = next
  await execute()
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="head">
        <span>订单列表</span>
        <el-select v-model="status" size="small" style="width: 130px" @change="execute">
          <el-option label="全部" value="all" />
          <el-option label="待付款" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已完成" value="completed" />
          <el-option label="已退款" value="refunded" />
        </el-select>
      </div>
    </template>

    <el-alert v-if="error" :title="error.message" type="warning" show-icon :closable="false" class="alert" />

    <el-table v-loading="loading" :data="rows" empty-text="暂无订单">
      <el-table-column prop="id" label="订单号" width="180" />
      <el-table-column prop="customer" label="客户" />
      <el-table-column prop="amount" label="金额" width="120" align="right" />
      <el-table-column prop="status" label="状态" width="110" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
    </el-table>

    <el-pagination
      class="pager"
      layout="total, prev, pager, next"
      :total="total"
      :page-size="size"
      :current-page="page"
      @current-change="onPageChange"
    />
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
.pager {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>

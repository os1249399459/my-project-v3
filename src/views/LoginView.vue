<script setup lang="ts">
/** Login: validates with the same rules the form library uses, no ad-hoc regex. */
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { api } from '@/api/client'
import { useSessionStore, type SessionUser } from '@/stores/session'

interface LoginPayload {
  username: string
  password: string
}

interface LoginResult {
  token: string
  user: SessionUser
}

const formRef = ref<FormInstance>()
const submitting = ref(false)
const form = reactive<LoginPayload>({ username: 'admin', password: 'admin' })

const rules: FormRules<LoginPayload> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码至少 4 位', trigger: 'blur' },
  ],
}

const router = useRouter()
const route = useRoute()
const session = useSessionStore()

async function submit(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const result = await api.post<LoginResult>('/auth/login', form, { silent: true })
    session.signIn(result.token, result.user)
    ElMessage.success('登录成功')
    const redirect = typeof route.query['redirect'] === 'string' ? route.query['redirect'] : '/dashboard'
    await router.replace(redirect)
  } catch {
    ElMessage.error('用户名或密码错误')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login">
    <el-card class="login__card" shadow="always">
      <h2 class="login__title">Console</h2>
      <p class="login__sub">请登录以继续</p>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password autocomplete="current-password" />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="submitting" class="login__submit">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login {
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1f2937, #111827);
}
.login__card {
  width: min(360px, 90vw);
  border-radius: 12px;
}
.login__title {
  margin: 0;
  font-size: 20px;
}
.login__sub {
  margin: 4px 0 20px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.login__submit {
  width: 100%;
}
</style>

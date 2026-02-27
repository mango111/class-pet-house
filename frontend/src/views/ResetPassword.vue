<template>
  <div class="min-h-screen bg-theme flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-700 mb-2">🔐 重置密码</h1>
      <p class="text-center text-gray-400 mb-6">使用激活码重置密码</p>

      <div v-if="error" class="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">{{ error }}</div>
      <div v-if="success" class="bg-green-50 text-green-500 text-sm p-3 rounded-lg mb-4">{{ success }}</div>

      <div class="space-y-4">
        <input v-model="username" type="text" placeholder="用户名"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent outline-none" />
        <input v-model="activationCode" type="text" placeholder="激活码"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent outline-none" />
        <input v-model="newPassword" type="password" placeholder="新密码（至少6位）"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent outline-none" />
        <button @click="handleReset" :disabled="loading"
          class="w-full py-3 bg-accent bg-accent-hover text-white rounded-xl font-medium transition active:scale-95">
          {{ loading ? '重置中...' : '重置密码' }}
        </button>
      </div>
      <div class="mt-4 text-center text-sm text-gray-400">
        <router-link to="/login" class="hover:text-accent">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../utils/api'

const username = ref('')
const activationCode = ref('')
const newPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleReset() {
  if (!username.value || !activationCode.value || !newPassword.value) {
    error.value = '请填写完整信息'; return
  }
  loading.value = true; error.value = ''
  try {
    await api.post('/auth/reset-password', {
      username: username.value,
      activationCode: activationCode.value,
      newPassword: newPassword.value
    })
    success.value = '密码重置成功，请返回登录'
  } catch (err) {
    error.value = err.error || '重置失败'
  } finally { loading.value = false }
}
</script>

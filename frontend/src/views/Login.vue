<template>
  <div class="min-h-screen bg-amber-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-700 mb-2">🐾 班级宠物屋</h1>
      <p class="text-center text-gray-400 mb-6">登录你的账号</p>

      <div v-if="error" class="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">{{ error }}</div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm text-gray-500 mb-1">用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition" />
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition" />
        </div>
        <button @click="handleLogin" :disabled="loading"
          class="w-full py-3 bg-pink-400 hover:bg-pink-500 text-white rounded-xl font-medium transition active:scale-95 disabled:opacity-50">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>

      <div class="mt-4 text-center text-sm text-gray-400 space-x-4">
        <router-link to="/register" class="hover:text-pink-400">注册账号</router-link>
        <router-link to="/reset-password" class="hover:text-pink-400">忘记密码</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = '请填写用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = await auth.login(username.value, password.value)
    if (data.status === 'not_activated') {
      router.push('/activate')
    } else {
      router.push('/')
    }
  } catch (err) {
    error.value = err.error || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

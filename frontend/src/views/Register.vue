<template>
  <div class="min-h-screen bg-theme flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-700 mb-2">🐾 班级宠物屋</h1>
      <p class="text-center text-gray-400 mb-6">注册新账号</p>

      <div v-if="error" class="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">{{ error }}</div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm text-gray-500 mb-1">用户名</label>
          <input v-model="username" type="text" placeholder="3-20个字符"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent ring-accent outline-none transition" />
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">密码</label>
          <input v-model="password" type="password" placeholder="至少6个字符"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent ring-accent outline-none transition" />
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">确认密码</label>
          <input v-model="confirmPassword" type="password" placeholder="再次输入密码" @keyup.enter="handleRegister"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent ring-accent outline-none transition" />
        </div>
        <button @click="handleRegister" :disabled="loading"
          class="w-full py-3 bg-accent bg-accent-hover text-white rounded-xl font-medium transition active:scale-95 disabled:opacity-50">
          {{ loading ? '注册中...' : '立即注册' }}
        </button>
      </div>

      <div class="mt-4 text-center text-sm text-gray-400">
        已有账号？<router-link to="/login" class="hover:text-accent">去登录</router-link>
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
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!username.value || !password.value) {
    error.value = '请填写完整信息'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次密码不一致'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.register(username.value, password.value)
    router.push('/activate')
  } catch (err) {
    error.value = err.error || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

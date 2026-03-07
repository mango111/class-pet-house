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
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="至少6个字符"
              class="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-accent ring-accent outline-none transition" />
            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">确认密码</label>
          <div class="relative">
            <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="再次输入密码"
              class="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-accent ring-accent outline-none transition" />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
              <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">系统邀请/激活码</label>
          <input v-model="activationCode" type="text" placeholder="例如：CPH-A1B2C3D4" @keyup.enter="handleRegister"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent ring-accent outline-none transition uppercase" />
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
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const activationCode = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!username.value || !password.value || !activationCode.value) {
    error.value = '请填写完整的账号、密码和激活码'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次密码不一致'
    return
  }
  loading.value = true
  error.value = ''
  try {
    // 传递激活码到统一注册接口
    await auth.register(username.value, password.value, activationCode.value)
    // 注册并激活成功，直接跳转大厅
    router.push('/')
  } catch (err) {
    error.value = err.error || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-amber-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-700 mb-2">🔑 激活账号</h1>
      <p class="text-center text-gray-400 mb-6">请输入您的激活码</p>

      <div v-if="error" class="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">{{ error }}</div>
      <div v-if="success" class="bg-green-50 text-green-500 text-sm p-3 rounded-lg mb-4">{{ success }}</div>

      <div class="space-y-4">
        <input v-model="code" type="text" placeholder="请输入激活码" @keyup.enter="handleActivate"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition" />
        <button @click="handleActivate" :disabled="loading"
          class="w-full py-3 bg-pink-400 hover:bg-pink-500 text-white rounded-xl font-medium transition active:scale-95 disabled:opacity-50">
          {{ loading ? '激活中...' : '立即激活' }}
        </button>
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
const code = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleActivate() {
  if (!code.value) { error.value = '请输入激活码'; return }
  loading.value = true; error.value = ''
  try {
    await auth.activate(code.value)
    success.value = '激活成功！即将跳转...'
    setTimeout(() => router.push('/'), 1500)
  } catch (err) {
    error.value = err.error || '激活失败'
  } finally { loading.value = false }
}
</script>

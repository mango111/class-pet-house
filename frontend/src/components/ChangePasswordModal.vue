<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 zoom-in">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" @click.stop>
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">🔑 修改密码</h2>
          <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div v-if="error" class="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">{{ error }}</div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
            <div class="relative">
              <input v-model="oldPassword" :type="showOld ? 'text' : 'password'" placeholder="请输入现在的密码"
                class="w-full px-4 py-3 pr-10 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-accent focus:bg-white transition" />
              <button type="button" @click="showOld = !showOld" class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg v-if="!showOld" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <div class="relative">
              <input v-model="newPassword" :type="showNew ? 'text' : 'password'" placeholder="至少6个字符" @keyup.enter="submit"
                class="w-full px-4 py-3 pr-10 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-accent focus:bg-white transition" />
              <button type="button" @click="showNew = !showNew" class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg v-if="!showNew" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-8 flex gap-3">
          <button @click="close" class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition active:scale-95">取消</button>
          <button @click="submit" :disabled="loading" class="flex-1 px-4 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition active:scale-95 disabled:opacity-50">
            {{ loading ? '修改中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../utils/api'
import Dialog from '../utils/dialog'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close'])

const oldPassword = ref('')
const newPassword = ref('')
const showOld = ref(false)
const showNew = ref(false)
const loading = ref(false)
const error = ref('')

function close() {
  oldPassword.value = ''
  newPassword.value = ''
  showOld.value = false
  showNew.value = false
  error.value = ''
  emit('close')
}

async function submit() {
  if (!oldPassword.value || !newPassword.value) {
    error.value = '请填写完整信息'
    return
  }
  if (newPassword.value.length < 6) {
    error.value = '新密码至少6位字符'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await api.put('/auth/change-password', { 
      oldPassword: oldPassword.value, 
      newPassword: newPassword.value 
    })
    Dialog.alert('密码修改成功')
    close()
  } catch (err) {
    error.value = err.error || '修改失败'
  } finally {
    loading.value = false
  }
}
</script>

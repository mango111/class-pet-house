<template>
  <div class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 md:p-4"
    @click.self="$emit('close')">
    <div class="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[75vh] sm:max-h-[80vh] flex flex-col overflow-hidden animate-bounce-in">
      
      <!-- 渐变头部 -->
      <div class="shrink-0 bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 px-4 py-3 sm:px-6 sm:py-5 relative">
        <h3 class="text-lg sm:text-xl font-black text-white">批量导入学生名单</h3>
        <p class="text-white/80 text-xs sm:text-sm mt-0.5 pr-8">一行一个姓名，系统自动过滤空行重复</p>
        <button @click="$emit('close')" class="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 flex items-center justify-center text-white/80 hover:text-white text-xl font-bold transition-colors">✕</button>
      </div>

      <!-- 可滚动内容区 -->
      <div class="flex-1 overflow-y-auto min-h-0 p-3 sm:p-6 bg-slate-50">
        <textarea v-model="text" rows="6" placeholder="例如：
张三
李四
王五"
          class="w-full h-full min-h-[120px] px-3 py-3 rounded-2xl border-2 border-slate-200 outline-none
          focus:border-accent text-sm sm:text-base bg-white shadow-sm resize-none tracking-wide text-slate-700"></textarea>
      </div>

      <!-- 底部按钮区 -->
      <div class="shrink-0 p-4 sm:p-5 bg-white border-t border-slate-100 flex gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-5">
        <button @click="$emit('close')"
          class="px-6 py-3 bg-slate-100/80 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">取消</button>
        <button @click="handleAdd" :disabled="loading"
          class="flex-1 py-3 bg-gradient-to-r from-accent to-indigo-500 text-white rounded-xl font-bold shadow-md shadow-accent/30 hover:-translate-y-0.5 active:scale-95 transition-all outline-none disabled:opacity-50 disabled:translate-y-0 disabled:active:scale-100 disabled:shadow-none">
          <span v-if="loading" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          {{ loading ? '正在导入数据...' : '✨ 确认导入名单' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useClassStore } from '../stores/class'
import { useEscClose } from '../composables/useEscClose'
import api from '../utils/api'
import Dialog from '../utils/dialog'

const emit = defineEmits(['close', 'added'])
useEscClose(emit)
const classStore = useClassStore()
const text = ref('')
const loading = ref(false)

async function handleAdd() {
  const names = text.value.split('\n').map(s => s.trim()).filter(Boolean)
  if (!names.length) return
  loading.value = true
  try {
    await api.post('/students', {
      class_id: classStore.currentClass.id,
      names
    })
    await classStore.fetchStudents()
    emit('added')
  } catch (err) {
    Dialog.alert(err.error || '添加失败')
  } finally {
    loading.value = false
  }
}
</script>

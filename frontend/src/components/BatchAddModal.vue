<template>
  <div class="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center"
    @click.self="$emit('close')">
    <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm p-5">
      <h3 class="text-center font-bold text-gray-700 mb-3">批量添加学生</h3>
      <p class="text-xs text-gray-400 mb-2">一行一个姓名，自动过滤空行和重复</p>
      <textarea v-model="text" rows="8" placeholder="张三&#10;李四&#10;王五"
        class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none
        focus:border-accent text-sm resize-none"></textarea>
      <div class="flex gap-2 mt-3">
        <button @click="$emit('close')"
          class="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">取消</button>
        <button @click="handleAdd" :disabled="loading"
          class="flex-1 py-2 bg-accent text-white rounded-lg text-sm">
          {{ loading ? '添加中...' : '确认添加' }}
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
    alert(err.error || '添加失败')
  } finally {
    loading.value = false
  }
}
</script>

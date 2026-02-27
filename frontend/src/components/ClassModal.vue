<template>
  <div class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <h2 class="text-lg font-bold text-gray-700 mb-4">📚 班级管理</h2>

      <!-- 班级列表 -->
      <div class="space-y-2 max-h-60 overflow-y-auto mb-4">
        <div v-for="cls in classStore.classes" :key="cls.id"
          class="flex items-center justify-between p-3 rounded-xl border transition cursor-pointer"
          :class="cls.id === classStore.currentClass?.id ? 'border-accent bg-theme-light' : 'border-gray-100 hover:bg-gray-50'"
          @click="switchTo(cls)">
          <span class="text-gray-700">{{ cls.name }}</span>
          <div class="flex gap-1">
            <span v-if="cls.id === classStore.currentClass?.id" class="text-xs text-accent">当前</span>
            <button @click.stop="editClass(cls)" class="text-gray-400 hover:text-gray-600 text-sm">✏️</button>
            <button @click.stop="deleteClass(cls)" class="text-gray-400 hover:text-red-500 text-sm">🗑️</button>
          </div>
        </div>
      </div>

      <!-- 创建新班级 -->
      <div class="flex gap-2">
        <input v-model="newName" type="text" placeholder="新班级名称"
          class="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-accent" />
        <button @click="createClass" class="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-hover">
          ➕ 创建
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useClassStore } from '../stores/class'
import api from '../utils/api'

const emit = defineEmits(['close'])
const classStore = useClassStore()
const newName = ref('')

import { useEscClose } from '../composables/useEscClose'
useEscClose(emit)

async function switchTo(cls) {
  await classStore.switchClass(cls)
  emit('close')
}

async function createClass() {
  if (!newName.value.trim()) return
  await api.post('/classes', { name: newName.value.trim() })
  newName.value = ''
  await classStore.fetchClasses()
}

async function editClass(cls) {
  const name = prompt('修改班级名称', cls.name)
  if (!name || name === cls.name) return
  await api.put(`/classes/${cls.id}`, { name })
  await classStore.fetchClasses()
}

async function deleteClass(cls) {
  if (!confirm(`确定删除"${cls.name}"？所有数据将丢失！`)) return
  try {
    await api.delete(`/classes/${cls.id}`)
    await classStore.fetchClasses()
  } catch (err) {
    alert(err.error || '删除失败')
  }
}
</script>

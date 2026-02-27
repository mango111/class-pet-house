<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold text-gray-700 mb-4">☁️ 成长记录</h2>

    <div class="space-y-2">
      <div v-for="h in history" :key="h.id"
        class="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm"
        :class="{ 'opacity-50 line-through': h.is_revoked }">
        <span class="text-lg">{{ h.type === 'graduate' ? '🎓' : h.type === 'exchange' ? '🛍️' : h.value > 0 ? '➕' : '➖' }}</span>
        <div class="flex-1">
          <p class="text-sm text-gray-700">
            <span class="font-medium">{{ h.Student?.name || '未知' }}</span>
            {{ h.rule_name || h.type }}
          </p>
          <p class="text-xs text-gray-400">{{ formatTime(h.created_at) }}</p>
        </div>
        <span class="text-sm font-bold" :class="h.value > 0 ? 'text-green-500' : 'text-red-500'">
          {{ h.value > 0 ? '+' : '' }}{{ h.value }}
        </span>
      </div>
    </div>

    <div v-if="!history.length" class="text-center py-20 text-gray-400">
      <p class="text-4xl mb-2">📝</p>
      <p>暂无记录</p>
    </div>

    <button v-if="hasMore" @click="loadMore"
      class="w-full mt-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">加载更多</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useClassStore } from '../stores/class'
import api from '../utils/api'

const classStore = useClassStore()
const history = ref([])
const hasMore = ref(false)
const offset = ref(0)
const limit = 50

onMounted(() => loadHistory())

async function loadHistory() {
  if (!classStore.currentClass) return
  const data = await api.get(
    `/history/class/${classStore.currentClass.id}?limit=${limit}&offset=${offset.value}`
  )
  history.value = data.rows || []
  hasMore.value = data.count > offset.value + limit
}

async function loadMore() {
  offset.value += limit
  const data = await api.get(
    `/history/class/${classStore.currentClass.id}?limit=${limit}&offset=${offset.value}`
  )
  history.value.push(...(data.rows || []))
  hasMore.value = data.count > offset.value + limit
}

function formatTime(t) {
  return new Date(t).toLocaleString('zh-CN')
}
</script>

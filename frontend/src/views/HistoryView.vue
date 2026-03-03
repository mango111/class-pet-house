<template>
  <div class="max-w-2xl mx-auto px-2 sm:px-0">
    <h2 class="text-lg sm:text-xl font-bold text-gray-700 mb-4">☁️ 成长记录</h2>

    <div class="space-y-2">
      <div v-for="h in history" :key="h.id"
        class="flex items-center gap-2 sm:gap-3 bg-white rounded-xl p-2.5 sm:p-3 shadow-sm"
        :class="{ 'opacity-50 line-through': h.is_revoked }">
        <span class="text-base sm:text-lg">{{ h.type === 'graduate' ? '🎓' : h.type === 'exchange' ? '🛍️' : h.value > 0 ? '➕' : '➖' }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm text-gray-700 truncate">
            <span class="font-medium">{{ h.Student?.name || '未知' }}</span>
            {{ h.rule_name || h.type }}
          </p>
          <p class="text-[10px] sm:text-xs text-gray-400">{{ formatTime(h.createdAt) }}</p>
        </div>
        <span class="text-xs sm:text-sm font-bold shrink-0" :class="h.value > 0 ? 'text-green-500' : 'text-red-500'">
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
import { ref, watch } from 'vue'
import { useClassStore } from '../stores/class'
import api from '../utils/api'

const classStore = useClassStore()
const history = ref([])
const hasMore = ref(false)
const offset = ref(0)
const limit = 50

watch(() => classStore.currentClass, (newClass) => {
  if (newClass) {
    offset.value = 0
    loadHistory()
  }
}, { immediate: true })

async function loadHistory() {
  if (!classStore.currentClass) return
  try {
    const data = await api.get(
      `/history/class/${classStore.currentClass.id}?limit=${limit}&offset=${offset.value}`
    )
    history.value = data.rows || []
    hasMore.value = data.count > offset.value + limit
  } catch {}
}

async function loadMore() {
  offset.value += limit
  try {
    const data = await api.get(
      `/history/class/${classStore.currentClass.id}?limit=${limit}&offset=${offset.value}`
    )
    history.value.push(...(data.rows || []))
    hasMore.value = data.count > offset.value + limit
  } catch {}
}

function formatTime(t) {
  if (!t) return ''
  try {
    const d = new Date(t)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }).replace(/\//g, '-')
  } catch (e) {
    return ''
  }
}
</script>

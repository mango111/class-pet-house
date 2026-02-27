<template>
  <div class="min-h-screen bg-amber-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <!-- 左侧：班级名称 -->
        <div class="flex items-center gap-3">
          <button @click="showClassModal = true" class="text-gray-700 font-medium hover:text-pink-500 transition">
            🐾 {{ classStore.currentClass?.system_name || '班级宠物屋' }}
            <span class="text-sm text-gray-400 ml-1">{{ classStore.currentClass?.name || '' }}</span>
            <span class="text-xs">▼</span>
          </button>
        </div>

        <!-- 中间：搜索框 -->
        <div class="hidden md:flex items-center">
          <input v-model="searchQuery" type="text" placeholder="🔍 搜索学生..."
            class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-pink-300 outline-none w-48" />
        </div>

        <!-- 右侧：功能按钮 -->
        <div class="flex items-center gap-2">
          <button v-if="!batchMode" @click="batchMode = true"
            class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="批量操作">👥</button>
          <button v-else @click="batchMode = false; selectedStudents.clear()"
            class="p-2 rounded-lg bg-red-50 text-red-500 text-sm">❌ 退出</button>

          <button @click="undoMode = !undoMode"
            :class="undoMode ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-100'"
            class="p-2 rounded-lg text-sm" title="撤回">↩️</button>

          <router-link to="/history" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="成长记录">☁️</router-link>
          <router-link to="/leaderboard" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="光荣榜">🏆</router-link>
          <router-link to="/shop" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="小卖部">🛍️</router-link>
          <router-link to="/settings" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="设置">⚙️</router-link>
        </div>
      </div>
    </nav>

    <!-- 分组筛选栏 -->
    <div v-if="classStore.groups.length" class="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto">
      <button @click="activeGroup = null"
        :class="activeGroup === null ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-600'"
        class="px-3 py-1 rounded-full text-sm whitespace-nowrap transition">全部</button>
      <button v-for="g in classStore.groups" :key="g.id" @click="activeGroup = g.id"
        :class="activeGroup === g.id ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-600'"
        class="px-3 py-1 rounded-full text-sm whitespace-nowrap transition">{{ g.name }}</button>
      <button @click="activeGroup = 'ungrouped'"
        :class="activeGroup === 'ungrouped' ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-600'"
        class="px-3 py-1 rounded-full text-sm whitespace-nowrap transition">未分组</button>
    </div>

    <!-- 主内容区 -->
    <main class="max-w-6xl mx-auto p-4">
      <router-view
        :search-query="searchQuery"
        :batch-mode="batchMode"
        :undo-mode="undoMode"
        :active-group="activeGroup"
        :selected-students="selectedStudents"
        @select-student="toggleStudent"
      />
    </main>

    <!-- 批量操作底栏 -->
    <div v-if="batchMode" class="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-3 flex items-center justify-between z-50">
      <span class="text-sm text-gray-500">已选 {{ selectedStudents.size }} 人</span>
      <div class="flex gap-2">
        <button @click="selectAll" class="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">全选</button>
        <button @click="handleBatchScore" class="px-4 py-1.5 bg-pink-400 text-white rounded-lg text-sm">✨ 批量喂养</button>
      </div>
    </div>

    <!-- 班级切换弹窗 -->
    <ClassModal v-if="showClassModal" @close="showClassModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useClassStore } from '../stores/class'
import ClassModal from '../components/ClassModal.vue'

const classStore = useClassStore()
const searchQuery = ref('')
const batchMode = ref(false)
const undoMode = ref(false)
const activeGroup = ref(null)
const selectedStudents = ref(new Set())
const showClassModal = ref(false)

function toggleStudent(id) {
  if (selectedStudents.value.has(id)) {
    selectedStudents.value.delete(id)
  } else {
    selectedStudents.value.add(id)
  }
}

function selectAll() {
  classStore.students.forEach(s => selectedStudents.value.add(s.id))
}

function handleBatchScore() {
  // TODO: 弹出积分规则选择
}

onMounted(async () => {
  await classStore.fetchClasses()
  if (classStore.currentClass) {
    await classStore.fetchStudents()
    await classStore.fetchGroups()
  }
})
</script>

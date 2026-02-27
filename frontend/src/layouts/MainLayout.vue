<template>
  <div class="min-h-screen bg-theme">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <!-- 左侧：班级名称 -->
        <div class="flex items-center gap-3">
          <button @click="showClassModal = true" class="text-gray-700 font-medium hover:text-accent transition">
            🐾 {{ classStore.currentClass?.system_name || '班级宠物屋' }}
            <span class="text-sm text-gray-400 ml-1">{{ classStore.currentClass?.name || '' }}</span>
            <span class="text-xs">▼</span>
          </button>
        </div>

        <!-- 中间：搜索框（移动端也显示） -->
        <div class="flex items-center">
          <input v-model="searchQuery" type="text" placeholder="🔍 搜索学生..."
            class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-accent outline-none w-32 md:w-48" />
        </div>

        <!-- 右侧：功能按钮 -->
        <div class="flex items-center gap-1">
          <button v-if="!batchMode" @click="batchMode = true"
            class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="批量操作">👥</button>
          <button v-else @click="exitBatch"
            class="p-2 rounded-lg bg-red-50 text-red-500 text-sm">❌</button>

          <button @click="undoMode = !undoMode"
            :class="undoMode ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-100'"
            class="p-2 rounded-lg text-sm" title="撤回">↩️</button>

          <!-- 移动端：更多菜单 -->
          <div class="relative md:hidden">
            <button @click="showMenu = !showMenu" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm">☰</button>
            <div v-if="showMenu" class="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border py-1 w-32 z-50">
              <button @click="showRandomPick=true; showMenu=false" class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">🎲 随机点名</button>
              <button @click="showTimer=true; showMenu=false" class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">⏱️ 计时器</button>
              <router-link to="/history" class="block px-3 py-2 text-sm hover:bg-gray-50" @click="showMenu=false">☁️ 成长记录</router-link>
              <router-link to="/leaderboard" class="block px-3 py-2 text-sm hover:bg-gray-50" @click="showMenu=false">🏆 光荣榜</router-link>
              <router-link to="/shop" class="block px-3 py-2 text-sm hover:bg-gray-50" @click="showMenu=false">🛍️ 小卖部</router-link>
              <router-link to="/settings" class="block px-3 py-2 text-sm hover:bg-gray-50" @click="showMenu=false">⚙️ 设置</router-link>
            </div>
          </div>

          <!-- 桌面端：直接显示 -->
          <div class="hidden md:flex items-center gap-1">
            <button @click="showRandomPick=true" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="随机点名">🎲</button>
            <button @click="showTimer=true" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="计时器">⏱️</button>
            <router-link to="/history" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="成长记录">☁️</router-link>
            <router-link to="/leaderboard" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="光荣榜">🏆</router-link>
            <router-link to="/shop" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="小卖部">🛍️</router-link>
            <router-link to="/settings" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-sm" title="设置">⚙️</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 分组筛选栏 -->
    <div v-if="classStore.groups.length" class="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto">
      <button @click="activeGroup = null"
        :class="activeGroup === null ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'"
        class="px-3 py-1 rounded-full text-sm whitespace-nowrap transition">全部</button>
      <button v-for="g in classStore.groups" :key="g.id" @click="activeGroup = g.id"
        :class="activeGroup === g.id ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'"
        class="px-3 py-1 rounded-full text-sm whitespace-nowrap transition">{{ g.name }}</button>
      <button @click="activeGroup = 'ungrouped'"
        :class="activeGroup === 'ungrouped' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'"
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
      <span class="text-sm text-gray-500">已选 {{ selectedIds.length }} 人</span>
      <div class="flex gap-2">
        <button @click="selectAll" class="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">全选</button>
        <button @click="showBatchScoreModal = true" :disabled="!selectedIds.length"
          class="px-4 py-1.5 bg-accent text-white rounded-lg text-sm disabled:opacity-50">✨ 批量喂养</button>
      </div>
    </div>

    <!-- 班级切换弹窗 -->
    <ClassModal v-if="showClassModal" @close="showClassModal = false" />

    <!-- 批量喂养弹窗 -->
    <ScoreRuleModal
      v-if="showBatchScoreModal"
      :student="null"
      :batch-ids="selectedIds"
      @close="showBatchScoreModal = false"
      @scored="onBatchScored"
    />

    <!-- 随机点名 -->
    <RandomPick v-if="showRandomPick" @close="showRandomPick = false" />

    <!-- 课堂计时器 -->
    <ClassTimer v-if="showTimer" @close="showTimer = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClassStore } from '../stores/class'
import { useTheme } from '../composables/useTheme'
import ClassModal from '../components/ClassModal.vue'
import ScoreRuleModal from '../components/ScoreRuleModal.vue'
import RandomPick from '../components/RandomPick.vue'
import ClassTimer from '../components/ClassTimer.vue'

const classStore = useClassStore()
const { setTheme } = useTheme()
const searchQuery = ref('')
const batchMode = ref(false)
const undoMode = ref(false)
const activeGroup = ref(null)
const selectedIds = ref([])
const showClassModal = ref(false)
const showBatchScoreModal = ref(false)
const showMenu = ref(false)
const showRandomPick = ref(false)
const showTimer = ref(false)

// 兼容旧的 Set 接口给子组件用
const selectedStudents = computed(() => new Set(selectedIds.value))

function toggleStudent(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function selectAll() {
  selectedIds.value = classStore.students.map(s => s.id)
}

function exitBatch() {
  batchMode.value = false
  selectedIds.value = []
}

async function onBatchScored() {
  showBatchScoreModal.value = false
  try { await classStore.fetchStudents() } catch {}
  exitBatch()
}

onMounted(async () => {
  try {
    await classStore.fetchClasses()
    if (classStore.currentClass) {
      await Promise.all([
        classStore.fetchStudents(),
        classStore.fetchGroups()
      ])
    }
  } catch {}
})
</script>

<template>
  <div class="min-h-screen text-gray-800 pb-20 md:pb-20 overflow-x-hidden">
    <!-- 顶部绝美悬浮导航栏 (Floating glass dock) -->
    <div class="fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <nav class="max-w-6xl mx-auto h-[4.5rem] bg-white/80 backdrop-blur-2xl border-2 border-white rounded-[2.5rem] shadow-[0_15px_35px_-10px_var(--theme-ring)] flex items-center justify-between px-4 sm:px-6 pointer-events-auto transition-all duration-500">
        
        <!-- 左侧：班级名称 -->
        <div class="flex items-center">
          <button @click="showClassModal = true" class="group flex items-center gap-1.5 sm:gap-2 text-slate-800 font-bold transition">
            <span class="text-2xl sm:text-3xl drop-shadow-sm">🐾</span> 
            <span class="font-kuaile text-lg sm:text-xl tracking-wide hidden sm:inline-block">{{ classStore.currentClass?.system_name || '班级宠物屋' }}</span>
            <span class="text-[11px] sm:text-xs font-bold bg-white/80 px-3 py-1.5 rounded-full border border-white text-slate-700 shadow-sm ml-1 sm:ml-2 hover:bg-white transition-colors">{{ classStore.currentClass?.name || '选择班级' }} ▼</span>
          </button>
        </div>

        <!-- 中间：搜索框 -->
        <div class="flex items-center hidden lg:block">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input v-model="searchQuery" type="text" placeholder="搜索学生..."
              class="pl-9 pr-4 py-2 bg-white/50 rounded-2xl border-2 border-white text-sm focus:border-accent focus:bg-white outline-none w-48 shadow-sm transition-all focus:shadow-[0_4px_15px_-3px_var(--theme-light)] focus:-translate-y-0.5 font-nunito font-bold text-gray-600 placeholder-gray-400" />
          </div>
        </div>

        <!-- 右侧：功能按钮 -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- 批量操作与撤回 -->
          <div v-if="route.path === '/'" class="flex items-center bg-white rounded-full p-1 shadow-sm border border-slate-100">
            <div class="relative group hidden sm:block">
              <button v-if="!batchMode" @click="batchMode = true"
                class="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-transparent text-slate-500 hover:bg-slate-50 hover:text-accent transition-colors">
                <span class="text-lg sm:text-xl">👥</span>
              </button>
              <div v-if="!batchMode" class="absolute top-14 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">批量操作</div>
            </div>
            <button v-if="!batchMode" @click="batchMode = true"
              class="sm:hidden flex items-center justify-center w-9 h-9 rounded-full text-slate-500">
              <span class="text-lg">👥</span>
            </button>
            
            <button v-if="batchMode" @click="exitBatch"
              class="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-4 sm:py-2 gap-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
              <span class="text-lg sm:text-xl">❌</span><span class="text-sm font-bold hidden sm:inline">退出</span>
            </button>

            <div class="w-px h-5 bg-slate-200 mx-1"></div>

            <div class="relative group hidden sm:block">
              <button @click="undoMode = !undoMode"
                :class="undoMode ? 'bg-red-50 text-red-500' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-accent'"
                class="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-colors">
                <span class="text-lg sm:text-xl">↩️</span>
              </button>
              <div class="absolute top-14 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">撤销修改</div>
            </div>
            <button @click="undoMode = !undoMode"
              :class="undoMode ? 'bg-red-50 text-red-500' : 'text-slate-500'"
              class="sm:hidden flex items-center justify-center w-9 h-9 rounded-full">
              <span class="text-lg">↩️</span>
            </button>
          </div>

          <!-- 已移除移动端汉堡菜单 -->

          <!-- 桌面端核心操作大图标区 -->
          <div class="hidden md:flex items-center gap-3 bg-white/50 rounded-2xl p-1 border-2 border-white shadow-sm">
            <div class="relative group">
              <router-link to="/" class="btn-toy flex items-center justify-center w-10 h-10 bg-white rounded-xl text-theme-text">
                <span class="text-xl">🏠</span>
              </router-link>
              <div class="absolute top-14 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-800 text-white font-bold text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">返回首页</div>
            </div>
            <div class="relative group">
              <button @click="showRandomPick=true" class="btn-toy flex items-center justify-center w-10 h-10 bg-white rounded-xl text-theme-text">
                <span class="text-xl">🎲</span>
              </button>
              <div class="absolute top-14 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-800 text-white font-bold text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">趣味点名</div>
            </div>
            <div class="relative group">
              <button @click="showTimer=true" class="btn-toy flex items-center justify-center w-10 h-10 bg-white rounded-xl text-theme-text">
                <span class="text-xl">⏱️</span>
              </button>
              <div class="absolute top-14 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-800 text-white font-bold text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">课堂计时</div>
            </div>
            <div class="relative group">
              <router-link to="/history" class="btn-toy flex items-center justify-center w-10 h-10 bg-white rounded-xl text-theme-text">
                <span class="text-xl">☁️</span>
              </router-link>
              <div class="absolute top-14 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-800 text-white font-bold text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">成长足迹</div>
            </div>
            <div class="relative group">
              <router-link to="/leaderboard" class="btn-toy flex items-center justify-center w-10 h-10 bg-white rounded-xl text-theme-text">
                <span class="text-xl">🏆</span>
              </router-link>
              <div class="absolute top-14 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-800 text-white font-bold text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">荣耀榜单</div>
            </div>
            <div class="relative group">
              <router-link to="/shop" class="btn-toy flex items-center justify-center w-10 h-10 bg-white rounded-xl text-theme-text">
                <span class="text-xl">🛍️</span>
              </router-link>
              <div class="absolute top-14 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-800 text-white font-bold text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">神奇小卖部</div>
            </div>
            <div class="relative group">
              <router-link to="/settings" class="btn-toy flex items-center justify-center w-10 h-10 bg-white rounded-xl text-gray-600">
                <span class="text-xl">⚙️</span>
              </router-link>
              <div class="absolute top-14 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-800 text-white font-bold text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">控制台</div>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- 为了给原先吸顶导航腾出空间 -->
    <div class="h-28"></div>

    <!-- 分组筛选栏 (极简高级圆角) -->
    <div v-if="classStore.groups.length" class="max-w-6xl mx-auto px-4 mb-4 relative z-40">
      <div class="bg-white/60 backdrop-blur-md border border-white/80 rounded-full px-1.5 py-1.5 flex gap-1.5 overflow-x-auto shadow-sm max-w-max">
        <button @click="activeGroup = null"
          :class="activeGroup === null ? 'bg-accent/10 text-accent font-extrabold' : 'text-slate-500 hover:bg-white/60'"
          class="px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all">全部同学</button>
        <button v-for="g in classStore.groups" :key="g.id" @click="activeGroup = g.id"
          :class="activeGroup === g.id ? 'bg-accent/10 text-accent font-extrabold' : 'text-slate-500 hover:bg-white/60'"
          class="px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all">{{ g.name }}</button>
        <button @click="activeGroup = 'ungrouped'"
          :class="activeGroup === 'ungrouped' ? 'bg-accent/10 text-accent font-extrabold' : 'text-slate-500 hover:bg-white/60'"
          class="px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all">未分组</button>
      </div>
    </div>

    <!-- 主内容区 -->
    <main class="max-w-6xl mx-auto p-4 flex-1">
      <router-view
        :search-query="searchQuery"
        :batch-mode="batchMode"
        :undo-mode="undoMode"
        :active-group="activeGroup"
        :selected-students="selectedStudents"
        @select-student="toggleStudent"
      />
    </main>

    <!-- 批量操作底栏 (浮动卡片式) 注意移动端高度需要更高以避开TabBar -->
    <div v-if="batchMode" class="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] border-2 border-white rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-6 z-50 w-[90%] md:w-auto max-w-sm md:max-w-none">
      <span class="font-bold text-gray-600">已选 <span class="text-accent text-xl mx-1">{{ selectedIds.length }}</span> 人</span>
      <div class="flex gap-3">
        <button @click="toggleSelectAll" class="btn-toy px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-600">
          {{ isAllSelected ? '取消全选' : '全选同学们' }}
        </button>
        <button @click="showBatchScoreModal = true" :disabled="!selectedIds.length"
          class="btn-toy px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-bold disabled:opacity-50 shadow-[0_4px_0_var(--theme-shadow-hard)] flex items-center gap-2">
          <span class="text-lg">✨</span> 批量喂养
        </button>
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

    <!-- 移动端专属 TabBar (Mobile Bottom Navbar) -->
    <div class="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none pb-4 px-4 overflow-hidden">
      <nav class="bg-white/90 backdrop-blur-2xl border-2 border-white rounded-[2rem] shadow-[0_15px_35px_-10px_var(--theme-ring)] flex items-center justify-around px-2 py-2 pointer-events-auto">
        <router-link to="/" class="flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all relative group" active-class="text-accent font-black -translate-y-1 bg-theme-light shadow-inner" exact-active-class="text-accent font-black -translate-y-1 bg-theme-light shadow-inner">
          <span class="text-xl mb-0.5 transition-transform" :class="route.path === '/' ? 'scale-110 drop-shadow-sm animate-breathe' : 'grayscale opacity-50 group-hover:scale-110'">🐾</span>
          <span class="text-[10px] leading-none" :class="route.path === '/' ? '' : 'font-bold'">首页</span>
        </router-link>

        <router-link to="/leaderboard" class="flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all relative group" active-class="text-accent font-black -translate-y-1 bg-theme-light shadow-inner">
          <span class="text-xl mb-0.5 transition-transform" :class="route.path.startsWith('/leaderboard') ? 'scale-110 drop-shadow-sm animate-breathe' : 'grayscale opacity-50 group-hover:scale-110'">🏆</span>
          <span class="text-[10px] leading-none" :class="route.path.startsWith('/leaderboard') ? '' : 'font-bold'">光荣榜</span>
        </router-link>

        <router-link to="/history" class="flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all relative group" active-class="text-accent font-black -translate-y-1 bg-theme-light shadow-inner">
          <span class="text-xl mb-0.5 transition-transform" :class="route.path.startsWith('/history') ? 'scale-110 drop-shadow-sm animate-breathe' : 'grayscale opacity-50 group-hover:scale-110'">☁️</span>
          <span class="text-[10px] leading-none" :class="route.path.startsWith('/history') ? '' : 'font-bold'">成长记录</span>
        </router-link>

        <router-link to="/shop" class="flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all relative group" active-class="text-accent font-black -translate-y-1 bg-theme-light shadow-inner">
          <span class="text-xl mb-0.5 transition-transform" :class="route.path.startsWith('/shop') ? 'scale-110 drop-shadow-sm animate-breathe' : 'grayscale opacity-50 group-hover:scale-110'">🛍️</span>
          <span class="text-[10px] leading-none" :class="route.path.startsWith('/shop') ? '' : 'font-bold'">小卖部</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useClassStore } from '../stores/class'
import { useTheme } from '../composables/useTheme'
import ClassModal from '../components/ClassModal.vue'
import ScoreRuleModal from '../components/ScoreRuleModal.vue'
import RandomPick from '../components/RandomPick.vue'
import ClassTimer from '../components/ClassTimer.vue'

const classStore = useClassStore()
const route = useRoute()
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

const validStudents = computed(() => classStore.students.filter(s => s.pet_type))

const isAllSelected = computed(() => {
  return validStudents.value.length > 0 && selectedIds.value.length === validStudents.value.length
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = validStudents.value.map(s => s.id)
  }
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
        classStore.fetchGroups(),
        classStore.fetchScoreRules()
      ])
    }
  } catch {}
})
</script>

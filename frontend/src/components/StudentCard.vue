<template>
  <div
    class="relative rounded-[1.8rem] p-2.5 sm:p-4 flex flex-col h-full cursor-pointer transition-all duration-300 group"
    :class="{
      // 批量选中模式
      'ring-4 ring-accent bg-theme-light scale-[0.98] opacity-90': batchMode && selected,
      // 批量未选中模式
      'border border-dashed border-gray-300 bg-white/50 hover:bg-white scale-100 opacity-70 hover:opacity-100 animate-pulse': batchMode && !selected,
      // 正常模式
      'ring-4 ring-accent bg-white shadow-xl shadow-accent/20 scale-105 z-10': !batchMode && selected,
      'bg-gradient-to-b from-white to-[var(--theme-bg)] shadow-[0_10px_40px_-10px_var(--theme-ring)] opacity-95 blur-[0.2px] saturate-95 hover:opacity-100 hover:blur-none hover:saturate-100 hover:shadow-[0_20px_50px_-10px_var(--theme-ring)] hover:-translate-y-2 transition-all duration-500': !batchMode && !selected
    }"
    @click="$emit(batchMode ? 'select' : 'click')"
  >
    <!-- 批量选择右上角勾选框 -->
    <div v-if="batchMode" class="absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-20"
      :class="selected ? 'bg-accent border-accent text-white scale-110 shadow-md' : 'bg-slate-100 border-slate-300 text-transparent'">
      <span class="text-sm font-bold" v-show="selected">✓</span>
    </div>

    <!-- 顶栏：等级标与更换宠物按钮 -->
    <div class="flex justify-between items-start mb-0 relative z-10 h-6">
      <!-- 夸张放大的等级徽标 -->
      <div v-if="student.pet_type" class="absolute -top-5 -left-4 flex items-baseline space-x-1.5 z-30 drop-shadow-md bg-white/60 backdrop-blur-xl px-3 py-1 rounded-2xl border-2 border-white/80">
        <div class="w-4 h-4 rounded-full shadow-inner" :class="levelDotColor"></div>
        <span class="text-slate-800 font-black text-xl tracking-tighter italic">Lv.{{ petStage }}</span>
      </div>
      
      <!-- 更换宠物按钮 (放缩在右上角) -->
      <button v-if="student.pet_type && !batchMode"
        class="absolute -top-1.5 right-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-50 rounded-full text-xs text-slate-400 hover:text-accent hover:bg-slate-100 transition-colors z-20" title="更换宠物"
        @click.stop="$emit('change-pet')">🔄</button>
    </div>

    <!-- 宠物图片区 (带高级底层光圈) -->
    <div class="flex flex-1 justify-center items-center py-0 relative mt-0">
      <!-- 新增：深邃淡雅的青蓝色光晕底座 -->
      <div v-if="student.pet_type" class="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-cyan-50/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-2xl z-0 pointer-events-none"></div>
      <div v-if="!student.pet_type" class="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center text-4xl sm:text-6xl bg-slate-50 rounded-full border border-slate-100">
        🥚
      </div>
      <div v-else class="relative w-full flex justify-center mt-0 mb-1 animate-float-idle">
        <img :src="petImageUrl" :alt="student.pet_name || '宠物'"
          class="w-24 h-24 sm:w-32 sm:h-32 object-contain relative z-10 animate-breathe transition-transform duration-500 scale-[1.2] sm:scale-[1.3] hover:scale-[1.35] sm:hover:scale-[1.45]" :class="{ 'animate-bounce': justScored }" />
      </div>
    </div>

    <!-- 学生姓名区 -->
    <div class="flex justify-between items-end mt-0 mb-1 px-1 relative z-10">
      <h3 class="text-xl sm:text-2xl font-black text-[#0f172a] truncate tracking-wide leading-tight max-w-[60%] drop-shadow-sm">{{ student.name }}</h3>
      <span v-if="student.pet_type" class="text-xs font-bold text-slate-400 truncate max-w-[35%]">{{ student.pet_name || '未命名' }}</span>
    </div>

    <!-- 进度条系统 (加粗厚实果冻感, 深水蓝色) -->
    <div v-if="student.pet_type" class="flex flex-col gap-1 relative z-10 px-1 mb-1.5">
      <div class="flex justify-between items-center text-xs font-bold">
        <span class="text-slate-400 tracking-wide">本级进度</span>
        <span v-if="!isMaxLevel" class="text-blue-500 font-black flex items-center gap-1">
          <span class="text-slate-500 font-bold">还差</span> <OdometerNumber :value="maxFood - student.food_count" /> <span class="text-[13px]">🍖</span>
        </span>
        <span v-else class="text-yellow-500 font-extrablod">✨ 已满级</span>
      </div>

      <div class="h-2.5 sm:h-3.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
        <div class="h-full bg-[#06b6d4] rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-1 shadow-sm"
          :style="{ width: `${progressPercent}%` }">
        </div>
      </div>
    </div>

    <!-- 底部数据状态标 (纯净无背景一字排开) -->
    <div class="flex justify-between items-center text-xs font-bold text-slate-500 border-t border-slate-100/50 pt-1.5 relative z-10 px-1 mt-auto">
      <div class="flex items-center space-x-1 hover:text-orange-500 transition-colors">
        <span class="text-sm">🍖</span><span><OdometerNumber :value="student.food_count" /></span>
      </div>
      <div class="flex items-center space-x-1 text-slate-400/80">
        <span class="text-sm opacity-50">👥</span><span class="text-[11px] font-medium">{{ groupName }}</span>
      </div>
      <div class="flex items-center space-x-1 hover:text-yellow-500 transition-colors" @click.stop="$emit('show-badges')">
        <span class="text-sm grayscale opacity-30">🏅</span><span class="text-slate-400"><OdometerNumber :value="student.badges ? student.badges.length : 0" /></span>
      </div>
    </div>

    <!-- 满级毕业按钮 -->
    <button v-if="isMaxLevel"
      class="absolute bottom-3 left-3 right-3 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-[1.5rem] text-sm font-bold shadow-md hover:from-yellow-500 hover:to-amber-600 active:scale-95 transition-all z-20"
      @click.stop="$emit('graduate')">
      ✨ 召唤守护兽
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { PETS } from '../utils/pets'
import OdometerNumber from './OdometerNumber.vue'

const props = defineProps({
  student: Object,
  batchMode: Boolean,
  undoMode: Boolean,
  selected: Boolean,
  growthStages: Array
})

defineEmits(['click', 'select', 'change-pet', 'graduate', 'show-badges'])

const justScored = ref(false)

watch(() => props.student.food_count, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    justScored.value = true
    setTimeout(() => { justScored.value = false }, 800)
  }
})

const badges = computed(() => props.student.badges || [])
const maxFood = computed(() => {
  const stages = props.growthStages || [0,5,10,20,30,45,60,75,90,100]
  return stages[stages.length - 1]
})

const progressPercent = computed(() => {
  return Math.min(100, (props.student.food_count / maxFood.value) * 100)
})

const isMaxLevel = computed(() => {
  return props.student.food_count >= maxFood.value
})

const petStage = computed(() => {
  if (!props.student.pet_type) return 1
  const stages = props.growthStages || [0,5,10,20,30,45,60,75,90,100]
  let stage = 1
  for (let i = stages.length - 1; i >= 0; i--) {
    if (props.student.food_count >= stages[i]) { stage = i + 1; break }
  }
  return stage
})

const levelDotColor = computed(() => {
  const colors = ['bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 'bg-orange-400', 'bg-red-400', 'bg-pink-400', 'bg-teal-400', 'bg-indigo-400', 'bg-fuchsia-400', 'bg-rose-400'];
  return colors[(petStage.value - 1) % colors.length];
});

const petImageUrl = computed(() => {
  const pet = PETS.find(p => p.id === props.student.pet_type)
  if (!pet) return ''
  return `/pet-images/${pet.folder}/${petStage.value}.webp`
})
</script>

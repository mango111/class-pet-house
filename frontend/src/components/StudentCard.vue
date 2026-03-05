<template>
  <div
    class="relative rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col cursor-pointer transition-all duration-300 group overflow-hidden"
    :class="{
      'ring-4 ring-accent bg-theme-light scale-[0.98] opacity-90': batchMode && selected,
      'border-2 border-dashed border-gray-300 bg-white/50 hover:bg-white opacity-70 hover:opacity-100': batchMode && !selected,
      'ring-4 ring-accent bg-white shadow-xl shadow-accent/20 scale-[1.02] z-10': !batchMode && selected,
      'bg-white border-2 border-sky-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:border-sky-200 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1': !batchMode && !selected
    }"
    @click="$emit(batchMode ? 'select' : 'click')"
  >
    <!-- 批量选择勾选框 -->
    <div v-if="batchMode" class="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all z-40"
      :class="selected ? 'bg-accent border-accent text-white scale-110 shadow-md' : 'bg-slate-100 border-slate-300 text-transparent'">
      <span class="text-xs sm:text-sm font-bold" v-show="selected">✓</span>
    </div>

    <!-- 顶栏：等级标与操作按钮 -->
    <div class="flex justify-between items-start relative z-30 w-full">
      <div v-if="student.pet_type" class="flex items-center space-x-1 sm:space-x-1.5 bg-white px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-100 shadow-sm">
        <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" :class="levelDotColor"></div>
        <span class="text-slate-800 font-extrabold text-[10px] sm:text-xs tracking-tight italic">Lv.{{ petStage }}</span>
      </div>
      <div v-else></div>
      
      <div v-if="student.pet_type && !batchMode" class="flex gap-1">
        <button class="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-slate-100/90 rounded-full text-[10px] sm:text-xs text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all active:scale-90" title="保存收集卡"
          @click.stop="$emit('print-cert')">🖨️</button>
        <button class="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-violet-50 rounded-full text-[10px] sm:text-xs text-violet-400 hover:text-violet-600 hover:bg-violet-100 transition-all active:scale-90" title="AI评语"
          @click.stop="$emit('ai-evaluate')">✨</button>
        <button class="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-slate-100/90 rounded-full text-[10px] sm:text-xs text-slate-400 hover:text-accent hover:bg-red-50 transition-all active:scale-90" title="更换宠物"
          @click.stop="$emit('change-pet')">🔄</button>
      </div>
    </div>

    <!-- 宠物图片区 -->
    <div class="flex justify-center items-center relative my-1 sm:my-3 h-28 sm:h-40 md:h-44">
      <div v-if="!student.pet_type" class="w-14 h-14 sm:w-28 sm:h-28 flex items-center justify-center text-3xl sm:text-5xl bg-slate-50/60 rounded-full border border-slate-100">
        🥚
      </div>
      <div v-else class="relative w-full h-full flex justify-center items-center animate-float-idle">
        <img v-if="petImageUrl" :src="petImageUrl" :alt="student.pet_name || '宠物'"
          class="max-w-[90%] max-h-[90%] object-contain transition-transform duration-500 drop-shadow-md"
          :class="{ 'animate-bounce': justScored }"
          :style="{ transform: `scale(${petScale})` }" />
        <div v-else class="w-14 h-14 sm:w-28 sm:h-28 flex items-center justify-center text-[10px] sm:text-sm bg-slate-50 rounded-full border border-dashed border-red-200 text-red-300 font-bold text-center p-1">
          已下架
        </div>
      </div>
    </div>

    <!-- 学生姓名区 -->
    <div class="flex items-baseline justify-between gap-1 sm:gap-2 mb-1">
      <h3 class="text-sm sm:text-lg font-extrabold text-slate-800 truncate leading-tight">{{ student.name }}</h3>
      <span v-if="student.pet_type" class="text-[9px] sm:text-xs font-medium text-slate-400 truncate shrink-0">{{ student.pet_name || '未命名' }}</span>
    </div>

    <!-- 进度条区域 -->
    <div v-if="student.pet_type" class="flex flex-col gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
      <div class="flex justify-between items-center text-[10px] sm:text-xs font-semibold">
        <span class="text-slate-400">本级进度</span>
        <span v-if="!isMaxLevel" class="text-blue-600 font-bold flex items-center gap-0.5">
          <span class="text-slate-400 hidden min-[360px]:inline">还差</span>
          <span class="text-[11px] sm:text-sm font-bold"><OdometerNumber :value="maxFood - student.food_count" /></span>
          <span class="text-[9px] sm:text-[10px]">🍖</span>
        </span>
        <span v-else class="text-yellow-500 font-bold text-[10px] sm:text-xs">✨ 已满级</span>
      </div>
      <div class="h-1.5 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full transition-all duration-1000 ease-out"
          :style="{ width: `${progressPercent}%` }">
        </div>
      </div>
    </div>

    <!-- 底部数据状态栏 -->
    <div class="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-slate-500 border-t border-slate-100 pt-1.5 sm:pt-2 gap-1">
      <div class="flex items-center gap-0.5 text-slate-600">
        <span class="text-[10px] sm:text-xs">🍖</span><span><OdometerNumber :value="student.food_count" /></span>
      </div>
      <div class="flex items-center gap-0.5 text-slate-400 min-w-0">
        <span class="text-[10px] sm:text-xs opacity-60">👥</span><span class="truncate max-w-[3.5rem] sm:max-w-[5rem]">{{ groupName || '未分组' }}</span>
      </div>
      <div class="flex items-center gap-0.5 text-slate-400 cursor-pointer hover:text-amber-500 transition-colors" @click.stop="$emit('show-badges')">
        <span class="text-[10px] sm:text-xs">🏅</span><span><OdometerNumber :value="student.badges ? student.badges.length : 0" /></span>
      </div>
    </div>

    <!-- 满级毕业按钮 -->
    <button v-if="isMaxLevel"
      class="mt-1.5 sm:mt-2 w-full py-1.5 sm:py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold shadow-md hover:from-yellow-500 hover:to-amber-600 active:scale-95 transition-all z-20"
      @click.stop="$emit('graduate')">
      ✨ 召唤守护兽
    </button>

    <!-- 飞入的食物动效层 -->
    <div class="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden z-50">
      <div v-for="food in flyingFoods" :key="food.id"
           class="absolute left-1/2 bottom-8 animate-feed-fly flex justify-center items-center">
        <span class="text-3xl drop-shadow-2xl filter">{{ food.icon }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { PETS, getPetImageUrl } from '../utils/pets'
import OdometerNumber from './OdometerNumber.vue'
import { useClassStore } from '../stores/class'

const props = defineProps({
  student: Object,
  batchMode: Boolean,
  undoMode: Boolean,
  selected: Boolean,
  growthStages: Array
})

defineEmits(['click', 'select', 'change-pet', 'graduate', 'show-badges', 'print-cert'])

const justScored = ref(false)
const flyingFoods = ref([])
let foodIdCounter = 0

watch(() => props.student.food_count, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    justScored.value = true
    setTimeout(() => { justScored.value = false }, 800)

    // 如果是加分，则触发喂食飞行特效
    if (newVal > oldVal) {
      const id = foodIdCounter++
      const icons = ['🍖', '🍎', '🍓', '🥕', '✨', '🍬', '🍔']
      const icon = icons[Math.floor(Math.random() * icons.length)]
      
      flyingFoods.value.push({ id, icon })
      
      // 动画结束后移除 DOM
      setTimeout(() => {
        flyingFoods.value = flyingFoods.value.filter(f => f.id !== id)
      }, 1000)
    }
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
  return getPetImageUrl(pet.folder, petStage.value)
})

const petScale = computed(() => {
  return 1
})

const classStore = useClassStore()
const groupName = computed(() => {
  if (!props.student.group_id) return ''
  const g = classStore.groups.find(g => g.id === props.student.group_id)
  return g ? g.name : ''
})

</script>

<style scoped>
@keyframes feed-fly {
  0% {
    transform: translate(-50%, 0) scale(0.5) rotate(-20deg);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -30px) scale(1.3) rotate(10deg);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -100px) scale(1) rotate(-10deg);
  }
  100% {
    transform: translate(-50%, -130px) scale(0) rotate(20deg);
    opacity: 0;
  }
}

.animate-feed-fly {
  /* 调整持续时间和缓冲函数让“吃入”有吸附感 */
  animation: feed-fly 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>

<template>
  <div
    class="relative rounded-[1.4rem] sm:rounded-[1.8rem] p-2.5 sm:p-3 flex flex-col h-full cursor-pointer transition-all duration-300 group overflow-hidden"
    :class="{
      // 批量选中模式
      'ring-4 ring-accent bg-theme-light scale-[0.98] opacity-90': batchMode && selected,
      // 批量未选中模式
      'border border-dashed border-gray-300 bg-white/50 hover:bg-white scale-100 opacity-70 hover:opacity-100 animate-pulse': batchMode && !selected,
      // 正常模式
      'ring-4 ring-accent bg-white shadow-xl shadow-accent/20 scale-105 z-10': !batchMode && selected,
      'bg-white shadow-[0_4px_20px_-5px_var(--theme-ring)] border-2 border-white hover:border-[var(--theme-ring)]/40 hover:-translate-y-1 transition-all duration-300': !batchMode && !selected
    }"
    @click="$emit(batchMode ? 'select' : 'click')"
  >
    <!-- 批量选择右上角勾选框 -->
    <div v-if="batchMode" class="absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-20"
      :class="selected ? 'bg-accent border-accent text-white scale-110 shadow-md' : 'bg-slate-100 border-slate-300 text-transparent'">
      <span class="text-sm font-bold" v-show="selected">✓</span>
    </div>

    <!-- 顶栏：等级标与操作按钮 -->
    <div class="flex justify-between items-start mb-2 relative z-30 min-h-7 w-full px-1">
      <!-- 极简的圆角胶囊等级标 -->
      <div v-if="student.pet_type" class="flex items-center space-x-1.5 z-30 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm shadow-slate-100/50">
        <div class="w-2.5 h-2.5 rounded-full" :class="levelDotColor"></div>
        <span class="text-slate-800 font-extrabold text-xs tracking-tight italic">Lv.{{ petStage }}</span>
      </div>
      <div v-else></div>
      
      <!-- 右上角操作按钮区 -->
      <div v-if="student.pet_type && !batchMode" class="flex gap-2 z-30">
        <button class="w-7 h-7 flex items-center justify-center bg-slate-100/80 rounded-full text-xs text-slate-500 hover:text-sky-500 hover:bg-sky-50 transition-all active:scale-95" title="打印收集卡"
          @click.stop="$emit('print-cert')">🖨️</button>
        <button class="w-7 h-7 flex items-center justify-center bg-slate-100/80 rounded-full text-xs text-slate-500 hover:text-accent hover:bg-red-50 transition-all active:scale-95" title="更换宠物"
          @click.stop="$emit('change-pet')">🔄</button>
      </div>
    </div>

    <!-- 宠物图片区 (带极简圆形光圈) -->
    <div class="flex justify-center items-center py-1 sm:py-2 relative mb-2 h-[50%] min-h-[11rem] sm:min-h-[13rem] lg:min-h-[14.5rem]">
      <div v-if="!student.pet_type" class="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 flex items-center justify-center text-3xl sm:text-5xl bg-slate-50/50 rounded-full border border-slate-100">
        🥚
      </div>
      <div v-else class="relative w-full h-full flex justify-center items-center mt-1 animate-float-idle z-10">
        <img v-if="petImageUrl" :src="petImageUrl" :alt="student.pet_name || '宠物'"
          class="w-auto h-auto max-w-full max-h-full object-contain relative transition-transform duration-500 drop-shadow-sm"
          :class="{ 'animate-bounce': justScored }" />
        <div v-else class="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 flex items-center justify-center text-xs sm:text-sm lg:text-base bg-slate-50 rounded-full border border-dashed border-red-200 text-red-300 font-bold text-center p-2">
          已下架
        </div>
      </div>
    </div>

    <!-- 学生姓名区 -->
    <div class="flex items-center gap-2 mb-1 pl-1 relative z-10">
      <h3 class="text-sm sm:text-lg xl:text-xl font-bold text-slate-800 truncate leading-tight">{{ student.name }}</h3>
      <span v-if="student.pet_type" class="text-[10px] sm:text-xs font-medium text-slate-400 truncate">{{ student.pet_name || '未命名' }}</span>
    </div>

    <!-- 进度条系统 (深蓝/浅晶蓝风格) -->
    <div v-if="student.pet_type" class="flex flex-col gap-1.5 relative z-10 px-1 mb-3">
      <div class="flex justify-between items-center text-[11px] sm:text-xs font-medium">
        <span class="text-slate-400">本级进度</span>
        <span v-if="!isMaxLevel" class="text-blue-600 font-bold flex items-center gap-1">
          <span class="text-slate-400">还差</span> <span class="text-[13px]"><OdometerNumber :value="maxFood - student.food_count" /></span> <span class="text-[10px]">🍖</span>
        </span>
        <span v-else class="text-yellow-500 font-bold">✨ 已满级</span>
      </div>

      <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full bg-cyan-400 rounded-full transition-all duration-1000 ease-out"
          :style="{ width: `${progressPercent}%` }">
        </div>
      </div>
    </div>

    <!-- 底部数据状态标 (纯净无背景一字排开) -->
    <div class="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-slate-500 border-t border-slate-50 pt-2 relative z-10 px-1 mt-auto gap-1">
      <div class="flex items-center space-x-1 text-slate-600">
        <span class="text-[11px] sm:text-xs">🍖</span><span><OdometerNumber :value="student.food_count" /></span>
      </div>
      <div class="flex items-center space-x-1 text-slate-300">
        <span class="text-[11px] sm:text-xs opacity-60">👥</span><span class="font-medium truncate max-w-[72px] sm:max-w-[90px]">{{ groupName }}</span>
      </div>
      <div class="flex items-center space-x-1 text-slate-300" @click.stop="$emit('show-badges')">
        <span class="text-[11px] sm:text-xs grayscale opacity-40">🏅</span><span><OdometerNumber :value="student.badges ? student.badges.length : 0" /></span>
      </div>
    </div>

    <!-- 满级毕业按钮 -->
    <button v-if="isMaxLevel"
      class="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-[1.5rem] text-xs sm:text-sm font-bold shadow-md hover:from-yellow-500 hover:to-amber-600 active:scale-95 transition-all z-20"
      @click.stop="$emit('graduate')">
      ✨ 召唤守护兽
    </button>

    <!-- 飞入的食物动效层 -->
    <div class="absolute inset-0 pointer-events-none rounded-[1.8rem] overflow-hidden z-50">
      <div v-for="food in flyingFoods" :key="food.id"
           class="absolute left-1/2 bottom-8 animate-feed-fly flex justify-center items-center">
        <span class="text-3xl drop-shadow-2xl filter">{{ food.icon }}</span>
      </div>
    </div>
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
  return `/pet-images/${pet.folder}/${petStage.value}.webp?v=3`
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

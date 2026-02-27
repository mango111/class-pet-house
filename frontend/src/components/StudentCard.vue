<template>
  <div
    class="relative bg-white rounded-2xl shadow-sm border-2 p-3 cursor-pointer transition-all active:scale-95 hover:shadow-md"
    :class="{
      'border-accent bg-theme-light': selected,
      'border-transparent': !selected
    }"
    @click="$emit(batchMode ? 'select' : 'click')"
  >
    <!-- 宠物图片 -->
    <div class="flex justify-center mb-2">
      <div v-if="!student.pet_type" class="w-20 h-20 flex items-center justify-center text-4xl">
        🥚
      </div>
      <img v-else :src="petImageUrl" :alt="student.pet_name || '宠物'"
        class="w-20 h-20 object-contain" :class="{ 'animate-bounce': justScored }" />
    </div>

    <!-- 学生名字 -->
    <p class="text-center text-sm font-medium text-gray-700 truncate">{{ student.name }}</p>

    <!-- 宠物名字 -->
    <p v-if="student.pet_name" class="text-center text-xs text-gray-400 truncate">{{ student.pet_name }}</p>

    <!-- 进度条 -->
    <div v-if="student.pet_type" class="mt-2">
      <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full bg-accent rounded-full transition-all duration-500"
          :style="{ width: progressPercent + '%' }"></div>
      </div>
      <p class="text-center text-xs text-gray-400 mt-1">{{ student.food_count }} / {{ maxFood }}</p>
    </div>

    <!-- 徽章数量（可点击查看徽章墙） -->
    <div v-if="badges.length" class="absolute top-2 right-2 bg-yellow-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center cursor-pointer hover:bg-yellow-500 transition"
      @click.stop="$emit('show-badges')">
      {{ badges.length }}
    </div>

    <!-- 更换宠物按钮 -->
    <button v-if="student.pet_type && student.food_count === 0"
      class="absolute top-2 left-2 text-xs text-gray-400 hover:text-pink-400" title="更换宠物"
      @click.stop="$emit('change-pet')">🔄</button>

    <!-- 满级毕业按钮 -->
    <button v-if="isMaxLevel"
      class="mt-2 w-full py-1 bg-yellow-400 text-white rounded-lg text-xs font-medium hover:bg-yellow-500 transition"
      @click.stop="$emit('graduate')">
      ✨ 召唤守护兽
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { PETS } from '../utils/pets'

const props = defineProps({
  student: Object,
  batchMode: Boolean,
  undoMode: Boolean,
  selected: Boolean,
  growthStages: Array
})

defineEmits(['click', 'select', 'change-pet', 'graduate', 'show-badges'])

const justScored = ref(false)

// 监听 food_count 变化触发动画
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

const petImageUrl = computed(() => {
  const pet = PETS.find(p => p.id === props.student.pet_type)
  if (!pet) return ''
  const stages = props.growthStages || [0,5,10,20,30,45,60,75,90,100]
  let stage = 1
  for (let i = stages.length - 1; i >= 0; i--) {
    if (props.student.food_count >= stages[i]) { stage = i + 1; break }
  }
  return `/动物图片/${pet.folder}/${stage}.webp`
})
</script>

<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
      <h2 class="text-lg font-bold text-gray-700 mb-4">🎲 随机点名</h2>

      <!-- 滚动动画 -->
      <div class="relative h-44 flex items-center justify-center overflow-hidden mb-4">
        <div v-if="rolling" class="text-4xl font-bold text-accent animate-pulse">
          {{ currentName }}
        </div>
        <div v-else-if="result" class="animate-bounce-in">
          <img v-if="result.pet_type" :src="petImage"
            class="w-20 h-20 mx-auto object-contain mb-2" />
          <p class="text-3xl font-bold text-theme">{{ result.name }}</p>
          <p v-if="result.pet_name" class="text-sm text-gray-400 mt-1">
            宠物：{{ result.pet_name }}
          </p>
        </div>
        <div v-else class="text-gray-300 text-5xl">❓</div>
      </div>

      <!-- 设置 -->
      <div class="flex items-center justify-center gap-3 mb-4">
        <label class="flex items-center gap-1 text-sm text-gray-500">
          <input type="checkbox" v-model="excludePicked" class="rounded" />
          不重复
        </label>
        <label class="flex items-center gap-1 text-sm text-gray-500">
          <input type="checkbox" v-model="showEffect" class="rounded" />
          特效
        </label>
      </div>

      <!-- 按钮 -->
      <div class="flex gap-2 justify-center">
        <button @click="startRoll" :disabled="rolling || !available.length"
          class="px-6 py-2.5 bg-accent text-white rounded-xl font-medium
          hover:bg-accent-hover transition active:scale-95 disabled:opacity-50">
          {{ rolling ? '抽取中...' : '🎲 开始' }}
        </button>
        <button @click="reset"
          class="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">
          🔄 重置
        </button>
      </div>

      <!-- 已抽到的 -->
      <div v-if="pickedList.length" class="mt-4 flex flex-wrap gap-1 justify-center">
        <span v-for="s in pickedList" :key="s.id"
          class="px-2 py-0.5 bg-theme-light text-theme text-xs rounded-full">
          {{ s.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useClassStore } from '../stores/class'
import { useEscClose } from '../composables/useEscClose'
import { PETS } from '../utils/pets'

const emit = defineEmits(['close'])
useEscClose(emit)

const classStore = useClassStore()
const rolling = ref(false)
const result = ref(null)
const currentName = ref('')
const excludePicked = ref(true)
const showEffect = ref(true)
const pickedList = ref([])

const available = computed(() => {
  if (!excludePicked.value) return classStore.students
  const pickedIds = new Set(pickedList.value.map(s => s.id))
  return classStore.students.filter(s => !pickedIds.has(s.id))
})

const petImage = computed(() => {
  if (!result.value?.pet_type) return ''
  const pet = PETS.find(p => p.id === result.value.pet_type)
  return pet ? `/pet-images/${pet.folder}/1.webp?v=3` : ''
})

function startRoll() {
  if (!available.value.length) return
  rolling.value = true
  result.value = null
  let count = 0
  const maxCount = 20
  const interval = setInterval(() => {
    const rand = available.value[Math.floor(Math.random() * available.value.length)]
    currentName.value = rand.name
    count++
    if (count >= maxCount) {
      clearInterval(interval)
      rolling.value = false
      result.value = rand
      pickedList.value.push(rand)
    }
  }, 80)
}

function reset() {
  result.value = null
  pickedList.value = []
  currentName.value = ''
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold text-gray-700 mb-4">🏆 光荣榜</h2>

    <!-- 排行维度切换 -->
    <div class="flex gap-2 mb-4">
      <button @click="rankBy = 'food'"
        :class="rankBy === 'food' ? 'bg-pink-400 text-white' : 'bg-white text-gray-600'"
        class="px-4 py-2 rounded-lg text-sm transition">🍖 食物排行</button>
      <button @click="rankBy = 'badges'"
        :class="rankBy === 'badges' ? 'bg-pink-400 text-white' : 'bg-white text-gray-600'"
        class="px-4 py-2 rounded-lg text-sm transition">🏅 徽章排行</button>
    </div>

    <!-- 排行列表 -->
    <div class="space-y-2">
      <div v-for="(s, i) in rankedStudents" :key="s.id"
        class="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
        <span class="text-lg w-8 text-center font-bold"
          :class="i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300'">
          {{ i < 3 ? ['🥇','🥈','🥉'][i] : i + 1 }}
        </span>
        <img v-if="s.pet_type" :src="getPetImage(s)" class="w-10 h-10 object-contain" />
        <span v-else class="text-2xl w-10 text-center">🥚</span>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-700">{{ s.name }}</p>
          <p class="text-xs text-gray-400">{{ s.pet_name || '' }}</p>
        </div>
        <span class="text-sm font-bold text-pink-500">
          {{ rankBy === 'food' ? s.food_count : (s.badges || []).length }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useClassStore } from '../stores/class'
import { PETS } from '../utils/pets'

const classStore = useClassStore()
const rankBy = ref('food')

const rankedStudents = computed(() => {
  const list = [...classStore.students]
  if (rankBy.value === 'food') {
    list.sort((a, b) => b.food_count - a.food_count)
  } else {
    list.sort((a, b) => (b.badges || []).length - (a.badges || []).length)
  }
  return list
})

function getPetImage(s) {
  const pet = PETS.find(p => p.id === s.pet_type)
  if (!pet) return ''
  const stages = classStore.currentClass?.growth_stages || [0,5,10,20,30,45,60,75,90,100]
  let stage = 1
  for (let i = stages.length - 1; i >= 0; i--) {
    if (s.food_count >= stages[i]) { stage = i + 1; break }
  }
  return `/动物图片/${pet.folder}/${stage}.webp`
}
</script>

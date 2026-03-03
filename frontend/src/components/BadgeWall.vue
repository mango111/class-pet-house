<template>
  <div class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 max-h-[80vh] overflow-y-auto">
      <h3 class="text-center font-bold text-gray-700 mb-1">🏅 {{ student.name }} 的徽章墙</h3>
      <p class="text-center text-xs text-gray-400 mb-4">
        共 {{ badges.length }} 枚徽章
      </p>

      <div v-if="badges.length" class="grid grid-cols-4 gap-3">
        <div v-for="(badge, i) in badges" :key="i"
          class="flex flex-col items-center p-2 rounded-xl bg-yellow-50 border border-yellow-200">
          <img :src="getBadgeImage(badge)" class="w-12 h-12 object-contain" />
          <span class="text-xs text-gray-600 mt-1">{{ getPetName(badge.pet_type) }}</span>
          <span v-if="badge.pet_name" class="text-xs text-gray-400">{{ badge.pet_name }}</span>
        </div>
      </div>

      <div v-else class="text-center py-10 text-gray-400">
        <p class="text-3xl mb-2">🥚</p>
        <p class="text-sm">还没有徽章，继续加油！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEscClose } from '../composables/useEscClose'
import { PETS } from '../utils/pets'

const props = defineProps({ student: Object })
const emit = defineEmits(['close'])
useEscClose(emit)

const badges = computed(() => props.student.badges || [])

function getPetName(petType) {
  const pet = PETS.find(p => p.id === petType)
  return pet ? pet.name : '未知'
}

function getBadgeImage(badge) {
  const pet = PETS.find(p => p.id === badge.pet_type)
  if (!pet) return ''
  return `/pet-images/${pet.folder}/10.webp?v=3`
}
</script>

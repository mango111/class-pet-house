<template>
  <div class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 max-h-[80vh] overflow-y-auto">
      <h3 id="pet-selection-title" class="text-center font-bold text-gray-700 mb-1">🐾 领养宠物</h3>
      <p class="text-center text-xs text-gray-400 mb-4">为 {{ student.name }} 选择一只宠物</p>

      <div class="grid grid-cols-4 sm:grid-cols-5 gap-3">
        <button v-for="pet in pets" :key="pet.id"
          @click="selectPet(pet)"
          class="flex flex-col items-center p-2 rounded-xl border border-gray-100 hover:border-accent hover:bg-theme-light transition active:scale-95">
          <img :src="`/动物图片/${pet.folder}/1.webp`" :alt="pet.name" class="w-14 h-14 object-contain" />
          <span class="text-xs text-gray-600 mt-1">{{ pet.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useClassStore } from '../stores/class'
import { useEscClose } from '../composables/useEscClose'
import { PETS } from '../utils/pets'
import api from '../utils/api'

const props = defineProps({ student: Object })
const emit = defineEmits(['close', 'selected'])
useEscClose(emit)
const classStore = useClassStore()
const pets = PETS

async function selectPet(pet) {
  try {
    await api.put(`/students/${props.student.id}`, { pet_type: pet.id })
    emit('selected')
  } catch (err) {
    alert(err.error || '选择失败')
  }
}
</script>

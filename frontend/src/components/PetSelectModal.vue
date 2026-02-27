<template>
  <div class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 max-h-[80vh] overflow-y-auto">
      <h3 id="pet-selection-title" class="text-center font-bold text-gray-700 mb-1">🐾 领养宠物</h3>
      <p class="text-center text-xs text-gray-400 mb-4">为 {{ student.name }} 选择一只宠物</p>

      <!-- 起名输入框 -->
      <div v-if="selectedPet" class="mb-4 text-center">
        <img :src="`/动物图片/${selectedPet.folder}/1.webp`" class="w-20 h-20 mx-auto object-contain mb-2" />
        <p class="text-sm text-gray-600 mb-2">已选：{{ selectedPet.name }}</p>
        <input v-model="petName" type="text" :placeholder="`给${selectedPet.name}起个名字（可选）`"
          maxlength="20" @keyup.enter="confirmSelect"
          class="w-full max-w-xs mx-auto px-3 py-2 rounded-lg border text-sm outline-none focus:border-accent text-center" />
        <div class="flex gap-2 justify-center mt-3">
          <button @click="selectedPet = null"
            class="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">重选</button>
          <button @click="confirmSelect"
            class="px-4 py-1.5 bg-accent text-white rounded-lg text-sm">确认领养</button>
        </div>
      </div>

      <!-- 宠物列表 -->
      <div v-else class="grid grid-cols-4 sm:grid-cols-5 gap-3">
        <button v-for="pet in pets" :key="pet.id"
          @click="selectedPet = pet"
          class="flex flex-col items-center p-2 rounded-xl border border-gray-100 hover:border-accent hover:bg-theme-light transition active:scale-95">
          <img :src="`/动物图片/${pet.folder}/1.webp`" :alt="pet.name" class="w-14 h-14 object-contain" />
          <span class="text-xs text-gray-600 mt-1">{{ pet.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useClassStore } from '../stores/class'
import { useEscClose } from '../composables/useEscClose'
import { PETS } from '../utils/pets'
import api from '../utils/api'

const props = defineProps({ student: Object })
const emit = defineEmits(['close', 'selected'])
useEscClose(emit)
const classStore = useClassStore()
const pets = PETS
const selectedPet = ref(null)
const petName = ref('')

async function confirmSelect() {
  if (!selectedPet.value) return
  try {
    await api.put(`/students/${props.student.id}`, {
      pet_type: selectedPet.value.id,
      pet_name: petName.value.trim() || selectedPet.value.name
    })
    emit('selected')
  } catch (err) {
    alert(err.error || '选择失败')
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 max-h-[80vh] overflow-y-auto">
      <h3 id="pet-selection-title" class="text-center font-bold text-gray-700 mb-1">🐾 领养宠物</h3>
      <p class="text-center text-xs text-gray-400 mb-4">为 {{ student.name }} 选择一只宠物</p>

      <!-- 起名输入框 -->
      <div v-if="selectedPet" class="mb-4 text-center">
        <img :src="`/pet-images/${selectedPet.folder}/1.webp`" class="w-56 h-56 sm:w-72 sm:h-72 mx-auto object-contain mb-6 drop-shadow-2xl scale-125 transition-transform" />
        <p class="text-xl font-black text-gray-800 mb-3">已选：{{ selectedPet.name }}</p>
        <input v-model="petName" type="text" :placeholder="`给${selectedPet.name}起个名字（可选）`"
          maxlength="20" @keyup.enter="confirmSelect"
          class="w-full max-w-md mx-auto px-5 py-4 rounded-2xl border-4 border-slate-200 text-2xl outline-none focus:border-accent text-center font-black" />
        <div class="flex gap-2 justify-center mt-3">
          <button @click="selectedPet = null"
            class="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">重选</button>
          <button @click="confirmSelect"
            class="px-4 py-1.5 bg-accent text-white rounded-lg text-sm">确认领养</button>
        </div>
      </div>

      <!-- 宠物列表 -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-6 px-2">
        <button v-for="pet in pets" :key="pet.id"
          @click="selectedPet = pet"
          class="flex flex-col items-center p-4 rounded-3xl border-4 border-slate-100/80 bg-slate-50/50 hover:border-accent hover:bg-theme-light transition-all active:scale-95 group shadow-sm hover:shadow-lg">
          <div class="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <img :src="`/pet-images/${pet.folder}/1.webp`" :alt="pet.name" class="w-full h-full object-contain drop-shadow-md group-hover:drop-shadow-2xl group-hover:scale-125 transition-transform duration-300" />
          </div>
          <span class="text-lg font-black text-slate-700 mt-4">{{ pet.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEscClose } from '../composables/useEscClose'
import { PETS } from '../utils/pets'
import api from '../utils/api'
import Dialog from '../utils/dialog'

const props = defineProps({ student: Object })
const emit = defineEmits(['close', 'selected'])
useEscClose(emit)
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
    Dialog.alert(err.error || '选择失败')
  }
}
</script>

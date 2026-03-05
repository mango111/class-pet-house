<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 sm:p-6
      animate-bounce-in text-center mx-4">
      <div class="text-6xl mb-4">🎉</div>
      <h2 class="text-2xl font-bold text-yellow-600 mb-2">
        毕业典礼
      </h2>
      <p class="text-gray-600 mb-2">
        恭喜 <span class="font-bold">{{ student.name }}</span>
      </p>
      <p class="text-gray-500 text-sm mb-4">
        成功培养宠物毕业，获得一枚徽章！
      </p>

      <!-- 宠物图片 -->
      <img v-if="petImage" :src="petImage"
        class="w-24 h-24 sm:w-32 sm:h-32 mx-auto object-contain animate-float mb-4" />

      <button @click="handleGraduate" :disabled="loading"
        class="px-6 py-2 bg-yellow-400 text-white rounded-xl
        font-medium hover:bg-yellow-500 transition active:scale-95">
        {{ loading ? '收获中...' : '🏅 收获徽章' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useClassStore } from '../stores/class'
import { useEscClose } from '../composables/useEscClose'
import { PETS, getPetImageUrl } from '../utils/pets'
import api from '../utils/api'
import Dialog from '../utils/dialog'

const props = defineProps({ student: Object })
const emit = defineEmits(['close', 'graduated'])
useEscClose(emit)
const classStore = useClassStore()
const loading = ref(false)

const petImageUrl = computed(() => {
  if (!props.student || !props.student.pet_type) return ''
  const pet = PETS.find(p => p.id === props.student.pet_type)
  return pet ? getPetImageUrl(pet.folder, 10) : ''
})

async function handleGraduate() {
  loading.value = true
  try {
    const badges = [...(props.student.badges || [])]
    badges.push({
      pet_type: props.student.pet_type,
      pet_name: props.student.pet_name,
      date: new Date().toISOString()
    })
    await api.put(`/students/${props.student.id}`, {
      badges,
      food_count: 0,
      pet_type: null,
      pet_name: null
    })
    await api.post('/history', {
      class_id: classStore.currentClass.id,
      student_ids: [props.student.id],
      type: 'graduate'
    }).catch(() => {})
    emit('graduated')
  } catch (err) {
    Dialog.alert(err.error || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

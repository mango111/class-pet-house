<template>
  <div class="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center" @click.self="$emit('close')">
    <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm p-5 max-h-[70vh] overflow-y-auto">
      <h3 class="text-center font-bold text-gray-700 mb-1">{{ student.name }}</h3>
      <p class="text-center text-xs text-gray-400 mb-4">选择加分/扣分项</p>

      <div class="grid grid-cols-2 gap-2">
        <button v-for="rule in rules" :key="rule.id"
          @click="applyRule(rule)"
          class="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-pink-300 hover:bg-pink-50 transition active:scale-95">
          <span class="text-lg">{{ rule.icon }}</span>
          <div class="text-left">
            <p class="text-sm text-gray-700">{{ rule.name }}</p>
            <p class="text-xs" :class="rule.value > 0 ? 'text-green-500' : 'text-red-500'">
              {{ rule.value > 0 ? '+' : '' }}{{ rule.value }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useClassStore } from '../stores/class'
import api from '../utils/api'

const props = defineProps({ student: Object })
const emit = defineEmits(['close', 'scored'])
const classStore = useClassStore()
const rules = ref([])

onMounted(async () => {
  const data = await api.get(`/score-rules/class/${classStore.currentClass.id}`)
  rules.value = data
})

async function applyRule(rule) {
  try {
    await api.post('/history', {
      class_id: classStore.currentClass.id,
      student_ids: [props.student.id],
      rule_id: rule.id
    })
    emit('scored')
  } catch (err) {
    alert(err.error || '操作失败')
  }
}
</script>

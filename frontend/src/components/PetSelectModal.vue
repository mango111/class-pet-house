<template>
  <div class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" @click.self="$emit('close')">
    <div class="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
      
      <!-- 渐变头部 -->
      <div class="shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-5 py-4 sm:px-6 sm:py-5 relative">
        <h3 class="text-lg sm:text-xl font-black text-white">选择守护神兽</h3>
        <p class="text-white/70 text-xs sm:text-sm mt-0.5">为 <span class="font-bold text-white">{{ student.name }}</span> 选择一只可爱的神兽吧</p>
        <button @click="$emit('close')" class="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 flex items-center justify-center text-white/80 hover:text-white text-xl font-bold transition-colors">✕</button>
      </div>

      <!-- 搜索框 -->
      <div v-if="!selectedPet" class="shrink-0 px-4 sm:px-5 pt-3 sm:pt-4">
        <input v-model="searchQuery" type="text" placeholder="🔍 搜索宠物名称..."
          class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm outline-none focus:border-purple-300 font-medium placeholder-slate-400 transition-colors" />
      </div>

      <!-- 可滚动内容区 -->
      <div class="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5">
        <!-- 起名输入框 -->
        <div v-if="selectedPet" class="text-center py-4 h-full flex flex-col items-center justify-center">
          <div class="relative w-full aspect-square bg-sky-50 rounded-2xl flex items-center justify-center p-4 mb-4">
            <img :src="getPetImageUrl(selectedPet.folder, 1)" class="w-40 h-40 sm:w-56 sm:h-56 mx-auto object-contain drop-shadow-2xl" />
          </div>
          <p class="text-lg sm:text-xl font-black text-gray-800 mb-3">已选：{{ selectedPet.name }}</p>
          <div class="flex items-center justify-center gap-2 w-full max-w-sm mx-auto mb-4">
            <input v-model="petName" type="text" :placeholder="`给${selectedPet.name}起个名`"
              maxlength="20" @keyup.enter="confirmSelect" :disabled="isAiLoading"
              class="flex-1 min-w-0 px-4 py-3 rounded-xl border-2 border-slate-200 text-lg outline-none focus:border-purple-400 text-center font-bold disabled:bg-slate-50 disabled:text-slate-400" />
            <button @click="generateAiName" :disabled="isAiLoading" 
              class="shrink-0 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-purple-200 rounded-xl text-sm font-bold text-purple-600 transition-all active:scale-95 flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" title="AI智能起名">
              <span v-if="isAiLoading" class="animate-spin inline-block w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></span>
              <span v-else class="text-lg leading-none">✨</span>
              {{ isAiLoading ? '构思中...' : 'AI起名' }}
            </button>
          </div>
          <div class="flex gap-2 justify-center">
            <button @click="selectedPet = null"
              class="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">重选</button>
            <button @click="confirmSelect"
              class="px-5 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl text-sm font-bold hover:shadow-lg">确认领养</button>
          </div>
        </div>

        <!-- 宠物网格 -->
        <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          <button v-for="pet in filteredPets" :key="pet.id"
            @click="selectedPet = pet"
            class="flex flex-col items-center p-2 sm:p-3 rounded-xl border-2 border-slate-100 bg-white hover:border-purple-300 hover:bg-purple-50/50 transition-all active:scale-95 group">
            <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto my-2 p-1 sm:p-2 bg-gradient-to-br from-white to-sky-50 rounded-xl relative overflow-hidden flex items-center justify-center">
              <img :src="getPetImageUrl(pet.folder, 1)" :alt="pet.name" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span class="text-xs sm:text-sm font-bold text-slate-600 mt-1">{{ pet.name }}</span>
          </button>
          
          <div v-if="filteredPets.length === 0" class="col-span-full py-12 text-center text-slate-400 text-sm font-bold">
            没有找到叫「{{ searchQuery }}」的宠物 😢
          </div>
        </div>
      </div>

      <!-- 底部提示 -->
      <div v-if="!selectedPet" class="shrink-0 text-center text-[10px] sm:text-xs text-slate-400 py-2 border-t border-slate-100">
        点击选择宠物，让宝贝全阶段陪伴你，成长日记始于名字
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEscClose } from '../composables/useEscClose'
import { PETS, getPetImageUrl } from '../utils/pets'
import api from '../utils/api'
import Dialog from '../utils/dialog'

const props = defineProps({ student: Object })
const emit = defineEmits(['close', 'selected'])
useEscClose(emit)
const pets = PETS
const selectedPet = ref(null)
const petName = ref('')
const searchQuery = ref('')

const filteredPets = computed(() => {
  if (!searchQuery.value.trim()) return pets
  return pets.filter(p => p.name.includes(searchQuery.value.trim()))
})

// 提取中文姓氏
function getStudentSurname(fullName) {
  if (!fullName) return ''
  // 常见复姓
  const compoundSurnames = ['欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫', '万俟', '闻人', '夏侯', '诸葛', '尉迟', '公羊', '赫连', '澹台', '皇甫', '宗政', '濮阳', '公冶', '太叔', '申屠', '公孙', '慕容', '仲孙', '钟离', '长孙', '宇文', '司徒', '鲜于', '司空', '闾丘', '子车', '亓官', '司寇', '巫马', '公西', '颛孙', '壤驷', '公良', '漆雕', '乐正', '宰父', '谷梁', '拓跋', '夹谷', '轩辕', '令狐', '段干', '百里', '呼延', '东郭', '南门', '羊舌', '微生', '公户', '公玉', '公仪', '梁丘', '公仲', '公叔', '公孙', '段干', '百里', '东野', '南宫', '万俟', '司马', '上官', '欧阳', '夏侯', '诸葛', '闻人', '东方', '赫连', '皇甫', '尉迟', '公羊', '澹台', '公冶', '宗政', '濮阳', '淳于', '单于', '太叔', '申屠', '公孙', '仲孙', '轩辕', '令狐', '钟离', '宇文', '长孙', '慕容', '鲜于', '闾丘', '司徒', '司空', '亓官', '司寇', '仉督', '子车', '颛孙', '端木', '巫马', '公西', '漆雕', '乐正', '壤驷', '公良', '拓跋', '夹谷', '宰父', '谷梁', '晋楚', '闫法', '汝鄢', '涂钦', '段干', '百里', '东郭', '南门', '呼延', '归海', '羊舌', '微生', '岳帅', '缑亢', '况后', '有琴', '梁丘', '左丘', '东门', '西门', '商牟', '佘佴', '伯赏', '南宫', '墨哈', '谯笪', '年爱', '阳佟', '第五', '言福']
  for (const cs of compoundSurnames) {
    if (fullName.startsWith(cs)) return cs
  }
  // 单姓 (默认取第一个字)
  return fullName.charAt(0)
}

const isAiLoading = ref(false)

async function generateAiName() {
  if (isAiLoading.value) return
  isAiLoading.value = true
  try {
    const res = await api.post('/ai/generate-pet-name', {
      studentName: props.student.name,
      petType: selectedPet.value.name
    })
    if (res.name) {
      petName.value = res.name
    }
  } catch (err) {
    Dialog.alert(err.error || 'AI 起名失败，请检查设置中是否配置了 AI API Key')
  } finally {
    isAiLoading.value = false
  }
}
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

<template>
  <div class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 max-h-[80vh] overflow-y-auto">
      <h3 id="pet-selection-title" class="text-center font-bold text-gray-700 mb-1">🐾 领养宠物</h3>
      <p class="text-center text-xs text-gray-400 mb-4">为 {{ student.name }} 选择一只宠物</p>

      <!-- 起名输入框 -->
      <div v-if="selectedPet" class="mb-4 text-center">
        <img :src="`/pet-images/${selectedPet.folder}/1.webp`" class="w-56 h-56 sm:w-72 sm:h-72 mx-auto object-contain mb-6 drop-shadow-2xl scale-125 transition-transform" />
        <p class="text-xl font-black text-gray-800 mb-3">已选：{{ selectedPet.name }}</p>
        <div class="flex items-center justify-center gap-3 w-full max-w-lg mx-auto mb-4">
          <input v-model="petName" type="text" :placeholder="`给${selectedPet.name}起名字`"
            maxlength="20" @keyup.enter="confirmSelect"
            class="flex-1 min-w-0 px-5 py-4 rounded-2xl border-4 border-slate-200 text-2xl outline-none focus:border-accent text-center font-black" />
          <button @click="generateRandomName" class="shrink-0 p-4 bg-slate-100 hover:bg-slate-200 rounded-2xl text-4xl transition-transform active:scale-90 hover:rotate-12 outline-none shadow-sm h-full flex items-center justify-center border-4 border-transparent" title="随机网感名字">
            🎲
          </button>
        </div>
        <div class="flex gap-2 justify-center mt-3">
          <button @click="selectedPet = null"
            class="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">重选</button>
          <button @click="confirmSelect"
            class="px-4 py-1.5 bg-accent text-white rounded-lg text-sm">确认领养</button>
        </div>
      </div>

      <!-- 宠物列表控制区 -->
      <div v-else>
        <div class="mb-4 relative">
          <input v-model="searchQuery" type="text" placeholder="🔍 搜索宠物名称..."
            class="w-full px-5 py-4 rounded-2xl border-4 border-slate-100/80 bg-slate-50 text-xl outline-none focus:border-accent/50 font-bold placeholder-slate-400 transition-colors shadow-sm" />
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 px-2">
          <button v-for="pet in filteredPets" :key="pet.id"
            @click="selectedPet = pet"
            class="flex flex-col items-center p-6 rounded-[2rem] border-4 border-slate-100/80 bg-slate-50/50 hover:border-accent hover:bg-theme-light transition-all active:scale-95 group shadow-sm hover:shadow-xl relative overflow-hidden">
            <!-- 极大的宠物图标，几乎撑满格子 -->
            <div class="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center relative z-10">
              <img :src="`/pet-images/${pet.folder}/1.webp`" :alt="pet.name" class="w-full h-full object-contain drop-shadow-lg group-hover:drop-shadow-2xl group-hover:scale-[1.15] transition-transform duration-300" />
            </div>
            <!-- 网底光晕点缀 -->
            <div class="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-10 bg-black/5 blur-xl rounded-[100%]"></div>
            <span class="text-2xl font-black text-slate-700 mt-6 relative z-10">{{ pet.name }}</span>
          </button>
          
          <div v-if="filteredPets.length === 0" class="col-span-full py-12 text-center text-slate-400 text-lg font-bold">
            没有找到叫「{{ searchQuery }}」的宠物 😢
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

// 网感后缀词库
const trendySuffixes = [
  '总', '少', '老板', '阿哥', '公主', '大人', '铁柱', '师傅', '厂长', '富贵',
  '大王', '神仙', '宝宝', '同学', '老师', '仙女', '少侠', '建国', '翠花', '半仙'
]

function generateRandomName() {
  const surname = getStudentSurname(props.student.name)
  const randomSuffix = trendySuffixes[Math.floor(Math.random() * trendySuffixes.length)]
  petName.value = `${surname}${randomSuffix}`
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

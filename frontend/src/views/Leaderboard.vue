<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-xl sm:text-2xl font-black text-slate-800 mb-6 flex items-center gap-2 drop-shadow-sm px-2">
      <span class="text-2xl sm:text-3xl text-yellow-400 drop-shadow-md animate-breathe">🏆</span> 光荣榜
    </h2>

    <!-- 排行维度切换 -->
    <div class="flex flex-wrap gap-2 sm:gap-3 mb-6 px-2">
      <button @click="rankBy = 'food'"
        :class="rankBy === 'food' ? 'bg-accent text-white shadow-md shadow-accent/40 scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'"
        class="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300">🍖 食物排行</button>
      <button @click="rankBy = 'badges'"
        :class="rankBy === 'badges' ? 'bg-accent text-white shadow-md shadow-accent/40 scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'"
        class="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300">🏅 徽章排行</button>
    </div>

    <!-- 排行列表 -->
    <div class="space-y-3 sm:space-y-4 px-1 pb-8">
      <div v-for="(s, i) in rankedStudents" :key="s.id"
        class="group flex items-center gap-2 sm:gap-4 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-[1.8rem] p-3 sm:p-4 shadow-sm border-2 border-white hover:border-[var(--theme-ring)]/40 hover:shadow-[0_15px_35px_-10px_var(--theme-ring)] hover:-translate-y-1 transition-all duration-300 cursor-default animate-stagger-fade-in"
        :style="{ animationDelay: `${i * 0.06}s` }">
        
        <!-- Medal with Glow -->
        <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
          <div v-if="i < 3" class="absolute inset-0 rounded-full blur-md opacity-60 bg-gradient-to-tr"
            :class="i === 0 ? 'from-yellow-200 to-yellow-500' : i === 1 ? 'from-slate-200 to-slate-400' : 'from-orange-200 to-amber-600'"></div>
          <span class="text-3xl relative z-10 font-kuaile italic leading-none"
            :class="i === 0 ? 'text-yellow-400 drop-shadow-md scale-110' : i === 1 ? 'text-slate-400 drop-shadow-md scale-105' : i === 2 ? 'text-amber-500 drop-shadow-md scale-105' : 'text-slate-300 text-xl font-bold font-sans not-italic'">
            {{ i < 3 ? ['🥇','🥈','🥉'][i] : i + 1 }}
          </span>
        </div>
        
        <!-- Pet Image Squircle -->
        <div class="w-10 h-10 sm:w-14 sm:h-14 shrink-0 bg-slate-50/80 rounded-xl sm:rounded-[1.2rem] flex items-center justify-center overflow-hidden border border-slate-100/50 group-hover:scale-110 transition-transform duration-300">
          <img v-if="s.pet_type" :src="getPetImage(s)" class="w-8 h-8 sm:w-12 sm:h-12 object-contain animate-float-idle" />
          <span v-else class="text-xl sm:text-2xl">🥚</span>
        </div>
        
        <!-- Student Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm sm:text-base font-black text-slate-700 truncate">{{ s.name }}</p>
          <p class="text-[10px] sm:text-xs font-bold text-slate-400 truncate mt-0.5">{{ s.pet_name || '未命名' }}</p>
        </div>
        
        <!-- Score Pill -->
        <div class="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-slate-50 text-sm sm:text-base font-black text-accent shrink-0 border border-slate-100 group-hover:bg-theme-light transition-colors">
          {{ rankBy === 'food' ? s.food_count : (s.badges || []).length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useClassStore } from '../stores/class.js'
import { PETS, getPetImageUrl } from '../utils/pets.js'

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
  if (!s || !s.pet_type) return ''
  const pet = PETS.find(p => p.id === s.pet_type)
  if (!pet) return ''
  const stages = classStore.currentClass?.growthConfig?.stages || [0,5,10,20,30,45,60,75,90,100]
  let stage = 1
  for (let i = stages.length - 1; i >= 0; i--) {
    if (s.food_count >= stages[i]) { stage = i + 1; break }
  }
  return getPetImageUrl(pet.folder, stage)
}
</script>

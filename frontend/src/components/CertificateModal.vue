<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm print:bg-white print:backdrop-blur-none" @click="close">
    
    <!-- 模态框主体 -->
    <div class="relative w-[95vw] sm:w-[90vw] max-w-4xl m-4 flex flex-col items-center" @click.stop>
      
      <!-- 证书卡片 -->
      <div ref="certRef" class="relative w-full aspect-[1.414/1] max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        <!-- 保存/关闭按钮 (在卡片内右上角，截图时忽略) -->
        <div class="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2 z-30" data-html2canvas-ignore>
          <button @click="generateImage" :disabled="generating" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs sm:text-sm disabled:opacity-60 disabled:cursor-wait shadow-md">
            {{ generating ? '⏳ 生成中...' : '📥 保存图片' }}
          </button>
          <button @click="close" class="w-8 h-8 sm:w-9 sm:h-9 bg-slate-100/90 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center font-bold text-sm shadow-sm">
            ✕
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="absolute inset-3 sm:inset-5 border-4 border-dashed border-pink-300 rounded-xl flex flex-col items-center justify-between text-center p-3 sm:p-6">
          
          <!-- 背景装饰 -->
          <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-xl">
             <div class="absolute -top-10 -left-10 w-40 h-40 bg-yellow-200/50 rounded-full mix-blend-multiply filter blur-2xl"></div>
             <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-200/50 rounded-full mix-blend-multiply filter blur-2xl"></div>
             <div class="absolute top-1/2 right-10 w-24 h-24 bg-sky-200/40 rounded-full mix-blend-multiply filter blur-xl"></div>
          </div>

          <!-- 标题区 -->
          <div class="relative z-10 w-full">
            <h1 class="text-lg sm:text-3xl md:text-4xl font-black text-slate-800 tracking-wider print:text-5xl" style="font-family: 'Comic Sans MS', cursive, sans-serif;">✨ 班级宠物屋 ✨</h1>
            <h2 class="text-xs sm:text-xl md:text-2xl font-bold text-pink-500 tracking-widest print:text-3xl mt-0.5 sm:mt-1">优秀星宠收集卡</h2>
          </div>

          <!-- 萌宠图区 -->
          <div class="relative z-10 flex-1 flex flex-col items-center justify-center min-h-0">
            <img :src="petImageUrl" alt="pet" class="w-28 h-28 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain drop-shadow-xl" />
            <!-- 名字铭牌 -->
            <div class="mt-1.5 sm:mt-4 bg-white/90 backdrop-blur-sm px-3 py-1 sm:px-8 sm:py-2 rounded-full border-2 border-pink-100 shadow-sm print:border-4 print:mt-8">
               <span class="text-[9px] sm:text-sm text-slate-500 font-medium print:text-2xl">守护兽名字:</span>
               <span class="text-xs sm:text-xl md:text-2xl font-black text-slate-800 ml-1 sm:ml-2 print:text-4xl">{{ student.pet_name || '未命名' }}</span>
               <span class="inline-block ml-1 sm:ml-3 px-1.5 py-0.5 sm:px-3 sm:py-1 bg-amber-100 text-amber-700 text-[9px] sm:text-sm font-black rounded-lg transform -rotate-3 print:text-xl">Lv.{{ petStage }}</span>
            </div>
          </div>

          <!-- 页脚签字区 -->
          <div class="relative z-10 w-full flex justify-between items-end px-1 sm:px-8 border-t border-dashed border-slate-300 pt-1.5 sm:pt-4 print:border-t-4 print:pt-8 print:px-12">
            <div class="text-left w-1/3">
              <p class="text-[8px] sm:text-sm text-slate-500 font-bold mb-0.5 print:text-xl">授予优秀主人：</p>
              <p class="text-xs sm:text-2xl md:text-3xl font-black text-slate-800 border-b-2 sm:border-b-3 border-slate-800 pb-0.5 px-1 sm:px-3 inline-block min-w-[50px] sm:min-w-[100px] text-center print:text-5xl">{{ student.name }}</p>
            </div>
            
            <div class="text-center w-1/3 opacity-80 print:opacity-100">
               <p class="text-[7px] sm:text-xs text-slate-400 font-medium tracking-widest print:text-base leading-tight">CLASS PET HOUSE</p>
            </div>

            <div class="text-right w-1/3 flex flex-col items-end">
              <p class="text-[8px] sm:text-sm text-slate-400 font-bold mb-0.5 print:text-xl">教师查收盖章:</p>
              <div class="w-8 h-8 sm:w-16 sm:h-16 border-2 sm:border-4 border-red-500/80 rounded-full flex items-center justify-center transform rotate-12 bg-white/50 print:w-32 print:h-32 print:border-8 print:border-red-500">
                 <span class="text-red-500/80 font-black text-[7px] sm:text-sm tracking-tighter transform -rotate-12 print:text-3xl leading-none">优秀<br>认证</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { toPng } from 'html-to-image'
import { PETS, getPetImageUrl } from '../utils/pets'
import Dialog from '../utils/dialog'

const props = defineProps({
  show: Boolean,
  student: Object,
  growthStages: Array
})

const emit = defineEmits(['close'])
const certRef = ref(null)
const generating = ref(false)

const close = () => {
  emit('close')
}

const generateImage = async () => {
  if (!certRef.value || generating.value) return
  generating.value = true
  try {
    const dataUrl = await toPng(certRef.value, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#ffffff',
      filter: (node) => {
        // 跳过带 data-html2canvas-ignore 属性的元素
        if (node.hasAttribute && node.hasAttribute('data-html2canvas-ignore')) {
          return false
        }
        return true
      }
    })
    
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${props.student?.name || '宠物'}_收集卡.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (e) {
    console.error('生成图片失败:', e)
    Dialog.alert('图片生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const petStage = computed(() => {
  if (!props.student || !props.student.pet_type) return 1
  const stages = props.growthStages || [0,5,10,20,30,45,60,75,90,100]
  let stage = 1
  for (let i = stages.length - 1; i >= 0; i--) {
    if (props.student.food_count >= stages[i]) { stage = i + 1; break }
  }
  return stage
})

const petImageUrl = computed(() => {
  if (!props.student || !props.student.pet_type) return ''
  const pet = PETS.find(p => p.id === props.student.pet_type)
  if (!pet) return ''
  return getPetImageUrl(pet.folder, petStage.value)
})
</script>

<style scoped>
/* 无需打印样式 */
</style>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm print:bg-white print:backdrop-blur-none" @click="close">
    
    <!-- 模态框主体 (非打印状态下的容器) -->
    <div class="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 m-4 overflow-hidden print:shadow-none print:m-0 print:p-0 print:absolute print:inset-0 print:flex print:items-center print:justify-center print:bg-transparent" @click.stop id="print-certificate-container">
      
      <!-- 打印按钮 (仅屏幕可见) -->
      <div class="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2 print:hidden z-20">
        <button @click="printCertificate" class="px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs sm:text-base">
          🖨️ <span class="hidden sm:inline">确认打印</span>
        </button>
        <button @click="close" class="w-8 h-8 sm:w-11 sm:h-11 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center font-bold text-sm sm:text-base">
          ✕
        </button>
      </div>

      <!-- 证书内容区 (强制宽高比例) -->
      <div class="relative w-full aspect-[1.414/1] bg-orange-50/30 rounded-2xl border-4 border-dashed border-pink-300 p-2 sm:p-10 flex flex-col items-center justify-between text-center print:border-[12px] print:border-pink-300 print:rounded-3xl print:bg-white print:shadow-none" style="max-height: 80vh;">
        
        <!-- 背景装饰 -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-xl print:rounded-3xl">
           <div class="absolute -top-10 -left-10 w-40 h-40 bg-yellow-200/50 rounded-full mix-blend-multiply filter blur-2xl"></div>
           <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-200/50 rounded-full mix-blend-multiply filter blur-2xl"></div>
           <div class="absolute top-1/2 right-10 w-24 h-24 bg-sky-200/40 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>

        <!-- 标题区 -->
        <div class="relative z-10 w-full mt-1 sm:mt-4">
          <h1 class="text-xl sm:text-5xl font-black text-slate-800 tracking-wider mb-0 sm:mb-2 print:text-5xl" style="font-family: 'Comic Sans MS', 'MaokenZhuy圆体', cursive, sans-serif;">✨ 班级宠物屋 ✨</h1>
          <h2 class="text-sm sm:text-3xl font-bold text-pink-500 tracking-widest print:text-3xl mt-1">优秀星宠收集卡</h2>
        </div>

        <!-- 萌宠图区 -->
        <div class="relative z-10 flex-1 flex flex-col items-center justify-center my-1 sm:my-6 print:my-10">
          <div class="relative">
            <!-- 底光 -->
            <div class="absolute inset-0 bg-blue-100/80 rounded-full blur-2xl transform scale-150"></div>
            <img :src="petImageUrl" alt="pet" class="w-20 h-20 sm:w-52 sm:h-52 object-contain relative z-10 drop-shadow-2xl print:w-64 print:h-64" />
          </div>
          <!-- 名字铭牌 -->
          <div class="mt-2 sm:mt-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 sm:px-10 sm:py-3 rounded-full border-2 border-pink-100 shadow-sm print:border-4 print:border-pink-100">
             <span class="text-[10px] sm:text-lg text-slate-500 font-medium print:text-2xl">守护兽名字:</span>
             <span class="text-sm sm:text-3xl font-black text-slate-800 ml-1 sm:ml-3 print:text-4xl">{{ student.pet_name || '未命名' }}</span>
             <span class="inline-block ml-1 sm:ml-4 px-2 py-0.5 sm:px-4 sm:py-1.5 bg-amber-100 text-amber-700 text-[10px] sm:text-base font-black rounded-xl transform -rotate-3 print:text-xl print:px-5 print:py-2">Lv.{{ petStage }}</span>
          </div>
        </div>

        <!-- 页脚签字区 -->
        <div class="relative z-10 w-full flex justify-between items-end px-2 sm:px-12 border-t border-dashed border-slate-300 pt-2 sm:pt-8 print:border-t-4 print:pt-10 print:mb-4">
          <div class="text-left w-1/3">
            <p class="text-[9px] sm:text-lg text-slate-500 font-bold mb-0.5 sm:mb-2 print:text-xl">授予优秀主人：</p>
            <p class="text-sm sm:text-4xl font-black text-slate-800 border-b-2 sm:border-b-4 border-slate-800 pb-0.5 sm:pb-1 px-1 sm:px-4 inline-block min-w-[60px] sm:min-w-[140px] text-center print:text-5xl">{{ student.name }}</p>
          </div>
          
          <div class="text-center w-1/3 opacity-80 print:opacity-100">
             <p class="text-[8px] sm:text-sm text-slate-400 font-medium tracking-widest print:text-base origin-bottom max-w-[50px] sm:max-w-none mx-auto leading-tight">CLASS PET HOUSE</p>
          </div>

          <div class="text-right w-1/3 flex flex-col items-end">
            <p class="text-[9px] sm:text-lg text-slate-400 font-bold mb-0.5 sm:mb-2 print:text-xl">教师查收盖章:</p>
            <!-- 红色仿制印章 -->
            <div class="w-10 h-10 sm:w-24 sm:h-24 border-[3px] sm:border-8 border-red-500/80 rounded-full flex items-center justify-center transform rotate-12 bg-white/50 backdrop-blur-sm print:w-32 print:h-32 print:border-8 print:border-red-500">
               <span class="text-red-500/80 font-black text-[9px] sm:text-xl tracking-tighter transform -rotate-12 print:text-3xl leading-none">优秀<br>认证</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PETS } from '../utils/pets'

const props = defineProps({
  show: Boolean,
  student: Object,
  growthStages: Array
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const printCertificate = () => {
  window.print()
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
  return `/pet-images/${pet.folder}/${petStage.value}.webp?v=3`
})
</script>

<style>
/* 注入顶级打印样式 */
@media print {
  /* 隐藏所有 Vue 挂载的非证书元素 */
  body > #app > *:not(div:has(#print-certificate-container)) {
    display: none !important;
  }
  
  /* 为了防止其他全局样式干扰，强制页面去色和隐去背景 */
  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 居中全屏填充证书容器 */
  #print-certificate-container {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 27cm !important; /* 横向 A4 合理尺寸 */
    height: 19cm !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 打印纸张设置为横向 */
  @page {
    size: A4 landscape;
    margin: 0;
  }
}
</style>

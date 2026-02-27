<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 text-center">
      <h2 class="text-lg font-bold text-gray-700 mb-4">⏱️ 课堂计时器</h2>

      <!-- 时间显示 -->
      <div class="text-5xl font-mono font-bold mb-6"
        :class="timeUp ? 'text-red-500 animate-pulse' : 'text-theme'">
        {{ display }}
      </div>

      <!-- 预设时间 -->
      <div v-if="!running && !seconds" class="flex gap-2 justify-center mb-4">
        <button v-for="t in presets" :key="t" @click="setTime(t)"
          class="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-theme-light transition">
          {{ t }}分钟
        </button>
      </div>

      <!-- 自定义输入 -->
      <div v-if="!running && !seconds" class="flex items-center justify-center gap-2 mb-4">
        <input v-model.number="customMin" type="number" min="1" max="60" placeholder="分钟"
          class="w-16 px-2 py-1 rounded-lg border text-sm text-center outline-none" />
        <button @click="setTime(customMin)"
          class="px-3 py-1.5 bg-accent text-white rounded-lg text-sm">设定</button>
      </div>

      <!-- 控制按钮 -->
      <div class="flex gap-2 justify-center">
        <button v-if="!running && seconds > 0" @click="start"
          class="px-5 py-2 bg-accent text-white rounded-xl font-medium transition active:scale-95">
          ▶️ 开始
        </button>
        <button v-if="running" @click="pause"
          class="px-5 py-2 bg-yellow-400 text-white rounded-xl font-medium transition active:scale-95">
          ⏸️ 暂停
        </button>
        <button v-if="seconds > 0" @click="reset"
          class="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm">
          🔄 重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useEscClose } from '../composables/useEscClose'

const emit = defineEmits(['close'])
useEscClose(emit)

const presets = [1, 3, 5, 10]
const customMin = ref(5)
const seconds = ref(0)
const running = ref(false)
const timeUp = ref(false)
let timer = null

const display = computed(() => {
  const m = Math.floor(seconds.value / 60)
  const s = seconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function setTime(min) {
  if (!min || min < 1) return
  seconds.value = min * 60
  timeUp.value = false
}

function start() {
  running.value = true
  timeUp.value = false
  timer = setInterval(() => {
    if (seconds.value <= 1) {
      seconds.value = 0
      running.value = false
      timeUp.value = true
      clearInterval(timer)
      // 播放提示音
      try { new Audio('data:audio/wav;base64,UklGRl9vT19teleXBl').play() } catch {}
    } else {
      seconds.value--
    }
  }, 1000)
}

function pause() {
  running.value = false
  clearInterval(timer)
}

function reset() {
  running.value = false
  seconds.value = 0
  timeUp.value = false
  clearInterval(timer)
}

onUnmounted(() => clearInterval(timer))
</script>

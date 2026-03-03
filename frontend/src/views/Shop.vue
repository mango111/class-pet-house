<template>
  <div class="max-w-6xl mx-auto">
    <h2 class="text-xl font-bold text-gray-700 mb-4">🛍️ 小卖部</h2>

    <!-- 商品列表 -->
    <div class="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      <div v-for="(item, i) in items" :key="item.id"
        class="group bg-white/90 backdrop-blur-md rounded-[1.8rem] p-5 shadow-sm text-center border-2 border-white hover:border-[var(--theme-ring)]/40 hover:shadow-[0_15px_35px_-10px_var(--theme-ring)] hover:-translate-y-1 transition-all duration-300 animate-stagger-fade-in flex flex-col items-center"
        :style="{ animationDelay: `${i * 0.05}s` }">
        
        <!-- Icon Squircle -->
        <div class="w-16 h-16 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-4xl mb-3 shadow-inner group-hover:scale-110 transition-transform duration-300 group-hover:bg-theme-light">
          {{ item.icon }}
        </div>
        
        <p class="text-base font-black text-slate-700 tracking-wide">{{ item.name }}</p>
        <p class="text-xs font-bold text-slate-400 mt-1 h-8 line-clamp-2">{{ item.description }}</p>
        
        <div class="mt-3 px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-black text-sm border border-orange-100 flex items-center gap-1">
          <span class="text-[12px]">🏅</span> {{ item.price }}
        </div>
        
        <p v-if="item.stock >= 0" class="text-[10px] font-bold text-slate-400 mt-2 bg-slate-100 px-2 py-0.5 rounded-full">剩余: {{ item.stock }}</p>
        
        <div class="flex gap-2 justify-center mt-4 w-full">
          <button @click="openExchange(item)"
            class="flex-1 py-2 bg-accent text-white rounded-xl text-sm font-black shadow-md shadow-accent/30 hover:scale-[1.05] active:scale-95 transition-all">
            兑换
          </button>
          <button @click="deleteItem(item)"
            class="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 hover:scale-[1.05] transition-all">
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- 兑换弹窗（选择学生） -->
    <div v-if="showExchangeModal" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      @click.self="showExchangeModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-xs p-5">
        <h3 class="text-center font-bold text-gray-700 mb-3">
          兑换「{{ exchangeTarget?.name }}」
        </h3>
        <p class="text-center text-xs text-gray-400 mb-3">选择学生</p>
        <div class="max-h-60 overflow-y-auto space-y-1">
          <button v-for="s in classStore.students" :key="s.id"
            @click="confirmExchange(s)"
            class="w-full text-left px-3 py-2 rounded-lg hover:bg-theme-light text-sm transition flex justify-between">
            <span>{{ s.name }}</span>
            <span class="text-xs text-gray-400">🏅{{ (s.badges || []).length }}</span>
          </button>
        </div>
        <button @click="showExchangeModal = false"
          class="mt-3 w-full py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">取消</button>
      </div>
    </div>

    <!-- 商品管理 -->
    <div class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border-2 border-white mb-6">
      <h3 class="font-black text-slate-700 mb-4 text-lg">⚙️ 商品管理</h3>
      <div class="flex flex-col sm:flex-row gap-3">
        <input v-model="newItem.name" placeholder="商品名称"
          class="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-100 text-sm font-bold text-slate-600 outline-none focus:border-accent focus:bg-white transition-colors bg-slate-50" />
        <input v-model.number="newItem.price" type="number" placeholder="价格(徽章)" min="1"
          class="w-full sm:w-32 px-4 py-3 rounded-2xl border-2 border-slate-100 text-sm font-bold text-slate-600 outline-none focus:border-accent focus:bg-white transition-colors bg-slate-50" />
        <button @click="addItem"
          class="px-6 py-3 bg-slate-800 text-white font-black rounded-2xl text-sm hover:bg-slate-700 hover:shadow-lg border-2 border-slate-800 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap">➕ 添加商品</button>
      </div>
    </div>

    <!-- 兑换记录 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <h3 class="font-bold text-gray-700 mb-3">兑换记录</h3>
      <div v-for="r in records" :key="r.id"
        class="flex items-center justify-between p-2 border-b border-gray-50 text-sm">
        <span>{{ r.Student?.name }} 兑换了 {{ r.item_name }}</span>
        <span class="text-xs text-gray-400">{{ formatTime(r.createdAt) }}</span>
      </div>
      <p v-if="!records.length" class="text-center text-gray-400 text-sm py-4">暂无记录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useClassStore } from '../stores/class'
import api from '../utils/api'
import Dialog from '../utils/dialog'

const classStore = useClassStore()
const items = ref([])
const records = ref([])
const newItem = reactive({ name: '', price: 1 })
const showExchangeModal = ref(false)
const exchangeTarget = ref(null)

// ESC 关闭兑换弹窗
function onEsc(e) { if (e.key === 'Escape') showExchangeModal.value = false }
onMounted(() => window.addEventListener('keydown', onEsc))
onUnmounted(() => window.removeEventListener('keydown', onEsc))

watch(() => classStore.currentClass, async (newClass) => {
  if (!newClass) return
  try {
    const cid = newClass.id
    items.value = await api.get(`/shop/class/${cid}`)
    records.value = await api.get(`/shop/exchange/${cid}`)
  } catch {}
}, { immediate: true })

async function addItem() {
  if (!newItem.name) return
  try {
    const item = await api.post('/shop', {
      class_id: classStore.currentClass.id,
      name: newItem.name,
      price: newItem.price
    })
    items.value.push(item)
    newItem.name = ''
    newItem.price = 1
  } catch (err) { Dialog.alert(err.error || '添加失败') }
}

function openExchange(item) {
  exchangeTarget.value = item
  showExchangeModal.value = true
}

async function deleteItem(item) {
  if (!(await Dialog.confirm(`确定删除「${item.name}」？`))) return
  try {
    await api.delete(`/shop/${item.id}`)
    items.value = items.value.filter(i => i.id !== item.id)
  } catch (err) { Dialog.alert(err.error || '删除失败') }
}

async function confirmExchange(student) {
  try {
    await api.post('/shop/exchange', {
      class_id: classStore.currentClass.id,
      student_id: student.id,
      item_id: exchangeTarget.value.id
    })
    showExchangeModal.value = false
    Dialog.alert('兑换成功！')
    // 刷新商品列表（库存变化）、兑换记录、学生数据（徽章变化）
    const cid = classStore.currentClass.id
    await Promise.all([
      api.get(`/shop/class/${cid}`).then(d => items.value = d),
      api.get(`/shop/exchange/${cid}`).then(d => records.value = d),
      classStore.fetchStudents()
    ])
  } catch (err) { Dialog.alert(err.error || '兑换失败') }
}

function formatTime(t) {
  if (!t) return ''
  try {
    const d = new Date(t)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }).replace(/\//g, '-')
  } catch (e) {
    return ''
  }
}
</script>

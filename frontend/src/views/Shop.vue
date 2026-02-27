<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold text-gray-700 mb-4">🛍️ 小卖部</h2>

    <!-- 商品列表 -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
      <div v-for="item in items" :key="item.id"
        class="bg-white rounded-2xl p-4 shadow-sm text-center">
        <span class="text-3xl">{{ item.icon }}</span>
        <p class="text-sm font-medium text-gray-700 mt-2">{{ item.name }}</p>
        <p class="text-xs text-gray-400">{{ item.description }}</p>
        <p class="text-sm text-accent font-bold mt-1">🏅 {{ item.price }}</p>
        <p v-if="item.stock >= 0" class="text-xs text-gray-400">库存: {{ item.stock }}</p>
        <button @click="openExchange(item)"
          class="mt-2 px-3 py-1 bg-accent text-white rounded-lg text-xs bg-accent-hover transition">
          兑换
        </button>
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
    <div class="bg-white rounded-2xl p-5 shadow-sm mb-6">
      <h3 class="font-bold text-gray-700 mb-3">商品管理</h3>
      <div class="flex gap-2">
        <input v-model="newItem.name" placeholder="商品名称"
          class="flex-1 px-3 py-2 rounded-lg border text-sm outline-none" />
        <input v-model.number="newItem.price" type="number" placeholder="价格" min="1"
          class="w-20 px-3 py-2 rounded-lg border text-sm outline-none" />
        <button @click="addItem"
          class="px-4 py-2 bg-accent text-white rounded-lg text-sm">➕ 添加</button>
      </div>
    </div>

    <!-- 兑换记录 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <h3 class="font-bold text-gray-700 mb-3">兑换记录</h3>
      <div v-for="r in records" :key="r.id"
        class="flex items-center justify-between p-2 border-b border-gray-50 text-sm">
        <span>{{ r.Student?.name }} 兑换了 {{ r.item_name }}</span>
        <span class="text-xs text-gray-400">{{ formatTime(r.created_at) }}</span>
      </div>
      <p v-if="!records.length" class="text-center text-gray-400 text-sm py-4">暂无记录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useClassStore } from '../stores/class'
import api from '../utils/api'

const classStore = useClassStore()
const items = ref([])
const records = ref([])
const newItem = reactive({ name: '', price: 1 })
const showExchangeModal = ref(false)
const exchangeTarget = ref(null)

onMounted(async () => {
  if (!classStore.currentClass) return
  const cid = classStore.currentClass.id
  items.value = await api.get(`/shop/class/${cid}`)
  records.value = await api.get(`/shop/exchange/${cid}`)
})

async function addItem() {
  if (!newItem.name) return
  const item = await api.post('/shop', {
    class_id: classStore.currentClass.id,
    name: newItem.name,
    price: newItem.price
  })
  items.value.push(item)
  newItem.name = ''
  newItem.price = 1
}

function openExchange(item) {
  exchangeTarget.value = item
  showExchangeModal.value = true
}

async function confirmExchange(student) {
  try {
    await api.post('/shop/exchange', {
      class_id: classStore.currentClass.id,
      student_id: student.id,
      item_id: exchangeTarget.value.id
    })
    showExchangeModal.value = false
    alert('兑换成功！')
    records.value = await api.get(`/shop/exchange/${classStore.currentClass.id}`)
  } catch (err) { alert(err.error || '兑换失败') }
}

function formatTime(t) {
  return new Date(t).toLocaleString('zh-CN')
}
</script>

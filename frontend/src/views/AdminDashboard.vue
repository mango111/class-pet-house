<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
    <!-- 登录墙 -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-slate-800">🛡️ 系统后台管理</h1>
        <p class="text-slate-500 mt-2 text-sm">请输入.env中配置的超级管理员账密</p>
      </div>
      
      <div v-if="loginError" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
        {{ loginError }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm text-slate-600 mb-1">管理员账号</label>
          <input v-model="adminUser" type="text" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">管理员密码</label>
          <input v-model="adminPass" type="password" @keyup.enter="handleLogin" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
        </div>
        <button @click="handleLogin" :disabled="loading" class="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-3 font-medium transition active:scale-95 disabled:opacity-50">
          {{ loading ? '验证中...' : '进入控制台' }}
        </button>
      </div>
      
      <div class="mt-6 text-center">
        <router-link to="/" class="text-sm text-sky-600 hover:underline">返回前台大厅</router-link>
      </div>
    </div>

    <!-- 控制台面板 -->
    <div v-else class="max-w-5xl mx-auto space-y-6">
      <!-- 头部栏 -->
      <div class="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
            🔑 激活码管理中心
          </h1>
          <p class="text-slate-500 text-sm mt-1">管理系统的邀请注册激活码</p>
        </div>
        <div class="flex gap-4">
          <button @click="handleLogout" class="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium text-sm">
            退出登录
          </button>
          <router-link to="/" class="px-4 py-2 text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition font-medium text-sm">
            前台大厅
          </router-link>
        </div>
      </div>

      <!-- 操作与统计栏 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 生成区域 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 md:col-span-2 flex flex-col justify-center">
          <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">生成新激活码</h2>
          <div class="flex gap-3 items-end w-full">
            <div class="flex-1">
              <label class="block text-xs text-slate-400 mb-1">生成数量</label>
              <input v-model.number="generateCount" type="number" min="1" max="100" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <button @click="handleGenerate" :disabled="loading" class="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition active:scale-95 whitespace-nowrap disabled:opacity-50">
              批量生成
            </button>
          </div>
        </div>

        <!-- 汇总区域 -->
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
          <div class="absolute -right-4 -top-4 opacity-10 text-8xl">📊</div>
          <h2 class="text-sm font-medium text-slate-300 mb-4 z-10 w-full">全站统计数据</h2>
          <div class="grid grid-cols-2 gap-4 z-10 w-full mb-1">
            <div>
              <div class="text-xs text-slate-400">总激活码</div>
              <div class="text-2xl font-bold">{{ stats.totalLicenses }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400">已核销</div>
              <div class="text-2xl font-bold text-green-400">{{ stats.usedLicenses }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400">总注册用户</div>
              <div class="text-2xl font-bold text-sky-400">{{ stats.totalUsers }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 激活码清单 -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 class="font-bold text-slate-800">卡密明细清单</h2>
          <div class="flex bg-slate-100 p-1 rounded-lg">
            <button @click="filterType = 'all'" :class="filterType === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'" class="px-3 py-1 text-sm rounded-md font-medium transition">全部</button>
            <button @click="filterType = 'unused'" :class="filterType === 'unused' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-700'" class="px-3 py-1 text-sm rounded-md font-medium transition">未核销</button>
            <button @click="filterType = 'used'" :class="filterType === 'used' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'" class="px-3 py-1 text-sm rounded-md font-medium transition">已核销</button>
          </div>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-6 py-4 font-medium">卡密 (Code)</th>
                <th class="px-6 py-4 font-medium">状态</th>
                <th class="px-6 py-4 font-medium">使用账号</th>
                <th class="px-6 py-4 font-medium">核销时间</th>
                <th class="px-6 py-4 font-medium">创建时间</th>
                <th class="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in paginatedLicenses" :key="item.id" class="hover:bg-slate-50 transition">
                <td class="px-6 py-4 font-mono font-medium text-slate-800">{{ item.code }}</td>
                <td class="px-6 py-4">
                  <span v-if="item.is_used" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    已核销
                  </span>
                  <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                    未使用
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span v-if="item.username" class="text-slate-700 font-medium">@{{ item.username }}</span>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ formatDate(item.used_at) }}</td>
                <td class="px-6 py-4 text-slate-500">{{ formatDate(item.created_at) }}</td>
                <td class="px-6 py-4 text-right">
                  <button @click="copyCode(item.code)" class="text-sky-600 hover:text-sky-800 font-medium transition active:scale-95 pr-2">
                    复制
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedLicenses.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                  没有找到符合条件的卡密
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 翻页控制 -->
        <div v-if="totalPages > 1" class="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div class="text-sm text-slate-500">
            共 <span class="font-medium text-slate-700">{{ filteredLicenses.length }}</span> 条数据，当前第 <span class="font-medium text-slate-700">{{ currentPage }} / {{ totalPages }}</span> 页
          </div>
          <div class="flex gap-2">
            <button @click="currentPage--" :disabled="currentPage <= 1" class="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 text-sm font-medium">
              上一页
            </button>
            <button @click="currentPage++" :disabled="currentPage >= totalPages" class="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 text-sm font-medium">
              下一页
            </button>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Dialog from '../utils/dialog'

const adminUser = ref('')
const adminPass = ref('')
const loginError = ref('')
const isAuthenticated = ref(false)
const loading = ref(false)

const generateCount = ref(1)
const licenses = ref([])
const stats = ref({ totalUsers: 0, activatedUsers: 0, totalLicenses: 0, usedLicenses: 0 })

// 过滤状态：'all', 'used', 'unused'
const filterType = ref('all')

const filteredLicenses = computed(() => {
  let result = licenses.value
  if (filterType.value === 'used') result = licenses.value.filter(l => l.is_used)
  if (filterType.value === 'unused') result = licenses.value.filter(l => !l.is_used)
  return result
})

// 分页逻辑
const currentPage = ref(1)
const pageSize = ref(10)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredLicenses.value.length / pageSize.value))
})

const paginatedLicenses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLicenses.value.slice(start, end)
})

// 监听过滤条件变化，重置页码
import { watch } from 'vue'
watch(filterType, () => {
  currentPage.value = 1
})

// 创建专门的 Axios 实例（绕过全局拦截器，直接带 Basic Auth）
const adminApi = axios.create({
  baseURL: '/api/admin',
  timeout: 10000
})

adminApi.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      isAuthenticated.value = false
      localStorage.removeItem('adminAuth')
    }
    return Promise.reject(err.response?.data || err)
  }
)

const setAdminHeaders = (user, pass) => {
  const normalizedUser = (user || '').trim()
  const normalizedPass = (pass || '').trim()
  const token = btoa(`${normalizedUser}:${normalizedPass}`)
  adminApi.defaults.headers.common['Authorization'] = `Basic ${token}`
  adminApi.defaults.headers.common['X-Admin-Username'] = normalizedUser
  adminApi.defaults.headers.common['X-Admin-Password'] = normalizedPass
  localStorage.setItem('adminAuth', JSON.stringify({ user: normalizedUser, pass: normalizedPass }))
}

const handleLogin = async () => {
  adminUser.value = (adminUser.value || '').trim()
  adminPass.value = (adminPass.value || '').trim()

  if (!adminUser.value || !adminPass.value) {
    loginError.value = '请输入账密'
    return
  }
  loading.value = true
  loginError.value = ''
  
  try {
    setAdminHeaders(adminUser.value, adminPass.value)
    // 测试联通性
    await fetchData()
    isAuthenticated.value = true
  } catch (err) {
    loginError.value = err.error || '管理员认证失败，账密不匹配'
    isAuthenticated.value = false
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  isAuthenticated.value = false
  adminUser.value = ''
  adminPass.value = ''
  localStorage.removeItem('adminAuth')
}

const fetchData = async () => {
  try {
    const [licRes, statsRes] = await Promise.all([
      adminApi.get('/licenses'),
      adminApi.get('/stats')
    ])
    licenses.value = licRes
    stats.value = statsRes
    // 如果数据量没变但重刷了，也可以保证页码合法
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (err) {
    console.error('获取数据失败', err)
    throw err
  }
}

const handleGenerate = async () => {
  if (generateCount.value < 1) return
  loading.value = true
  try {
    await adminApi.post('/licenses/generate', { count: generateCount.value })
    await fetchData() // 刷新列表
    filterType.value = 'unused' // 自动切到未使用的卡密查看
    currentPage.value = 1 // 生成后回到第一页看新生成的数据
  } catch (err) {
    Dialog.alert(err.error || '生成卡密失败')
  } finally {
    loading.value = false
  }
}

const copyCode = async (code) => {
  try {
    // 优先尝试现代 API (仅在 HTTPS 或 localhost 可用)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(code)
    } else {
      // 降级传统复制方法 (支持 HTTP 域名)
      const textArea = document.createElement("textarea")
      textArea.value = code
      // 隐藏输入框，防止页面滚动
      textArea.style.position = "absolute"
      textArea.style.left = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (err) {
        console.error('Fallback copy failed', err)
        throw err
      } finally {
        textArea.remove()
      }
    }
    
    // 简单闪烁一下 UI 作为反馈
    const originalFilter = filterType.value
    filterType.value = ''
    setTimeout(() => { filterType.value = originalFilter }, 50)
  } catch (e) {
    Dialog.alert('复制失败，请手动选择复制: ' + e.message)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit'
  }).replace(/\//g, '-')
}

onMounted(() => {
  // 尝试自动登录
  const saved = localStorage.getItem('adminAuth')
  if (saved) {
    try {
      const { user, pass } = JSON.parse(saved)
      adminUser.value = user
      adminPass.value = pass
      handleLogin()
    } catch(e) {}
  }
})
</script>

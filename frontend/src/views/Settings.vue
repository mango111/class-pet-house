<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h2 class="text-xl font-bold text-gray-700">⚙️ 设置</h2>

    <!-- 系统名称 & 班级名称 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <label class="block text-sm text-gray-500 mb-1">系统名称</label>
        <input v-model="systemName" type="text"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-accent" />
      </div>
      <div>
        <label class="block text-sm text-gray-500 mb-1">当前班级名称</label>
        <input v-model="className" type="text"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-accent" />
      </div>
    </div>

    <!-- 学生名单管理 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <h3 class="font-bold text-gray-700 mb-3">👨‍🎓 学生名单管理</h3>
      <div class="flex gap-2 mb-3">
        <input v-model="newStudentName" type="text" placeholder="输入学生姓名"
          @keyup.enter="addStudent"
          class="flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" />
        <button @click="addStudent"
          class="px-4 py-2 bg-accent text-white rounded-lg text-sm">添加</button>
        <button @click="showBatchAdd = true"
          class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">批量添加</button>
      </div>

      <!-- 学生列表 -->
      <div class="space-y-2 max-h-60 overflow-y-auto">
        <div v-for="s in classStore.students" :key="s.id"
          class="flex items-center justify-between p-2 rounded-lg bg-gray-50">
          <span class="text-sm text-gray-700">{{ s.name }}</span>
          <div class="flex gap-1">
            <button @click="editStudent(s)" class="text-gray-400 hover:text-gray-600 text-sm">✏️</button>
            <button @click="deleteStudent(s)" class="text-gray-400 hover:text-red-500 text-sm">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 积分规则管理 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <h3 class="font-bold text-gray-700 mb-3">📋 加分项目管理</h3>
      <div class="space-y-2 max-h-60 overflow-y-auto mb-3">
        <div v-for="r in rules" :key="r.id"
          class="flex items-center justify-between p-2 rounded-lg bg-gray-50">
          <span class="text-sm">{{ r.icon }} {{ r.name }}
            <span :class="r.value > 0 ? 'text-green-500' : 'text-red-500'">
              {{ r.value > 0 ? '+' : '' }}{{ r.value }}
            </span>
          </span>
          <div class="flex gap-1">
            <button @click="deleteRule(r)" class="text-gray-400 hover:text-red-500 text-sm">🗑️</button>
          </div>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <input v-model="newRule.name" placeholder="规则名称"
          class="flex-1 px-3 py-2 rounded-lg border text-sm outline-none" />
        <input v-model="newRule.icon" placeholder="图标" maxlength="2"
          class="w-14 px-2 py-2 rounded-lg border text-sm outline-none text-center" />
        <input v-model.number="newRule.value" type="number" placeholder="分值"
          class="w-16 px-2 py-2 rounded-lg border text-sm outline-none" />
        <button @click="addRule"
          class="px-3 py-2 bg-accent text-white rounded-lg text-sm">➕</button>
      </div>
    </div>

    <!-- 界面主题 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <h3 class="font-bold text-gray-700 mb-3">🎨 界面主题</h3>
      <div class="flex flex-wrap gap-2">
        <button v-for="t in themes" :key="t.id" @click="currentTheme = t.id; setTheme(t.id)"
          :class="currentTheme === t.id ? 'ring-2 ring-offset-2 ring-accent' : ''"
          class="w-8 h-8 rounded-full transition" :style="{ backgroundColor: t.color }">
        </button>
      </div>
    </div>

    <!-- 账号管理 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <h3 class="font-bold text-gray-700 mb-3">👤 账号管理</h3>
      <button @click="changePassword"
        class="w-full py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">🔑 修改密码</button>
      <button @click="handleLogout"
        class="w-full py-2 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100">🚪 退出登录</button>
    </div>

    <!-- 保存按钮 -->
    <button @click="saveSettings"
      class="fixed bottom-6 right-6 px-6 py-3 bg-accent text-white rounded-xl shadow-lg bg-accent-hover transition active:scale-95">
      💾 保存设置
    </button>

    <!-- 批量添加弹窗 -->
    <BatchAddModal
      v-if="showBatchAdd"
      @close="showBatchAdd = false"
      @added="showBatchAdd = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClassStore } from '../stores/class'
import { useAuthStore } from '../stores/auth'
import api from '../utils/api'
import BatchAddModal from '../components/BatchAddModal.vue'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const classStore = useClassStore()
const authStore = useAuthStore()
const { setTheme } = useTheme()

const systemName = ref('')
const className = ref('')
const newStudentName = ref('')
const showBatchAdd = ref(false)
const rules = ref([])
const currentTheme = ref('pink')
const newRule = ref({ name: '', icon: '⭐', value: 1 })

const themes = [
  { id: 'pink', color: '#f472b6' },
  { id: 'blue', color: '#60a5fa' },
  { id: 'green', color: '#4ade80' },
  { id: 'purple', color: '#a78bfa' },
  { id: 'orange', color: '#fb923c' },
  { id: 'red', color: '#f87171' },
  { id: 'teal', color: '#2dd4bf' },
  { id: 'yellow', color: '#facc15' },
]

onMounted(async () => {
  if (classStore.currentClass) {
    systemName.value = classStore.currentClass.system_name || ''
    className.value = classStore.currentClass.name || ''
    currentTheme.value = classStore.currentClass.theme || 'pink'
    const data = await api.get(`/score-rules/class/${classStore.currentClass.id}`)
    rules.value = data
  }
})

async function addStudent() {
  if (!newStudentName.value.trim()) return
  try {
    await api.post('/students', {
      class_id: classStore.currentClass.id,
      name: newStudentName.value.trim()
    })
    newStudentName.value = ''
    await classStore.fetchStudents()
  } catch (err) { alert(err.error || '添加失败') }
}

async function editStudent(s) {
  const name = prompt('修改学生姓名', s.name)
  if (!name || name === s.name) return
  await api.put(`/students/${s.id}`, { name })
  await classStore.fetchStudents()
}

async function deleteStudent(s) {
  if (!confirm(`确定删除"${s.name}"？`)) return
  await api.delete(`/students/${s.id}`)
  await classStore.fetchStudents()
}

async function deleteRule(r) {
  if (!confirm(`确定删除"${r.name}"？`)) return
  await api.delete(`/score-rules/${r.id}`)
  rules.value = rules.value.filter(x => x.id !== r.id)
}

async function addRule() {
  if (!newRule.value.name || !newRule.value.value) return
  try {
    const rule = await api.post('/score-rules', {
      class_id: classStore.currentClass.id,
      name: newRule.value.name,
      icon: newRule.value.icon || '⭐',
      value: newRule.value.value
    })
    rules.value.push(rule)
    newRule.value = { name: '', icon: '⭐', value: 1 }
  } catch (err) { alert(err.error || '添加失败') }
}

async function changePassword() {
  const oldPwd = prompt('请输入旧密码')
  if (!oldPwd) return
  const newPwd = prompt('请输入新密码（至少6位）')
  if (!newPwd) return
  try {
    await api.put('/auth/change-password', { oldPassword: oldPwd, newPassword: newPwd })
    alert('密码修改成功')
  } catch (err) { alert(err.error || '修改失败') }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

async function saveSettings() {
  try {
    await api.put(`/classes/${classStore.currentClass.id}`, {
      system_name: systemName.value,
      name: className.value,
      theme: currentTheme.value
    })
    await classStore.fetchClasses()
    alert('设置已保存')
  } catch (err) { alert(err.error || '保存失败') }
}
</script>

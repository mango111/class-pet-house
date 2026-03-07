<template>
  <div class="max-w-4xl mx-auto space-y-6">
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
      <div class="flex flex-col sm:flex-row gap-2 mb-3">
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
      <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 mt-3">
        <input v-model="newRule.name" placeholder="规则名称"
          class="flex-1 px-3 py-2 rounded-lg border text-sm outline-none" />
        <input v-model="newRule.icon" placeholder="图标" maxlength="2"
          class="w-full sm:w-14 px-2 py-2 rounded-lg border text-sm outline-none text-center" />
        <input v-model.number="newRule.value" type="number" placeholder="分值"
          class="w-full sm:w-16 px-2 py-2 rounded-lg border text-sm outline-none" />
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

    <!-- 成长阶段配置 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <h3 class="font-bold text-gray-700 mb-3">📊 成长阶段配置</h3>
      <p class="text-xs text-gray-400 mb-2">设置宠物每个阶段所需的食物数量（逗号分隔）</p>
      <input v-model="growthStagesText" type="text" placeholder="0,5,10,20,30,45,60,75,90,100"
        class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:border-accent" />
    </div>

    <!-- 班级工具 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <h3 class="font-bold text-gray-700 mb-3">🛠️ 班级工具</h3>
      <button @click="randomAssignPets"
        class="w-full py-2 bg-theme-light text-theme rounded-lg text-sm hover:opacity-80">🐾 一键随机分配宠物</button>
      <button @click="randomAssignGroups"
        class="w-full py-2 bg-theme-light text-theme rounded-lg text-sm hover:opacity-80">🎲 随机分组</button>
      <button @click="resetAllProgress"
        class="w-full py-2 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100">🔄 全班进度重置</button>
      <div v-if="classStore.classes.length > 1" class="flex gap-2 items-center">
        <select v-model="copyFromClassId" class="flex-1 px-3 py-2 rounded-lg border text-sm outline-none">
          <option value="">选择源班级</option>
          <option v-for="c in classStore.classes.filter(c => c.id !== classStore.currentClass?.id)" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <button @click="copyConfig" :disabled="!copyFromClassId"
          class="px-4 py-2 bg-accent text-white rounded-lg text-sm disabled:opacity-50">📋 复制配置</button>
      </div>
    </div>

    <!-- 🤖 AI 智能助手 -->
    <div class="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <h3 class="font-bold text-gray-700 mb-3">🤖 AI 智能助手</h3>
      <button @click="showAiReport = true"
        class="w-full py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all">📊 AI 生成班级周报</button>
      <p class="text-xs text-gray-400">基于全班积分数据，AI自动生成周报/月报，可直接复制发家长群</p>
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
    <div class="pt-4 pb-8">
      <button @click="saveSettings"
        class="w-full sm:w-auto px-10 py-3.5 bg-accent text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 text-base mx-auto">
        <span class="text-xl">💾</span> 保存全部设置
      </button>
    </div>

    <!-- 批量添加弹窗 -->
    <BatchAddModal
      v-if="showBatchAdd"
      @close="showBatchAdd = false"
      @added="showBatchAdd = false"
    />

    <!-- 修改密码弹窗 -->
    <ChangePasswordModal
      v-if="showChangePassword"
      :show="showChangePassword"
      @close="showChangePassword = false"
    />

    <!-- AI 周报弹窗 -->
    <AiReportModal
      v-if="showAiReport"
      :show="showAiReport"
      :class-id="classStore.currentClass?.id"
      @close="showAiReport = false"
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
import AiReportModal from '../components/AiReportModal.vue'
import ChangePasswordModal from '../components/ChangePasswordModal.vue'
import { useTheme } from '../composables/useTheme'
import { PETS } from '../utils/pets'
import Dialog from '../utils/dialog'

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
const growthStagesText = ref('')
const copyFromClassId = ref('')
const showAiReport = ref(false)
const showChangePassword = ref(false)

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
    growthStagesText.value = (classStore.currentClass.growth_stages || [0,5,10,20,30,45,60,75,90,100]).join(',')
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
  } catch (err) { Dialog.alert(err.error || '添加失败') }
}

async function editStudent(s) {
  const name = await Dialog.prompt('修改学生姓名', s.name)
  if (!name || name === s.name) return
  try {
    await api.put(`/students/${s.id}`, { name })
    await classStore.fetchStudents()
  } catch (err) { Dialog.alert(err.error || '修改失败') }
}

async function deleteStudent(s) {
  if (!(await Dialog.confirm(`确定删除"${s.name}"？`))) return
  try {
    await api.delete(`/students/${s.id}`)
    await classStore.fetchStudents()
  } catch (err) { Dialog.alert(err.error || '删除失败') }
}

async function deleteRule(r) {
  if (!(await Dialog.confirm(`确定删除"${r.name}"？`))) return
  try {
    await api.delete(`/score-rules/${r.id}`)
    rules.value = rules.value.filter(x => x.id !== r.id)
  } catch (err) { Dialog.alert(err.error || '删除失败') }
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
  } catch (err) { Dialog.alert(err.error || '添加失败') }
}

function changePassword() {
  showChangePassword.value = true
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

async function saveSettings() {
  try {
    const updateData = {
      system_name: systemName.value,
      name: className.value,
      theme: currentTheme.value
    }
    // 解析成长阶段
    if (growthStagesText.value) {
      const stages = growthStagesText.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
      if (stages.length >= 2) updateData.growth_stages = stages
    }
    await api.put(`/classes/${classStore.currentClass.id}`, updateData)
    await classStore.fetchClasses()
    Dialog.alert('设置已保存')
  } catch (err) { Dialog.alert(err.error || '保存失败') }
}

async function randomAssignPets() {
  if (!(await Dialog.confirm('将为所有未分配宠物的学生随机分配，确定？'))) return
  try {
    await api.post('/students/random-pets', {
      class_id: classStore.currentClass.id,
      pets: PETS
    })
    await classStore.fetchStudents()
    Dialog.alert('随机分配完成')
  } catch (err) { Dialog.alert(err.error || '分配失败') }
}

async function randomAssignGroups() {
  if (!(await Dialog.confirm('将打乱所有学生并随机分配到现有分组，确定？'))) return
  try {
    await api.post('/groups/random-assign', {
      class_id: classStore.currentClass.id
    })
    await classStore.fetchGroups()
    await classStore.fetchStudents()
    Dialog.alert('随机分组完成')
  } catch (err) { Dialog.alert(err.error || '分组失败') }
}

async function resetAllProgress() {
  if (!(await Dialog.confirm('⚠️ 将重置全班所有学生的食物和宠物，此操作不可撤回！确定？'))) return
  try {
    await api.post('/students/reset-all', {
      class_id: classStore.currentClass.id
    })
    await classStore.fetchStudents()
    Dialog.alert('全班进度已重置')
  } catch (err) { Dialog.alert(err.error || '重置失败') }
}

async function copyConfig() {
  if (!copyFromClassId.value) return
  if (!(await Dialog.confirm('将从源班级复制积分规则、商品和成长阶段到当前班级，确定？'))) return
  try {
    await api.post('/classes/copy-config', {
      from_class_id: copyFromClassId.value,
      to_class_id: classStore.currentClass.id
    })
    await classStore.fetchClasses()
    const data = await api.get(`/score-rules/class/${classStore.currentClass.id}`)
    rules.value = data
    Dialog.alert('配置复制成功')
  } catch (err) { Dialog.alert(err.error || '复制失败') }
}
</script>

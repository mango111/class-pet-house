<template>
  <div class="w-full mx-auto flex flex-col md:flex-row gap-6 items-start pb-20 relative">
    
    <!-- 左侧/顶部 固定的菜单导航 -->
    <div class="w-full md:w-64 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm flex-shrink-0 sticky top-[90px] md:top-[110px] z-30 self-start">
      <h2 class="text-xl font-bold text-gray-800 mb-4 px-2 hidden md:block">⚙️ 系统设置</h2>
      <nav class="flex flex-row md:flex-col gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="flex items-center gap-1.5 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-medium transition-colors whitespace-nowrap outline-none text-sm md:text-base"
          :class="activeTab === tab.id ? 'bg-accent text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
          <span class="text-base md:text-lg">{{ tab.icon }}</span>
          <span>{{ tab.name }}</span>
        </button>
      </nav>
    </div>

    <!-- 右侧内容区域 -->
    <div class="flex-1 w-full min-w-0">
      
      <!--========================================
        基础设置
      =========================================-->
      <div v-if="activeTab === 'basic'" class="space-y-6 animation-fade-in">
        <div class="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="text-lg font-bold text-gray-800 border-b pb-3 border-gray-100">系统信息</h3>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">系统自定义名称</label>
            <input v-model="systemName" type="text" placeholder="例如：三年二班宠物屋"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-accent bg-gray-50 focus:bg-white transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">当前班级标签</label>
            <input v-model="className" type="text" placeholder="例如：星光闪耀班"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-accent bg-gray-50 focus:bg-white transition" />
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="text-lg font-bold text-gray-800 border-b pb-3 border-gray-100">🎈 界面主题</h3>
          <p class="text-sm text-gray-500 mb-2">选择全班同学们喜爱的主题配色</p>
          <div class="flex flex-wrap gap-4 pt-2">
            <button v-for="t in themes" :key="t.id" @click="currentTheme = t.id; setTheme(t.id)"
              :class="currentTheme === t.id ? 'ring-4 ring-offset-2 ring-accent scale-110' : 'hover:scale-110'"
              class="w-10 h-10 rounded-full transition-all shadow-sm" :style="{ backgroundColor: t.color }">
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="text-lg font-bold text-gray-800 border-b pb-3 border-gray-100">📈 成长阶段设置</h3>
          <p class="text-sm text-gray-500 mb-2">定义宠物进化所需的食物数量阈值（以英文逗号分隔）。默认值：0,5,10,20,30,45,60,75,90,100</p>
          <input v-model="growthStagesText" type="text" placeholder="例如：0,5,10,20,30,45,60,75,90,100"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-accent bg-gray-50 focus:bg-white transition font-mono tracking-wider" />
        </div>

        <button @click="saveSettings"
          class="w-full px-6 py-4 bg-accent text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-lg">
          <span>💾 保存当前全部基础设置</span>
        </button>
      </div>

      <!--========================================
        学生管理
      =========================================-->
      <div v-if="activeTab === 'students'" class="bg-white rounded-2xl p-6 shadow-sm animation-fade-in flex flex-col min-h-[400px]">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 mb-4 gap-4 flex-shrink-0">
          <h3 class="text-lg font-bold text-gray-800">学生名单管理</h3>
          <button @click="showBatchAdd = true"
            class="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">批量导入学生</button>
        </div>
        
        <div class="flex gap-2 mb-4 flex-shrink-0">
          <input v-model="newStudentName" type="text" placeholder="输入新学生姓名并回车..."
            @keyup.enter="addStudent"
            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-accent bg-gray-50 focus:bg-white transition" />
          <button @click="addStudent"
            class="px-4 sm:px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition whitespace-nowrap shrink-0">添加</button>
        </div>

        <div class="flex-1 space-y-2 pr-2">
          <div v-if="classStore.students.length === 0" class="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">暂无学生，请在上方输入姓名添加</div>
          <div v-for="s in classStore.students" :key="s.id"
            class="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-sky-50 transition border border-transparent hover:border-sky-100 group">
            <span class="font-medium text-gray-700 pl-2 select-all">{{ s.name }}</span>
            <div class="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="editStudent(s)" class="p-2 text-gray-400 hover:text-sky-500 bg-white rounded-lg shadow-sm border border-gray-100 outline-none transition" title="修改名字">✏️</button>
              <button @click="deleteStudent(s)" class="p-2 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100 outline-none transition" title="删除学生">🗑️</button>
            </div>
          </div>
        </div>
        <div class="mt-4 text-xs text-gray-400 text-center flex-shrink-0">此页面的添加、修改和删除操作都会自动实时保存生效。</div>
      </div>

      <!--========================================
        加分项管理
      =========================================-->
      <div v-if="activeTab === 'rules'" class="bg-white rounded-2xl p-6 shadow-sm animation-fade-in flex flex-col min-h-[400px]">
        <h3 class="text-lg font-bold text-gray-800 border-b pb-4 mb-4 flex-shrink-0">奖励与扣查项目配置</h3>
        
        <div class="bg-orange-50/50 p-4 rounded-xl mb-4 border border-orange-100 flex-shrink-0">
          <h4 class="text-sm font-bold text-gray-700 mb-3">🛠️ 新增规则指令</h4>
          <div class="flex flex-wrap gap-2">
            <input v-model="newRule.name" placeholder="名称，例如: 积极发言"
              class="flex-1 min-w-[120px] px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-accent bg-white" />
            <input v-model="newRule.icon" placeholder="图标" maxlength="2"
              class="w-16 px-2 py-2.5 rounded-lg border border-gray-200 outline-none text-center focus:border-accent bg-white text-lg" title="输入一个Emoji表情" />
            <input v-model.number="newRule.value" type="number" placeholder="+1或-1"
              class="w-24 px-2 py-2.5 rounded-lg border border-gray-200 outline-none text-center focus:border-accent bg-white" title="正数加分，负数扣分" />
            <button @click="addRule"
              class="px-6 py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition shadow-sm">提交新建</button>
          </div>
        </div>

        <div class="flex-1 space-y-2 pr-2">
          <div v-if="rules.length === 0" class="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">还没配置任何积分规则</div>
          <div v-for="r in rules" :key="r.id"
             class="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-orange-50 transition border border-transparent hover:border-orange-100 group">
             <div class="flex items-center gap-4">
               <span class="text-2xl inline-flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100">{{ r.icon }}</span>
               <span class="font-bold text-gray-700">{{ r.name }}</span>
               <span :class="r.value > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'" class="px-3 py-1 rounded-full text-sm font-black border">
                 {{ r.value > 0 ? '+' : '' }}{{ r.value }}
               </span>
             </div>
             <button @click="deleteRule(r)" class="p-2 text-gray-300 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100 outline-none transition opacity-100 sm:opacity-0 group-hover:opacity-100" title="删除规则">🗑️</button>
          </div>
        </div>
        <div class="mt-4 text-xs text-gray-400 text-center flex-shrink-0">提示：正数分值会在点击学生时产生“喂食”金币效果，负数则是扣分。配置实时生效。</div>
      </div>

      <!--========================================
        高级工具
      =========================================-->
      <div v-if="activeTab === 'tools'" class="space-y-6 animation-fade-in">
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-bold text-gray-800 border-b pb-3 mb-6">🤖 AI 智能超级助手</h3>
          <div class="flex flex-col sm:flex-row items-center justify-between p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-purple-100 gap-4">
            <div class="flex-1">
              <h4 class="text-lg font-bold text-purple-800 mb-1">班级自动周报与月报</h4>
              <p class="text-sm text-purple-600/80 leading-relaxed max-w-lg">利用AI深度大语言模型分析这周内全班所有积分操作明细、红黑榜与学生行为表现，提取总结出高度友好的班级总结，方便直接复制发送给家长群审阅。</p>
            </div>
            <button @click="showAiReport = true"
              class="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap">
              ✨ 立即生成周报
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-bold text-gray-800 border-b pb-3 mb-6">🛠️ 快速调整工具</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button @click="randomAssignPets"
              class="p-5 bg-teal-50 border border-teal-100 text-teal-800 rounded-2xl text-left hover:bg-teal-100 transition group flex flex-col gap-2">
              <div class="text-3xl group-hover:scale-110 transition-transform origin-left">🐾</div>
              <div class="font-bold text-lg">全班一键盲盒摸宠</div>
              <div class="text-sm opacity-75">如果同学们嫌自己一个一个挑选麻烦，点击这里，系统会为所有尚未领养宠物的同学随机发一只开局萌宠。</div>
            </button>

            <button @click="randomAssignGroups"
              class="p-5 bg-sky-50 border border-sky-100 text-sky-800 rounded-2xl text-left hover:bg-sky-100 transition group flex flex-col gap-2">
              <div class="text-3xl group-hover:scale-110 transition-transform origin-left">🎲</div>
              <div class="font-bold text-lg">打乱全班随机分组</div>
              <div class="text-sm opacity-75">上课需要重新分组？一键将当前所有同学完全打乱，随机且平均地塞回你已经建好的各个空缺小组名下。</div>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-bold text-red-600 border-b border-red-100 pb-3 mb-6">⚠️ 危险与维护区</h3>
          
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row items-center justify-between p-5 bg-red-50 border border-red-100 rounded-2xl gap-4">
              <div class="flex-1">
                <h4 class="font-bold text-red-800">新学期·清空全班进度记录</h4>
                <p class="text-xs sm:text-sm text-red-600/80 mt-1 max-w-md">慎重！这将清空整个班级所有同学当前的食物数量，并将他们所有的宠物退化回第0阶段的幼崽形态。且不会保留任何恢复备份！</p>
              </div>
              <button @click="resetAllProgress"
                class="w-full sm:w-auto px-5 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition shadow-sm whitespace-nowrap active:scale-95">
                🧨 确定重置数据
              </button>
            </div>
            
            <div v-if="classStore.classes.length > 1" class="flex flex-col justify-start p-5 bg-gray-50 border border-gray-200 rounded-2xl gap-4">
              <div>
                <h4 class="font-bold text-gray-800">复刻其他班级配置清单</h4>
                <p class="text-sm text-gray-500 mt-1">你的账号下管理了多个平行班级？可以从指定班级完全复制“加扣分规则大全”、“小卖部奖品列表”、“成长门槛”这三项配置到本班，免去一条条录入的麻烦。</p>
              </div>
              <div class="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <select v-model="copyFromClassId" class="flex-1 px-4 py-3 rounded-xl border border-gray-300 outline-none bg-white focus:border-accent font-medium">
                  <option value=""> -- 点击选择复刻源班级 -- </option>
                  <option v-for="c in classStore.classes.filter(c => c.id !== classStore.currentClass?.id)" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <button @click="copyConfig" :disabled="!copyFromClassId"
                  class="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 disabled:opacity-40 transition active:scale-95 whitespace-nowrap">
                  开始复刻转移
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--========================================
        账号管理
      =========================================-->
      <div v-if="activeTab === 'account'" class="bg-white rounded-2xl p-6 shadow-sm animation-fade-in flex flex-col min-h-[400px]">
        <h3 class="text-lg font-bold text-gray-800 border-b pb-3 mb-6 flex-shrink-0">账号安全设置</h3>
        <p class="text-sm text-gray-500 mb-6 flex-shrink-0">管理你当前登录的教师账号密码和在线状态登录信息。若遗忘了密码只能通过向管理员索要的激活码寻回。</p>
        
        <div class="space-y-4 max-w-2xl w-full mx-auto md:mx-0 flex-1">
          <button @click="showChangePassword = true"
            class="w-full flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-800 rounded-2xl hover:shadow-md hover:from-white hover:to-gray-50 transition-all group">
            <span class="flex items-center gap-4 text-left">
              <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🔑</div>
              <div>
                <div class="font-bold text-lg">修改我的登录密码</div>
                <div class="text-sm text-gray-500 mt-0.5">需要输入旧密码，请妥善保管新密码</div>
              </div>
            </span>
            <span class="text-gray-300 group-hover:text-accent group-hover:translate-x-1 transition-all">❯</span>
          </button>
          
          <button @click="handleLogout"
            class="w-full flex items-center justify-between p-5 bg-red-50/50 border border-red-100 text-red-800 rounded-2xl hover:bg-red-50 hover:shadow-md transition-all group">
            <span class="flex items-center gap-4 text-left">
              <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl text-red-500 group-hover:scale-110 transition-transform">🚪</div>
              <div>
                <div class="font-bold text-lg">安全退出系统登录</div>
                <div class="text-sm text-red-400 mt-0.5">下次访问大厅将需重新输入账号验证身份</div>
              </div>
            </span>
            <span class="text-red-200 group-hover:text-red-500 group-hover:translate-x-1 transition-all">❯</span>
          </button>
        </div>
        <div class="mt-auto pt-6 text-center text-gray-300 text-sm flex-shrink-0 font-mono">
          🐾 班级宠物屋 V1.0 - 为教育和激励打造
        </div>
      </div>

    </div>

    <!-- 弹窗挂载点 -->
    <BatchAddModal v-if="showBatchAdd" @close="showBatchAdd = false" @added="showBatchAdd = false" />
    <ChangePasswordModal v-if="showChangePassword" :show="showChangePassword" @close="showChangePassword = false" />
    <AiReportModal v-if="showAiReport" :show="showAiReport" :class-id="classStore.currentClass?.id" @close="showAiReport = false" />
    
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

// 定义左侧标签页结构
const tabs = [
  { id: 'basic', name: '基本设置', icon: '⚙️' },
  { id: 'students', name: '学生管理', icon: '👨‍🎓' },
  { id: 'rules', name: '积分规则', icon: '📋' },
  { id: 'tools', name: '超级工具', icon: '🛠️' },
  { id: 'account', name: '账号中心', icon: '👤' },
]
const activeTab = ref('basic')

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

// === 学生名单管理 ===
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
  if (!(await Dialog.confirm(`确定要在名单中彻底除名 "${s.name}" 吗？该学生的所有历史积分数据将被抹去。`))) return
  try {
    await api.delete(`/students/${s.id}`)
    await classStore.fetchStudents()
  } catch (err) { Dialog.alert(err.error || '删除失败') }
}

// === 加分规则管理 ===
async function deleteRule(r) {
  if (!(await Dialog.confirm(`你想删掉 "${r.name}" 这组规则吗？`))) return
  try {
    await api.delete(`/score-rules/${r.id}`)
    rules.value = rules.value.filter(x => x.id !== r.id)
  } catch (err) { Dialog.alert(err.error || '删除失败，请稍后重试') }
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
    newRule.value = { name: '', icon: '⭐', value: 1 } // Reset to ready defaults
  } catch (err) { Dialog.alert(err.error || '添加规则失败') }
}

// === 基础设置与杂项保存 ===
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
    Dialog.alert('基础配置保存成功！刷新或返回前台即可生效。')
  } catch (err) { Dialog.alert(err.error || '保存遇到网络故障') }
}

// === 面板特权动作 ===
async function randomAssignPets() {
  if (!(await Dialog.confirm('确定一键随机为班上目前还没开盲盒的学生发送宠物吗？'))) return
  try {
    await api.post('/students/random-pets', {
      class_id: classStore.currentClass.id,
      pets: PETS
    })
    await classStore.fetchStudents()
    Dialog.alert('已给没宠物的孩子们完成了派发！')
  } catch (err) { Dialog.alert(err.error || '系统派发异常，请稍后再试') }
}

async function randomAssignGroups() {
  if (!(await Dialog.confirm('打乱所有学生目前所属的小组，进行天命重新发配！是否继续？'))) return
  try {
    await api.post('/groups/random-assign', {
      class_id: classStore.currentClass.id
    })
    await classStore.fetchGroups()
    await classStore.fetchStudents()
    Dialog.alert('重新乱序列队！分组洗牌完毕🎲')
  } catch (err) { Dialog.alert(err.error || '洗牌失败') }
}

async function resetAllProgress() {
  if (!(await Dialog.confirm('🚨 危险提醒：此操作将清空所选班级所有人的现有宠物进度和历史积分累计，恢复如初，通常用于新学期排雷！继续执行？'))) return
  try {
    await api.post('/students/reset-all', {
      class_id: classStore.currentClass.id
    })
    await classStore.fetchStudents()
    Dialog.alert('班级全员进度已重置')
  } catch (err) { Dialog.alert(err.error || '服务端拒绝了你的重置命令') }
}

async function copyConfig() {
  if (!copyFromClassId.value) return
  if (!(await Dialog.confirm('即将强行覆盖本班的 积分项、商品项配置 为来源班级规则，确定执行？'))) return
  try {
    await api.post('/classes/copy-config', {
      from_class_id: copyFromClassId.value,
      to_class_id: classStore.currentClass.id
    })
    await classStore.fetchClasses()
    const data = await api.get(`/score-rules/class/${classStore.currentClass.id}`)
    rules.value = data
    Dialog.alert('一键传功复制圆满成功！')
  } catch (err) { Dialog.alert(err.error || '无法完成云端配置转移') }
}

// === 闭合退出 ===
function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.animation-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 隐藏横向滚动框的默认 UI 并留出美观留白 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 允许优美的自定义细长滚动条 (主要针对表单内部长清单的 Webkit)为主 */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>

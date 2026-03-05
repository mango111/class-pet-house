<template>
  <div class="space-y-4">
    <!-- 操作栏 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-bold text-slate-600">👥 拖拽分组管理</h3>
        <span class="text-xs text-slate-400">拖动学生卡片到不同组</span>
      </div>
      <div class="flex gap-2">
        <button @click="showAddGroup = true"
          class="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
          ➕ 新建分组
        </button>
        <button @click="$emit('close')"
          class="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
          ✕ 退出
        </button>
      </div>
    </div>

    <!-- 新建分组输入 -->
    <div v-if="showAddGroup" class="flex gap-2 items-center bg-white rounded-xl p-3 shadow-sm border border-slate-100">
      <input v-model="newGroupName" type="text" placeholder="输入分组名称" maxlength="20"
        @keyup.enter="createGroup"
        class="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-purple-300" />
      <button @click="createGroup" class="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold">创建</button>
      <button @click="showAddGroup = false; newGroupName = ''" class="px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm">取消</button>
    </div>

    <!-- 分组区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <!-- 各分组 -->
      <div v-for="group in groupsWithStudents" :key="group.id"
        class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- 分组标题 -->
        <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="text-sm font-black text-purple-700">{{ group.name }}</span>
            <span class="text-[10px] bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-full font-bold">{{ group.students.length }}人</span>
          </div>
          <button @click="deleteGroup(group)" class="text-slate-400 hover:text-red-500 text-sm transition-colors" title="删除分组">🗑️</button>
        </div>
        <!-- 可拖拽列表容器 (通过外层 relative 包含占位符) -->
        <div class="relative flex-1 flex flex-col bg-slate-50/50 rounded-b-2xl h-full">
          <!-- 空状态占位 -->
          <div v-if="group.students.length === 0" class="absolute inset-2 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center pointer-events-none z-0">
            <span class="text-sm font-bold text-slate-400">将同学拖到这里</span>
          </div>
          
          <draggable
            v-model="group.students"
            group="students"
            item-key="id"
            :animation="200"
            :id="`group-${group.id}`"
            class="flex-1 min-h-[120px] h-full p-2 space-y-1.5 pb-24 relative z-10"
            ghost-class="opacity-40"
            drag-class="pet-drag-active"
            @change="(evt) => onDragChange(evt, group.id)">
            
            <template #item="{ element }">
              <div :data-id="element.id" class="flex items-center gap-2 px-3 py-2.5 bg-white shadow-sm border border-slate-100 hover:border-purple-200 hover:bg-purple-50 rounded-xl cursor-grab active:cursor-grabbing transition-colors group/item">
                <img v-if="element.pet_type" :src="getPetImage(element)" class="w-8 h-8 object-contain" />
                <span v-else class="w-8 h-8 flex items-center justify-center text-lg drop-shadow-sm">🥚</span>
                <span class="text-sm font-bold text-slate-700 flex-1">{{ element.name }}</span>
                <span class="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">🍖 {{ element.food_count }}</span>
                <span class="text-slate-300 group-hover/item:text-slate-400 text-lg leading-none">⣿</span>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- 未分组 -->
      <div class="bg-white rounded-2xl shadow-sm border border-dashed border-slate-300 overflow-hidden flex flex-col xl:col-span-1 md:col-span-2 col-span-1">
        <div class="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-black text-slate-600">未分组学生</span>
            <span class="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold shadow-sm">{{ ungroupedStudents.length }}人</span>
          </div>
        </div>
        <div class="relative flex-1 flex flex-col bg-slate-50/80 rounded-b-2xl h-full">
          <div v-if="ungroupedStudents.length === 0" class="absolute inset-2 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center pointer-events-none z-0">
            <span class="text-sm font-bold text-slate-400">目前没有未分组同学</span>
          </div>

          <draggable
            v-model="ungroupedStudents"
            group="students"
            item-key="id"
            :animation="200"
            id="group-null"
            class="flex-1 min-h-[150px] h-full p-2 space-y-1.5 pb-24 relative z-10"
            ghost-class="opacity-40"
            drag-class="pet-drag-active"
            @change="(evt) => onDragChange(evt, null)">
            
            <template #item="{ element }">
              <div :data-id="element.id" class="flex items-center gap-2 px-3 py-2.5 bg-white shadow-sm border border-slate-100 hover:border-purple-200 hover:bg-purple-50 rounded-xl cursor-grab active:cursor-grabbing transition-colors group/item">
                <img v-if="element.pet_type" :src="getPetImage(element)" class="w-8 h-8 object-contain" />
                <span v-else class="w-8 h-8 flex items-center justify-center text-lg drop-shadow-sm">🥚</span>
                <span class="text-sm font-bold text-slate-700 flex-1">{{ element.name }}</span>
                <span class="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">🍖 {{ element.food_count }}</span>
                <span class="text-slate-300 group-hover/item:text-slate-400 text-lg leading-none">⣿</span>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useClassStore } from '../stores/class.js'
import { PETS, getPetImageUrl } from '../utils/pets.js'
import api from '../utils/api.js'
import Dialog from '../utils/dialog'

const emit = defineEmits(['close'])
const classStore = useClassStore()

const showAddGroup = ref(false)
const newGroupName = ref('')

// 使用 ref，手动管理（不自动重建，避免打断拖拽）
const groupsWithStudents = ref([])
const ungroupedStudents = ref([])

function rebuildLists() {
  groupsWithStudents.value = classStore.groups.map(g => ({
    id: g.id,
    name: g.name,
    students: classStore.students
      .filter(s => s.group_id === g.id)
      .map(s => ({ ...s }))
  }))
  ungroupedStudents.value = classStore.students
    .filter(s => !s.group_id)
    .map(s => ({ ...s }))
}

// 仅在初始化时构建列表
onMounted(() => {
  rebuildLists()
})

const getPetImage = (student) => {
  if (!student || !student.pet_type) return ''
  const pet = PETS.find(p => p.id === student.pet_type)
  if (!pet) return ''
  const stages = classStore.currentClass?.growthConfig?.stages || [0,5,10,20,30,45,60,75,90,100]
  let stage = 1
  for (let i = stages.length - 1; i >= 0; i--) {
    if (student.food_count >= stages[i]) { stage = i + 1; break }
  }
  return getPetImageUrl(pet.folder, stage)
}

async function onDragChange(evt, groupId) {
  // 打印调试信息，你可以按F12看日志
  console.log('Drag changed:', evt, 'to group:', groupId)
  
  if (evt.added) {
    const student = evt.added.element
    try {
      await api.put(`/students/${student.id}`, { group_id: groupId })
      console.log(`Successfully saved ${student.name} to group ${groupId}`)
      classStore.fetchStudents()
    } catch (err) {
      console.error('Failed to save group assignment', err)
      Dialog.alert('分组配置保存失败')
      await classStore.fetchStudents()
      rebuildLists()
    }
  }
}

async function createGroup() {
  if (!newGroupName.value.trim()) return
  try {
    await api.post('/groups', {
      class_id: classStore.currentClass.id,
      name: newGroupName.value.trim()
    })
    await classStore.fetchGroups()
    newGroupName.value = ''
    showAddGroup.value = false
    rebuildLists()
  } catch (err) {
    Dialog.alert(err.error || '创建失败')
  }
}

async function deleteGroup(group) {
  if (!(await Dialog.confirm(`确认删除分组「${group.name}」？组内学生将变为未分组`))) return
  try {
    await api.delete(`/groups/${group.id}`)
    await classStore.fetchGroups()
    await classStore.fetchStudents()
    rebuildLists()
  } catch (err) {
    Dialog.alert(err.error || '删除失败')
  }
}
</script>

<style scoped>
.pet-drag-active {
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25) !important;
  --tw-ring-color: #c084fc !important;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000) !important;
  transform: scale(1.05) !important;
  z-index: 50 !important;
}
</style>

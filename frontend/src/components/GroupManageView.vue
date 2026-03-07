<template>
  <div class="space-y-6 sm:space-y-8 pb-10">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-4 sm:p-5 rounded-[2rem] border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a] transition-transform hover:-translate-y-1">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-yellow-300 rounded-2xl flex items-center justify-center text-2xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] rotate-3">
          👥
        </div>
        <div>
          <h3 class="text-lg sm:text-xl font-black text-slate-800 font-kuaile">欢乐分组大作战</h3>
          <span class="text-xs sm:text-sm font-bold text-slate-500">你可以随意捏起同学们，把他们扔进不同的彩色基地里！</span>
        </div>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button @click="showAddGroup = true"
          class="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-pink-400 text-slate-900 rounded-2xl text-sm font-black border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#0f172a] hover:bg-pink-300 active:translate-y-0 active:shadow-none transition-all">
          ➕ 新建基地
        </button>
        <button @click="$emit('close')"
          class="px-4 sm:px-5 py-3 bg-white text-slate-900 rounded-2xl text-sm font-black border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#0f172a] active:translate-y-0 active:shadow-none transition-all">
          ✕ 退出
        </button>
      </div>
    </div>

    <!-- Add Group Form -->
    <div v-if="showAddGroup" class="flex flex-col sm:flex-row gap-3 items-center bg-indigo-50 rounded-[2rem] p-5 border-4 border-indigo-900 shadow-[6px_6px_0_0_#312e81] transform-gpu animate-bounce-in relative z-20">
      <div class="w-full sm:w-auto flex-1 relative group">
        <input v-model="newGroupName" type="text" placeholder="给新基地起个超酷的名字..." maxlength="20"
          @keyup.enter="createGroup"
          class="w-full px-5 py-4 rounded-2xl border-4 border-indigo-900 text-base sm:text-lg font-bold text-indigo-900 outline-none focus:bg-white bg-indigo-100 transition-colors placeholder-indigo-900/40" />
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button @click="createGroup" class="flex-1 sm:flex-none px-8 py-4 bg-emerald-400 text-slate-900 rounded-2xl text-lg font-black border-4 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-1 hover:bg-emerald-300 active:translate-y-0 active:shadow-none transition-all">
          ✨ 创建
        </button>
        <button @click="showAddGroup = false; newGroupName = ''" class="px-5 py-4 bg-slate-200 text-slate-900 rounded-2xl text-lg font-black border-4 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-1 hover:bg-white active:translate-y-0 active:shadow-none transition-all">
          取消
        </button>
      </div>
    </div>

    <!-- Groups Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 auto-rows-max">
      
      <!-- Existing Groups -->
      <div v-for="(group, idx) in groupsWithStudents" :key="group.id"
        class="group-container relative rounded-[2rem] border-4 border-slate-900 shadow-[6px_6px_0_0_#0f172a] flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 group hover:shadow-[8px_8px_0_0_#0f172a]"
        :class="getGroupColorClass(idx)">
        
        <!-- Group Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b-4 border-slate-900 bg-white/20 backdrop-blur-sm shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-xl font-black text-slate-900 font-kuaile truncate max-w-[150px] sm:max-w-[200px]">{{ group.name }}</span>
            <span class="text-sm border-2 border-slate-900 bg-white text-slate-900 px-3 py-1 rounded-full font-black shadow-[2px_2px_0_0_#0f172a] -rotate-3 group-hover:rotate-3 transition-transform">{{ group.students.length }}人</span>
          </div>
          <button @click="deleteGroup(group)" class="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-900 rounded-xl text-lg hover:bg-red-400 hover:text-white transition-colors shadow-[2px_2px_0_0_#0f172a] active:translate-y-0.5 active:shadow-none pointer-events-auto" title="摧毁基地">
            🗑️
          </button>
        </div>

        <!-- Draggable Content Area -->
        <div class="flex-1 flex flex-col relative min-h-[160px]">
          <!-- Empty State Graphic -->
          <div v-if="group.students.length === 0" class="absolute inset-4 rounded-2xl border-4 border-dashed border-slate-900/20 flex flex-col items-center justify-center pointer-events-none z-0">
            <span class="text-4xl mb-2 opacity-30 grayscale">🎪</span>
            <span class="text-sm font-black text-slate-900/40">拉人进来！</span>
          </div>
          
          <draggable
            v-model="group.students"
            group="students"
            item-key="id"
            :animation="250"
            :id="`group-${group.id}`"
            class="flex-1 h-full p-4 space-y-3 pb-8 relative z-10"
            ghost-class="sortable-ghost"
            drag-class="sortable-drag"
            @change="(evt) => onDragChange(evt, group.id)">
            
            <template #item="{ element }">
              <div :data-id="element.id" class="student-token group/student">
                <div class="flex items-center gap-3 w-full">
                  <div class="w-12 h-12 shrink-0 rounded-[1rem] bg-indigo-50 border-2 border-slate-900 flex items-center justify-center overflow-hidden shadow-inner group-hover/student:scale-110 transition-transform bg-grid-pattern">
                    <img v-if="element.pet_type" :src="getPetImage(element)" class="w-8 h-8 object-contain" />
                    <span v-else class="text-2xl drop-shadow-sm">🥚</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-base sm:text-lg font-black text-slate-900 truncate">{{ element.name }}</div>
                  </div>
                  <div class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-300 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_0_#0f172a]">
                    <span class="text-xs sm:text-sm font-black text-slate-900">🍖 {{ element.food_count }}</span>
                  </div>
                  <!-- Drag Handle Area (Invisible but covers right side) -->
                  <div class="w-8 shrink-0 flex items-center justify-center text-slate-900/30 group-hover/student:text-slate-900/60 cursor-grab active:cursor-grabbing">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Ungrouped Students (The Waiting Room) -->
      <div class="group-container bg-slate-200 relative rounded-[2rem] border-4 border-slate-900 shadow-[6px_6px_0_0_#0f172a] flex flex-col overflow-hidden sm:col-span-1 md:col-span-2 xl:col-span-1">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b-4 border-slate-900 bg-slate-300/50 shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-xl font-black text-slate-900 font-kuaile">散头游击队</span>
            <span class="text-sm bg-slate-900 text-white px-3 py-1 rounded-full font-black shadow-[2px_2px_0_0_#cbd5e1] rotate-2">{{ ungroupedStudents.length }}只落单</span>
          </div>
        </div>

        <div class="flex-1 flex flex-col relative min-h-[160px]">
          <div v-if="ungroupedStudents.length === 0" class="absolute inset-4 rounded-2xl border-4 border-dashed border-slate-900/20 flex flex-col items-center justify-center pointer-events-none z-0">
            <span class="text-4xl mb-2 opacity-30 grayscale">🎉</span>
            <span class="text-sm font-black text-slate-900/40">太棒了，所有人都有家！</span>
          </div>

          <draggable
            v-model="ungroupedStudents"
            group="students"
            item-key="id"
            :animation="250"
            id="group-null"
            class="flex-1 h-full p-4 space-y-3 pb-8 relative z-10"
            ghost-class="sortable-ghost"
            drag-class="sortable-drag"
            @change="(evt) => onDragChange(evt, null)">
            
            <template #item="{ element }">
              <div :data-id="element.id" class="student-token group/student bg-white!">
                <div class="flex items-center gap-3 w-full">
                  <div class="w-12 h-12 shrink-0 rounded-[1rem] bg-slate-100 border-2 border-slate-900 flex items-center justify-center overflow-hidden shadow-inner group-hover/student:scale-110 transition-transform">
                    <img v-if="element.pet_type" :src="getPetImage(element)" class="w-8 h-8 object-contain grayscale sm:grayscale-0 group-hover/student:grayscale-0 transition-all" />
                    <span v-else class="text-2xl drop-shadow-sm opacity-60 group-hover/student:opacity-100">🥚</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-base sm:text-lg font-black text-slate-500 group-hover/student:text-slate-900 truncate transition-colors">{{ element.name }}</div>
                  </div>
                  <div class="w-8 shrink-0 flex items-center justify-center text-slate-900/30 group-hover/student:text-slate-900/60 cursor-grab active:cursor-grabbing">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                  </div>
                </div>
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

const groupsWithStudents = ref([])
const ungroupedStudents = ref([])

// A palette of fun soft-brutalism backgrounds for the groups
const groupColorClasses = [
  'bg-sky-200',
  'bg-emerald-200',
  'bg-amber-200',
  'bg-violet-200',
  'bg-fuchsia-200',
  'bg-rose-200',
  'bg-lime-200',
  'bg-cyan-200',
  'bg-orange-200'
]

function getGroupColorClass(index) {
  return groupColorClasses[index % groupColorClasses.length]
}

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
  if (evt.added) {
    const student = evt.added.element
    try {
      await api.put(`/students/${student.id}`, { group_id: groupId })
      classStore.fetchStudents() // background sync
    } catch (err) {
      Dialog.alert('分组配置保存失败')
      await classStore.fetchStudents()
      rebuildLists() // revert on fail
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
  if (!(await Dialog.confirm(`天哪！你要彻底碾碎基地「${group.name}」吗？里面的同学将会流离失所变成散头游击队！`))) return
  try {
    await api.delete(`/groups/${group.id}`)
    await classStore.fetchGroups()
    await classStore.fetchStudents()
    rebuildLists()
  } catch (err) {
    Dialog.alert(err.error || '摧毁失败')
  }
}
</script>

<style scoped>
/* Toy UI Styling for Students */
.student-token {
  @apply flex items-center bg-white border-4 border-slate-900 rounded-[1.5rem] px-3 sm:px-4 py-3 cursor-grab active:cursor-grabbing select-none transition-transform;
  box-shadow: 4px 4px 0 0 #0f172a;
}
.student-token:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0 0 #0f172a;
}
.student-token:active {
  transform: translateY(2px) scale(0.98);
  box-shadow: 2px 2px 0 0 #0f172a;
}

/* Dragging state */
.sortable-drag {
  opacity: 1 !important;
  z-index: 9999 !important;
  transform: scale(1.05) rotate(3deg) !important;
  box-shadow: 12px 12px 0 0 rgba(15, 23, 42, 0.5) !important;
  cursor: grabbing !important;
}

/* Drop target placeholder */
.sortable-ghost {
  opacity: 0.3 !important;
  transform: scale(0.95) !important;
  background-color: #cbd5e1 !important;
  box-shadow: inset 4px 4px 0 0 rgba(0,0,0,0.1) !important;
  border-style: dashed !important;
}

/* Cute grid background for pet avatars */
.bg-grid-pattern {
  background-image: radial-gradient(#94a3b8 1px, transparent 1px);
  background-size: 8px 8px;
}
</style>

import { defineStore } from 'pinia'
import api from '../utils/api'

export const useClassStore = defineStore('class', {
  state: () => ({
    classes: [],
    currentClass: null,
    students: [],
    groups: [],
    scoreRules: [],
    loading: false
  }),
  actions: {
    async fetchClasses() {
      this.classes = await api.get('/classes')
      if (!this.currentClass && this.classes.length) {
        this.currentClass = this.classes[0]
      }
    },
    async switchClass(cls) {
      this.currentClass = cls
      await this.fetchStudents()
      await this.fetchGroups()
    },
    async fetchStudents() {
      if (!this.currentClass) return
      this.students = await api.get(`/students/class/${this.currentClass.id}`)
    },
    async fetchGroups() {
      if (!this.currentClass) return
      this.groups = await api.get(`/groups/class/${this.currentClass.id}`)
    },
    async fetchScoreRules() {
      if (!this.currentClass) return
      this.scoreRules = await api.get(`/score-rules/class/${this.currentClass.id}`)
    }
  }
})

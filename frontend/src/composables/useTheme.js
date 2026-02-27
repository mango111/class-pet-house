import { ref, computed } from 'vue'

const currentThemeId = ref(localStorage.getItem('theme') || 'pink')

const THEMES = {
  pink:   { accent: '#f472b6', accentHover: '#ec4899', bg: '#fdf2f8', light: '#fce7f3', text: '#9d174d', ring: '#f9a8d4' },
  blue:   { accent: '#60a5fa', accentHover: '#3b82f6', bg: '#eff6ff', light: '#dbeafe', text: '#1e40af', ring: '#93c5fd' },
  green:  { accent: '#4ade80', accentHover: '#22c55e', bg: '#f0fdf4', light: '#dcfce7', text: '#166534', ring: '#86efac' },
  purple: { accent: '#a78bfa', accentHover: '#8b5cf6', bg: '#f5f3ff', light: '#ede9fe', text: '#5b21b6', ring: '#c4b5fd' },
  orange: { accent: '#fb923c', accentHover: '#f97316', bg: '#fff7ed', light: '#ffedd5', text: '#9a3412', ring: '#fdba74' },
  red:    { accent: '#f87171', accentHover: '#ef4444', bg: '#fef2f2', light: '#fee2e2', text: '#991b1b', ring: '#fca5a5' },
  teal:   { accent: '#2dd4bf', accentHover: '#14b8a6', bg: '#f0fdfa', light: '#ccfbf1', text: '#115e59', ring: '#5eead4' },
  yellow: { accent: '#facc15', accentHover: '#eab308', bg: '#fefce8', light: '#fef9c3', text: '#854d0e', ring: '#fde047' },
}

export function useTheme() {
  const theme = computed(() => THEMES[currentThemeId.value] || THEMES.pink)

  function setTheme(id) {
    currentThemeId.value = id
    localStorage.setItem('theme', id)
    applyCSS(THEMES[id] || THEMES.pink)
  }

  function applyCSS(t) {
    const root = document.documentElement.style
    root.setProperty('--accent', t.accent)
    root.setProperty('--accent-hover', t.accentHover)
    root.setProperty('--theme-bg', t.bg)
    root.setProperty('--theme-light', t.light)
    root.setProperty('--theme-text', t.text)
    root.setProperty('--theme-ring', t.ring)
  }

  // 初始化
  applyCSS(theme.value)

  return { currentThemeId, theme, setTheme, THEMES }
}

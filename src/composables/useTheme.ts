import { ref, computed, watch, type Ref, type ComputedRef } from "vue"

interface ThemeComposable {
  isDarkMode: Ref<boolean>
  toggleTheme: () => void
  themeClasses: ComputedRef<string>
}

export function useTheme(): ThemeComposable {
  const isDarkMode = ref(false)

  const initializeTheme = () => {
    if (typeof window !== "undefined") {
      isDarkMode.value =
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
    applyTheme()
  }

  const applyTheme = () => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDarkMode.value)
    }
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem("theme", isDarkMode.value ? "dark" : "light")
  }

  const themeClasses = computed(() =>
    isDarkMode.value ? "dark bg-gray-900 text-white" : "light bg-white text-gray-900"
  )

  watch(isDarkMode, () => {
    applyTheme()
  })

  initializeTheme()

  return {
    isDarkMode,
    toggleTheme,
    themeClasses
  }
}

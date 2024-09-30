<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from "vue"

const props = defineProps<{
  wordIndex: number
  charIndex: number
  wordLength: number
  lineIndex: number
  totalWords: number
}>()

interface IndicatorStyle {
  left: string
  top: string
  height: string
  opacity: string
  transform: string
}

const indicatorStyle = ref<IndicatorStyle>({
  left: "0px",
  top: "0px",
  height: "0px",
  opacity: "1",
  transform: "scale(0.6)"
})

const isBlinking = ref(true)

const updateIndicatorPosition = () => {
  requestAnimationFrame(() => {
    const lineElement = document.querySelector(`[data-line-index="${props.lineIndex}"]`)
    if (!lineElement) return

    const wordElements = lineElement.querySelectorAll("[data-word-index]")
    if (wordElements.length === 0) return

    const targetWordIndex = props.wordIndex % props.totalWords
    const targetWord = wordElements[targetWordIndex] as HTMLElement
    if (!targetWord) return

    const chars = targetWord.querySelectorAll(".char")
    const isWordComplete = props.charIndex >= props.wordLength

    let targetRect: DOMRect
    if (isWordComplete) {
      targetRect = targetWord.getBoundingClientRect()
    } else {
      const targetCharIndex = Math.min(props.charIndex, chars.length - 1)
      const targetChar = chars[targetCharIndex] as HTMLElement
      if (!targetChar) return
      targetRect = targetChar.getBoundingClientRect()
    }

    const containerRect = document.querySelector(".typing-container")?.getBoundingClientRect()
    if (!containerRect) return

    indicatorStyle.value = {
      left: `${isWordComplete ? targetRect.right - containerRect.left : targetRect.left - containerRect.left}px`,
      top: `${targetRect.top - containerRect.top}px`,
      height: `${targetRect.height}px`,
      opacity: "1",
      transform: "scale(0.6)"
    }
  })
}

// Compute the style object for binding
const computedStyle = computed(() => ({
  ...indicatorStyle.value,
  width: "2px",
  backgroundColor: "rgb(234 179 8)",
  transition: "left 0.1s ease-out, top 0.1s ease-out"
}))

// Blink effect
const startBlinking = () => {
  const blinkInterval = setInterval(() => {
    isBlinking.value = !isBlinking.value
  }, 530) // Typical cursor blink rate

  onUnmounted(() => clearInterval(blinkInterval))
}

onMounted(() => {
  updateIndicatorPosition()
  window.addEventListener("resize", updateIndicatorPosition)
  startBlinking()
})

onUnmounted(() => {
  window.removeEventListener("resize", updateIndicatorPosition)
})

watch([() => props.wordIndex, () => props.charIndex, () => props.lineIndex], updateIndicatorPosition, {
  immediate: true
})
</script>

<template>
  <div class="absolute pointer-events-none" :class="{ 'opacity-0': !isBlinking }" :style="computedStyle" />
</template>

import { createRouter, createWebHistory } from "vue-router"
import CodeTypingTest from "@/components/CodeTypingTest.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: CodeTypingTest
    }
  ]
})

export default router

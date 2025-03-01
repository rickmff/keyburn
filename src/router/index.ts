import { createRouter, createWebHistory } from "vue-router"
import { useAuth } from "@clerk/vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/Home.vue")
    },
    {
      path: "/sign-in",
      name: "signIn",
      component: () => import("@/views/SignIn.vue")
    },
    {
      path: "/sign-up",
      name: "signUp",
      component: () => import("@/views/SignUp.vue")
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/Profile.vue"),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const { isSignedIn } = useAuth()
  
  if (to.meta.requiresAuth && !isSignedIn) {
    next("/sign-in")
  } else {
    next()
  }
})

export default router

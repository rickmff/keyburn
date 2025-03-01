<script setup lang="ts">
import { SignUp } from '@clerk/vue'
import { useTheme } from '@/composables/useTheme'

const { themeClasses } = useTheme()
</script>

<template>
  <div :class="['min-h-screen py-14 flex flex-col items-center justify-center', themeClasses]">
    <div class="container mx-auto max-w-9xl flex-grow flex flex-col items-center justify-center">
      <header class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-yellow-500 mb-2">
          <span class="text-gray-700">${</span> KeyBurn <span class="text-gray-700">}</span>
        </h1>
        <p class="text-gray-400">Create an account to track your typing progress</p>
      </header>
      
      <div class="w-full max-w-md">
        <SignUp />
      </div>
      
      <div class="mt-8 text-center">
        <p class="text-gray-400">
          Already have an account?
          <router-link to="/sign-in" class="text-yellow-500 hover:text-yellow-400 transition-colors">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
    
    <footer class="mt-auto py-4 text-center text-sm text-gray-700">
      <p>
        Created by
        <a
          href="https://github.com/rickmff"
          target="_blank"
          rel="noopener noreferrer"
          class="text-yellow-500 hover:text-yellow-400 transition-colors duration-300"
        >
          Rickmff
        </a>
      </p>
    </footer>
  </div>
</template> 
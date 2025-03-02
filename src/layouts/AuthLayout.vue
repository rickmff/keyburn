<script setup lang="ts">
import { clerkOptions } from '@/lib/clerk'

const appearance = clerkOptions.appearance

</script>

<template>
  <div class="min-h-screen py-14 flex flex-col items-center justify-center bg-black">
    <div class="container mx-auto flex-grow flex flex-col items-center justify-center">
      <header class="mb-8 text-center">
        <a href="/">
        <h1 class="text-4xl font-bold text-yellow-500 mb-2">
          <span class="text-gray-700">${</span> KeyBurn <span class="text-gray-700">}</span>
        </h1>
      </a>
      </header>
      
      <slot :appearance="appearance"></slot>
      
      <div class="mt-8 text-center">
        <slot name="footer"></slot>
      </div>
    </div>
    
    <footer class="mt-auto py-4 text-center text-sm text-gray-500">
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
<script setup lang="ts">

const appearance = {
  variables: {
    colorPrimary: '#fff',
    colorText: '#fff',
    colorBackground: '#1a1a1a',
    borderRadius: '0rem'
  },
  elements: {
    formButtonPrimary: 'bg-yellow-500 hover:bg-yellow-400 text-black',
    card: 'bg-black border-gray-700 rounded-lg',
    headerTitle: 'text-gray-400',
    socialButtonsIconButton: 'bg-white border border-gray-700 rounded-lg hover:border-yellow-500 text-white',
    formFieldInput: 'bg-gray-800 text-white hover:border-yellow-500',
    formFieldLabel: 'text-gray-300',
    main: 'gap-0',
    footer: 'hidden',
    dividerText: 'text-gray-400',
    formFieldAction: 'text-yellow-500 hover:text-yellow-400',
    identityPreviewText: 'text-white',
    formHeaderSubtitle: 'text-gray-400'
  }
}
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
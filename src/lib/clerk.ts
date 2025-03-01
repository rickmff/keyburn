import { clerkPlugin } from '@clerk/vue'

export const clerkOptions = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  appearance: {
    variables: {
      colorPrimary: '#EAB308',
      colorText: '#FFFFFF',
      colorBackground: '#000000',
      borderRadius: '0.5rem'
    },
    elements: {
      formButtonPrimary: 'bg-yellow-500 hover:bg-yellow-400 text-black',
      card: 'bg-black border border-gray-500',
      headerTitle: 'text-yellow-500',
      socialButtonsBlockButton: 'border border-gray-500 hover:border-yellow-500',
      formFieldInput: 'bg-gray-800 border-gray-500',
      footer: 'hidden'
    }
  }
} 
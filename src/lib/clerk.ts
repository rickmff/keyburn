export const clerkOptions = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  appearance: {
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
} 
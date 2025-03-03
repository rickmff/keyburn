export const clerkOptions = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  appearance: {
    variables: {
      colorPrimary: '#fff',
      colorText: '#000',
      colorBackground: '#fff',
      borderRadius: '0rem'
    },
    elements: {
      formButtonPrimary: 'bg-yellow-500 hover:bg-yellow-400 text-gray-700',
      card: 'border-gray-700 rounded-lg',
      headerTitle: 'text-gray-700',
      socialButtonsIconButton: 'bg-white border border-gray-700 rounded-lg hover:border-yellow-500 text-white',
      formFieldInput: 'bg-gray-700 text-white hover:border-yellow-500',
      formFieldLabel: 'text-gray-700',
      main: 'gap-0',
      footer: 'hidden',
      dividerText: 'text-gray-700',
      formFieldAction: 'text-yellow-500 hover:text-yellow-400',
      identityPreviewText: 'text-gray-700',
      formHeaderSubtitle: 'text-gray-700'
    }
  }
} 
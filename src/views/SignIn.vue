<script setup lang="ts">
import { SignIn } from '@clerk/vue'
import AuthLayout from '../layouts/AuthLayout.vue'

</script>

<template>
  <AuthLayout>
    <template #default="{ appearance }">
      <SignIn :appearance="appearance"/>
    </template>
    
    <template #footer>
      <p class="text-gray-500">
        Don't have an account?
        <router-link to="/sign-up" class="text-yellow-500 hover:text-yellow-400 transition-colors">
          Sign up
        </router-link>
      </p>
    </template>
  </AuthLayout>
</template> 
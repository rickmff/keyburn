<script setup lang="ts">
import { SignUp } from '@clerk/vue'
import AuthLayout from '../layouts/AuthLayout.vue'

</script>

<template>
  <AuthLayout>
    <template #default="{ appearance }">
      <SignUp :appearance="appearance"/>
    </template>

    <template #footer>
      <p class="text-gray-500">
        Already have an account?
        <router-link to="/sign-in" class="text-yellow-500 hover:text-yellow-400 transition-colors">
          Sign in
        </router-link>
      </p>
    </template>
  </AuthLayout>
</template> 
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser } from '@clerk/vue'
import { useTheme } from '@/composables/useTheme'
import { getUserTestResults, type TestResult } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@clerk/vue'
import { EyeOff, Eye } from 'lucide-vue-next'

const { user, isLoaded } = useUser()
const { signOut } = useAuth()

const { themeClasses } = useTheme()
const testResults = ref<TestResult[]>([])
const isLoading = ref(true)
const hideEmail = ref(false)

onMounted(async () => {
  if (isLoaded && user?.value?.id) {
    try {
      const { data, error } = await getUserTestResults(user.value.id)
      if (error) throw error
      testResults.value = data || []
    } catch (error) {
      console.error('Error fetching test results:', error)
    } finally {
      isLoading.value = false
    }
  }
})

function formatDate(dateString: string) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}
</script>

<template>
  <div :class="['min-h-screen py-14 flex flex-col', themeClasses]">
    <div class="container mx-auto max-w-9xl flex-grow">
      <header class="flex justify-between items-center mb-8 px-5">
        <div class="flex items-center">
          <router-link to="/" class="text-4xl font-bold text-yellow-500">
            <span class="text-gray-700">${</span> KeyBurn <span class="text-gray-700">}</span>
          </router-link>
        </div>
        <router-link to="/"
          class="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full transition-colors duration-300 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
          Take a New Test
        </router-link>
      </header>

      <div class="px-5">
        <div class="bg-black p-6 rounded-lg border border-gray-500 mb-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex flex-col gap-3">
              <h1 class="text-2xl font-bold text-yellow-500">Your Profile</h1>
              <p class="text-white text-lg" v-if="user">{{ user.fullName || user.username }}</p>
              <p v-if="user && !hideEmail" class="text-gray-500 text-sm flex items-center">
                {{ user.primaryEmailAddress?.emailAddress }}
                <button @click="hideEmail = true" class="ml-2 text-xs text-gray-700 hover:text-yellow-400 transition-colors duration-300">
                  <span class="sr-only">Hide email</span>
                  <EyeOff class="h-4 w-4" />
                </button>
              </p>
              <p v-else-if="user && hideEmail" class="text-gray-500 text-sm flex items-center">
                <span>Email</span>
                <button @click="hideEmail = false" class="ml-2 text-xs text-gray-700 hover:text-yellow-400 transition-colors duration-300">
                  <span class="sr-only">Show email</span>
                  <Eye class="h-4 w-4" />
                </button>
              </p>
              <a @click="() => signOut()"
                class="text-red-500 hover:text-red-400 transition-colors duration-300 text-xs cursor-pointer">
                Sign Out
              </a>
            </div>
          </div>
        </div>

        <div class="bg-black p-6 rounded-lg border border-gray-500">
          <h2 class="text-xl font-bold text-yellow-500 mb-4">Your Test History</h2>

          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>

          <div v-else-if="testResults.length === 0" class="text-center py-8">
            <p class="text-gray-400 mb-4">You haven't taken any tests yet.</p>
            <router-link to="/"
              class="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full transition-colors duration-300 inline-flex items-center gap-2">
              Take Your First Test
            </router-link>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="text-left py-3 px-4 text-gray-400">Date</th>
                  <th class="text-left py-3 px-4 text-gray-400">Snippet</th>
                  <th class="text-left py-3 px-4 text-gray-400">Duration</th>
                  <th class="text-left py-3 px-4 text-gray-400">WPM</th>
                  <th class="text-left py-3 px-4 text-gray-400">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in testResults" :key="result.id"
                  class="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                  <td class="py-3 px-4 text-gray-300">{{ formatDate(result.created_at || '') }}</td>
                  <td class="py-3 px-4 text-gray-300">{{ result.snippet_title || 'Code Snippet' }}</td>
                  <td class="py-3 px-4 text-gray-300">{{ result.test_duration }}s</td>
                  <td class="py-3 px-4 text-yellow-500 font-bold">{{ result.wpm }}</td>
                  <td class="py-3 px-4" :class="{
                    'text-green-500': result.accuracy >= 95,
                    'text-yellow-500': result.accuracy >= 85 && result.accuracy < 95,
                    'text-red-500': result.accuracy < 85
                  }">{{ result.accuracy }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <footer class="mt-auto py-4 text-center text-sm text-gray-700">
      <p>
        Created by
        <a href="https://github.com/rickmff" target="_blank" rel="noopener noreferrer"
          class="text-yellow-500 hover:text-yellow-400 transition-colors duration-300">
          Rickmff
        </a>
      </p>
    </footer>
  </div>
</template>
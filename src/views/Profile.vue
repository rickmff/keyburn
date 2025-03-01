<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser, UserButton } from '@clerk/vue'
import { useTheme } from '@/composables/useTheme'
import { getUserTestResults, type TestResult } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

const { user, isLoaded } = useUser()
const { themeClasses } = useTheme()
const testResults = ref<TestResult[]>([])
const isLoading = ref(true)

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
        <div class="flex items-center gap-4">
          <UserButton />
        </div>
      </header>

      <div class="px-5">
        <div class="bg-black p-6 rounded-lg border border-gray-500 mb-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 class="text-2xl font-bold text-yellow-500 mb-2">Your Profile</h1>
              <p class="text-gray-400" v-if="user">{{ user.fullName || user.username || user.primaryEmailAddress?.emailAddress }}</p>
            </div>
            <div>
              <router-link 
                to="/" 
                class="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full transition-colors duration-300 inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                Take a New Test
              </router-link>
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
            <router-link 
              to="/" 
              class="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full transition-colors duration-300 inline-flex items-center gap-2"
            >
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
                <tr 
                  v-for="result in testResults" 
                  :key="result.id" 
                  class="border-b border-gray-700 hover:bg-gray-800 transition-colors"
                >
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
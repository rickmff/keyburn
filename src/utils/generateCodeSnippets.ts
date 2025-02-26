interface CodeSnippet {
  title: string;
  code: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

const codeSnippets: CodeSnippet[] = [
  {
    title: 'Two Sum',
    code: 
`function twoSum(nums, target) {
const map = new Map()
for (let i = 0; i < nums.length; i++) {
const complement = target - nums[i]
if (map.has(complement)) {
return [map.get(complement), i]
}
map.set(nums[i], i)
}
return []
}`.replace(/\n/g, '\n'),
    complexity: 'simple'
  },
  {
    title: 'Fibonacci',
    code:
`function fibonacci(n) {
if (n <= 1) {
return n
}
let prev = 0
let current = 1
for (let i = 2; i <= n; i++) {
const next = prev + current
prev = current
current = next
}
return current
}`.replace(/\n/g, '\n'),
    complexity: 'simple'
  },
  {
    title: 'Quick Sort',
    code:
`function quickSort(arr) {
if (arr.length <= 1) {
return arr
}
const pivot = arr[Math.floor(arr.length / 2)]
const left = arr.filter(x => x < pivot)
const middle = arr.filter(x => x === pivot)
const right = arr.filter(x => x > pivot)
return [...quickSort(left), ...middle, ...quickSort(right)]
}`.replace(/\n/g, '\n'),
    complexity: 'moderate'
  },
  {
    title: 'Binary Tree Node',
    code:
`class TreeNode {
constructor(val) {
this.val = val
this.left = null
this.right = null
}
insert(val) {
if (val < this.val) {
if (this.left === null) {
this.left = new TreeNode(val)
} else {
this.left.insert(val)
}
} else {
if (this.right === null) {
this.right = new TreeNode(val)
} else {
this.right.insert(val)
}
}
}
}`.replace(/\n/g, '\n'),
    complexity: 'complex'
  },
  {
    title: 'Promise Chain',
    code:
`async function fetchUserData(userId) {
try {
const user = await fetch(\`/api/users/\${userId}\`)
const userData = await user.json()
const posts = await fetch(\`/api/posts?userId=\${userId}\`)
const userPosts = await posts.json()
return {
user: userData,
posts: userPosts
}
} catch (error) {
console.error('Error fetching user data:', error)
throw error
}
}`.replace(/\n/g, '\n'),
    complexity: 'complex'
  },
  {
    title: 'Simple Function',
    code: 
`function greet(name) {
return "Hello, " + name + "!"
}`,
    complexity: 'simple'
  },
  {
    title: 'Array Methods',
    code: 
`const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
const sum = numbers.reduce((a, b) => a + b, 0)`,
    complexity: 'moderate'
  },
  {
    title: 'Class Definition',
    code: 
`class Rectangle {
constructor(width, height) {
this.width = width
this.height = height
}
get area() {
return this.width * this.height
}
set dimensions([width, height]) {
this.width = width
this.height = height
}
}`,
    complexity: 'complex'
  },
  {
    title: 'Merge Sort',
    code:
`function mergeSort(arr) {
if (arr.length <= 1) return arr
const mid = Math.floor(arr.length / 2)
const left = arr.slice(0, mid)
const right = arr.slice(mid)
return merge(
mergeSort(left),
mergeSort(right)
)
}

function merge(left, right) {
const result = []
let i = 0, j = 0
while (i < left.length && j < right.length) {
if (left[i] <= right[j]) {
result.push(left[i++])
} else {
result.push(right[j++])
}
}
return [...result, ...left.slice(i), ...right.slice(j)]
}`.replace(/\n/g, '\n'),
    complexity: 'complex'
  },
  {
    title: 'Debounce Function',
    code:
`function debounce(func, wait) {
let timeout
return function executedFunction(...args) {
const later = () => {
clearTimeout(timeout)
func(...args)
}
clearTimeout(timeout)
timeout = setTimeout(later, wait)
}
}

const debouncedSearch = debounce((query) => {
fetchSearchResults(query)
}, 300)`.replace(/\n/g, '\n'),
    complexity: 'moderate'
  },
  {
    title: 'Stack Implementation',
    code:
`class Stack {
constructor() {
this.items = []
}

push(element) {
this.items.push(element)
}

pop() {
if (this.isEmpty()) return null
return this.items.pop()
}

peek() {
if (this.isEmpty()) return null
return this.items[this.items.length - 1]
}

isEmpty() {
return this.items.length === 0
}

size() {
return this.items.length
}
}`.replace(/\n/g, '\n'),
    complexity: 'moderate'
  },
  {
    title: 'Binary Search',
    code:
`function binarySearch(arr, target) {
let left = 0
let right = arr.length - 1

while (left <= right) {
const mid = Math.floor((left + right) / 2)
if (arr[mid] === target) {
return mid
}
if (arr[mid] < target) {
left = mid + 1
} else {
right = mid - 1
}
}
return -1
}`.replace(/\n/g, '\n'),
    complexity: 'moderate'
  },
  {
    title: 'Event Emitter',
    code:
`class EventEmitter {
constructor() {
this.events = {}
}

on(event, callback) {
if (!this.events[event]) {
this.events[event] = []
}
this.events[event].push(callback)
return () => this.off(event, callback)
}

off(event, callback) {
if (!this.events[event]) return
this.events[event] = this.events[event]
.filter(cb => cb !== callback)
}

emit(event, data) {
if (!this.events[event]) return
this.events[event].forEach(cb => cb(data))
}
}`.replace(/\n/g, '\n'),
    complexity: 'complex'
  },
  {
    title: 'Memoization',
    code:
`function memoize(fn) {
const cache = new Map()
return function (...args) {
const key = JSON.stringify(args)
if (cache.has(key)) {
return cache.get(key)
}
const result = fn.apply(this, args)
cache.set(key, result)
return result
}
}

const memoizedFib = memoize(function(n) {
if (n <= 1) return n
return memoizedFib(n - 1) + memoizedFib(n - 2)
})`.replace(/\n/g, '\n'),
    complexity: 'complex'
  },
  {
    title: 'Async Queue',
    code:
`class AsyncQueue {
constructor() {
this.queue = []
this.processing = false
}

async add(task) {
return new Promise((resolve, reject) => {
this.queue.push({ task, resolve, reject })
this.process()
})
}

async process() {
if (this.processing) return
this.processing = true

while (this.queue.length > 0) {
const { task, resolve, reject } = this.queue.shift()
try {
const result = await task()
resolve(result)
} catch (error) {
reject(error)
}
}

this.processing = false
}
}`.replace(/\n/g, '\n'),
    complexity: 'complex'
  },
  {
    title: 'LRU Cache',
    code:
`class LRUCache {
constructor(capacity) {
this.capacity = capacity
this.cache = new Map()
}

get(key) {
if (!this.cache.has(key)) return -1
const value = this.cache.get(key)
this.cache.delete(key)
this.cache.set(key, value)
return value
}

put(key, value) {
if (this.cache.has(key)) {
this.cache.delete(key)
}
this.cache.set(key, value)
if (this.cache.size > this.capacity) {
const firstKey = this.cache.keys().next().value
this.cache.delete(firstKey)
}
}
}`.replace(/\n/g, '\n'),
    complexity: 'complex'
  },
  {
    title: 'Deep Clone',
    code:
`function deepClone(obj) {
if (obj === null || typeof obj !== 'object') {
return obj
}

if (Array.isArray(obj)) {
return obj.map(item => deepClone(item))
}

const cloned = {}
for (const key in obj) {
if (obj.hasOwnProperty(key)) {
cloned[key] = deepClone(obj[key])
}
}
return cloned
}`.replace(/\n/g, '\n'),
    complexity: 'moderate'
  },
  {
    title: 'Throttle Function',
    code:
`function throttle(func, limit) {
let inThrottle
return function(...args) {
if (!inThrottle) {
func.apply(this, args)
inThrottle = true
setTimeout(() => {
inThrottle = false
}, limit)
}
}
}

const throttledScroll = throttle(() => {
console.log('Scroll event')
}, 1000)`.replace(/\n/g, '\n'),
    complexity: 'moderate'
  }
];

function getRandomCodeSnippet(complexity: 'simple' | 'moderate' | 'complex' = 'moderate'): CodeSnippet {
  const filteredSnippets = codeSnippets.filter(snippet => snippet.complexity === complexity);
  return filteredSnippets[Math.floor(Math.random() * filteredSnippets.length)];
}

export type { CodeSnippet };
export {
  codeSnippets,
  getRandomCodeSnippet
}; 
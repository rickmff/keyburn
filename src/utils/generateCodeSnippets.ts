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
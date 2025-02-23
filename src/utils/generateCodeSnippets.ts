interface CodeSnippet {
  title: string;
  code: string;
}

const codeSnippets: CodeSnippet[] = [
  {
    title: 'Two Sum',
    code: 
`function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  
  return [];
}`.replace(/\n/g, '\n')
  },
  {
    title: 'Fibonacci',
    code:
`function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  
  let prev = 0;
  let current = 1;
  
  for (let i = 2; i <= n; i++) {
    const next = prev + current;
    prev = current;
    current = next;
  }
  
  return current;
}`.replace(/\n/g, '\n')
  },
  {
    title: 'Quick Sort',
    code:
`function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}`.replace(/\n/g, '\n')
  },
  {
    title: 'Binary Tree Node',
    code:
`class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
  
  insert(val) {
    if (val < this.val) {
      if (this.left === null) {
        this.left = new TreeNode(val);
      } else {
        this.left.insert(val);
      }
    } else {
      if (this.right === null) {
        this.right = new TreeNode(val);
      } else {
        this.right.insert(val);
      }
    }
  }
}`.replace(/\n/g, '\n')
  },
  {
    title: 'Promise Chain',
    code:
`async function fetchUserData(userId) {
  try {
    const user = await fetch(\`/api/users/\${userId}\`);
    const userData = await user.json();
    
    const posts = await fetch(\`/api/posts?userId=\${userId}\`);
    const userPosts = await posts.json();
    
    return {
      user: userData,
      posts: userPosts
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}`.replace(/\n/g, '\n')
  }
];

function getRandomCodeSnippet(): CodeSnippet {
  const randomIndex = Math.floor(Math.random() * codeSnippets.length);
  return codeSnippets[randomIndex];
}

export type { CodeSnippet };
export {
  codeSnippets,
  getRandomCodeSnippet
}; 
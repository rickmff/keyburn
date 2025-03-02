interface CodeSnippet {
  title: string;
  code: string;
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
}`.replace(/\n/g, '\n')
  },
];

function getRandomCodeSnippet(): CodeSnippet {
  return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
}

export type { CodeSnippet };
export {
  codeSnippets,
  getRandomCodeSnippet
}; 
import { generateText } from '@/lib/itzam'

interface CodeSnippet {
  title: string;
  code: string;
}

async function getRandomCodeSnippet(input: string): Promise<CodeSnippet> {
  try {
    const response = await generateText(
      input,
      'keyburn'
    )
    const snippet = {
      title: input,
      code: String(response) || 'console.log("Hello World!");'
    }
    return snippet
  } catch (error) {
    console.error('Error generating code snippet:', error)
    return {
      title: 'Fallback Challenge',
      code: 'console.log("Hello World!");'
    }
  }
}

export type { CodeSnippet };
export {
  getRandomCodeSnippet
};
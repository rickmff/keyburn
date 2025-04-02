import Itzam from "itzam";

const itzamClient = new Itzam(import.meta.env.VITE_ITZAM_API_KEY);

export async function generateText(input: string, workflowSlug: string) {
  try {
    const response = await itzamClient.generateText({
      input,
      workflowSlug
    });
    return response.data.output;
  } catch (error) {
    console.error('Itzam API error:', error);
    throw error;
  }
}
// @ts-ignore
import en from '@/default_prompts/prompts_en.csv';

export type Prompt = {
  title: string;
  prompt: string;
}

export const allPrompts: Record<string, Prompt[]> = {
  en,
};

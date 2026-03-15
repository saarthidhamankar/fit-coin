'use server';
/**
 * @fileOverview A Genkit flow for generating personalized motivational messages, workout suggestions, and occasional rewards.
 *
 * - generateMotivation - A function that handles the motivation generation process.
 * - GenerateMotivationInput - The input type for the generateMotivation function.
 * - GenerateMotivationOutput - The return type for the generateMotivation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WorkoutEntrySchema = z.object({
  date: z.string().describe('The date of the workout in YYYY-MM-DD format.'),
  type: z.string().describe('The type of workout (e.g., "Cardio", "Strength", "Yoga").'),
  durationMinutes: z.number().describe('The duration of the workout in minutes.'),
  tokensEarned: z.number().describe('The number of FIT tokens earned for this workout.'),
});

const GenerateMotivationInputSchema = z.object({
  workoutHistory: z.array(WorkoutEntrySchema).describe('A list of recent workout entries for the user.').optional(),
  achievements: z.array(z.string()).describe('A list of achievements unlocked by the user (e.g., "7 day streak bonus", "First workout ever").').optional(),
  currentStreak: z.number().describe('The user\'s current workout streak in days.').optional(),
  totalWorkouts: z.number().describe('The total number of workouts logged by the user.').optional(),
  totalTokensEarned: z.number().describe('The total FIT tokens earned by the user.').optional(),
});
export type GenerateMotivationInput = z.infer<typeof GenerateMotivationInputSchema>;

const GenerateMotivationOutputSchema = z.object({
  motivationalMessage: z.string().describe('A personalized motivational message for the user.'),
  workoutSuggestions: z.array(z.string()).describe('A list of personalized workout suggestions based on their history and goals.'),
  promoCode: z.string().describe('An optional promo code (e.g., FIT2025, STREAK7) if the user reached a milestone.').optional(),
});
export type GenerateMotivationOutput = z.infer<typeof GenerateMotivationOutputSchema>;

export async function generateMotivation(input: GenerateMotivationInput): Promise<GenerateMotivationOutput> {
  return generateMotivationFlow(input);
}

const motivationPrompt = ai.definePrompt({
  name: 'generateMotivationPrompt',
  input: { schema: GenerateMotivationInputSchema },
  output: { schema: GenerateMotivationOutputSchema },
  prompt: `You are an encouraging and knowledgeable fitness coach for FitCoin, a decentralized gym reward platform. Your goal is to inspire users to stay engaged and achieve their fitness goals.

Analyze the user's workout history and achievements provided below. Then, generate a personalized motivational message and provide 2-3 specific workout suggestions. 

If the user has a streak of 3 or more days, or has completed more than 5 workouts total, provide a "Promo Code" as a reward for their dedication.

Consider the following information:

{{#if workoutHistory}}Recent Workout History:
{{#each workoutHistory}}
- Date: {{{date}}}, Type: {{{type}}}, Duration: {{{durationMinutes}}} minutes, Tokens Earned: {{{tokensEarned}}}
{{/each}}
{{else}}No recent workout history provided.
{{/if}}

{{#if achievements}}Unlocked Achievements:
{{#each achievements}}
- {{{this}}}
{{/each}}
{{else}}No achievements provided.
{{/if}}

{{#if currentStreak}}Current Workout Streak: {{{currentStreak}}} days
{{/if}}
{{#if totalWorkouts}}Total Workouts Logged: {{{totalWorkouts}}}
{{/if}}
{{#if totalTokensEarned}}Total FIT Tokens Earned: {{{totalTokensEarned}}}
{{/if}}

Now, generate a personalized motivational message, specific workout suggestions, and an optional promo code if they deserve it.`,
});

const generateMotivationFlow = ai.defineFlow(
  {
    name: 'generateMotivationFlow',
    inputSchema: GenerateMotivationInputSchema,
    outputSchema: GenerateMotivationOutputSchema,
  },
  async (input) => {
    const { output } = await motivationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate motivational message and workout suggestions.');
    }
    return output;
  }
);

'use server';
/**
 * @fileOverview A Genkit flow for generating personalized motivational messages and workout suggestions.
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

Now, generate a personalized motivational message and specific workout suggestions.

Motivational Message:
Workout Suggestions:`,
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

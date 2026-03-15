export type WorkoutType = 'Gym/Strength' | 'Cardio' | 'Yoga' | 'HIIT' | 'Swimming' | 'Cycling' | 'Strength';

export const REWARD_RULES = {
  DURATION: [
    { min: 90, reward: 25 },
    { min: 60, reward: 15 },
    { min: 30, reward: 8 },
    { min: 15, reward: 4 }
  ],
  BONUSES: {
    SEVEN_DAY_STREAK: 50,
    THIRTY_DAY_CHALLENGE: 250,
    EARLY_BIRD: 10,
    WEEKEND: 5,
    FIRST_WORKOUT: 20
  },
  PENALTIES: {
    STREAK_BREAK: 20 // Deducted if more than 48h since last workout
  }
};

export const WEEKLY_PLANS = {
  MuscleGain: {
    Mon: "Chest & Triceps: Bench Press, Incline DB Press, Cable Flys, Skull Crushers",
    Tue: "Back & Biceps: Pull-ups, Rows, Deadlifts, Hammer Curls",
    Wed: "Active Recovery: Low-intensity cardio or mobility work",
    Thu: "Shoulders & Abs: Military Press, Lateral Raises, Planks, Leg Raises",
    Fri: "Legs: Squats, Leg Press, Extensions, Calf Raises",
    Sat: "Full Body Hypertrophy: Compound movements focus",
    Sun: "Rest & Nutrients: High protein intake and rest"
  },
  FatLoss: {
    Mon: "HIIT Session: 30m intervals + Core finisher",
    Tue: "Strength Circuit: High reps, low rest (Whole Body)",
    Wed: "Steady State Cardio: 45m brisk walk or light cycle",
    Thu: "HIIT + Functional: Kettlebell swings, burpees, mountain climbers",
    Fri: "Metabolic Conditioning: EMOM 20m + Stretching",
    Sat: "Outdoor Adventure: Hiking, Swimming or Long Cycle",
    Sun: "Mobility & Prep: Foam rolling and meal prep"
  }
};

export const calculateWorkoutReward = (duration: number, date: Date, stats: { totalWorkouts: number, currentStreak: number }) => {
  let reward = 0;
  let breakdowns: string[] = [];

  const durRule = REWARD_RULES.DURATION.find(r => duration >= r.min);
  if (durRule) {
    reward += durRule.reward;
    breakdowns.push(`${durRule.reward} FIT: Base Grind`);
  }

  if (date.getHours() < 8) {
    reward += REWARD_RULES.BONUSES.EARLY_BIRD;
    breakdowns.push(`+${REWARD_RULES.BONUSES.EARLY_BIRD} FIT: Early Bird`);
  }

  const day = date.getDay();
  if (day === 0 || day === 6) {
    reward += REWARD_RULES.BONUSES.WEEKEND;
    breakdowns.push(`+${REWARD_RULES.BONUSES.WEEKEND} FIT: Weekend Warrior`);
  }

  if (stats.totalWorkouts === 0) {
    reward += REWARD_RULES.BONUSES.FIRST_WORKOUT;
    breakdowns.push(`+${REWARD_RULES.BONUSES.FIRST_WORKOUT} FIT: Genesis Bonus`);
  }

  if (stats.currentStreak > 0 && (stats.currentStreak + 1) % 7 === 0) {
    reward += REWARD_RULES.BONUSES.SEVEN_DAY_STREAK;
    breakdowns.push(`+${REWARD_RULES.BONUSES.SEVEN_DAY_STREAK} FIT: 7-Day Fire`);
  }

  return { reward, breakdowns };
};

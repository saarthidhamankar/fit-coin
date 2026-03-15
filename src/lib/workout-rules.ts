export type WorkoutType = 'Gym/Strength' | 'Cardio' | 'Yoga' | 'HIIT' | 'Swimming' | 'Cycling' | 'Strength';

export const REWARD_RULES = {
  DURATION: [
    { min: 90, reward: 25 },
    { min: 60, reward: 15 },
    { min: 30, reward: 8 },
    { min: 15, reward: 4 },
    { min: 1, reward: 1 } // Entry level reward for instant feedback
  ],
  BONUSES: {
    SEVEN_DAY_STREAK: 50,
    THIRTY_DAY_CHALLENGE: 250,
    EARLY_BIRD: 10,
    WEEKEND: 5,
    FIRST_WORKOUT: 20
  },
  PENALTIES: {
    STREAK_BREAK: 20
  }
};

export const WEEKLY_PLANS = {
  MuscleGain: {
    Mon: "Chest & Triceps: Bench Press (4x10), Incline DB Press (3x12), Cable Flys (3x15), Skull Crushers (3x12)",
    Tue: "Back & Biceps: Pull-ups (4xMax), Barbell Rows (4x10), Deadlifts (3x8), Hammer Curls (3x12)",
    Wed: "Active Recovery: Low-intensity 20m walk + 15m full body mobility/stretching",
    Thu: "Shoulders & Abs: Military Press (4x10), Lateral Raises (3x15), Planks (3x1m), Leg Raises (3x20)",
    Fri: "Legs: Barbell Squats (4x10), Leg Press (3x12), Leg Extensions (3x15), Calf Raises (4x20)",
    Sat: "Full Body Hypertrophy: Clean & Press (3x10), Weighted Dips (3x12), Face Pulls (3x15)",
    Sun: "Rest & Nutrients: High protein intake (2g/kg), 8h+ sleep, and meal prep for Week X"
  },
  FatLoss: {
    Mon: "HIIT Session: 30m intervals (Sprints/Burpees) + 10m Core (Crunches/Bicycle)",
    Tue: "Strength Circuit: Whole Body DB Circuit (4 rounds, 15 reps per exercise, 60s rest)",
    Wed: "Steady State Cardio: 45m brisk walk at incline or light cycle at 65% Max HR",
    Thu: "HIIT + Functional: Kettlebell swings (4x20), Box jumps (4x12), Mountain climbers (4x30s)",
    Fri: "Metabolic Conditioning: EMOM 20m (Pushups, Squats, Situps, Lunges) + 10m Yoga",
    Sat: "Outdoor Adventure: 60m Hiking, Swimming or Long distance Cycling in nature",
    Sun: "Mobility & Prep: 30m Foam rolling + Micronutrient focus (Green veggies & 4L H2O)"
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

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
    Sun: "Active Rest: Focused on high-protein synthesis and 20 min light walking.",
    Mon: "Upper Body Power: Bench Press (4x10), Rows (4x10), Overhead Press (3x12).",
    Tue: "Lower Body Foundation: Squats (4x10), Lunges (3x12), Calf Raises (4x20).",
    Wed: "Recovery & Core: Planks (3x1min), Leg Raises (3x20), 15 min deep stretching.",
    Thu: "Back & Biceps Focus: Pull-ups (4xMax), Barbell Curls (3x12), Lat Pulldowns (3x12).",
    Fri: "Chest & Triceps Focus: Incline Press (3x12), Dips (3xMax), Cable Flys (3x15).",
    Sat: "Full Body Hypertrophy: Clean and Press (3x10), Deadlifts (3x8), Face Pulls (3x15)."
  },
  FatLoss: {
    Sun: "Hydration Focus: 4L water baseline + 30 min foam rolling and recovery.",
    Mon: "HIIT Cardio: 30 min interval sprints + mountain climbers (4x30s).",
    Tue: "Metabolic Circuit: DB Snatches, Burpees, and Goblet Squats (4 rounds).",
    Wed: "Low Intensity Cardio: 45 min brisk walk or light cycling (65% Max HR).",
    Thu: "Functional Agility: Box jumps (3x12), Kettlebell swings (4x20), Skaters (3x20).",
    Fri: "Core Ignition: Bicycle crunches, Russian twists, and Hollow holds (4 circuits).",
    Sat: "Outdoor Endurance: 60 min hiking, swimming, or long-distance cycling."
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

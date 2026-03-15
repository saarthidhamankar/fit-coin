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

  if (stats.totalWorkouts > 0 && (stats.totalWorkouts + 1) % 30 === 0) {
    reward += REWARD_RULES.BONUSES.THIRTY_DAY_CHALLENGE;
    breakdowns.push(`+${REWARD_RULES.BONUSES.THIRTY_DAY_CHALLENGE} FIT: Monthly King`);
  }

  return { reward, breakdowns };
};

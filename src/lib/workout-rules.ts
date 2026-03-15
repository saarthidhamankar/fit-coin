
export type WorkoutType = 'Cardio' | 'Strength' | 'Yoga' | 'HIIT' | 'Swimming' | 'Cycling';

export const REWARD_RULES = {
  DURATION: [
    { min: 90, reward: 15 },
    { min: 60, reward: 10 },
    { min: 30, reward: 5 },
    { min: 15, reward: 2 }
  ],
  BONUSES: {
    SEVEN_DAY_STREAK: 20,
    THIRTY_DAY_CHALLENGE: 100,
    EARLY_BIRD: 5, // Before 8am
    WEEKEND: 3,
    FIRST_WORKOUT: 10
  }
};

export const calculateWorkoutReward = (duration: number, date: Date, stats: { totalWorkouts: number, currentStreak: number }) => {
  let reward = 0;
  let breakdowns: string[] = [];

  // Base duration reward
  const durRule = REWARD_RULES.DURATION.find(r => duration >= r.min);
  if (durRule) {
    reward += durRule.reward;
    breakdowns.push(`${durRule.reward} FIT for ${duration} mins`);
  }

  // Early bird
  if (date.getHours() < 8) {
    reward += REWARD_RULES.BONUSES.EARLY_BIRD;
    breakdowns.push(`+${REWARD_RULES.BONUSES.EARLY_BIRD} Early Bird`);
  }

  // Weekend
  const day = date.getDay();
  if (day === 0 || day === 6) {
    reward += REWARD_RULES.BONUSES.WEEKEND;
    breakdowns.push(`+${REWARD_RULES.BONUSES.WEEKEND} Weekend Bonus`);
  }

  // Welcome bonus
  if (stats.totalWorkouts === 0) {
    reward += REWARD_RULES.BONUSES.FIRST_WORKOUT;
    breakdowns.push(`+${REWARD_RULES.BONUSES.FIRST_WORKOUT} Welcome Bonus`);
  }

  // 7-Day Streak bonus
  if (stats.currentStreak > 0 && (stats.currentStreak + 1) % 7 === 0) {
    reward += REWARD_RULES.BONUSES.SEVEN_DAY_STREAK;
    breakdowns.push(`+${REWARD_RULES.BONUSES.SEVEN_DAY_STREAK} 7-Day Streak!`);
  }

  // 30-Day Challenge bonus
  if (stats.totalWorkouts > 0 && (stats.totalWorkouts + 1) % 30 === 0) {
    reward += REWARD_RULES.BONUSES.THIRTY_DAY_CHALLENGE;
    breakdowns.push(`+${REWARD_RULES.BONUSES.THIRTY_DAY_CHALLENGE} 30-Day Challenge!`);
  }

  return { reward, breakdowns };
};

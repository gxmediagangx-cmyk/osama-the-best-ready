export type WeightUnit = 'kg' | 'lbs';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  previousWeight?: number;
  previousReps?: number;
  rpe?: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'other';
  targetSets: number;
  targetReps: number;
  defaultWeight: number;
  notes?: string;
  sets: ExerciseSet[];
  // Custom overload overrides if set (defaults to global settings)
  customRepCeiling?: number;
  customRepStep?: number;
  customWeightStep?: number;
}

export interface WorkoutDay {
  id: string;
  title: string; // e.g. "Day 1: Chest & Triceps"
  description?: string;
  order: number;
  exercises: Exercise[];
}

export interface WorkoutSystem {
  id: string;
  name: string; // e.g. "Osama's Aesthetic Hypertrophy Split"
  description: string;
  isCurrent: boolean;
  createdAt: string;
  days: WorkoutDay[];
}

export interface CompletedSessionLog {
  id: string;
  systemId: string;
  systemName: string;
  dayId: string;
  dayTitle: string;
  completedAt: string;
  durationMinutes: number;
  totalVolume: number; // total kg or lbs lifted
  totalSetsCompleted: number;
  totalRepsCompleted: number;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    category: string;
    sets: {
      setNumber: number;
      weight: number;
      reps: number;
      completed: boolean;
    }[];
  }[];
  userNotes?: string;
  overloadNotes?: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string; // e.g. "150g" or "1 cup"
  protein: number; // in grams
  carbs: number;   // in grams
  fats: number;    // in grams
  calories: number;
  consumed: boolean;
  icon?: 'egg' | 'bowl' | 'chicken' | 'meat' | 'fish' | 'fruit' | 'shake' | 'bread' | 'salad';
}

export interface Meal {
  id: string;
  name: string; // e.g. "Breakfast", "Pre-Workout Snack", "Post-Workout Lunch"
  scheduledTime: string; // e.g. "08:30"
  order: number;
  foods: FoodItem[];
  notes?: string;
}

export interface SupplementItem {
  id: string;
  name: string;
  taken: boolean;
}

export interface MealSystem {
  id: string;
  name: string; // e.g. "Lean Aesthetic Bulk (2,500 kcal)"
  description: string;
  isCurrent: boolean;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  meals: Meal[];
  waterCount?: number;
  waterTarget?: number;
  supplements?: SupplementItem[];
}

export interface WalkingSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "07:30 AM"
  label: string; // e.g. "Morning Fasted Walk", "Post-Lunch Walk"
  durationMinutes: number;
  steps: number;
  distanceKm: number;
  notes?: string;
}

export type AppThemeId =
  | 'gold'
  | 'crimson'
  | 'emerald'
  | 'cobalt'
  | 'violet'
  | 'orange'
  | 'teal'
  | 'rose'
  | 'silver'
  | 'lime';

export interface AppSettings {
  userName: string;
  weightUnit: WeightUnit;
  themeId?: AppThemeId;
  // Smart Progressive Overload rule settings:
  overloadRepStep: number;     // e.g. +2 reps per click
  overloadRepCeiling: number;  // e.g. 12 reps, after which weight increases
  overloadRepFloor: number;    // e.g. 8 reps, reset to this when weight jumps
  overloadWeightStep: number;  // e.g. +2.5 kg or lbs
  // Rest timer settings:
  restTimerEnabled: boolean;   // master switch to enable/disable the rest timer completely
  defaultRestSeconds: number;  // fallback
  restBetweenSetsSeconds: number; // rest between sets (e.g. 90s)
  restBetweenExercisesSeconds: number; // rest between exercises (e.g. 150s)
  autoStartRestOnCheck: boolean; // starts rest timer when a set is checked
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  // Daily targets:
  dailyStepGoal: number;
  dailyWaterGoalMl: number;
}

export type BoxingMode = 'solo' | 'partner';

export type BoxingDrillCategory =
  | 'warmup'
  | 'shadowboxing'
  | 'bagwork'
  | 'padwork'
  | 'partner-drill'
  | 'sparring'
  | 'footwork'
  | 'conditioning';

export interface BoxingRound {
  id: string;
  roundNumber: number;
  durationSeconds: number; // e.g. 180 (3 mins) or 120 (2 mins)
  restSeconds: number;     // e.g. 60 (1 min)
  completed: boolean;
  focusCombo?: string;     // optional specific combo or focus for this round
}

export interface BoxingDrill {
  id: string;
  name: string;
  category: BoxingDrillCategory;
  mode: BoxingMode; // whether this drill requires a partner or is solo
  roundDurationSeconds: number; // default 180s (3:00)
  restSeconds: number;          // default 60s (1:00)
  intensity: 'technical' | 'fast' | 'power' | 'conditioning';
  comboOrCues?: string; // e.g. "1-2-Slip-2-3-2 | Focus on head movement after last punch"
  partnerAlternativeName?: string; // Quick swap if partner joins/leaves
  partnerAlternativeCues?: string;
  notes?: string;
  rounds: BoxingRound[];
}

export interface BoxingWorkout {
  id: string;
  name: string;
  description: string;
  mode: BoxingMode; // 'solo' (No Partner) or 'partner' (With Partner)
  defaultRoundSeconds: number;
  defaultRestSeconds: number;
  drills: BoxingDrill[];
}

export interface CompletedBoxingLog {
  id: string;
  workoutId: string;
  workoutName: string;
  mode: BoxingMode;
  partnerName?: string;
  completedAt: string;
  durationMinutes: number;
  totalRoundsCompleted: number;
  totalDrillsCompleted: number;
  drills: {
    drillId: string;
    drillName: string;
    category: BoxingDrillCategory;
    mode: BoxingMode;
    roundsCompleted: number;
    totalRounds: number;
    roundDurationSeconds: number;
    comboOrCues?: string;
  }[];
  userNotes?: string;
}

export interface CompletedNutritionLog {
  id: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO timestamp
  systemId: string;
  systemName: string;
  mealsCompletedCount: number;
  totalMealsCount: number;
  meals: {
    mealId: string;
    mealName: string;
    scheduledTime: string;
    completed: boolean;
    foods: {
      foodId: string;
      name: string;
      portion: string;
      consumed: boolean;
    }[];
  }[];
  waterGlasses: number;
  waterTarget: number;
  supplements: {
    name: string;
    taken: boolean;
  }[];
  userNotes?: string;
}


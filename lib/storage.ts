import { get, set } from 'idb-keyval';
import {
  AppSettings,
  BoxingWorkout,
  CompletedBoxingLog,
  CompletedNutritionLog,
  CompletedSessionLog,
  MealSystem,
  WalkingSession,
  WorkoutSystem,
} from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Osama',
  weightUnit: 'kg',
  themeId: 'gold',
  overloadRepStep: 2,
  overloadRepCeiling: 12,
  overloadRepFloor: 8,
  overloadWeightStep: 2.5,
  restTimerEnabled: true,
  defaultRestSeconds: 90,
  restBetweenSetsSeconds: 90,
  restBetweenExercisesSeconds: 150,
  autoStartRestOnCheck: true,
  soundEnabled: true,
  vibrateEnabled: true,
  dailyStepGoal: 10000,
  dailyWaterGoalMl: 3000,
};

export const DEFAULT_WORKOUT_SYSTEMS: WorkoutSystem[] = [
  {
    id: 'system-aesthetic-4day',
    name: "Osama's Aesthetic Hypertrophy Split",
    description: '4-day focused split designed for lean athletic muscle, broad shoulders, and defined arms.',
    isCurrent: true,
    createdAt: '2026-10-01',
    days: [
      {
        id: 'day-push',
        title: 'Day 1: Chest & Back Session',
        description: 'Upper, Mid & Inner Chest + Lat Width, Mid-Back & Upper Back/Rhomboids',
        order: 1,
        exercises: [
          {
            id: 'ex-incline-db-press',
            name: 'Incline Dumbbell Press',
            category: 'chest',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 24,
            notes: 'Target: Upper Chest • Grip: Neutral to 45-degree pronated grip (palms facing slightly inward/forward)',
            sets: [
              { id: 'set-idp-1', setNumber: 1, weight: 24, reps: 10, completed: false },
              { id: 'set-idp-2', setNumber: 2, weight: 24, reps: 10, completed: false },
              { id: 'set-idp-3', setNumber: 3, weight: 24, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-flat-bench-press',
            name: 'Flat Bench Press',
            category: 'chest',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 60,
            notes: 'Target: Mid Chest / Overall Mass • Grip: Pronated grip (overhand, slightly wider than shoulder-width)',
            sets: [
              { id: 'set-fbp-1', setNumber: 1, weight: 60, reps: 10, completed: false },
              { id: 'set-fbp-2', setNumber: 2, weight: 60, reps: 10, completed: false },
              { id: 'set-fbp-3', setNumber: 3, weight: 60, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-pec-deck',
            name: 'Butterfly Machine (Pec Deck)',
            category: 'chest',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 45,
            notes: 'Target: Inner Chest / Isolation • Grip: Neutral grip / forearm pads (elbows bent at 90 degrees, palms facing inward)',
            sets: [
              { id: 'set-pd-1', setNumber: 1, weight: 45, reps: 12, completed: false },
              { id: 'set-pd-2', setNumber: 2, weight: 45, reps: 12, completed: false },
              { id: 'set-pd-3', setNumber: 3, weight: 45, reps: 12, completed: false },
            ],
          },
          {
            id: 'ex-lat-pulldown-cb',
            name: 'Lat Pulldown',
            category: 'back',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 55,
            notes: 'Target: Lat Width • Grip: Medium overhand grip (standard shoulder-width or slightly wider)',
            sets: [
              { id: 'set-lpcb-1', setNumber: 1, weight: 55, reps: 10, completed: false },
              { id: 'set-lpcb-2', setNumber: 2, weight: 55, reps: 10, completed: false },
              { id: 'set-lpcb-3', setNumber: 3, weight: 55, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-seated-cable-row-close',
            name: 'Seated Cable Row (Close Grip)',
            category: 'back',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 50,
            notes: 'Target: Mid-Back Thickness • Grip: Neutral grip (palms facing each other using a close V-bar / parallel handle)',
            sets: [
              { id: 'set-scrc-1', setNumber: 1, weight: 50, reps: 10, completed: false },
              { id: 'set-scrc-2', setNumber: 2, weight: 50, reps: 10, completed: false },
              { id: 'set-scrc-3', setNumber: 3, weight: 50, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-seated-cable-row-wide',
            name: 'Seated Cable Row (Wide Grip)',
            category: 'back',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 45,
            notes: 'Target: Upper Back & Rhomboids (Lower-back safe alternative to T-bar rows) • Grip: Pronated overhand grip (using a wide bar, pulling high toward the upper chest)',
            sets: [
              { id: 'set-scrw-1', setNumber: 1, weight: 45, reps: 10, completed: false },
              { id: 'set-scrw-2', setNumber: 2, weight: 45, reps: 10, completed: false },
              { id: 'set-scrw-3', setNumber: 3, weight: 45, reps: 10, completed: false },
            ],
          },
        ],
      },
      {
        id: 'day-pull',
        title: 'Day 2: Back, Biceps & Rear Delts (Pull)',
        description: 'V-taper lat width, rhomboid thickness, and peaked bicep growth',
        order: 2,
        exercises: [
          {
            id: 'ex-lat-pulldown',
            name: 'Neutral-Grip Lat Pulldown',
            category: 'back',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 55,
            notes: 'Drive elbows down into your back pockets.',
            sets: [
              { id: 'set-lp-1', setNumber: 1, weight: 55, reps: 10, completed: false },
              { id: 'set-lp-2', setNumber: 2, weight: 55, reps: 10, completed: false },
              { id: 'set-lp-3', setNumber: 3, weight: 55, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-chest-supported-row',
            name: 'Chest-Supported Dumbbell Row',
            category: 'back',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 24,
            notes: 'Isolate back without lower back fatigue.',
            sets: [
              { id: 'set-csr-1', setNumber: 1, weight: 24, reps: 10, completed: false },
              { id: 'set-csr-2', setNumber: 2, weight: 24, reps: 10, completed: false },
              { id: 'set-csr-3', setNumber: 3, weight: 24, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-face-pull',
            name: 'Cable Face Pull / Rear Delt Fly',
            category: 'shoulders',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 15,
            notes: 'External rotation at finish for healthy rotator cuffs.',
            sets: [
              { id: 'set-fp-1', setNumber: 1, weight: 15, reps: 12, completed: false },
              { id: 'set-fp-2', setNumber: 2, weight: 15, reps: 12, completed: false },
              { id: 'set-fp-3', setNumber: 3, weight: 15, reps: 12, completed: false },
            ],
          },
          {
            id: 'ex-incline-curl',
            name: 'Incline Dumbbell Bicep Curl',
            category: 'arms',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 12.5,
            notes: 'Max stretch on bicep long head, supinate wrist at top.',
            sets: [
              { id: 'set-ic-1', setNumber: 1, weight: 12.5, reps: 10, completed: false },
              { id: 'set-ic-2', setNumber: 2, weight: 12.5, reps: 10, completed: false },
              { id: 'set-ic-3', setNumber: 3, weight: 12.5, reps: 10, completed: false },
            ],
          },
        ],
      },
      {
        id: 'day-legs',
        title: 'Day 3: Quads, Hamstrings & Calves (Legs)',
        description: 'Athletic foundation, quad sweep, and hamstring development',
        order: 3,
        exercises: [
          {
            id: 'ex-hack-squat',
            name: 'Hack Squat / Leg Press',
            category: 'legs',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 90,
            notes: 'Deep knee flexion, push through mid-foot.',
            sets: [
              { id: 'set-hs-1', setNumber: 1, weight: 90, reps: 10, completed: false },
              { id: 'set-hs-2', setNumber: 2, weight: 90, reps: 10, completed: false },
              { id: 'set-hs-3', setNumber: 3, weight: 90, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-rdl',
            name: 'Dumbbell Romanian Deadlift (RDL)',
            category: 'legs',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 28,
            notes: 'Hips back, feel hamstring stretch, keep spine neutral.',
            sets: [
              { id: 'set-rdl-1', setNumber: 1, weight: 28, reps: 10, completed: false },
              { id: 'set-rdl-2', setNumber: 2, weight: 28, reps: 10, completed: false },
              { id: 'set-rdl-3', setNumber: 3, weight: 28, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-leg-curl',
            name: 'Seated Leg Curl',
            category: 'legs',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 45,
            notes: 'Lean forward slightly for improved stretch.',
            sets: [
              { id: 'set-lc-1', setNumber: 1, weight: 45, reps: 12, completed: false },
              { id: 'set-lc-2', setNumber: 2, weight: 45, reps: 12, completed: false },
              { id: 'set-lc-3', setNumber: 3, weight: 45, reps: 12, completed: false },
            ],
          },
          {
            id: 'ex-calves',
            name: 'Standing Calf Raise',
            category: 'legs',
            targetSets: 4,
            targetReps: 12,
            defaultWeight: 40,
            notes: '2-second dead pause at bottom stretch, no bouncing.',
            sets: [
              { id: 'set-cr-1', setNumber: 1, weight: 40, reps: 12, completed: false },
              { id: 'set-cr-2', setNumber: 2, weight: 40, reps: 12, completed: false },
              { id: 'set-cr-3', setNumber: 3, weight: 40, reps: 12, completed: false },
              { id: 'set-cr-4', setNumber: 4, weight: 40, reps: 12, completed: false },
            ],
          },
        ],
      },
      {
        id: 'day-arms-abs',
        title: 'Day 4: Shoulders, Arms & Abs Specialization',
        description: 'Detail day to cap off shoulders and build aesthetic arms & core',
        order: 4,
        exercises: [
          {
            id: 'ex-seated-db-press',
            name: 'Seated Dumbbell Shoulder Press',
            category: 'shoulders',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 22,
            notes: 'Elbows slightly tucked forward, full range of motion.',
            sets: [
              { id: 'set-sp-1', setNumber: 1, weight: 22, reps: 10, completed: false },
              { id: 'set-sp-2', setNumber: 2, weight: 22, reps: 10, completed: false },
              { id: 'set-sp-3', setNumber: 3, weight: 22, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-hammer-curl',
            name: 'Dumbbell Hammer Curls',
            category: 'arms',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 14,
            notes: 'Targets brachialis for thicker upper arm profile.',
            sets: [
              { id: 'set-hc-1', setNumber: 1, weight: 14, reps: 10, completed: false },
              { id: 'set-hc-2', setNumber: 2, weight: 14, reps: 10, completed: false },
              { id: 'set-hc-3', setNumber: 3, weight: 14, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-dip-or-skull',
            name: 'Cable Triceps Pushdown (Straight Bar)',
            category: 'arms',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 22.5,
            notes: 'Lock elbows to ribs, squeeze triceps hard.',
            sets: [
              { id: 'set-tpb-1', setNumber: 1, weight: 22.5, reps: 12, completed: false },
              { id: 'set-tpb-2', setNumber: 2, weight: 22.5, reps: 12, completed: false },
              { id: 'set-tpb-3', setNumber: 3, weight: 22.5, reps: 12, completed: false },
            ],
          },
          {
            id: 'ex-hanging-leg-raise',
            name: 'Hanging Leg Raise / Cable Crunch',
            category: 'core',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 0,
            notes: 'Curl pelvis up towards chest, don’t just swing legs.',
            sets: [
              { id: 'set-hlr-1', setNumber: 1, weight: 0, reps: 15, completed: false },
              { id: 'set-hlr-2', setNumber: 2, weight: 0, reps: 15, completed: false },
              { id: 'set-hlr-3', setNumber: 3, weight: 0, reps: 15, completed: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'system-ppl-3day',
    name: 'Classic Push / Pull / Legs (PPL)',
    description: 'Timeless 3-day foundation split that cycles through push, pull, and leg muscles.',
    isCurrent: false,
    createdAt: '2026-10-01',
    days: [
      {
        id: 'day-ppl-push',
        title: 'Push Day (Chest, Shoulders, Triceps)',
        order: 1,
        exercises: [
          {
            id: 'ex-flat-press',
            name: 'Dumbbell Flat Bench Press',
            category: 'chest',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 28,
            sets: [
              { id: 'set-p1', setNumber: 1, weight: 28, reps: 10, completed: false },
              { id: 'set-p2', setNumber: 2, weight: 28, reps: 10, completed: false },
              { id: 'set-p3', setNumber: 3, weight: 28, reps: 10, completed: false },
            ],
          },
        ],
      },
    ],
  },
];

export const DEFAULT_MEAL_SYSTEMS: MealSystem[] = [
  {
    id: 'meal-system-clean-bulk',
    name: 'Osama Daily Whole-Food Routine',
    description: 'Clean whole-food meal schedule focused on consistent portions, hydration, and daily supplements without calorie counting.',
    isCurrent: true,
    targetCalories: 2600,
    targetProtein: 175,
    targetCarbs: 290,
    targetFats: 75,
    waterCount: 6,
    waterTarget: 8,
    supplements: [
      { id: 'sup-1', name: 'Creatine 5g', taken: true },
      { id: 'sup-2', name: 'Multivitamin', taken: false },
    ],
    meals: [
      {
        id: 'm-1',
        name: 'Meal 1: Breakfast',
        scheduledTime: '08:00 AM',
        order: 1,
        notes: 'High protein breakfast',
        foods: [
          { id: 'f-1', name: 'Eggs', portion: '4 large', icon: 'egg', protein: 24, carbs: 2, fats: 20, calories: 280, consumed: true },
          { id: 'f-2', name: 'Oatmeal', portion: '1 cup', icon: 'bowl', protein: 10, carbs: 54, fats: 5, calories: 300, consumed: true },
        ],
      },
      {
        id: 'm-2',
        name: 'Meal 2: Lunch',
        scheduledTime: '01:00 PM',
        order: 2,
        notes: 'Pre-training clean carbs & protein',
        foods: [
          { id: 'f-4', name: 'Chicken Breast', portion: '200g', icon: 'chicken', protein: 50, carbs: 0, fats: 4, calories: 250, consumed: false },
          { id: 'f-5', name: 'White Rice', portion: '1.5 cups', icon: 'bowl', protein: 6, carbs: 65, fats: 1, calories: 300, consumed: false },
        ],
      },
      {
        id: 'm-3',
        name: 'Meal 3: Pre-Workout',
        scheduledTime: '04:00 PM',
        order: 3,
        notes: 'Light fast-digesting energy before gym or boxing',
        foods: [
          { id: 'f-7', name: 'Banana & Honey', portion: '1 large + 1 tbsp', icon: 'fruit', protein: 2, carbs: 45, fats: 0, calories: 185, consumed: false },
          { id: 'f-8', name: 'Whey Isolate Shake', portion: '1 scoop', icon: 'shake', protein: 25, carbs: 2, fats: 1, calories: 120, consumed: false },
        ],
      },
      {
        id: 'm-4',
        name: 'Meal 4: Dinner',
        scheduledTime: '08:00 PM',
        order: 4,
        notes: 'Post-workout recovery meal',
        foods: [
          { id: 'f-9', name: 'Lean Steak / Salmon', portion: '200g', icon: 'meat', protein: 46, carbs: 0, fats: 14, calories: 310, consumed: false },
          { id: 'f-10', name: 'Sweet Potato & Greens', portion: '250g', icon: 'salad', protein: 4, carbs: 50, fats: 2, calories: 230, consumed: false },
        ],
      },
    ],
  },
];

export const DEFAULT_WALKING_SESSIONS: WalkingSession[] = [
  {
    id: 'walk-1',
    date: '2026-10-05',
    time: '07:45 AM',
    label: 'Morning Sunlight Walk',
    durationMinutes: 25,
    steps: 2900,
    distanceKm: 2.1,
    notes: 'A brisk outdoor walk to clear mind and wake up.',
  },
  {
    id: 'walk-2',
    date: '2026-10-05',
    time: '01:45 PM',
    label: 'Post-Lunch Digestion Stroll',
    durationMinutes: 15,
    steps: 1750,
    distanceKm: 1.2,
    notes: 'Low intensity walk after meal 2 for blood glucose control.',
  },
];

export const DEFAULT_WORKOUT_LOGS: CompletedSessionLog[] = [
  {
    id: 'log-sample-1',
    systemId: 'system-aesthetic-4day',
    systemName: "Osama's Aesthetic Hypertrophy Split",
    dayId: 'day-push',
    dayTitle: 'Day 1: Chest, Shoulders & Triceps (Push)',
    completedAt: '2026-10-03T18:30:00.000Z',
    durationMinutes: 52,
    totalVolume: 4890,
    totalSetsCompleted: 13,
    totalRepsCompleted: 134,
    exercises: [
      {
        exerciseId: 'ex-incline-db',
        exerciseName: 'Incline Dumbbell Bench Press',
        category: 'chest',
        sets: [
          { setNumber: 1, weight: 26, reps: 10, completed: true },
          { setNumber: 2, weight: 26, reps: 10, completed: true },
          { setNumber: 3, weight: 26, reps: 10, completed: true },
        ],
      },
      {
        exerciseId: 'ex-lat-raise',
        exerciseName: 'Cable Lateral Raise',
        category: 'shoulders',
        sets: [
          { setNumber: 1, weight: 7.5, reps: 12, completed: true },
          { setNumber: 2, weight: 7.5, reps: 12, completed: true },
          { setNumber: 3, weight: 7.5, reps: 12, completed: true },
          { setNumber: 4, weight: 7.5, reps: 10, completed: true },
        ],
      },
    ],
    userNotes: 'Felt great energy. Cable laterals were burning. Ready to up weights next time.',
    overloadNotes: ['Incline DB: 26kg hit 10 reps across all sets. Ready for +2.5kg!'],
  },
];

export const DEFAULT_BOXING_WORKOUTS: BoxingWorkout[] = [
  {
    id: 'boxing-solo-bag-footwork',
    name: 'Solo Heavy Bag & Sharp Footwork',
    description: 'High-output solo boxing session when training alone: rhythm jump rope, crisp shadowboxing angles, heavy bag combinations, and fight core.',
    mode: 'solo',
    defaultRoundSeconds: 180,
    defaultRestSeconds: 60,
    drills: [
      {
        id: 'bdrill-1',
        name: 'Boxer Skip & Rhythm Jump Rope',
        category: 'warmup',
        mode: 'solo',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'fast',
        comboOrCues: 'R1: Basic boxer step | R2: High knees + double-unders last 30s | R3: Direction switches & foot speed',
        partnerAlternativeName: 'Partner Mirror Footwork & Tag Warmup',
        partnerAlternativeCues: 'Keep lead foot outside partner, mirror step-ins & shoulder/knee taps without getting touched.',
        notes: 'Stay light on the balls of your feet, relax shoulders.',
        rounds: [
          { id: 'br-1-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-1-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-1-3', roundNumber: 3, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
      {
        id: 'bdrill-2',
        name: 'Shadowboxing: Jab Variations & Head Movement',
        category: 'shadowboxing',
        mode: 'solo',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'technical',
        comboOrCues: '1-1-2 → Slip Right → 2-3-2 → Pivot out left. Visualize opponent counters after every combo.',
        partnerAlternativeName: 'Partner Jab-Parry-Counter Flow',
        partnerAlternativeCues: 'Partner A throws live jabs → Partner B parries/slips & counters with light touch 1-2, switch every 90s.',
        notes: 'Snap punches back to chin immediately. Chin tucked.',
        rounds: [
          { id: 'br-2-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-2-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-2-3', roundNumber: 3, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
      {
        id: 'bdrill-3',
        name: 'Heavy Bag: Outside-to-Inside Combinations',
        category: 'bagwork',
        mode: 'solo',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'power',
        comboOrCues: '1-2-3(body)-3(head)-2 | Roll under after last cross | 10-second non-stop speed burnout at clapper',
        partnerAlternativeName: 'Focus Mitts: Power Combos & Weaves',
        partnerAlternativeCues: '1-2-3-2 → Duck partner hook → 3-2-3. Partner calls random defensive cues between combos.',
        notes: 'Turn hips over on hooks and cross. Exhale sharply on every shot.',
        rounds: [
          { id: 'br-3-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-3-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-3-3', roundNumber: 3, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-3-4', roundNumber: 4, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
      {
        id: 'bdrill-4',
        name: 'Fighter Abs & Rotational Core Circuit',
        category: 'conditioning',
        mode: 'solo',
        roundDurationSeconds: 120,
        restSeconds: 45,
        intensity: 'conditioning',
        comboOrCues: '30s Russian Twists + 30s Sit-up 1-2 Punches + 30s Leg Raises + 30s Plank',
        partnerAlternativeName: 'Medicine Ball Partner Body Conditioning',
        partnerAlternativeCues: 'Sit-up med-ball throws + light body-shot bracing rounds with partner.',
        rounds: [
          { id: 'br-4-1', roundNumber: 1, durationSeconds: 120, restSeconds: 45, completed: false },
          { id: 'br-4-2', roundNumber: 2, durationSeconds: 120, restSeconds: 45, completed: false },
          { id: 'br-4-3', roundNumber: 3, durationSeconds: 120, restSeconds: 45, completed: false },
        ],
      },
    ],
  },
  {
    id: 'boxing-partner-pads-drills',
    name: 'Partner Pads, Counter Drills & Technical Spar',
    description: 'Complete 2-person boxing session when training with a partner: mirror footwork, pad work combos, Dutch glove-to-glove drills, and controlled sparring.',
    mode: 'partner',
    defaultRoundSeconds: 180,
    defaultRestSeconds: 60,
    drills: [
      {
        id: 'bdrill-p1',
        name: 'Partner Distance Control & Mirror Footwork',
        category: 'footwork',
        mode: 'partner',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'technical',
        comboOrCues: 'Partner leads steps forward/back/lateral → Maintain exact 1-step fighting range without crossing feet.',
        partnerAlternativeName: 'Solo Cone / Line Agility Footwork',
        partnerAlternativeCues: 'In-and-out pendulum step + L-step pivots & angle cuts around center line.',
        rounds: [
          { id: 'br-p1-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p1-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
      {
        id: 'bdrill-p2',
        name: 'Pad / Mitt Work: Sharp Combos & Defense',
        category: 'padwork',
        mode: 'partner',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'fast',
        comboOrCues: '1-2-Slip-2-3-2 | Catch partner jab → return 2-3-2 | Pull-counter 2 on partner feint',
        partnerAlternativeName: 'Heavy Bag: Pull-Counter & Combo Flow',
        partnerAlternativeCues: 'Use bag swing to time pull-2-3-2 and slip-rip body combinations.',
        notes: 'Hit the center of the mitts with snap, not pushing.',
        rounds: [
          { id: 'br-p2-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p2-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p2-3', roundNumber: 3, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p2-4', roundNumber: 4, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
      {
        id: 'bdrill-p3',
        name: 'Glove-to-Glove Partner Counter Drills (Dutch Style)',
        category: 'partner-drill',
        mode: 'partner',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'technical',
        comboOrCues: 'A throws 1-2-3 to guard → B blocks & immediately fires 2-3-2 back → A rolls under & counters 3-2.',
        partnerAlternativeName: 'Double-End Bag / Reflex Defense Drill',
        partnerAlternativeCues: 'High guard tight blocks + 3-punch rapid combinations with head off-line.',
        notes: 'Keep tight high guard and eyes open when absorbing on the gloves.',
        rounds: [
          { id: 'br-p3-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p3-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p3-3', roundNumber: 3, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p3-4', roundNumber: 4, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
      {
        id: 'bdrill-p4',
        name: 'Technical / Controlled Sparring',
        category: 'sparring',
        mode: 'partner',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'technical',
        comboOrCues: 'R1: Lead hand (Jab/Lead Hook) only | R2-R3: Open technical sparring at 50% power, 100% speed & IQ',
        partnerAlternativeName: 'High-Pace Visualization Shadowboxing',
        partnerAlternativeCues: '3 rounds championship pace: feints, level changes, check hooks, and ring generalship.',
        rounds: [
          { id: 'br-p4-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p4-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p4-3', roundNumber: 3, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
    ],
  },
];

export const DEFAULT_BOXING_LOGS: CompletedBoxingLog[] = [
  {
    id: 'boxing-log-sample-1',
    workoutId: 'boxing-solo-bag-footwork',
    workoutName: 'Solo Heavy Bag & Sharp Footwork',
    mode: 'solo',
    completedAt: '2026-10-04T19:15:00.000Z',
    durationMinutes: 48,
    totalRoundsCompleted: 13,
    totalDrillsCompleted: 4,
    drills: [
      {
        drillId: 'bdrill-1',
        drillName: 'Boxer Skip & Rhythm Jump Rope',
        category: 'warmup',
        mode: 'solo',
        roundsCompleted: 3,
        totalRounds: 3,
        roundDurationSeconds: 180,
        comboOrCues: 'R1: Basic boxer step | R2: High knees + double-unders',
      },
      {
        drillId: 'bdrill-3',
        drillName: 'Heavy Bag: Outside-to-Inside Combinations',
        category: 'bagwork',
        mode: 'solo',
        roundsCompleted: 4,
        totalRounds: 4,
        roundDurationSeconds: 180,
        comboOrCues: '1-2-3(body)-3(head)-2',
      },
    ],
    userNotes: 'Trained solo today. Left hook to the body felt super crisp on the heavy bag.',
  },
];

export const DEFAULT_NUTRITION_LOGS: CompletedNutritionLog[] = [];

// In-Memory Fast Cache with IndexedDB + LocalStorage Sync
class LocalGymDatabase {
  private isBrowser = typeof window !== 'undefined';

  async loadSettings(): Promise<AppSettings> {
    if (!this.isBrowser) return DEFAULT_SETTINGS;
    try {
      const idbVal = await get<AppSettings>('osama_app_settings');
      if (idbVal) return { ...DEFAULT_SETTINGS, ...idbVal };

      const lsVal = localStorage.getItem('osama_app_settings');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Error reading settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_app_settings', JSON.stringify(settings));
      await set('osama_app_settings', settings);
    } catch (e) {
      console.warn('Error saving settings to storage', e);
    }
  }

  private normalizeWorkoutSystems(systems: WorkoutSystem[]): WorkoutSystem[] {
    return systems.map((sys) => ({
      ...sys,
      days: sys.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => {
          const baseWeight = ex.sets[0]?.weight ?? ex.defaultWeight ?? 20;
          const baseReps = ex.sets[0]?.reps ?? ex.targetReps ?? 10;
          return {
            ...ex,
            defaultWeight: baseWeight,
            targetReps: baseReps,
            sets: ex.sets.map((s) => ({
              ...s,
              weight: baseWeight,
              reps: baseReps,
            })),
          };
        }),
      })),
    }));
  }

  private normalizeBoxingWorkouts(workouts: BoxingWorkout[]): BoxingWorkout[] {
    return workouts.map((w) => ({
      ...w,
      drills: w.drills.map((d) => {
        const roundSec = d.roundDurationSeconds || d.rounds[0]?.durationSeconds || 180;
        const restSec = d.restSeconds || d.rounds[0]?.restSeconds || 60;
        return {
          ...d,
          roundDurationSeconds: roundSec,
          restSeconds: restSec,
          rounds: d.rounds.map((r) => ({
            ...r,
            durationSeconds: roundSec,
            restSeconds: restSec,
          })),
        };
      }),
    }));
  }

  private migrateDayOneIfNeeded(systems: WorkoutSystem[]): { systems: WorkoutSystem[]; migrated: boolean } {
    let migrated = false;
    const defaultDayOne = DEFAULT_WORKOUT_SYSTEMS[0].days[0];
    const updated = systems.map((sys) => {
      if (sys.id !== 'system-aesthetic-4day') return sys;
      return {
        ...sys,
        days: sys.days.map((day, idx) => {
          if (
            (day.id === 'day-push' || idx === 0) &&
            day.title === 'Day 1: Chest, Shoulders & Triceps (Push)'
          ) {
            migrated = true;
            return defaultDayOne;
          }
          return day;
        }),
      };
    });
    return { systems: updated, migrated };
  }

  async loadWorkoutSystems(): Promise<WorkoutSystem[]> {
    if (!this.isBrowser) return DEFAULT_WORKOUT_SYSTEMS;
    try {
      const idbVal = await get<WorkoutSystem[]>('osama_workout_systems');
      if (idbVal && Array.isArray(idbVal) && idbVal.length > 0) {
        const { systems, migrated } = this.migrateDayOneIfNeeded(idbVal);
        if (migrated) {
          await this.saveWorkoutSystems(systems);
        }
        return systems;
      }

      const lsVal = localStorage.getItem('osama_workout_systems');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const { systems, migrated } = this.migrateDayOneIfNeeded(parsed);
          if (migrated) {
            await this.saveWorkoutSystems(systems);
          }
          return systems;
        }
      }
    } catch (e) {
      console.warn('Error reading workout systems', e);
    }
    return DEFAULT_WORKOUT_SYSTEMS;
  }

  async saveWorkoutSystems(systems: WorkoutSystem[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_workout_systems', JSON.stringify(systems));
      await set('osama_workout_systems', systems);
    } catch (e) {
      console.warn('Error saving workout systems', e);
    }
  }

  async loadMealSystems(): Promise<MealSystem[]> {
    if (!this.isBrowser) return DEFAULT_MEAL_SYSTEMS;
    try {
      const idbVal = await get<MealSystem[]>('osama_meal_systems');
      if (idbVal && Array.isArray(idbVal) && idbVal.length > 0) return idbVal;

      const lsVal = localStorage.getItem('osama_meal_systems');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading meal systems', e);
    }
    return DEFAULT_MEAL_SYSTEMS;
  }

  async saveMealSystems(mealSystems: MealSystem[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_meal_systems', JSON.stringify(mealSystems));
      await set('osama_meal_systems', mealSystems);
    } catch (e) {
      console.warn('Error saving meal systems', e);
    }
  }

  async loadWalkingSessions(): Promise<WalkingSession[]> {
    if (!this.isBrowser) return DEFAULT_WALKING_SESSIONS;
    try {
      const idbVal = await get<WalkingSession[]>('osama_walking_sessions');
      if (idbVal && Array.isArray(idbVal)) return idbVal;

      const lsVal = localStorage.getItem('osama_walking_sessions');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading walking sessions', e);
    }
    return DEFAULT_WALKING_SESSIONS;
  }

  async saveWalkingSessions(sessions: WalkingSession[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_walking_sessions', JSON.stringify(sessions));
      await set('osama_walking_sessions', sessions);
    } catch (e) {
      console.warn('Error saving walking sessions', e);
    }
  }

  async loadWorkoutLogs(): Promise<CompletedSessionLog[]> {
    if (!this.isBrowser) return DEFAULT_WORKOUT_LOGS;
    try {
      const idbVal = await get<CompletedSessionLog[]>('osama_workout_logs');
      if (idbVal && Array.isArray(idbVal)) return idbVal;

      const lsVal = localStorage.getItem('osama_workout_logs');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading workout logs', e);
    }
    return DEFAULT_WORKOUT_LOGS;
  }

  async saveWorkoutLogs(logs: CompletedSessionLog[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_workout_logs', JSON.stringify(logs));
      await set('osama_workout_logs', logs);
    } catch (e) {
      console.warn('Error saving workout logs', e);
    }
  }

  async loadBoxingWorkouts(): Promise<BoxingWorkout[]> {
    if (!this.isBrowser) return DEFAULT_BOXING_WORKOUTS;
    try {
      const idbVal = await get<BoxingWorkout[]>('osama_boxing_workouts');
      if (idbVal && Array.isArray(idbVal) && idbVal.length > 0) {
        return this.normalizeBoxingWorkouts(idbVal);
      }

      const lsVal = localStorage.getItem('osama_boxing_workouts');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return this.normalizeBoxingWorkouts(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading boxing workouts', e);
    }
    return DEFAULT_BOXING_WORKOUTS;
  }

  async saveBoxingWorkouts(workouts: BoxingWorkout[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_boxing_workouts', JSON.stringify(workouts));
      await set('osama_boxing_workouts', workouts);
    } catch (e) {
      console.warn('Error saving boxing workouts', e);
    }
  }

  async loadBoxingLogs(): Promise<CompletedBoxingLog[]> {
    if (!this.isBrowser) return DEFAULT_BOXING_LOGS;
    try {
      const idbVal = await get<CompletedBoxingLog[]>('osama_boxing_logs');
      if (idbVal && Array.isArray(idbVal)) return idbVal;

      const lsVal = localStorage.getItem('osama_boxing_logs');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading boxing logs', e);
    }
    return DEFAULT_BOXING_LOGS;
  }

  async saveBoxingLogs(logs: CompletedBoxingLog[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_boxing_logs', JSON.stringify(logs));
      await set('osama_boxing_logs', logs);
    } catch (e) {
      console.warn('Error saving boxing logs', e);
    }
  }

  async loadNutritionLogs(): Promise<CompletedNutritionLog[]> {
    if (!this.isBrowser) return DEFAULT_NUTRITION_LOGS;
    try {
      const idbVal = await get<CompletedNutritionLog[]>('osama_nutrition_logs');
      if (idbVal && Array.isArray(idbVal)) return idbVal;

      const lsVal = localStorage.getItem('osama_nutrition_logs');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading nutrition logs', e);
    }
    return DEFAULT_NUTRITION_LOGS;
  }

  async saveNutritionLogs(logs: CompletedNutritionLog[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_nutrition_logs', JSON.stringify(logs));
      await set('osama_nutrition_logs', logs);
    } catch (e) {
      console.warn('Error saving nutrition logs', e);
    }
  }

  // Full Database Backup Export as JSON file
  exportFullBackup(payload: {
    settings: AppSettings;
    workoutSystems: WorkoutSystem[];
    mealSystems: MealSystem[];
    walkingSessions: WalkingSession[];
    workoutLogs: CompletedSessionLog[];
    boxingWorkouts?: BoxingWorkout[];
    boxingLogs?: CompletedBoxingLog[];
    nutritionLogs?: CompletedNutritionLog[];
  }) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `osama_gym_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Restore from imported JSON
  async importFullBackup(jsonText: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonText);
      if (data.settings) await this.saveSettings(data.settings);
      if (data.workoutSystems) await this.saveWorkoutSystems(data.workoutSystems);
      if (data.mealSystems) await this.saveMealSystems(data.mealSystems);
      if (data.walkingSessions) await this.saveWalkingSessions(data.walkingSessions);
      if (data.workoutLogs) await this.saveWorkoutLogs(data.workoutLogs);
      if (data.boxingWorkouts) await this.saveBoxingWorkouts(data.boxingWorkouts);
      if (data.boxingLogs) await this.saveBoxingLogs(data.boxingLogs);
      if (data.nutritionLogs) await this.saveNutritionLogs(data.nutritionLogs);
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
      return false;
    }
  }
}

export const localDb = new LocalGymDatabase();

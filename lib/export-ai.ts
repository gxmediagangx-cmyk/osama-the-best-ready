import {
  CompletedBoxingLog,
  CompletedNutritionLog,
  CompletedSessionLog,
  MealSystem,
  WalkingSession,
  WorkoutSystem,
} from './types';

function toLocalDateKey(isoOrDate: string): string {
  if (!isoOrDate) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) return isoOrDate;
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return isoOrDate.slice(0, 10);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Generates a clean, instant-copyable text report for a specific day (YYYY-MM-DD)
 * showing:
 * - Gym Trainings Done & Exercises/Sets Skipped
 * - Boxing Trainings Done & Rounds Skipped
 * - Meals Eaten & Meals/Foods Forgotten/Skipped
 * - Water Drank (X/Y glasses) & Supplements Taken/Missed
 * - Walks / Steps Logged
 */
export function generateDailyReportText(params: {
  dateKey: string;
  userName?: string;
  unit?: string;
  workoutLogs: CompletedSessionLog[];
  boxingLogs: CompletedBoxingLog[];
  nutritionLogs: CompletedNutritionLog[];
  currentMealSystem?: MealSystem | null;
  workoutSystems?: WorkoutSystem[];
  walkingSessions?: WalkingSession[];
}): string {
  const {
    dateKey,
    userName = 'Osama',
    unit = 'kg',
    workoutLogs,
    boxingLogs,
    nutritionLogs,
    currentMealSystem,
    walkingSessions = [],
  } = params;

  const readableDate = formatReadableDateKey(dateKey);
  const dayWorkouts = workoutLogs.filter((l) => toLocalDateKey(l.completedAt) === dateKey);
  const dayBoxing = boxingLogs.filter((l) => toLocalDateKey(l.completedAt) === dateKey);
  const savedDayNutrition = nutritionLogs.find((n) => n.date === dateKey);
  const isToday = dateKey === getTodayDateKey();
  const dayWalks = walkingSessions.filter((w) => w.date === dateKey);

  const lines: string[] = [];
  lines.push(`=========================================`);
  lines.push(`DAILY REPORT — ${userName.toUpperCase()}`);
  lines.push(`Date: ${readableDate}`);
  lines.push(`=========================================`);
  lines.push(``);

  // 1. GYM & BOXING TRAININGS (DONE vs DIDN'T DO)
  lines.push(`1. TRAININGS (DONE vs MISSED)`);
  lines.push(`-----------------------------------------`);

  if (dayWorkouts.length > 0) {
    dayWorkouts.forEach((w) => {
      lines.push(`[DONE] Gym Workout: ${w.dayTitle} (${w.durationMinutes} min | ${w.totalVolume.toLocaleString()} ${unit})`);
      const doneExercises: string[] = [];
      const skippedExercises: string[] = [];

      w.exercises.forEach((ex) => {
        const completedSets = ex.sets.filter((s) => s.completed);
        const missedSets = ex.sets.length - completedSets.length;
        if (completedSets.length > 0) {
          const perSetStr = completedSets
            .map((s) => `S${s.setNumber}: ${s.weight}${unit}×${s.reps}`)
            .join(', ');
          doneExercises.push(`  • Done: ${ex.exerciseName} (${perSetStr})`);
          if (missedSets > 0) {
            skippedExercises.push(`  • Skipped Sets: ${ex.exerciseName} (${missedSets} set${missedSets > 1 ? 's' : ''} not done)`);
          }
        } else {
          skippedExercises.push(`  • Didn't Do: ${ex.exerciseName} (0/${ex.sets.length} sets)`);
        }
      });

      if (doneExercises.length > 0) {
        lines.push(...doneExercises);
      }
      if (skippedExercises.length > 0) {
        lines.push(...skippedExercises);
      }
      if (w.userNotes) {
        lines.push(`  • Workout Note: "${w.userNotes}"`);
      }
    });
  } else {
    lines.push(`[DIDN'T DO] Gym Workout: No gym workout logged on this day.`);
  }

  lines.push(``);

  if (dayBoxing.length > 0) {
    dayBoxing.forEach((b) => {
      const modeLabel = b.mode === 'partner' ? 'Partner Session' : 'Solo Session';
      lines.push(`[DONE] Boxing Training: ${b.workoutName} (${modeLabel} | ${b.durationMinutes} min | ${b.totalRoundsCompleted} rounds)`);
      b.drills.forEach((d) => {
        if (d.roundsCompleted >= d.totalRounds && d.totalRounds > 0) {
          lines.push(`  • Done: ${d.drillName} (${d.roundsCompleted}/${d.totalRounds} rounds)`);
        } else if (d.roundsCompleted > 0) {
          lines.push(`  • Partial: ${d.drillName} (${d.roundsCompleted}/${d.totalRounds} rounds done, ${d.totalRounds - d.roundsCompleted} skipped)`);
        } else {
          lines.push(`  • Didn't Do: ${d.drillName} (0/${d.totalRounds} rounds)`);
        }
      });
      if (b.userNotes) {
        lines.push(`  • Boxing Note: "${b.userNotes}"`);
      }
    });
  } else {
    lines.push(`[DIDN'T DO] Boxing Training: No boxing session logged on this day.`);
  }

  lines.push(``);

  // 2. NUTRITION: MEALS EATEN vs FORGOTTEN
  lines.push(`2. NUTRITION (MEALS EATEN vs FORGOTTEN)`);
  lines.push(`-----------------------------------------`);

  // Use saved nutrition log for that date, or fall back to live currentMealSystem if viewing today
  const mealsSource = savedDayNutrition
    ? savedDayNutrition.meals
    : isToday && currentMealSystem
    ? currentMealSystem.meals.map((m) => ({
        mealId: m.id,
        mealName: m.name,
        scheduledTime: m.scheduledTime,
        completed: m.foods.length > 0 && m.foods.every((f) => f.consumed),
        foods: m.foods.map((f) => ({
          foodId: f.id,
          name: f.name,
          portion: f.portion,
          consumed: Boolean(f.consumed),
        })),
      }))
    : null;

  if (mealsSource && mealsSource.length > 0) {
    const eatenLines: string[] = [];
    const forgottenLines: string[] = [];

    mealsSource.forEach((meal) => {
      const eatenFoods = meal.foods.filter((f) => f.consumed);
      const missedFoods = meal.foods.filter((f) => !f.consumed);

      if (eatenFoods.length === meal.foods.length && meal.foods.length > 0) {
        const foodList = eatenFoods.map((f) => `${f.name} (${f.portion})`).join(', ');
        eatenLines.push(`  [ATE] ${meal.mealName} [${meal.scheduledTime}]: ${foodList}`);
      } else if (eatenFoods.length > 0) {
        const eatenList = eatenFoods.map((f) => `${f.name} (${f.portion})`).join(', ');
        const missedList = missedFoods.map((f) => `${f.name} (${f.portion})`).join(', ');
        eatenLines.push(`  [ATE PARTIAL] ${meal.mealName} [${meal.scheduledTime}]: Ate ${eatenList}`);
        forgottenLines.push(`  [FORGOT IN ${meal.mealName.toUpperCase()}]: ${missedList}`);
      } else {
        const missedList =
          meal.foods.length > 0
            ? meal.foods.map((f) => `${f.name} (${f.portion})`).join(', ')
            : 'No foods listed';
        forgottenLines.push(`  [FORGOT / SKIPPED] ${meal.mealName} [${meal.scheduledTime}]: ${missedList}`);
      }
    });

    lines.push(`Meals Eaten:`);
    if (eatenLines.length > 0) {
      lines.push(...eatenLines);
    } else {
      lines.push(`  • None recorded yet.`);
    }

    lines.push(``);
    lines.push(`Meals Forgotten / Skipped:`);
    if (forgottenLines.length > 0) {
      lines.push(...forgottenLines);
    } else {
      lines.push(`  • None! All scheduled meals and foods were eaten.`);
    }
  } else {
    lines.push(`  • No nutrition day saved for ${readableDate}.`);
  }

  lines.push(``);

  // 3. WATER & SUPPLEMENTS
  lines.push(`3. WATER & SUPPLEMENTS`);
  lines.push(`-----------------------------------------`);

  const waterGlasses = savedDayNutrition
    ? savedDayNutrition.waterGlasses
    : isToday && currentMealSystem
    ? currentMealSystem.waterCount ?? 0
    : 0;
  const waterTarget = savedDayNutrition
    ? savedDayNutrition.waterTarget
    : isToday && currentMealSystem
    ? currentMealSystem.waterTarget ?? 8
    : 8;

  const remainingGlasses = Math.max(0, waterTarget - waterGlasses);
  lines.push(
    `Water Drank: ${waterGlasses}/${waterTarget} glasses (${waterGlasses * 250} ml)${
      remainingGlasses > 0
        ? ` — Forgot ${remainingGlasses} glass${remainingGlasses > 1 ? 'es' : ''}`
        : ' — Daily Hydration Goal Hit!'
    }`
  );

  const supsSource = savedDayNutrition
    ? savedDayNutrition.supplements
    : isToday && currentMealSystem
    ? (currentMealSystem.supplements || []).map((s) => ({
        name: s.name,
        taken: s.taken,
      }))
    : [];

  if (supsSource.length > 0) {
    const takenSups = supsSource.filter((s) => s.taken).map((s) => s.name);
    const missedSups = supsSource.filter((s) => !s.taken).map((s) => s.name);
    lines.push(`Supplements Taken: ${takenSups.length > 0 ? takenSups.join(', ') : 'None'}`);
    if (missedSups.length > 0) {
      lines.push(`Supplements Forgotten: ${missedSups.join(', ')}`);
    }
  }

  if (dayWalks.length > 0) {
    const totalSteps = dayWalks.reduce((acc, w) => acc + w.steps, 0);
    const totalKm = dayWalks.reduce((acc, w) => acc + w.distanceKm, 0);
    lines.push(
      `Walking / Cardio: ${totalSteps.toLocaleString()} steps (${totalKm.toFixed(1)} km across ${dayWalks.length} walk${dayWalks.length > 1 ? 's' : ''})`
    );
  }

  return lines.join('\n');
}

export function generateAIPromptMarkdown(
  logs: CompletedSessionLog[],
  userName: string = 'Osama',
  unit: string = 'kg',
  boxingLogs: CompletedBoxingLog[] = [],
  nutritionLogs: CompletedNutritionLog[] = [],
  currentMealSystem?: MealSystem | null,
  walkingSessions: WalkingSession[] = []
): string {
  const todayReport = generateDailyReportText({
    dateKey: getTodayDateKey(),
    userName,
    unit,
    workoutLogs: logs,
    boxingLogs,
    nutritionLogs,
    currentMealSystem,
    walkingSessions,
  });

  let md = `# FULL TRAINING & NUTRITION REPORT FOR ${userName.toUpperCase()}\n\n`;
  md += `${todayReport}\n\n`;
  md += `---\n\n`;
  md += `## RECENT GYM SESSIONS (${logs.length}):\n\n`;

  logs.slice(0, 10).forEach((session, sIdx) => {
    const sDate = new Date(session.completedAt).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    md += `### Session ${sIdx + 1}: ${session.dayTitle} (${sDate})\n`;
    md += `- **Program:** ${session.systemName} | **Duration:** ${session.durationMinutes} min | **Volume:** ${session.totalVolume.toLocaleString()} ${unit}\n`;
    if (session.userNotes) {
      md += `- **Notes:** "${session.userNotes}"\n`;
    }

    session.exercises.forEach((ex, exIdx) => {
      const doneSets = ex.sets.filter((s) => s.completed);
      const missedCount = ex.sets.length - doneSets.length;
      const setsStr = doneSets
        .map((s) => `Set ${s.setNumber}: ${s.weight}${unit} × ${s.reps}`)
        .join(' | ');
      md += `${exIdx + 1}. **${ex.exerciseName}**: ${setsStr || 'Skipped (0 sets)'}${
        missedCount > 0 && doneSets.length > 0 ? ` (${missedCount} set skipped)` : ''
      }\n`;
    });
    md += `\n`;
  });

  if (boxingLogs && boxingLogs.length > 0) {
    md += `---\n\n`;
    md += `## RECENT BOXING SESSIONS (${boxingLogs.length}):\n\n`;
    boxingLogs.slice(0, 10).forEach((bSession, bIdx) => {
      const bDate = new Date(bSession.completedAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      md += `### Boxing ${bIdx + 1}: ${bSession.workoutName} (${bDate})\n`;
      md += `- **Mode:** ${bSession.mode === 'partner' ? 'Partner' : 'Solo'} | **Duration:** ${bSession.durationMinutes} min | **Rounds:** ${bSession.totalRoundsCompleted}\n`;
      bSession.drills.forEach((d, dIdx) => {
        md += `${dIdx + 1}. **${d.drillName}**: ${d.roundsCompleted}/${d.totalRounds} rounds (${Math.round(d.roundDurationSeconds / 60)}m)\n`;
      });
      md += `\n`;
    });
  }

  if (nutritionLogs && nutritionLogs.length > 0) {
    md += `---\n\n`;
    md += `## SAVED NUTRITION DAYS (${nutritionLogs.length}):\n\n`;
    nutritionLogs.slice(0, 10).forEach((nLog) => {
      const eatenMeals = nLog.meals.filter((m) => m.completed).map((m) => m.mealName);
      const missedMeals = nLog.meals.filter((m) => !m.completed).map((m) => m.mealName);
      md += `### ${formatReadableDateKey(nLog.date)}\n`;
      md += `- **Meals Ate (${nLog.mealsCompletedCount}/${nLog.totalMealsCount}):** ${eatenMeals.join(', ') || 'None'}\n`;
      md += `- **Meals Forgot/Skipped:** ${missedMeals.join(', ') || 'None'}\n`;
      md += `- **Water Drank:** ${nLog.waterGlasses}/${nLog.waterTarget} glasses (${nLog.waterGlasses * 250} ml)\n\n`;
    });
  }

  return md;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadLogsAsJSON(
  logs: CompletedSessionLog[],
  userName: string = 'Osama',
  boxingLogs: CompletedBoxingLog[] = [],
  nutritionLogs: CompletedNutritionLog[] = []
) {
  const data = {
    exportedFor: userName,
    exportedAt: new Date().toISOString(),
    format: 'AI-Studio-Gym-Analytics-v2',
    workoutLogs: logs,
    boxingLogs,
    nutritionLogs,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(
    jsonStr,
    `osama_full_logs_${new Date().toISOString().slice(0, 10)}.json`,
    'application/json'
  );
}

export function downloadLogsAsMarkdown(
  logs: CompletedSessionLog[],
  userName: string = 'Osama',
  unit: string = 'kg',
  boxingLogs: CompletedBoxingLog[] = [],
  nutritionLogs: CompletedNutritionLog[] = [],
  currentMealSystem?: MealSystem | null
) {
  const md = generateAIPromptMarkdown(
    logs,
    userName,
    unit,
    boxingLogs,
    nutritionLogs,
    currentMealSystem
  );
  downloadFile(
    md,
    `osama_report_${new Date().toISOString().slice(0, 10)}.md`,
    'text/markdown'
  );
}

export function downloadLogsAsCSV(logs: CompletedSessionLog[], unit: string = 'kg') {
  const rows: string[] = [];
  rows.push(
    ['Date', 'System', 'Day', 'Exercise', 'Category', 'Set', `Weight (${unit})`, 'Reps', 'Completed', 'Volume'].join(',')
  );

  logs.forEach((session) => {
    const dateStr = session.completedAt.slice(0, 10);
    session.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        const vol = s.completed ? s.weight * s.reps : 0;
        rows.push(
          [
            `"${dateStr}"`,
            `"${session.systemName.replace(/"/g, '""')}"`,
            `"${session.dayTitle.replace(/"/g, '""')}"`,
            `"${ex.exerciseName.replace(/"/g, '""')}"`,
            `"${ex.category}"`,
            s.setNumber,
            s.weight,
            s.reps,
            s.completed ? 'YES' : 'NO',
            vol,
          ].join(',')
        );
      });
    });
  });

  downloadFile(
    rows.join('\n'),
    `osama_workouts_${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv'
  );
}

'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  WorkoutSystem,
  WorkoutDay,
  Exercise,
  AppSettings,
  CompletedSessionLog,
} from '@/lib/types';
import { ExerciseCard } from './ExerciseCard';
import { AddExerciseModal } from './AddExerciseModal';
import {
  ArrowLeft,
  Plus,
  RotateCcw,
  Trophy,
  Timer,
} from 'lucide-react';
import { soundManager } from '@/lib/sound';

interface ActiveWorkoutSessionProps {
  system: WorkoutSystem;
  day: WorkoutDay;
  settings: AppSettings;
  onExit: () => void;
  onUpdateExercise: (exercise: Exercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onAddExercise: (newEx: Exercise) => void;
  onMoveExercise: (index: number, direction: 'up' | 'down') => void;
  onResetChecks: () => void;
  onSaveSession: (log: CompletedSessionLog) => void;
  onTriggerRestTimer: (seconds: number, label?: string) => void;
  onOpenTimer?: () => void;
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
  system,
  day,
  settings,
  onExit,
  onUpdateExercise,
  onDeleteExercise,
  onAddExercise,
  onMoveExercise,
  onResetChecks,
  onSaveSession,
  onTriggerRestTimer,
  onOpenTimer,
}) => {
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [showSessionCompleteDialog, setShowSessionCompleteDialog] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(50);

  const unit = settings.weightUnit;

  const totalSets = day.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = day.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const currentVolume = day.exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + s.weight * s.reps, 0),
    0
  );
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleFinish = () => {
    let totalVolume = 0;
    let totalSetsDone = 0;
    let totalRepsDone = 0;

    day.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalVolume += s.weight * s.reps;
          totalSetsDone += 1;
          totalRepsDone += s.reps;
        }
      });
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#d4b26f', '#eed891', '#ffffff', '#b38d45'],
      });
    } catch {
      // Ignore
    }

    soundManager.playOverloadLevelUp();

    const log: CompletedSessionLog = {
      id: `log-${Date.now()}`,
      systemId: system.id,
      systemName: system.name,
      dayId: day.id,
      dayTitle: day.title,
      completedAt: new Date().toISOString(),
      durationMinutes: sessionDurationMinutes,
      totalVolume,
      totalSetsCompleted: totalSetsDone,
      totalRepsCompleted: totalRepsDone,
      exercises: day.exercises.map((e) => ({
        exerciseId: e.id,
        exerciseName: e.name,
        category: e.category,
        sets: e.sets.map((s) => ({
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
        })),
      })),
      userNotes: sessionNotes || undefined,
    };

    onSaveSession(log);
    setShowSessionCompleteDialog(false);
    onExit();
  };

  return (
    <div className="space-y-3.5 pb-36">
      {/* Top Controls Bar (Clean normal flow — never overlaps or covers the Active Workout card below) */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <button
          type="button"
          onClick={onExit}
          className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-[#14141a] px-3 text-xs font-bold text-zinc-200 hover:text-white active:scale-95 transition touch-manipulation cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Workout Hub</span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenTimer && (
            <button
              type="button"
              onClick={onOpenTimer}
              className="flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-white/10 bg-[#16161c] px-2.5 text-xs font-bold text-[#eed891] hover:border-[#d4b26f]/40 hover:text-white active:scale-95 transition touch-manipulation cursor-pointer"
              title="Open rest timer console"
            >
              <Timer className="w-3.5 h-3.5 text-[#d4b26f] shrink-0" />
              <span>Timer</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetChecks}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#16161c] text-zinc-400 hover:text-white active:scale-95 transition touch-manipulation cursor-pointer"
            title="Reset checkmarks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsAddExerciseOpen(true)}
            className="flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl bg-[#d4b26f] px-3 text-xs font-black uppercase tracking-tight text-black hover:bg-[#e2c487] active:scale-95 transition touch-manipulation shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] shrink-0" />
            <span>Exercise</span>
          </button>
        </div>
      </div>

      {/* Day Overview Telemetry Card */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#d4b26f]">
              Active Workout
            </div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white mt-0.5 leading-snug">
              {day.title}
            </h1>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Completed
            </div>
            <div className="font-mono text-base font-black text-[#eed891] mt-0.5">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* 3 Telemetry Metrics */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-white/[0.05] pt-3 text-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Volume</div>
            <div className="font-mono text-base font-black text-white mt-0.5">
              {currentVolume.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">{unit}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Sets Done</div>
            <div className="font-mono text-base font-black text-white mt-0.5">
              {completedSets} <span className="text-zinc-500 font-normal">/ {totalSets}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Remaining</div>
            <div className="font-mono text-base font-black text-zinc-200 mt-0.5">
              {totalSets - completedSets}
            </div>
          </div>
        </div>

        <div className="mt-2.5 h-1 w-full rounded-full bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-[#d4b26f] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Exercises Cards */}
      {day.exercises.length > 0 ? (
        <div className="space-y-3">
          {day.exercises.map((exercise, idx) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exerciseIndex={idx}
              totalExercises={day.exercises.length}
              settings={settings}
              onUpdateExercise={onUpdateExercise}
              onDeleteExercise={onDeleteExercise}
              onMoveUp={() => onMoveExercise(idx, 'up')}
              onMoveDown={() => onMoveExercise(idx, 'down')}
              onTriggerRestTimer={onTriggerRestTimer}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
          <p className="text-xs text-zinc-400">No exercises added to this workout day.</p>
          <button
            onClick={() => setIsAddExerciseOpen(true)}
            className="mt-3 rounded-xl bg-[#d4b26f] px-4 py-2 text-xs font-bold text-black"
          >
            Add Exercise
          </button>
        </div>
      )}

      {/* Mobile-First Docked Bottom Action Bar - Always visible, thumb reachable from any scroll position */}
      {day.exercises.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0c0c10]/98 backdrop-blur-2xl px-3.5 pt-2.5 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-12px_36px_rgba(0,0,0,0.85)]">
          <div className="mx-auto max-w-[430px]">
            <button
              type="button"
              onClick={() => setShowSessionCompleteDialog(true)}
              className="flex h-12 w-full items-center justify-between gap-2 whitespace-nowrap rounded-2xl bg-[#d4b26f] px-3.5 text-xs font-black uppercase tracking-wide text-black shadow-xl hover:bg-[#e2c487] active:scale-[0.98] transition touch-manipulation cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/15 text-black">
                  <Trophy className="h-4 w-4 stroke-[2.5]" />
                </div>
                <span className="truncate">Complete & Save Workout</span>
              </div>
              <span className="shrink-0 whitespace-nowrap rounded-lg bg-black/15 px-2.5 py-1 font-mono text-[11px] font-black text-black">
                {completedSets}/{totalSets} Sets Done →
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        onAddExercise={onAddExercise}
        defaultWeightUnit={settings.weightUnit}
      />

      {/* Session Finish Modal */}
      {showSessionCompleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141a] p-6 shadow-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4b26f] text-black">
                <Trophy className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black">Workout Completed!</h3>
                <p className="text-xs text-zinc-400">{day.title}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Duration (Minutes)</label>
                <input
                  type="number"
                  value={sessionDurationMinutes}
                  onChange={(e) => setSessionDurationMinutes(parseInt(e.target.value) || 45)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white font-mono focus:border-[#d4b26f] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Personal Workout Notes</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="e.g. Incline press felt great, hit all targets with solid form..."
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowSessionCompleteDialog(false)}
                className="flex-1 rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 rounded-xl bg-[#d4b26f] py-2.5 text-xs font-black uppercase text-black hover:bg-[#e2c487]"
              >
                Save Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

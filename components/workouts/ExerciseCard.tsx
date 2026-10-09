'use client';

import React, { useState } from 'react';
import {
  Check,
  Zap,
  Plus,
  Minus,
  MoreHorizontal,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Info,
  Timer,
} from 'lucide-react';
import { Exercise, ExerciseSet, AppSettings } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  totalExercises?: number;
  settings: AppSettings;
  onUpdateExercise: (updated: Exercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onTriggerRestTimer: (seconds: number, label?: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  totalExercises = 1,
  settings,
  onUpdateExercise,
  onDeleteExercise,
  onMoveUp,
  onMoveDown,
  onTriggerRestTimer,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(exercise.notes || '');

  const repStep = exercise.customRepStep ?? settings.overloadRepStep ?? 2;
  const repCeiling = exercise.customRepCeiling ?? settings.overloadRepCeiling ?? 12;
  const repFloor = settings.overloadRepFloor ?? 8;
  const weightStep = exercise.customWeightStep ?? settings.overloadWeightStep ?? 2.5;
  const unit = settings.weightUnit;

  // Toggle set completion
  const handleToggleSet = (setId: string) => {
    let justCompleted = false;
    const updatedSets = exercise.sets.map((s) => {
      if (s.id === setId) {
        const nextState = !s.completed;
        if (nextState) {
          justCompleted = true;
          soundManager.playClickPop();
        }
        return { ...s, completed: nextState };
      }
      return s;
    });

    if (justCompleted && settings.restTimerEnabled !== false && settings.autoStartRestOnCheck) {
      // Check if this was the last pending set of the exercise!
      const allDone = updatedSets.length > 0 && updatedSets.every((s) => s.completed);
      if (allDone) {
        // Exercise finished -> Trigger longer between-exercises rest
        onTriggerRestTimer(settings.restBetweenExercisesSeconds || 150, 'Exercise Rest');
      } else {
        // Normal set finished -> Trigger between-sets rest
        onTriggerRestTimer(settings.restBetweenSetsSeconds || settings.defaultRestSeconds || 90, 'Set Rest');
      }
    }

    onUpdateExercise({ ...exercise, sets: updatedSets });
  };

  // Toggle all sets of the exercise (checkbox next to exercise name)
  const handleToggleAllSets = () => {
    const isCurrentlyAllDone = exercise.sets.length > 0 && exercise.sets.every((s) => s.completed);
    const newCompleted = !isCurrentlyAllDone;
    const updatedSets = exercise.sets.map((s) => ({ ...s, completed: newCompleted }));

    soundManager.playClickPop();
    if (newCompleted && settings.restTimerEnabled !== false && settings.autoStartRestOnCheck) {
      // Rest between exercises!
      onTriggerRestTimer(settings.restBetweenExercisesSeconds || 150, 'Exercise Rest');
    }
    onUpdateExercise({ ...exercise, sets: updatedSets });
  };

  // Direct increment / decrement helper — updates ONLY the targeted set
  const handleStepValue = (
    setId: string,
    field: 'weight' | 'reps',
    delta: number
  ) => {
    const updatedSets = exercise.sets.map((s) => {
      if (s.id === setId) {
        const current = s[field];
        const next = Math.max(0, Number((current + delta).toFixed(1)));
        return { ...s, [field]: next };
      }
      return s;
    });
    soundManager.playClickPop();
    onUpdateExercise({
      ...exercise,
      sets: updatedSets,
    });
  };

  // Smart Progressive Overload Engine - Adds +repStep (or +weightStep) to EACH set individually based on its own current value
  const handleSmartOverload = () => {
    if (exercise.sets.length === 0) return;

    // Ready for weight jump only when all sets have reached the rep ceiling (or if the user is jumping weight)
    const allSetsAtCeiling = exercise.sets.every((s) => s.reps >= repCeiling);

    if (!allSetsAtCeiling) {
      soundManager.playClickPop();
      // Add +repStep (e.g. +2 reps) to each set's own current reps (so 6 and 8 become 8 and 10)
      const updatedSets = exercise.sets.map((s) => ({
        ...s,
        reps: s.reps + repStep,
        previousWeight: s.weight,
        previousReps: s.reps,
      }));

      onUpdateExercise({
        ...exercise,
        sets: updatedSets,
      });
    } else {
      soundManager.playOverloadLevelUp();
      // Add +weightStep to each set's own current weight and reset reps to repFloor
      const updatedSets = exercise.sets.map((s) => ({
        ...s,
        weight: Number((s.weight + weightStep).toFixed(1)),
        reps: repFloor,
        previousWeight: s.weight,
        previousReps: s.reps,
      }));

      onUpdateExercise({
        ...exercise,
        sets: updatedSets,
      });
    }
  };

  // Add set
  const handleAddSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      setNumber: exercise.sets.length + 1,
      weight: lastSet ? lastSet.weight : exercise.defaultWeight || 20,
      reps: lastSet ? lastSet.reps : exercise.targetReps || 10,
      previousWeight: lastSet ? lastSet.weight : undefined,
      previousReps: lastSet ? lastSet.reps : undefined,
      completed: false,
    };
    onUpdateExercise({
      ...exercise,
      targetSets: exercise.sets.length + 1,
      sets: [...exercise.sets, newSet],
    });
    soundManager.playClickPop();
  };

  // Remove set
  const handleRemoveSet = (setId: string) => {
    if (exercise.sets.length <= 1) return;
    const filtered = exercise.sets
      .filter((s) => s.id !== setId)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    onUpdateExercise({
      ...exercise,
      targetSets: filtered.length,
      sets: filtered,
    });
    soundManager.playClickPop();
  };

  const handleSaveNotes = () => {
    onUpdateExercise({ ...exercise, notes: notesText });
    setIsEditingNotes(false);
  };

  const isReadyForWeightJump =
    exercise.sets.length > 0 && exercise.sets.every((s) => s.reps >= repCeiling);
  const completedCount = exercise.sets.filter((s) => s.completed).length;
  const isAllDone = completedCount === exercise.sets.length && exercise.sets.length > 0;

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
        isAllDone
          ? 'border-[#d4b26f]/30 bg-[#121217] shadow-sm'
          : 'border-white/[0.08] bg-[#121217]'
      }`}
    >
      {/* Exercise Card Header */}
      <div className="p-3.5 pb-2.5">
        {/* Top Row: Index, Checkbox, Full-Width Name, and Dropdown / Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {/* Index pill badge */}
            <span className="font-mono text-[11px] font-bold text-zinc-400 bg-[#181822] border border-white/10 px-1.5 py-0.5 rounded-md shrink-0 mt-1">
              #{exerciseIndex + 1}
            </span>

            {/* Dedicated Checkbox next to exercise name */}
            <button
              type="button"
              onClick={handleToggleAllSets}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-90 touch-manipulation cursor-pointer mt-0.5 ${
                isAllDone
                  ? 'border-[#d4b26f] bg-[#d4b26f] text-black shadow-md'
                  : 'border-zinc-500 bg-zinc-950 text-transparent hover:border-[#d4b26f] hover:text-zinc-500'
              }`}
              title={isAllDone ? 'Mark exercise incomplete' : 'Check off all sets & start exercise rest'}
              aria-label={`Checkbox to complete all sets of ${exercise.name}`}
            >
              <Check className={`h-4 w-4 stroke-[3.5] transition-transform ${isAllDone ? 'scale-100' : 'scale-0'}`} />
            </button>

            {/* Exercise Title */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className={`text-sm sm:text-base font-bold tracking-tight transition-colors break-words leading-snug ${
                  isAllDone ? 'text-zinc-400 line-through decoration-[#d4b26f]/70' : 'text-white'
                }`}>
                  {exercise.name}
                </h3>
                {isAllDone && (
                  <span className="rounded bg-[#d4b26f]/15 px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-[#d4b26f]">
                    DONE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Controls: Expand + Menu (Reorder moved below so title text is never covered) */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition touch-manipulation"
              aria-label="Toggle exercise sets"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition touch-manipulation"
                aria-label="More exercise options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-2xl border border-white/10 bg-[#181820] p-1.5 shadow-2xl text-xs">
                  <button
                    onClick={() => {
                      setIsEditingNotes(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-zinc-200 hover:bg-zinc-800 touch-manipulation font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Edit Form Cues</span>
                  </button>
                  <button
                    onClick={() => {
                      onDeleteExercise(exercise.id);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-rose-400 hover:bg-rose-500/10 touch-manipulation font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Exercise</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Row: Category & Sets Completed on Left, Reorder Up/Down on Right */}
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.04] pt-2.5">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 min-w-0">
            <span className="capitalize font-semibold text-[#eed891] truncate">
              {exercise.category}
            </span>
            <span aria-hidden="true" className="text-zinc-600 shrink-0">·</span>
            <span className="shrink-0">{completedCount}/{exercise.sets.length} done</span>
          </div>

          {totalExercises > 1 && (
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#181822] p-0.5 shrink-0">
              <button
                type="button"
                disabled={exerciseIndex === 0}
                onClick={() => {
                  soundManager.playClickPop();
                  onMoveUp?.();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                title="Move exercise up"
                aria-label="Move exercise up"
              >
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                disabled={exerciseIndex === totalExercises - 1}
                onClick={() => {
                  soundManager.playClickPop();
                  onMoveDown?.();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                title="Move exercise down"
                aria-label="Move exercise down"
              >
                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Third Row: Dedicated Action Buttons Grid (Rest Timer & Smart Overload Jump — never collides!) */}
        <div
          className={`mt-2 grid gap-2 ${
            settings.restTimerEnabled !== false ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Rest Timer Button directly connected to this exercise */}
          {settings.restTimerEnabled !== false && (
            <button
              type="button"
              onClick={() => {
                onTriggerRestTimer(settings.restBetweenExercisesSeconds || 150);
              }}
              className="flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-[#181824] px-3 text-xs font-semibold text-zinc-200 hover:border-[#d4b26f]/40 hover:text-white active:scale-95 transition touch-manipulation cursor-pointer"
              title="Start rest timer for this exercise"
            >
              <Timer className="w-3.5 h-3.5 text-[#d4b26f] shrink-0" />
              <span>{settings.restBetweenExercisesSeconds || 150}s Rest</span>
            </button>
          )}

          {/* Smart Progressive Overload Jump Badge */}
          <button
            type="button"
            onClick={handleSmartOverload}
            className={`flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-bold tracking-tight transition active:scale-95 touch-manipulation cursor-pointer ${
              isReadyForWeightJump
                ? 'bg-[#d4b26f] text-black shadow-sm font-black'
                : 'bg-[#d4b26f]/15 border border-[#d4b26f]/35 text-[#eed891] hover:bg-[#d4b26f]/25'
            }`}
            title="Apply progressive overload jump to all sets"
          >
            <Zap className="w-3.5 h-3.5 stroke-[2.8] shrink-0" />
            {isReadyForWeightJump ? (
              <span>+{weightStep}{unit} Jump</span>
            ) : (
              <span>+{repStep}r All Sets</span>
            )}
          </button>
        </div>
      </div>

      {/* Notes / Form Cues */}
      {exercise.notes && !isEditingNotes && (
        <div className="mx-3.5 mb-2.5 flex items-start gap-2 rounded-xl bg-[#181820]/80 px-3 py-2 text-xs sm:text-sm text-zinc-200">
          <Info className="w-4 h-4 text-[#d4b26f] shrink-0 mt-0.5" />
          <span className="leading-snug">{exercise.notes}</span>
        </div>
      )}

      {/* Editable Notes Form */}
      {isEditingNotes && (
        <div className="mx-3.5 mb-3 rounded-xl border border-white/10 bg-[#181820] p-3">
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Exercise form cues (e.g. 3-second negative descent)..."
            className="w-full rounded-lg border border-white/10 bg-zinc-950 p-2.5 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
            rows={2}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setIsEditingNotes(false)}
              className="px-2.5 py-1 text-xs sm:text-sm text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              className="rounded-lg bg-[#d4b26f] px-3.5 py-1.5 text-xs sm:text-sm font-bold text-black"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Sets List - Mobile-First Layout */}
      {isExpanded && (
        <div className="border-t border-white/[0.06] px-3.5 pt-2.5 pb-3">
          <div className="space-y-2.5">
            {exercise.sets.map((set) => {
              const targetWeight = set.previousWeight !== undefined ? set.previousWeight : (exercise.defaultWeight || 20);
              const targetReps = set.previousReps !== undefined ? set.previousReps : (exercise.targetReps || 10);

              return (
                <div
                  key={set.id}
                  className={`rounded-2xl p-3 sm:p-3.5 transition-all space-y-2.5 ${
                    set.completed
                      ? 'bg-[#d4b26f]/[0.09] border border-[#d4b26f]/35'
                      : 'bg-[#12121a] border border-white/[0.08] shadow-sm'
                  }`}
                >
                  {/* Top Line of Set: SET badge, Target info, and Check Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 rounded-lg bg-zinc-800/90 px-2.5 py-1 font-mono text-xs sm:text-sm font-bold text-white shadow-sm">
                        SET {set.setNumber}
                      </span>
                      <span className="truncate text-xs sm:text-sm font-medium text-zinc-300">
                        Target: {targetWeight}{unit} × {targetReps}
                      </span>
                    </div>

                    {/* Screenshot-Accurate Check Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleSet(set.id)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-bold transition active:scale-95 touch-manipulation cursor-pointer ${
                        set.completed
                          ? 'border-[#d4b26f] bg-[#d4b26f] text-black font-black shadow-md'
                          : 'border-white/10 bg-[#1e1e2b] text-white hover:border-[#d4b26f]/40 hover:bg-zinc-800'
                      }`}
                      title={set.completed ? 'Mark incomplete' : 'Mark set complete & start rest'}
                    >
                      <Check className={`w-4 h-4 stroke-[2.5] ${set.completed ? 'text-black' : 'text-white'}`} />
                      <span>Check</span>
                    </button>
                  </div>

                  {/* Steppers Row: 2 Balanced Columns with Circular (+ / -) Buttons inside Pill Capsule */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                    {/* Weight Stepper */}
                    <div className="min-w-0">
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
                        <span>WEIGHT ({unit.toUpperCase()})</span>
                        <span className="font-mono text-[10px] sm:text-[11px] text-zinc-400 font-normal">±{weightStep}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0c12] p-1 shadow-inner">
                        <button
                          type="button"
                          onClick={() => handleStepValue(set.id, 'weight', -weightStep)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition shadow-sm touch-manipulation"
                          title={`-${weightStep}${unit}`}
                          aria-label="Decrease weight"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          inputMode="decimal"
                          value={set.weight}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = exercise.sets.map((s) =>
                              s.id === set.id ? { ...s, weight: val } : s
                            );
                            onUpdateExercise({
                              ...exercise,
                              sets: updated,
                            });
                          }}
                          className="min-w-0 w-full bg-transparent text-center font-mono text-base sm:text-lg font-black text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepValue(set.id, 'weight', weightStep)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition shadow-sm touch-manipulation"
                          title={`+${weightStep}${unit}`}
                          aria-label="Increase weight"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>

                    {/* Reps Stepper */}
                    <div className="min-w-0">
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
                        <span>REPS</span>
                        <span className="font-mono text-[10px] sm:text-[11px] text-zinc-400 font-normal">±1</span>
                      </div>
                      <div className="flex items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0c12] p-1 shadow-inner">
                        <button
                          type="button"
                          onClick={() => handleStepValue(set.id, 'reps', -1)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition shadow-sm touch-manipulation"
                          title="-1 rep"
                          aria-label="Decrease reps"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={set.reps}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const updated = exercise.sets.map((s) =>
                              s.id === set.id ? { ...s, reps: val } : s
                            );
                            onUpdateExercise({
                              ...exercise,
                              sets: updated,
                            });
                          }}
                          className="min-w-0 w-full bg-transparent text-center font-mono text-base sm:text-lg font-black text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepValue(set.id, 'reps', 1)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition shadow-sm touch-manipulation"
                          title="+1 rep"
                          aria-label="Increase reps"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="mt-3 flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleAddSet}
              className="flex min-h-[44px] items-center gap-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-[#eed891] hover:text-white hover:bg-white/5 transition touch-manipulation"
            >
              <Plus className="w-4 h-4 text-[#d4b26f]" />
              <span>Add Another Set</span>
            </button>

            {exercise.sets.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveSet(exercise.sets[exercise.sets.length - 1].id)}
                className="flex min-h-[44px] items-center px-3 rounded-xl text-xs sm:text-sm text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition touch-manipulation"
              >
                Remove Last Set
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  WorkoutSystem,
  WorkoutDay,
  AppSettings,
  CompletedSessionLog,
} from '@/lib/types';
import {
  Dumbbell,
  Play,
  Layers,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { formatSafeDate } from '@/lib/utils';
import { soundManager } from '@/lib/sound';
import { SystemEditorModal } from './SystemEditorModal';

interface WorkoutRoutineHubProps {
  systems: WorkoutSystem[];
  settings: AppSettings;
  workoutLogs: CompletedSessionLog[];
  onSelectDayToStart: (dayId: string) => void;
  onUpdateSystems: (updated: WorkoutSystem[]) => void;
}

export const WorkoutRoutineHub: React.FC<WorkoutRoutineHubProps> = ({
  systems,
  settings,
  workoutLogs,
  onSelectDayToStart,
  onUpdateSystems,
}) => {
  const currentSystem = systems.find((s) => s.isCurrent) || systems[0] || null;
  const [isSystemEditorOpen, setIsSystemEditorOpen] = useState(false);
  const [isProgramPickerOpen, setIsProgramPickerOpen] = useState(false);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  if (!currentSystem) {
    return <div className="p-8 text-center text-zinc-500">No workout systems found.</div>;
  }

  const handleSelectSystem = (systemId: string) => {
    const updated = systems.map((s) => ({
      ...s,
      isCurrent: s.id === systemId,
    }));
    onUpdateSystems(updated);
    setIsProgramPickerOpen(false);
  };

  const handleMoveExerciseInDay = (
    dayId: string,
    exIndex: number,
    direction: 'up' | 'down'
  ) => {
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id !== dayId) return d;
      const targetIndex = direction === 'up' ? exIndex - 1 : exIndex + 1;
      if (targetIndex < 0 || targetIndex >= d.exercises.length) return d;
      const nextExercises = [...d.exercises];
      const [moved] = nextExercises.splice(exIndex, 1);
      nextExercises.splice(targetIndex, 0, moved);
      return { ...d, exercises: nextExercises };
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    soundManager.playClickPop();
    onUpdateSystems(updatedSystems);
  };

  const getLastCompletedTime = (dayId: string) => {
    const matchingLog = workoutLogs.find((l) => l.dayId === dayId);
    if (!matchingLog) return null;

    const logDate = formatSafeDate(matchingLog.completedAt);
    return `Last: ${logDate}`;
  };

  return (
    <div className="space-y-4 pb-32">
      {/* App Cover Banner Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121217] shadow-xl group">
        <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/app-cover.jpg"
            alt="Osama The Best Cover"
            className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-[#121217]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#d4b26f]/20 border border-[#d4b26f]/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#eed891] backdrop-blur-md">
                Aesthetic Protocol
              </span>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-md mt-1">
                Osama The Best
              </h2>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-lg bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 text-[11px] font-bold text-zinc-300 drop-shadow">
                {currentSystem.days.length} Days Split
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Program Selector Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121217] p-4 sm:p-5 shadow-sm">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#d4b26f] block">
          Training Split
        </span>

        <button
          type="button"
          onClick={() => setIsProgramPickerOpen(true)}
          className="mt-1.5 flex w-full items-center justify-between gap-3 text-left group touch-manipulation cursor-pointer"
        >
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug group-hover:text-[#eed891] transition">
            {currentSystem.name}
          </span>
          <ChevronDown className="w-5 h-5 text-zinc-300 shrink-0" />
        </button>

        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
          Select today&apos;s workout to start training
        </p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsSystemEditorOpen(true)}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#d4b26f]/30 bg-[#181820] px-4 py-2 text-xs sm:text-sm font-bold text-zinc-100 hover:text-white hover:border-[#d4b26f]/60 hover:bg-zinc-800 transition touch-manipulation cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#d4b26f] shrink-0" />
            <span>Edit Split</span>
          </button>
        </div>
      </div>

      {/* Routine Days List */}
      <div className="space-y-3">
        <div className="px-1 space-y-0.5">
          <span className="block text-xs font-black uppercase tracking-wider text-zinc-400">
            Workouts ({currentSystem.days.length} Days)
          </span>
          <span className="block text-xs text-zinc-400">
            Pick any day to begin
          </span>
        </div>

        {currentSystem.days.map((day, idx) => {
          const totalSets = day.exercises.reduce((acc, e) => acc + e.sets.length, 0);
          const lastTrained = getLastCompletedTime(day.id);
          const isExpanded = expandedDayId === day.id;

          return (
            <div
              key={day.id}
              className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121217] transition-all hover:border-[#d4b26f]/30"
            >
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#181820] border border-[#d4b26f]/20 font-mono text-sm font-bold text-[#d4b26f]">
                      D{idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {day.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 mt-1 flex-wrap">
                        <span>{day.exercises.length} exercises</span>
                        <span className="text-zinc-600">·</span>
                        <span>{totalSets} sets</span>
                        {lastTrained && (
                          <>
                            <span className="text-zinc-600">·</span>
                            <span suppressHydrationWarning className="text-[#eed891] font-medium">{lastTrained}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectDayToStart(day.id)}
                    className="flex min-h-[46px] min-w-[88px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#d4b26f] px-4 py-2.5 text-xs sm:text-sm font-black uppercase text-black hover:bg-[#e2c487] active:scale-95 shadow-md transition touch-manipulation cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black stroke-none" />
                    <span>Start</span>
                  </button>
                </div>

                {/* Exercises preview */}
                <div className="mt-3.5 border-t border-white/[0.04] pt-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-400 font-medium">Included exercises:</span>
                    <button
                      type="button"
                      onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                      className="flex min-h-[36px] items-center gap-1 text-[#eed891] font-bold touch-manipulation cursor-pointer"
                    >
                      <span>{isExpanded ? 'Done Ordering' : 'View & Order'}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isExpanded && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {day.exercises.slice(0, 4).map((ex) => (
                        <span
                          key={ex.id}
                          className="rounded-lg bg-[#181820] border border-white/[0.05] px-2.5 py-1 text-xs text-zinc-200 font-medium"
                        >
                          {ex.name}
                        </span>
                      ))}
                      {day.exercises.length > 4 && (
                        <span className="rounded-lg bg-[#181820]/60 px-2.5 py-1 text-xs text-zinc-400 font-medium">
                          +{day.exercises.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-2.5 space-y-2 animate-in fade-in">
                      {day.exercises.map((ex, eIdx) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between gap-2.5 rounded-xl bg-[#181820]/90 px-3 py-2.5 text-sm border border-white/[0.06]"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-zinc-100 block truncate">
                              {eIdx + 1}. {ex.name}
                            </span>
                            <span className="font-mono text-xs text-zinc-400">
                              {ex.targetSets} sets × {ex.targetReps}r @ {ex.defaultWeight}{settings.weightUnit}
                            </span>
                          </div>

                          {day.exercises.length > 1 && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={eIdx === 0}
                                onClick={() => handleMoveExerciseInDay(day.id, eIdx, 'up')}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121217] text-zinc-300 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                                title="Move up"
                              >
                                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                disabled={eIdx === day.exercises.length - 1}
                                onClick={() => handleMoveExerciseInDay(day.id, eIdx, 'down')}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121217] text-zinc-300 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                                title="Move down"
                              >
                                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Program Switcher Modal */}
      {isProgramPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141a] p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider">Select Training Split</h3>
              <button
                onClick={() => setIsProgramPickerOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {systems.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSystem(s.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
                    s.isCurrent
                      ? 'bg-[#d4b26f]/15 border border-[#d4b26f]/40 text-[#eed891] font-bold'
                      : 'bg-zinc-900/60 border border-white/[0.04] text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{s.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{s.days.length} Days Split</div>
                  </div>
                  {s.isCurrent && <ChevronRight className="w-4 h-4 text-[#d4b26f]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit System Modal */}
      <SystemEditorModal
        isOpen={isSystemEditorOpen}
        onClose={() => setIsSystemEditorOpen(false)}
        system={currentSystem}
        onSaveSystem={(updated) => {
          const next = systems.map((s) => (s.id === updated.id ? updated : s));
          onUpdateSystems(next);
        }}
      />
    </div>
  );
};

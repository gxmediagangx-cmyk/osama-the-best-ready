'use client';

import React, { useState } from 'react';
import {
  WorkoutSystem,
  WorkoutDay,
  Exercise,
  AppSettings,
  CompletedSessionLog,
} from '@/lib/types';
import { WorkoutRoutineHub } from './WorkoutRoutineHub';
import { ActiveWorkoutSession } from './ActiveWorkoutSession';

interface WorkoutSystemViewProps {
  systems: WorkoutSystem[];
  settings: AppSettings;
  workoutLogs: CompletedSessionLog[];
  onUpdateSystems: (updated: WorkoutSystem[]) => void;
  onSaveSessionLog: (log: CompletedSessionLog) => void;
  onTriggerRestTimer: (seconds: number, label?: string) => void;
  onOpenTimer?: () => void;
  onOpenAIExport: () => void;
  onActiveSessionChange?: (isActive: boolean) => void;
}

export const WorkoutSystemView: React.FC<WorkoutSystemViewProps> = ({
  systems,
  settings,
  workoutLogs,
  onUpdateSystems,
  onSaveSessionLog,
  onTriggerRestTimer,
  onOpenTimer,
  onOpenAIExport,
  onActiveSessionChange,
}) => {
  const currentSystem = systems.find((s) => s.isCurrent) || systems[0] || null;
  const [activeDayId, setActiveDayId] = useState<string | null>(null);

  // Notify parent if active session state changes
  React.useEffect(() => {
    onActiveSessionChange?.(activeDayId !== null);
  }, [activeDayId, onActiveSessionChange]);

  if (!currentSystem) {
    return <div className="p-8 text-center text-zinc-500">No workout systems found.</div>;
  }

  const activeDay = currentSystem.days.find((d) => d.id === activeDayId) || null;

  const handleUpdateExercise = (updatedEx: Exercise) => {
    if (!activeDay) return;
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        const nextExercises = d.exercises.map((e) =>
          e.id === updatedEx.id ? updatedEx : e
        );
        return { ...d, exercises: nextExercises };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  const handleDeleteExercise = (exId: string) => {
    if (!activeDay) return;
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        return {
          ...d,
          exercises: d.exercises.filter((e) => e.id !== exId),
        };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  const handleAddExercise = (newEx: Exercise) => {
    if (!activeDay) return;
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        return {
          ...d,
          exercises: [...d.exercises, newEx],
        };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (!activeDay) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeDay.exercises.length) return;

    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        const nextExercises = [...d.exercises];
        const [moved] = nextExercises.splice(index, 1);
        nextExercises.splice(targetIndex, 0, moved);
        return {
          ...d,
          exercises: nextExercises,
        };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  const handleResetChecks = () => {
    if (!activeDay) return;
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        const uncheckExercises = d.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => ({ ...s, completed: false })),
        }));
        return { ...d, exercises: uncheckExercises };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  // If in an active session, render the dedicated ActiveWorkoutSession screen
  if (activeDay) {
    return (
      <ActiveWorkoutSession
        system={currentSystem}
        day={activeDay}
        settings={settings}
        onExit={() => {
          setActiveDayId(null);
          if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
        }}
        onUpdateExercise={handleUpdateExercise}
        onDeleteExercise={handleDeleteExercise}
        onAddExercise={handleAddExercise}
        onMoveExercise={handleMoveExercise}
        onResetChecks={handleResetChecks}
        onSaveSession={onSaveSessionLog}
        onTriggerRestTimer={onTriggerRestTimer}
        onOpenTimer={onOpenTimer}
      />
    );
  }

  // Otherwise, render the Workout Routine Hub
  return (
    <WorkoutRoutineHub
      systems={systems}
      settings={settings}
      workoutLogs={workoutLogs}
      onSelectDayToStart={(dayId) => {
        setActiveDayId(dayId);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
      }}
      onUpdateSystems={onUpdateSystems}
    />
  );
};

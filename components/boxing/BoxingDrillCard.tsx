'use client';

import React, { useState } from 'react';
import {
  Check,
  Bell,
  Plus,
  Minus,
  MoreHorizontal,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Users,
  User,
  ArrowLeftRight,
  Flame,
  Play,
  Pause,
  SkipForward,
  X,
} from 'lucide-react';
import { BoxingDrill, BoxingRound } from '@/lib/types';
import { LiveBoxingTimerState } from './BoxingRoundTimer';
import { soundManager } from '@/lib/sound';

interface BoxingDrillCardProps {
  drill: BoxingDrill;
  drillIndex: number;
  totalDrills?: number;
  liveTimerState?: LiveBoxingTimerState | null;
  onUpdateDrill: (updated: BoxingDrill) => void;
  onDeleteDrill: (drillId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onStartDrillTimer: (
    drill: BoxingDrill,
    startRound: number,
    initialPhase?: 'work' | 'rest'
  ) => void;
  onTimerCommand?: (
    action: 'togglePlay' | 'skipPhase' | 'adjustSeconds' | 'stop' | 'reset' | 'updateDurations',
    delta?: number,
    extra?: {
      roundSeconds?: number;
      restSeconds?: number;
      changedField?: 'roundDurationSeconds' | 'restSeconds';
    }
  ) => void;
}

const CATEGORY_LABELS: Record<BoxingDrill['category'], string> = {
  warmup: 'Warmup / Jump Rope',
  shadowboxing: 'Shadowboxing',
  bagwork: 'Heavy / Speed Bag',
  padwork: 'Pad / Mitt Work',
  'partner-drill': 'Partner Counter Drill',
  sparring: 'Technical Sparring',
  footwork: 'Footwork & Angles',
  conditioning: 'Fight Conditioning',
};

export const BoxingDrillCard: React.FC<BoxingDrillCardProps> = ({
  drill,
  drillIndex,
  totalDrills = 1,
  liveTimerState,
  onUpdateDrill,
  onDeleteDrill,
  onMoveUp,
  onMoveDown,
  onStartDrillTimer,
  onTimerCommand,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editName, setEditName] = useState(drill.name);
  const [editCombo, setEditCombo] = useState(drill.comboOrCues || '');
  const [editNotes, setEditNotes] = useState(drill.notes || '');

  const completedRoundsCount = drill.rounds.filter((r) => r.completed).length;
  const isAllDone = drill.rounds.length > 0 && completedRoundsCount === drill.rounds.length;
  const isThisDrillActive =
    liveTimerState?.drillId === drill.id &&
    (liveTimerState.isRunning || liveTimerState.secondsLeft > 0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleRound = (roundId: string) => {
    let toggledToCompleted = false;
    let toggledRoundNumber = 1;

    const updatedRounds = drill.rounds.map((r) => {
      if (r.id === roundId) {
        const next = !r.completed;
        toggledToCompleted = next;
        toggledRoundNumber = r.roundNumber;
        if (next) soundManager.playClickPop();
        return { ...r, completed: next };
      }
      return r;
    });

    onUpdateDrill({ ...drill, rounds: updatedRounds });

    // Just like Gym sets: when you manually check a round Done, auto-start Corner Rest if more rounds remain!
    if (
      toggledToCompleted &&
      toggledRoundNumber < drill.rounds.length &&
      !(isThisDrillActive && liveTimerState?.phase === 'work' && liveTimerState?.isRunning)
    ) {
      onStartDrillTimer(drill, toggledRoundNumber, 'rest');
    }
  };

  const handleToggleAllRounds = () => {
    const nextState = !isAllDone;
    const updatedRounds = drill.rounds.map((r) => ({ ...r, completed: nextState }));
    soundManager.playClickPop();
    onUpdateDrill({ ...drill, rounds: updatedRounds });
  };

  const handleAddRound = () => {
    const newRound: BoxingRound = {
      id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roundNumber: drill.rounds.length + 1,
      durationSeconds: drill.roundDurationSeconds || 180,
      restSeconds: drill.restSeconds || 60,
      completed: false,
    };
    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      rounds: [...drill.rounds, newRound],
    });
  };

  const handleRemoveLastRound = () => {
    if (drill.rounds.length <= 1) return;
    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      rounds: drill.rounds.slice(0, -1),
    });
  };

  const handleAdjustDuration = (field: 'roundDurationSeconds' | 'restSeconds', delta: number) => {
    const current = drill[field];
    const next = Math.max(15, current + delta);
    const updatedRounds = drill.rounds.map((r) => ({
      ...r,
      durationSeconds: field === 'roundDurationSeconds' ? next : r.durationSeconds,
      restSeconds: field === 'restSeconds' ? next : r.restSeconds,
    }));
    const updatedDrill: BoxingDrill = {
      ...drill,
      [field]: next,
      rounds: updatedRounds,
    };
    soundManager.playClickPop();
    onUpdateDrill(updatedDrill);

    // If the inline timer is active on this exercise, immediately update its round/rest durations and active countdown!
    if (isThisDrillActive) {
      onTimerCommand?.('updateDurations', delta, {
        roundSeconds: updatedDrill.roundDurationSeconds,
        restSeconds: updatedDrill.restSeconds,
        changedField: field,
      });
    }
  };

  // Swap between Solo and Partner mode on the fly!
  const handleSwapSoloPartner = () => {
    const nextMode = drill.mode === 'solo' ? 'partner' : 'solo';
    const currentName = drill.name;
    const currentCues = drill.comboOrCues;

    const swappedName =
      drill.partnerAlternativeName ||
      (nextMode === 'partner'
        ? `Partner Pad / Counter: ${drill.name}`
        : `Solo Bag / Shadow: ${drill.name}`);

    const swappedCues =
      drill.partnerAlternativeCues ||
      (nextMode === 'partner'
        ? `${currentCues || '1-2-3-2'} (With partner catching on mitts/gloves & countering)`
        : `${currentCues || '1-2-3-2'} (Solo on heavy bag or shadowboxing with head movement)`);

    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      mode: nextMode,
      name: swappedName,
      comboOrCues: swappedCues,
      partnerAlternativeName: currentName,
      partnerAlternativeCues: currentCues,
    });
  };

  const handleSaveEditedDetails = () => {
    onUpdateDrill({
      ...drill,
      name: editName.trim() || drill.name,
      comboOrCues: editCombo.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setIsEditingDetails(false);
    soundManager.playClickPop();
  };

  const firstPendingRound = drill.rounds.find((r) => !r.completed)?.roundNumber || 1;

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
        isAllDone
          ? 'border-[#d4b26f]/35 bg-[#121217]'
          : 'border-white/[0.08] bg-[#121217]'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 pb-2.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <span className="font-mono text-xs font-bold text-zinc-400 bg-[#181822] border border-white/10 px-2 py-0.5 rounded-md shrink-0 mt-1">
              #{drillIndex + 1}
            </span>

            {/* Master All-Rounds Checkbox */}
            <button
              type="button"
              onClick={handleToggleAllRounds}
              className={`flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-90 touch-manipulation cursor-pointer ${
                isAllDone
                  ? 'border-[#d4b26f] bg-[#d4b26f] text-black shadow-md'
                  : 'border-zinc-500 bg-zinc-950 text-transparent hover:border-[#d4b26f]'
              }`}
              title={isAllDone ? 'Mark drill incomplete' : 'Check off all rounds'}
            >
              <Check className={`h-5 w-5 stroke-[3.5] transition-transform ${isAllDone ? 'scale-100' : 'scale-0'}`} />
            </button>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Mode Badge: Solo vs Partner */}
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                    drill.mode === 'partner'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  }`}
                >
                  {drill.mode === 'partner' ? (
                    <>
                      <Users className="w-3 h-3" />
                      <span>Partner</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      <span>Solo</span>
                    </>
                  )}
                </span>

                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {CATEGORY_LABELS[drill.category]}
                </span>
              </div>

              <h3
                className={`mt-1 text-base sm:text-lg font-bold tracking-tight break-words leading-snug ${
                  isAllDone ? 'text-zinc-400 line-through decoration-[#d4b26f]/70' : 'text-white'
                }`}
              >
                {drill.name}
              </h3>
            </div>
          </div>

          {/* Right Expand & Menu (Reorder moved below so drill title is never covered) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-2xl border border-white/10 bg-[#181820] p-1.5 shadow-2xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(drill.name);
                      setEditCombo(drill.comboOrCues || '');
                      setEditNotes(drill.notes || '');
                      setIsEditingDetails(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-zinc-200 hover:bg-zinc-800 font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#d4b26f]" />
                    <span>Edit Combo & Name</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSwapSoloPartner();
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-zinc-200 hover:bg-zinc-800 font-medium"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
                    <span>Swap to {drill.mode === 'solo' ? 'Partner' : 'Solo'} Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteDrill(drill.id);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-rose-400 hover:bg-rose-500/10 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Drill</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Row: Rounds Done & Duration on Left, Reorder Up/Down on Right */}
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.04] pt-2.5">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 whitespace-nowrap min-w-0">
            <span className="font-mono font-bold text-[#eed891]">
              {completedRoundsCount}/{drill.rounds.length} Rds
            </span>
            <span className="text-zinc-600">·</span>
            <span className="font-mono text-xs">
              {Math.floor(drill.roundDurationSeconds / 60)}:
              {(drill.roundDurationSeconds % 60).toString().padStart(2, '0')} Work / {drill.restSeconds}s Rest
            </span>
          </div>

          {totalDrills > 1 && (
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#181822] p-0.5 shrink-0">
              <button
                type="button"
                disabled={drillIndex === 0}
                onClick={() => {
                  soundManager.playClickPop();
                  onMoveUp?.();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                title="Move drill up"
                aria-label="Move drill up"
              >
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                disabled={drillIndex === totalDrills - 1}
                onClick={() => {
                  soundManager.playClickPop();
                  onMoveDown?.();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                title="Move drill down"
                aria-label="Move drill down"
              >
                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Third Row: Dedicated 2-Column Action Buttons (Solo/Partner Switch & Start Round Timer) */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          {/* 1-Tap Solo <-> Partner Adaptation Button */}
          <button
            type="button"
            onClick={handleSwapSoloPartner}
            className="flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-[#181822] px-3 text-xs font-bold text-zinc-200 hover:border-[#d4b26f]/40 hover:text-white active:scale-95 transition cursor-pointer"
            title="Switch between Solo and Partner version of this drill"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#d4b26f] shrink-0" />
            <span>Switch to {drill.mode === 'solo' ? 'Partner' : 'Solo'}</span>
          </button>

          {/* Start / Pause Inline Round Timer */}
          <button
            type="button"
            onClick={() => {
              if (isThisDrillActive) {
                onTimerCommand?.('togglePlay');
              } else {
                onStartDrillTimer(drill, firstPendingRound, 'work');
              }
            }}
            className={`flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-black uppercase active:scale-95 transition shadow-sm cursor-pointer ${
              isThisDrillActive
                ? liveTimerState?.phase === 'rest'
                  ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300'
                  : 'border border-[#d4b26f] bg-[#d4b26f]/20 text-[#eed891]'
                : 'bg-[#d4b26f] text-black hover:bg-[#e2c487]'
            }`}
          >
            {isThisDrillActive ? (
              <>
                {liveTimerState?.isRunning ? (
                  <Pause className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                )}
                <span className="font-mono">{formatTime(liveTimerState?.secondsLeft || 0)}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black stroke-none shrink-0" />
                <span>Start R{firstPendingRound}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* INLINE LIVE ROUND & CORNER REST TIMER (Appears right inside this exercise card when active!) */}
      {isThisDrillActive && liveTimerState && (
        <div
          className={`mx-3.5 mb-3 overflow-hidden rounded-2xl border p-3 space-y-2.5 transition-all ${
            liveTimerState.phase === 'work' &&
            liveTimerState.secondsLeft <= 10 &&
            liveTimerState.secondsLeft > 0
              ? 'border-amber-400 bg-[#1a1310] shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : liveTimerState.phase === 'rest'
              ? 'border-emerald-500/50 bg-[#0f1915]'
              : 'border-[#d4b26f]/50 bg-[#15151f]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  liveTimerState.phase === 'rest'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#d4b26f] text-black'
                }`}
              >
                <Bell className="w-3 h-3 stroke-[2.5]" />
                {liveTimerState.phase === 'rest'
                  ? `CORNER REST · NEXT R${Math.min(drill.rounds.length, liveTimerState.currentRound + 1)}`
                  : `ROUND ${liveTimerState.currentRound} OF ${liveTimerState.totalRounds} · WORK`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onTimerCommand?.('stop')}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
              title="Stop & close timer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Centered Countdown Stepper Row */}
          <div className="flex items-center justify-center gap-3 py-1">
            <button
              type="button"
              onClick={() => onTimerCommand?.('adjustSeconds', -15)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#1c1c26] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
              title="-15 seconds"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div
              className={`min-w-[100px] text-center font-mono text-3xl font-black tracking-tight ${
                liveTimerState.phase === 'rest' ? 'text-emerald-300' : 'text-white'
              }`}
            >
              {formatTime(liveTimerState.secondsLeft)}
            </div>

            <button
              type="button"
              onClick={() => onTimerCommand?.('adjustSeconds', 15)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#1c1c26] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
              title="+15 seconds"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* 2-Column Pause/Resume & Skip Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onTimerCommand?.('togglePlay')}
              className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-black uppercase transition active:scale-95 cursor-pointer ${
                liveTimerState.isRunning
                  ? 'border border-[#d4b26f] bg-[#d4b26f]/20 text-[#eed891]'
                  : 'bg-[#d4b26f] text-black'
              }`}
            >
              {liveTimerState.isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTimerCommand?.('skipPhase')}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#1c1c26] text-xs font-bold text-zinc-200 hover:text-white active:scale-95 transition cursor-pointer"
              title={
                liveTimerState.phase === 'work'
                  ? 'Finish round & start rest'
                  : 'Skip rest & start next round'
              }
            >
              <SkipForward className="w-3.5 h-3.5 text-[#d4b26f]" />
              <span>{liveTimerState.phase === 'work' ? 'Skip to Rest' : 'Next Round'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Combination / Technical Cues Box */}
      {!isEditingDetails && drill.comboOrCues && (
        <div
          onClick={() => {
            setEditName(drill.name);
            setEditCombo(drill.comboOrCues || '');
            setEditNotes(drill.notes || '');
            setIsEditingDetails(true);
          }}
          className="mx-3.5 mb-2.5 cursor-pointer rounded-xl border border-[#d4b26f]/20 bg-[#181822] px-3 py-2.5 text-xs sm:text-sm hover:border-[#d4b26f]/40 transition"
          title="Tap to customize combination or cues"
        >
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#d4b26f] mb-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Combination / Drill Focus
            </span>
            <span className="text-zinc-400 font-normal">Tap to edit</span>
          </div>
          <div className="font-mono text-xs sm:text-sm text-zinc-100 leading-relaxed">{drill.comboOrCues}</div>
          {drill.notes && <div className="mt-1 text-xs text-zinc-300">Coach Tip: {drill.notes}</div>}
        </div>
      )}

      {/* Inline Editor for Name, Combo, and Notes */}
      {isEditingDetails && (
        <div className="mx-3.5 mb-3 rounded-xl border border-[#d4b26f]/40 bg-[#181822] p-3 space-y-2.5">
          <div>
            <label className="text-xs font-bold uppercase text-zinc-400">Drill Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-bold text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#d4b26f]">
              Combinations / Round Focus (e.g. 1-2-Slip-2-3-2)
            </label>
            <textarea
              value={editCombo}
              onChange={(e) => setEditCombo(e.target.value)}
              rows={2}
              placeholder="e.g. 1-2-3-2, roll under, counter 3-2"
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 p-2.5 text-sm font-mono text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-400">Technical Notes</label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="e.g. Keep rear hand glued to cheek"
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingDetails(false)}
              className="px-3 py-1.5 text-xs sm:text-sm text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEditedDetails}
              className="rounded-lg bg-[#d4b26f] px-4 py-1.5 text-xs sm:text-sm font-black uppercase text-black"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Expanded Rounds & Timing Controls (Clean Gym-Style Round Rows) */}
      {isExpanded && (
        <div className="border-t border-white/[0.06] px-3.5 pt-2.5 pb-3 space-y-2.5">
          {/* Round-by-Round Interactive Rows */}
          <div className="space-y-1.5">
            {drill.rounds.map((r) => {
              const isRoundActive =
                isThisDrillActive && liveTimerState?.currentRound === r.roundNumber;

              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 transition ${
                    r.completed
                      ? 'border-[#d4b26f]/35 bg-[#d4b26f]/10'
                      : isRoundActive
                      ? 'border-[#d4b26f] bg-[#191924]'
                      : 'border-white/[0.07] bg-[#15151d]'
                  }`}
                >
                  {/* Left: Round Badge & Duration / Live Status */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex h-7 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black ${
                        r.completed
                          ? 'bg-[#d4b26f] text-black'
                          : isRoundActive
                          ? 'bg-[#d4b26f]/25 text-[#eed891] border border-[#d4b26f]'
                          : 'bg-[#0e0e14] text-zinc-300 border border-white/10'
                      }`}
                    >
                      R{r.roundNumber}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-100">
                        <span>
                          {Math.floor(r.durationSeconds / 60)}:
                          {(r.durationSeconds % 60).toString().padStart(2, '0')} Work
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-[#eed891]">{r.restSeconds}s Rest</span>
                      </div>
                      {isRoundActive && liveTimerState && (
                        <div
                          className={`font-mono text-[11px] font-black uppercase ${
                            liveTimerState.phase === 'rest'
                              ? 'text-emerald-400'
                              : 'text-[#d4b26f]'
                          }`}
                        >
                          {liveTimerState.phase === 'rest' ? 'Corner Rest: ' : 'Live Round: '}
                          {formatTime(liveTimerState.secondsLeft)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Per-Round Timer Button + Done Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (isRoundActive) {
                          onTimerCommand?.('togglePlay');
                        } else {
                          onStartDrillTimer(drill, r.roundNumber, 'work');
                        }
                      }}
                      className={`flex h-8 items-center gap-1 rounded-xl border px-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                        isRoundActive
                          ? 'border-[#d4b26f] bg-[#d4b26f]/20 text-[#eed891]'
                          : 'border-white/10 bg-[#0e0e14] text-zinc-300 hover:border-[#d4b26f]/40 hover:text-white'
                      }`}
                      title={`Start timer for Round ${r.roundNumber}`}
                    >
                      {isRoundActive && liveTimerState?.isRunning ? (
                        <>
                          <Pause className="w-3 h-3 text-[#d4b26f]" />
                          <span className="font-mono">
                            {formatTime(liveTimerState.secondsLeft)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-[#d4b26f] fill-[#d4b26f]" />
                          <span>Time</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleRound(r.id)}
                      className={`flex h-8 items-center gap-1 rounded-xl border px-2.5 text-xs font-black uppercase transition active:scale-95 cursor-pointer ${
                        r.completed
                          ? 'border-[#d4b26f] bg-[#d4b26f] text-black shadow-sm'
                          : 'border-white/10 bg-[#1c1c26] text-zinc-200 hover:border-[#d4b26f]/40 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Round Duration & Rest Stepper Row (Capsule style matching Gym Weight/Reps steppers — no label collisions!) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="min-w-0">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
                <span>ROUND TIME</span>
                <span className="font-mono text-[10px] text-zinc-400 font-normal">±30s</span>
              </div>
              <div className="flex items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0c12] p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleAdjustDuration('roundDurationSeconds', -30)}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="font-mono text-sm sm:text-base font-black text-white text-center flex-1">
                  {Math.floor(drill.roundDurationSeconds / 60)}:
                  {(drill.roundDurationSeconds % 60).toString().padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdjustDuration('roundDurationSeconds', 30)}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
                <span>REST TIME</span>
                <span className="font-mono text-[10px] text-zinc-400 font-normal">±15s</span>
              </div>
              <div className="flex items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0c12] p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleAdjustDuration('restSeconds', -15)}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="font-mono text-sm sm:text-base font-black text-[#eed891] text-center flex-1">
                  {drill.restSeconds}s
                </span>
                <button
                  type="button"
                  onClick={() => handleAdjustDuration('restSeconds', 15)}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Add/Remove Rounds Row */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={handleAddRound}
              className="flex min-h-[38px] items-center gap-1 rounded-xl px-2.5 text-xs font-bold text-[#eed891] hover:bg-white/5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d4b26f]" />
              <span>Add Round</span>
            </button>

            {drill.rounds.length > 1 && (
              <button
                type="button"
                onClick={handleRemoveLastRound}
                className="flex min-h-[38px] items-center px-2.5 rounded-xl text-xs text-zinc-400 hover:text-rose-400 transition cursor-pointer"
              >
                Remove Last Round
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

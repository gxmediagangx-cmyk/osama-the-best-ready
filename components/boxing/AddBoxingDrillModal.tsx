'use client';

import React, { useState } from 'react';
import { X, Plus, Swords, User, Users } from 'lucide-react';
import { BoxingDrill, BoxingDrillCategory, BoxingMode, BoxingRound } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface AddBoxingDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDrill: (newDrill: BoxingDrill) => void;
  defaultMode?: BoxingMode;
}

interface DrillTemplate {
  name: string;
  category: BoxingDrillCategory;
  mode: BoxingMode;
  rounds: number;
  roundSeconds: number;
  restSeconds: number;
  intensity: BoxingDrill['intensity'];
  comboOrCues: string;
  partnerAlternativeName: string;
  partnerAlternativeCues: string;
}

const BOXING_TEMPLATES: DrillTemplate[] = [
  // SOLO TEMPLATES
  {
    name: 'Boxer Skip & Double-Under Jump Rope',
    category: 'warmup',
    mode: 'solo',
    rounds: 3,
    roundSeconds: 180,
    restSeconds: 60,
    intensity: 'fast',
    comboOrCues: 'R1: Rhythm boxer step | R2: High-knee sprints | R3: Double-unders & criss-cross',
    partnerAlternativeName: 'Partner Mirror Footwork & Shoulder Tag',
    partnerAlternativeCues: 'Live distance control & shoulder/knee touch warmup with partner.',
  },
  {
    name: 'Shadowboxing: Angles, Feints & Head Movement',
    category: 'shadowboxing',
    mode: 'solo',
    rounds: 3,
    roundSeconds: 180,
    restSeconds: 60,
    intensity: 'technical',
    comboOrCues: 'Feint Jab → 1-2-Slip-2-3-2 → Check Hook & pivot out 90 degrees',
    partnerAlternativeName: 'Partner Jab-Parry & Slip-Counter Flow',
    partnerAlternativeCues: 'Partner feeds jabs & crosses → Slip/parry and touch counter.',
  },
  {
    name: 'Heavy Bag: Power Combinations & Body Rip',
    category: 'bagwork',
    mode: 'solo',
    rounds: 4,
    roundSeconds: 180,
    restSeconds: 60,
    intensity: 'power',
    comboOrCues: '1-2-3(body)-3(head)-2 | Roll under → 6-3-2 | Last 15s non-stop punch-out',
    partnerAlternativeName: 'Focus Mitts: Power Combinations & Body Shield',
    partnerAlternativeCues: '1-2-3(body)-2 on mitts with partner calling defensive weave cues.',
  },
  {
    name: 'Heavy Bag: Inside Fighting & Uppercut Clinic',
    category: 'bagwork',
    mode: 'solo',
    rounds: 3,
    roundSeconds: 180,
    restSeconds: 60,
    intensity: 'power',
    comboOrCues: 'High guard step-in → 5-6-3(body)-3(head) → Frame & angle off',
    partnerAlternativeName: 'Partner Inside Phone-Booth Guard Drill',
    partnerAlternativeCues: 'Shoulder-to-shoulder short hooks & uppercuts to partner guard/mitts.',
  },
  {
    name: 'Double-End Bag / Slip Line Precision',
    category: 'footwork',
    mode: 'solo',
    rounds: 3,
    roundSeconds: 180,
    restSeconds: 60,
    intensity: 'technical',
    comboOrCues: '1-2-Slip-Slip-2-3 | Focus on pinpoint accuracy and immediate head off-center',
    partnerAlternativeName: 'Partner Noodle / Pool-Noodle Reflex Defense',
    partnerAlternativeCues: 'Slip & roll under partner swings while firing sharp 2-3 counters.',
  },
  {
    name: 'Fighter Core, Neck & Punch-Out Burnout',
    category: 'conditioning',
    mode: 'solo',
    rounds: 3,
    roundSeconds: 120,
    restSeconds: 45,
    intensity: 'conditioning',
    comboOrCues: '30s Speed 1-2s + 30s Russian Twists + 30s Burpee Shadowbox + 30s Plank',
    partnerAlternativeName: 'Partner Medicine Ball Core & Body Conditioning',
    partnerAlternativeCues: 'Sit-up medicine ball passes + core bracing rounds.',
  },
  // PARTNER TEMPLATES
  {
    name: 'Focus Mitts: Sharp Speed & Pull-Counter Combos',
    category: 'padwork',
    mode: 'partner',
    rounds: 4,
    roundSeconds: 180,
    restSeconds: 60,
    intensity: 'fast',
    comboOrCues: '1-2-Pull-2-3-2 | Catch partner hook → 2-3-2 | Pivot out on lead hook',
    partnerAlternativeName: 'Heavy Bag: Pull-Counter & Speed Flow',
    partnerAlternativeCues: 'Time the bag swing to pull back and fire 2-3-2 combinations.',
  },
  {
    name: 'Dutch Glove-to-Glove Back-and-Forth Drills',
    category: 'partner-drill',
    mode: 'partner',
    rounds: 4,
    roundSeconds: 180,
    restSeconds: 60,
    intensity: 'technical',
    comboOrCues: 'A: 1-2-3 on guard → B: 2-3-2 back → A: Slip right & 2-3(body)-2',
    partnerAlternativeName: 'Shadowboxing with High-Guard Counter Visualization',
    partnerAlternativeCues: 'Shell up in high guard for 2 beats → explode with 2-3-2 counter.',
  },
  {
    name: 'Partner Catch, Parry & Counter Clinic',
    category: 'partner-drill',
    mode: 'partner',
    rounds: 3,
    roundSeconds: 180,
    restSeconds: 60,
    intensity: 'technical',
    comboOrCues: 'R1: Catch jab & shoot 1-2 | R2: Slip cross outside & rip 3(body)-2 | R3: Live 1-for-1',
    partnerAlternativeName: 'Slip-Line / Mirror Counter Shadowboxing',
    partnerAlternativeCues: 'Practice catch-jab-return-jab and slip-cross-riposte in mirror.',
  },
  {
    name: 'Technical / Controlled Sparring',
    category: 'sparring',
    mode: 'partner',
    rounds: 3,
    roundSeconds: 180,
    restSeconds: 60,
    intensity: 'technical',
    comboOrCues: 'R1: Jab-only sparring | R2: Lead hand + defense | R3: Open technical sparring (50% power)',
    partnerAlternativeName: 'Championship Pace Visualization Shadowboxing',
    partnerAlternativeCues: '3 full rounds moving around the ring: feints, angles, defense, and ring IQ.',
  },
];

export const AddBoxingDrillModal: React.FC<AddBoxingDrillModalProps> = ({
  isOpen,
  onClose,
  onAddDrill,
  defaultMode = 'solo',
}) => {
  const [filterMode, setFilterMode] = useState<'all' | BoxingMode>(defaultMode);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<BoxingMode>(defaultMode);
  const [category, setCategory] = useState<BoxingDrillCategory>('bagwork');
  const [intensity, setIntensity] = useState<BoxingDrill['intensity']>('fast');
  const [roundsCount, setRoundsCount] = useState(3);
  const [roundSeconds, setRoundSeconds] = useState(180);
  const [restSeconds, setRestSeconds] = useState(60);
  const [comboOrCues, setComboOrCues] = useState('');
  const [notes, setNotes] = useState('');
  const [partnerAltName, setPartnerAltName] = useState('');
  const [partnerAltCues, setPartnerAltCues] = useState('');

  if (!isOpen) return null;

  const filteredTemplates = BOXING_TEMPLATES.filter(
    (t) => filterMode === 'all' || t.mode === filterMode
  );

  const handleSelectTemplate = (t: DrillTemplate) => {
    setName(t.name);
    setMode(t.mode);
    setCategory(t.category);
    setIntensity(t.intensity);
    setRoundsCount(t.rounds);
    setRoundSeconds(t.roundSeconds);
    setRestSeconds(t.restSeconds);
    setComboOrCues(t.comboOrCues);
    setPartnerAltName(t.partnerAlternativeName);
    setPartnerAltCues(t.partnerAlternativeCues);
    soundManager.playClickPop();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rounds: BoxingRound[] = Array.from({ length: roundsCount }, (_, idx) => ({
      id: `br-${Date.now()}-${idx}`,
      roundNumber: idx + 1,
      durationSeconds: roundSeconds,
      restSeconds,
      completed: false,
    }));

    const newDrill: BoxingDrill = {
      id: `bdrill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      category,
      mode,
      roundDurationSeconds: roundSeconds,
      restSeconds,
      intensity,
      comboOrCues: comboOrCues.trim() || undefined,
      partnerAlternativeName: partnerAltName.trim() || undefined,
      partnerAlternativeCues: partnerAltCues.trim() || undefined,
      notes: notes.trim() || undefined,
      rounds,
    };

    soundManager.playClickPop();
    onAddDrill(newDrill);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-3.5 pb-16 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#14141a] p-5 shadow-2xl text-white max-h-[88vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
              <Swords className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Boxing Drill / Exercise</h3>
              <p className="text-[11px] text-zinc-400">Pick a Solo or Partner drill or create your own</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Filter Tabs (Solo vs Partner) */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className="text-xs font-semibold text-zinc-300">Quick Boxing Templates:</span>
            <div className="flex rounded-lg bg-[#0c0c10] p-0.5 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterMode('solo')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterMode === 'solo' ? 'bg-[#d4b26f] text-black' : 'text-zinc-400'
                }`}
              >
                Solo
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('partner')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterMode === 'partner' ? 'bg-[#d4b26f] text-black' : 'text-zinc-400'
                }`}
              >
                Partner
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterMode === 'all' ? 'bg-[#d4b26f] text-black' : 'text-zinc-400'
                }`}
              >
                All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {filteredTemplates.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-95 text-left ${
                  name === t.name
                    ? 'bg-[#d4b26f] text-black font-black'
                    : 'border border-white/10 bg-[#181822] text-zinc-300 hover:border-[#d4b26f]/40'
                }`}
              >
                {t.mode === 'partner' ? '👥 ' : '🥊 '}
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-300">Drill / Exercise Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Heavy Bag: 1-2-3-2 Power Rounds or Partner Pad Work"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-medium text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          {/* Solo vs Partner Selector */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setMode('solo')}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                mode === 'solo'
                  ? 'border-[#d4b26f] bg-[#d4b26f]/15 text-[#eed891]'
                  : 'border-white/10 bg-zinc-950 text-zinc-400'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Solo (No Partner)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('partner')}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                mode === 'partner'
                  ? 'border-[#d4b26f] bg-[#d4b26f]/15 text-[#eed891]'
                  : 'border-white/10 bg-zinc-950 text-zinc-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>With Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Drill Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BoxingDrillCategory)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm font-medium text-white focus:border-[#d4b26f] focus:outline-none"
              >
                <option value="warmup">Warmup / Jump Rope</option>
                <option value="shadowboxing">Shadowboxing</option>
                <option value="bagwork">Heavy / Speed Bag</option>
                <option value="padwork">Pad / Mitt Work (Partner)</option>
                <option value="partner-drill">Partner Counter Drill</option>
                <option value="sparring">Technical Sparring</option>
                <option value="footwork">Footwork & Defense</option>
                <option value="conditioning">Boxing Conditioning & Core</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Pace / Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as BoxingDrill['intensity'])}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm font-medium text-white focus:border-[#d4b26f] focus:outline-none"
              >
                <option value="technical">Technical & Precision</option>
                <option value="fast">Fast Hand Speed</option>
                <option value="power">Heavy Power Shots</option>
                <option value="conditioning">High-Output Conditioning</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Rounds</label>
              <input
                type="number"
                min="1"
                max="15"
                value={roundsCount}
                onChange={(e) => setRoundsCount(parseInt(e.target.value) || 3)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-center font-mono text-base font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Round (Sec)</label>
              <select
                value={roundSeconds}
                onChange={(e) => setRoundSeconds(parseInt(e.target.value) || 180)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-2.5 py-2.5 text-sm font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              >
                <option value={60}>1:00 (60s)</option>
                <option value={120}>2:00 (120s)</option>
                <option value={180}>3:00 (180s)</option>
                <option value={240}>4:00 (240s)</option>
                <option value={300}>5:00 (300s)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Rest (Sec)</label>
              <select
                value={restSeconds}
                onChange={(e) => setRestSeconds(parseInt(e.target.value) || 60)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-2.5 py-2.5 text-sm font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              >
                <option value={30}>30s Rest</option>
                <option value={45}>45s Rest</option>
                <option value={60}>60s Rest</option>
                <option value={90}>90s Rest</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#eed891]">
              Punch Combination / Round Focus (Optional)
            </label>
            <input
              type="text"
              value={comboOrCues}
              onChange={(e) => setComboOrCues(e.target.value)}
              placeholder="e.g. 1-2-Slip-2-3-2 | Roll under hook | Pivot out"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-mono text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400">Coach Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Keep chin tucked, snap punches back to guard"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div className="mt-5 flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-[#1e1e28] py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#d4b26f] py-3 text-sm font-black uppercase text-black hover:bg-[#e2c487] active:scale-95 transition shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Drill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

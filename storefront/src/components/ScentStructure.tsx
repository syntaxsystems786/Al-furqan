"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ScentStructureProps {
  topNotes: string | null;
  middleNotes: string | null;
  baseNotes: string | null;
}

const notes = [
  { key: 'topNotes' as const, label: 'Top Notes', desc: 'First impression — 15–30 mins', color: 'bg-[#E8E0D8]', textColor: 'text-[#1A1A1A]' },
  { key: 'middleNotes' as const, label: 'Heart Notes', desc: 'The soul — 2–4 hours', color: 'bg-[#C4B5A5]', textColor: 'text-[#1A1A1A]' },
  { key: 'baseNotes' as const, label: 'Base Notes', desc: 'The foundation — 6–12+ hours', color: 'bg-[#8C7A6B]', textColor: 'text-[#FAFAF8]' },
];

export default function ScentStructure({ topNotes, middleNotes, baseNotes }: ScentStructureProps) {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const values = { topNotes, middleNotes, baseNotes };

  if (!topNotes && !middleNotes && !baseNotes) return null;

  return (
    <div className="mt-12 mb-8 border-t border-[#8C7A6B]/15 pt-10">
      <h3 className="text-xs font-bold text-[#8C7A6B] tracking-[0.3em] uppercase mb-8">
        Scent Structure
      </h3>
      <div className="flex flex-col gap-2">
        {notes.map((note, idx) => {
          const value = values[note.key];
          if (!value) return null;
          const isActive = activeNote === note.key;

          return (
            <motion.div
              key={note.key}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              onClick={() => setActiveNote(isActive ? null : note.key)}
              className={`relative overflow-hidden cursor-pointer group transition-all duration-300 ${note.color} ${isActive ? 'ring-1 ring-[#8C7A6B]' : ''}`}
              style={{ height: isActive ? 'auto' : `${60 + idx * 20}px` }}
            >
              <div className={`flex items-center justify-between px-6 py-4 ${note.textColor}`}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">{note.label}</span>
                  <span className="text-base font-serif mt-0.5">{value}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] opacity-60 tracking-widest">{note.desc}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

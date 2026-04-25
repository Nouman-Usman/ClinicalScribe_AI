import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOG_MESSAGES = [
  "Initializing Neural Engine v2.0...",
  "Calibrating Thoracic Scan Matrix...",
  "Analyzing Ribcage Symmetry...",
  "Pulmonary Volume Detection: NORMAL",
  "Cardiac Shadow Assessment: CLEAR",
  "Vertebral Alignment Mapping...",
  "T1-T12 Segments: OPTIMAL",
  "Generating SOAP Draft...",
  "Risk Score Calculation: 1.2% (LOW)",
  "Syncing with EMR Tunnel...",
  "Data Encryption: AES-256 ACTIVE",
  "Ready for Practitioner Review."
];

export default function AnalysisLog() {
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev.slice(-4), LOG_MESSAGES[index]]);
      index = (index + 1) % LOG_MESSAGES.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2 p-6 font-mono text-[10px] leading-relaxed">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <span className="text-cyan-400 font-black uppercase tracking-widest">Live_Analysis_Feed</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        </div>
      </div>
      
      <div className="h-[120px] overflow-hidden flex flex-col justify-end">
        <AnimatePresence mode="popLayout">
          {logs.map((log, i) => (
            <motion.div
              key={`${log}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="flex items-start gap-3 py-1"
            >
              <span className="text-white/20">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className={log.includes('NORMAL') || log.includes('CLEAR') || log.includes('ACTIVE') ? 'text-cyan-400' : 'text-white/60'}>
                {log}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Model_Precision</span>
          <span className="text-white font-black">99.8%</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Latency</span>
          <span className="text-cyan-400 font-black">12ms</span>
        </div>
      </div>
    </div>
  );
}

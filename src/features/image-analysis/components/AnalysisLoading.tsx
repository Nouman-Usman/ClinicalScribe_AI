
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck, Activity, Brain, Search, Database, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const steps = [
    { icon: <Database className="w-5 h-5" />, text: "Extracting DICOM metadata..." },
    { icon: <Brain className="w-5 h-5" />, text: "Warming up Neural Engine..." },
    { icon: <Zap className="w-5 h-5" />, text: "Preprocessing image tensors..." },
    { icon: <Search className="w-5 h-5" />, text: "Scanning anatomical regions..." },
    { icon: <Activity className="w-5 h-5" />, text: "Running multi-modal inference..." },
    { icon: <ShieldCheck className="w-5 h-5" />, text: "Finalizing clinical report..." },
];

interface AnalysisLoadingProps {
    frontalUrl?: string | null;
    lateralUrl?: string | null;
}

export function AnalysisLoading({ frontalUrl, lateralUrl }: AnalysisLoadingProps) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % steps.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] w-full bg-slate-950 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl p-8">
            {/* Background Neural Grid */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-purple-500/10" />

            {/* Images Preview with Scanning Effect */}
            <div className="relative z-10 flex flex-wrap justify-center gap-6 mb-12">
                {[frontalUrl, lateralUrl].filter(Boolean).map((url, i) => (
                    <div key={i} className="relative w-40 h-52 sm:w-48 sm:h-64 rounded-xl border-2 border-primary/30 overflow-hidden bg-black shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <img src={url!} alt="Scan preview" className="w-full h-full object-cover opacity-60 grayscale" />
                        
                        {/* Scanning Line */}
                        <motion.div 
                            className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        
                        {/* Scanning Overlay */}
                        <motion.div 
                            className="absolute inset-0 bg-primary/10 z-10"
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                ))}
            </div>

            {/* Loading Status */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full">
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                    <div className="relative bg-slate-900 p-6 rounded-full border border-white/10 shadow-2xl">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">System Analysis in Progress</h2>
                <p className="text-slate-400 mb-10 text-base sm:text-lg">AI Core is processing medical imaging for precision diagnostics.</p>

                <div className="w-full bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 shadow-inner">
                    <div className="h-20 flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center justify-center gap-4 text-primary text-lg sm:text-xl font-semibold"
                            >
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    {steps[currentStep].icon}
                                </div>
                                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                                    {steps[currentStep].text}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    
                    <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 mt-4">
                        <motion.div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-primary to-cyan-400"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 15, ease: "easeInOut" }}
                        />
                    </div>
                    
                    <div className="mt-4 flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                        <span>Neural Compute Engine</span>
                        <span>Processing...</span>
                    </div>
                </div>
            </div>

            {/* Matrix-like decorative elements */}
            <div className="absolute bottom-4 right-6 font-mono text-[10px] text-primary/30 text-right leading-tight hidden sm:block">
                DATA_STREAM_ACTIVE<br />
                MODEL_V4.2.1_LATEST
            </div>
        </div>
    );
}

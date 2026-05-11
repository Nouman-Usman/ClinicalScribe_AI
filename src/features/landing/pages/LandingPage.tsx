import { Shield, Lock, Clock, FileText, Stethoscope, CheckCircle, BarChart3, Users, MessageSquare, Mail, TrendingUp, Heart, ArrowRight, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AnalysisLog from '../components/AnalysisLog';
import ScrollSequence from '../components/ScrollSequence';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onNavigate: (page?: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Fade in Hero content
    gsap.from('.hero-content > *', {
      y: 50,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power4.out'
    });

    // Reveal feature cards on scroll
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '#features',
        start: 'top 80%',
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.2)'
    });

    // Text Reveal for sections
    gsap.utils.toArray<HTMLElement>('.reveal-text').forEach((text) => {
      gsap.from(text, {
        scrollTrigger: {
          trigger: text,
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      });
    });

    // Floating animation for stats
    gsap.to('.stat-box', {
      y: -10,
      repeat: -1,
      yoyo: true,
      duration: 2,
      stagger: 0.2,
      ease: 'sine.inOut'
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px]" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[100] p-4 lg:p-6">
        <nav className="max-w-7xl mx-auto bg-slate-950/40 backdrop-blur-2xl rounded-3xl px-6 py-4 flex items-center justify-between border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/30">
              <Stethoscope className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">
              AiroDx<span className="text-cyan-400 font-black">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Platform</a>
            <a href="#workflow" className="hover:text-cyan-400 transition-colors">Workflow</a>
            <a href="#security" className="hover:text-cyan-400 transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('auth')}
              className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Login
            </button>
            <Button 
              onClick={() => onNavigate('auth')}
              className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl px-6 h-11 font-bold shadow-[0_0_20px_rgba(8,145,178,0.3)] border-none transition-all hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero / Sequence Section */}
      <section className="relative h-[400vh]"> {/* Extended height for scroll sequence */}
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          <ScrollSequence frameCount={160} className="absolute inset-0 z-0" />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 z-10 flex items-center bg-gradient-to-b md:bg-gradient-to-r from-[#020617]/90 via-[#020617]/60 md:via-transparent to-transparent pt-20 md:pt-0">
            <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
              <div className="hero-content flex flex-col gap-8">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest shadow-inner">
                    v2.0 Neural Engine
                  </span>
                  <div className="h-[1px] w-16 bg-slate-800" />
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider text-balance">AI Medical Transcription</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
                  Clinical <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
                    Precision
                  </span>
                </h1>

                <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-medium">
                  Autonomous medical documentation powered by real-time thoracic analysis and specialized clinical LLMs.
                </p>

                <div className="flex flex-wrap items-center gap-5 pt-4">
                  <Button 
                    onClick={() => onNavigate('auth')}
                    size="lg"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white h-16 px-10 text-xl font-black rounded-2xl shadow-[0_0_40px_rgba(8,145,178,0.4)] transition-all hover:scale-105"
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="ghost"
                    size="lg"
                    className="h-14 px-8 text-lg font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 rounded-2xl"
                  >
                    Watch Demo
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/5">
                  <div className="stat-box">
                    <div className="text-3xl font-black text-white">98.2%</div>
                    <div className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Accuracy</div>
                  </div>
                  <div className="stat-box">
                    <div className="text-3xl font-black text-white">~3.5h</div>
                    <div className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Time Saved</div>
                  </div>
                  <div className="stat-box">
                    <div className="text-3xl font-black text-white">SEC</div>
                    <div className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">HIPAA Ready</div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex flex-col items-end gap-6 pt-32">
                <div className="w-[380px] p-1 rounded-3xl bg-slate-900/40 backdrop-blur-3xl border border-white/5 shadow-2xl">
                  <AnalysisLog />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-20 bg-[#020617] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight reveal-text">
              Engineered for <br />
              <span className="text-cyan-400">High-Stake</span> Accuracy
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed reveal-text">
              Our neural infrastructure eliminates clinical fatigue by automating the most intensive administrative tasks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard 
              index={1}
              icon={<Zap className="w-10 h-10 text-cyan-400" />}
              title="Dynamic SOAP Generation"
              description="Real-time extraction of clinical entities into structured medical formats with 99.8% precision."
            />
            <FeatureCard 
              index={2}
              icon={<Heart className="w-10 h-10 text-blue-500" />}
              title="Bio-Insight Engine"
              description="Predictive risk modeling that analyzes patient history alongside current diagnostic data."
            />
            <FeatureCard 
              index={3}
              icon={<Award className="w-10 h-10 text-purple-500" />}
              title="Compliant Security"
              description="End-to-end encrypted neural pipelines certified for HIPAA and ISO global standards."
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-32 relative z-20 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight reveal-text">
                Autonomous <br />
                <span className="text-cyan-400 italic">Workflow.</span>
              </h2>
              <div className="space-y-10">
                <WorkflowStep 
                  number="01" 
                  title="Neural Capture" 
                  desc="Ambient recording of the encounter. AI ignores chatter and focuses on clinical data." 
                />
                <WorkflowStep 
                  number="02" 
                  title="Contextual Mapping" 
                  desc="Data is mapped to ICD-10 and CPT codes automatically for billing efficiency." 
                />
                <WorkflowStep 
                  number="03" 
                  title="Secure Sync" 
                  desc="Direct integration with your EMR via encrypted secure tunnels." 
                />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative glass rounded-[3rem] p-12 border border-white/10">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <div className="w-32 h-2 bg-slate-800 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-slate-800/50 rounded-full" />
                      <div className="h-3 w-4/5 bg-slate-800/50 rounded-full" />
                      <div className="h-3 w-full bg-slate-800/50 rounded-full" />
                    </div>
                    <div className="pt-8">
                      <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 font-mono text-xs text-cyan-400">
                        PROCESSING_SOAP_STRUCTURE... <br />
                        <span className="text-white/40 mt-2 block">Extracting Vitals... Done.</span>
                        <span className="text-white/40 block">Analyzing Risk... 1.2%</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
         </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-40 relative z-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-12 tracking-tighter reveal-text">
            Ready for the <span className="text-cyan-500">Next Era</span> <br />
            of Practice?
          </h2>
          <div className="flex flex-wrap justify-center gap-6 reveal-text">
            <Button 
              onClick={() => onNavigate('auth')}
              size="lg"
              className="bg-white text-slate-950 hover:bg-slate-100 h-20 px-14 text-2xl font-black rounded-3xl shadow-2xl transition-all hover:scale-110"
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="h-20 px-12 text-2xl font-bold rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-xl"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-slate-950 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-cyan-400" />
              <span className="text-2xl font-bold text-white tracking-tighter">AiroDx</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs font-medium">Precision autonomous documentation for modern healthcare practitioners.</p>
          </div>
          <div className="flex gap-12 text-xs font-bold uppercase tracking-widest text-slate-500">
            <button className="hover:text-cyan-400 transition-colors underline-offset-4 hover:underline">Privacy</button>
            <button className="hover:text-cyan-400 transition-colors underline-offset-4 hover:underline">Terms</button>
            <button className="hover:text-cyan-400 transition-colors underline-offset-4 hover:underline">Security</button>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            © 2025 AiroDx / All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ index, icon, title, description }: { index: number, icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="feature-card group relative p-10 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-cyan-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/5">
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="mb-10 p-5 bg-slate-800/30 rounded-2xl w-fit border border-white/5 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
        {icon}
      </div>
      <div className="text-[10px] font-black text-cyan-500/50 uppercase tracking-[0.3em] mb-4">Module_0{index}</div>
      <h3 className="text-2xl lg:text-3xl font-black text-white mb-6 tracking-tight group-hover:text-cyan-400 transition-colors">{title}</h3>
      <p className="text-slate-400 text-lg leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

function WorkflowStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-8 group reveal-text">
      <div className="text-3xl font-black text-slate-800 group-hover:text-cyan-500 transition-colors duration-500">{number}</div>
      <div className="space-y-2">
        <h4 className="text-2xl font-black text-white tracking-tight">{title}</h4>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

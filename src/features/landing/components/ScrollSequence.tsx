import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollSequenceProps {
  frameCount: number;
  className?: string;
}

export default function ScrollSequence({ frameCount, className }: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      // Format index with leading zeros (e.g., 001)
      const index = i.toString().padStart(3, '0');
      img.src = `/assets/frames/ezgif-frame-${index}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
      loadedImages[i - 1] = img;
    }
  }, [frameCount]);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Initial render
    const render = (index: number) => {
      const img = images[index];
      if (!img) return;

      // Use logical dimensions for clear and draw
      const w = window.innerWidth;
      const h = window.innerHeight;

      context.clearRect(0, 0, w, h);
      
      // Draw image and scale to cover
      const scale = Math.max(w / img.width, h / img.height);
      const x = (w / 2) - (img.width / 2) * scale;
      const y = (h / 2) - (img.height / 2) * scale;
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    // Set canvas dimensions with high DPI support
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      context.scale(dpr, dpr);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      render(0);
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    // GSAP ScrollTrigger
    const sequence = { frame: 0 };
    gsap.to(sequence, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300%', // Scroll length
        scrub: 1,
        pin: true,
        // markers: true, // For debugging
      },
      onUpdate: () => render(Math.round(sequence.frame))
    });

    return () => {
      window.removeEventListener('resize', updateSize);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [isLoaded, images, frameCount]);

  return (
    <div ref={containerRef} className={`relative w-full h-screen ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Preloading_Sequence...</span>
          </div>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full object-cover"
      />
    </div>
  );
}

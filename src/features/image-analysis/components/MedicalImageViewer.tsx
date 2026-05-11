
import { useState, useRef, useEffect } from 'react';
import {
    ZoomIn, ZoomOut, Move, RotateCcw,
    Maximize, Activity, Eye, EyeOff, Layers,
    ChevronRight, ChevronLeft, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Finding } from '@/services/imageAnalysis';

interface MedicalImageViewerProps {
    imageUrl: string | null;
    findings: Finding[];
    onFindingClick?: (findingId: string) => void;
    activeFindingId?: string | null;
    isLoading?: boolean;
}

export function MedicalImageViewer({
    imageUrl,
    findings,
    onFindingClick,
    activeFindingId,
    isLoading
}: MedicalImageViewerProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showOverlays, setShowOverlays] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset view when image changes
    useEffect(() => {
        handleReset();
    }, [imageUrl]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!containerRef.current) return;

            // Don't intercept keyboard shortcuts if the user is typing in an input or textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            switch (e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    setScale(prev => Math.min(prev + 0.25, 4));
                    break;
                case '-':
                    e.preventDefault();
                    setScale(prev => Math.max(prev - 0.25, 0.5));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setPosition(prev => ({ ...prev, y: prev.y + 20 }));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setPosition(prev => ({ ...prev, y: prev.y - 20 }));
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    setPosition(prev => ({ ...prev, x: prev.x + 20 }));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setPosition(prev => ({ ...prev, x: prev.x - 20 }));
                    break;
                case 'r':
                    e.preventDefault();
                    handleReset();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="flex flex-col h-full bg-black/95 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group">
            {/* Top Toolbar */}
            <div className="h-12 bg-card/10 backdrop-blur border-b border-white/10 flex items-center justify-between px-4 z-20" role="toolbar" aria-label="Image viewer controls">
                <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-cyan-400 opacity-70">SERIES: 1045</span>
                    <span className="text-xs font-mono text-white/40 mx-2">|</span>
                    <span className="text-xs font-mono text-cyan-400 opacity-70" aria-live="polite">ZOOM: {(scale * 100).toFixed(0)}%</span>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={handleZoomOut}
                        aria-label="Zoom out (-)">
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={handleZoomIn}
                        aria-label="Zoom in (+)">
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 hover:bg-white/10", showOverlays ? "text-cyan-400" : "text-white/70")}
                        onClick={() => setShowOverlays(!showOverlays)}
                        aria-label={showOverlays ? "Hide overlays" : "Show overlays"}
                        aria-pressed={showOverlays}
                    >
                        {showOverlays ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={handleReset}
                        aria-label="Reset view (r)">
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Viewport */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden relative cursor-move bg-[url('/grid-pattern.png')] bg-repeat"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {imageUrl ? (
                    <div
                        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        }}
                    >
                        <div className="relative shadow-2xl">
                            {/* The Image */}
                            <img
                                src={imageUrl}
                                alt="Medical Scan"
                                className="max-w-none pointer-events-none select-none"
                                style={{ maxHeight: '80vh', maxWidth: '80vw' }}
                            />

                            {/* Finding Overlays */}
                            {showOverlays && findings.map((finding) => (
                                <div
                                    key={finding.id}
                                    className={cn(
                                        "absolute border-2 transition-all duration-300 cursor-pointer group/overlay flex flex-col justify-end",
                                        activeFindingId === finding.id
                                            ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10"
                                            : "border-red-500/50 hover:border-red-400 hover:bg-red-500/10"
                                    )}
                                    style={{
                                        left: `${finding.region?.x}%`,
                                        top: `${finding.region?.y}%`,
                                        width: `${finding.region?.width}%`,
                                        height: `${finding.region?.height}%`
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFindingClick?.(finding.id);
                                    }}
                                >
                                    <div className={cn(
                                        "absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white rounded opacity-0 group-hover/overlay:opacity-100 transition-opacity whitespace-nowrap",
                                        activeFindingId === finding.id
                                            ? "bg-cyan-500 opacity-100"
                                            : "bg-red-500"
                                    )}>
                                        {finding.label} ({(finding.confidence * 100).toFixed(0)}%)
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4 select-none">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                <p className="font-mono text-sm animate-pulse">Running Neural Inference...</p>
                            </div>
                        ) : (
                            <>
                                <Activity className="w-16 h-16 opacity-20" />
                                <p className="font-medium text-lg">No Image Loaded</p>
                                <p className="text-sm">Select a case from the sidebar to begin</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Orientation Markers (Simulated) */}
            {imageUrl && (
                <>
                    <div className="absolute top-14 left-4 text-white/50 text-xs font-bold select-none">R</div>
                    <div className="absolute top-14 right-4 text-white/50 text-xs font-bold select-none">L</div>
                </>
            )}
        </div>
    );
}

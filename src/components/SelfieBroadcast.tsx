import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Camera, Image as ImageIcon, X, Video, SwitchCamera, Upload, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { api } from '../utils/api';
import { toast } from 'sonner';

export interface SelfieBroadcastRef {
    openUploadModal: () => void;
}

export const SelfieBroadcast = forwardRef<SelfieBroadcastRef, { userId: string, userName: string }>(({ userId, userName }, ref) => {
    const [activeSnaps, setActiveSnaps] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');

    // Camera Logic
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
        openUploadModal: () => setShowUpload(true)
    }));

    useEffect(() => {
        loadActiveSnaps();
        // Poll for updates every 30 seconds to keep list fresh
        const pollInterval = setInterval(loadActiveSnaps, 30000);
        return () => clearInterval(pollInterval);
    }, []);

    // Rotation timer: 2 minutes (120000ms)
    useEffect(() => {
        if (activeSnaps.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activeSnaps.length);
        }, 120000);

        return () => clearInterval(interval);
    }, [activeSnaps.length]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const loadActiveSnaps = async () => {
        try {
            const data = await api.getBestSelfie(); // This now returns an array
            // Ensure data is array
            setActiveSnaps(Array.isArray(data) ? data : (data ? [data] : []));
        } catch (error) {
            console.error('Failed to load active selfies', error);
        }
    };

    const handleNext = () => {
        if (activeSnaps.length > 0) {
            setCurrentIndex(prev => (prev + 1) % activeSnaps.length);
        }
    };

    const handlePrev = () => {
        if (activeSnaps.length > 0) {
            setCurrentIndex(prev => (prev - 1 + activeSnaps.length) % activeSnaps.length);
        }
    };

    const currentSnap = activeSnaps[currentIndex];

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            setShowCamera(true);
            // Wait for modal transition then attach stream
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play();
                }
            }, 100);
        } catch (err) {
            toast.error('Unable to access camera');
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                const width = videoRef.current.videoWidth;
                const height = videoRef.current.videoHeight;
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                context.drawImage(videoRef.current, 0, 0, width, height);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
                setImageUrl(dataUrl);
                stopCamera();
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit check client side
                toast.error('File too large. Max 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!imageUrl) return;
        setIsUploading(true);
        try {
            await api.submitSelfie({
                userId,
                userName,
                imageUrl,
                caption
            });
            toast.success('Snap Sent! Waiting for approval.');
            setShowUpload(false);
            setImageUrl('');
            setCaption('');
        } catch (error) {
            toast.error('Snap Failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative mb-10 group">
            {/* Hidden Canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Glowing Border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-orange)] to-purple-600 rounded-3xl opacity-30 group-hover:opacity-50 blur transition duration-500" />

            <div className="relative bg-stone-900 rounded-[22px] overflow-hidden border border-white/5 shadow-2xl h-[320px]">
                {/* Background Atmosphere */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--accent-orange)]/5 rounded-full -mr-[200px] -mt-[200px] blur-[100px]" />

                {currentSnap ? (
                    <div className="absolute inset-0 z-0">
                        <img src={currentSnap.imageUrl} alt="Best Snap" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 bg-[url('https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop')] bg-cover grayscale">
                        <div className="absolute inset-0 bg-stone-900/80" />
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <Camera size={48} className="text-white/50" />
                            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Broadcast Offline</p>
                        </div>
                    </div>
                )}

                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-orange)] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-orange)]"></span>
                                </span>
                                <p className="text-[10px] font-black text-[var(--accent-orange)] uppercase tracking-widest leading-none drop-shadow-md">Cafe live</p>
                            </div>
                            <h3 className="text-[24px] font-black text-white uppercase tracking-tight leading-none mt-1 drop-shadow-lg">
                                {currentSnap ? currentSnap.userName : 'Be the Icon'}
                            </h3>
                        </div>
                        {currentSnap && (
                            <div className="flex gap-2">
                                {activeSnaps.length > 1 && (
                                    <button
                                        onClick={() => setShowGrid(true)}
                                        className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1 text-white hover:bg-white/10 transition-colors"
                                    >
                                        <LayoutGrid size={12} className="text-[var(--accent-orange)]" />
                                        <span className="text-[10px] font-black tracking-widest uppercase">All</span>
                                    </button>
                                )}
                                <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                    <div className="flex items-center gap-1 text-white">
                                        <SwitchCamera size={12} className="text-[var(--accent-orange)]" />
                                        <span className="text-[10px] font-black tracking-widest uppercase">
                                            Snap {currentIndex + 1}/{activeSnaps.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {currentSnap && (
                            <>
                                <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 relative">
                                    <p className="text-white/90 text-[14px] font-medium leading-relaxed italic pr-8">
                                        "{currentSnap.caption}"
                                    </p>

                                    {/* Navigation Arrows (Only if multiple snaps) */}
                                    {activeSnaps.length > 1 && (
                                        <div className="absolute right-2 bottom-2 flex gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-95"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-95"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* Pagination Dots */}
                                {activeSnaps.length > 1 && (
                                    <div className="flex justify-center gap-1.5 absolute bottom-[-16px] left-0 right-0">
                                        {activeSnaps.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-[var(--accent-orange)]' : 'w-1.5 bg-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Upload/Camera Modal */}
                {showUpload && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="w-full max-w-sm bg-stone-900 rounded-[32px] border border-white/10 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative">

                            {/* Decorative background glow for modal */}
                            <div className="absolute top-0 inset-x-0 h-[200px] bg-gradient-to-b from-[var(--accent-orange)]/10 to-transparent pointer-events-none" />

                            {/* Header */}
                            <div className="p-6 pb-2 flex justify-between items-center relative z-10">
                                <div>
                                    <h4 className="text-[20px] font-black text-white uppercase tracking-tight leading-none">Broadcast</h4>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Capture the moment</p>
                                </div>
                                <button onClick={() => { setShowUpload(false); stopCamera(); }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6 overflow-y-auto no-scrollbar relative z-10">

                                {/* Camera View */}
                                {showCamera ? (
                                    <div className="relative rounded-[24px] overflow-hidden bg-black aspect-[3/4] shadow-2xl border border-white/10 group/cam">
                                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

                                        {/* Camera Overlay UI */}
                                        <div className="absolute inset-0 pointer-events-none border-[1px] border-white/20 rounded-[23px] m-4 opacity-50" />

                                        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-20">
                                            <button onClick={stopCamera} className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-all border border-white/10">
                                                <X size={20} />
                                            </button>
                                            <button
                                                onClick={capturePhoto}
                                                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-all hover:bg-white/10"
                                            >
                                                <div className="w-12 h-12 bg-white rounded-full group-hover/cam:scale-90 transition-transform" />
                                            </button>
                                            <button className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-all border border-white/10">
                                                <SwitchCamera size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Preview if image selected */}
                                        {imageUrl ? (
                                            <div className="relative rounded-[24px] overflow-hidden border border-white/10 aspect-video group shadow-2xl bg-black">
                                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <button
                                                        onClick={() => setImageUrl('')}
                                                        className="px-4 py-2 bg-black/50 backdrop-blur-md text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-500/80 transition-colors border border-white/20 flex items-center gap-2"
                                                    >
                                                        <X size={12} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={startCamera}
                                                    className="aspect-square rounded-[24px] bg-stone-800/50 hover:bg-stone-800 border border-white/5 flex flex-col items-center justify-center gap-3 transition-all group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent-orange)] to-rose-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <Camera size={24} className="text-white" />
                                                    </div>
                                                    <span className="text-[12px] font-black text-white uppercase tracking-wider">Camera</span>
                                                </button>

                                                <label className="aspect-square rounded-[24px] bg-stone-800/50 hover:bg-stone-800 border border-white/5 flex flex-col items-center justify-center gap-3 transition-all group cursor-pointer">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent-green)] to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <ImageIcon size={24} className="text-white" />
                                                    </div>
                                                    <span className="text-[12px] font-black text-white uppercase tracking-wider">Upload</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                                </label>
                                            </div>
                                        )}

                                        {/* Caption Input */}
                                        <div className="bg-stone-800/50 p-1 rounded-[20px] border border-white/5">
                                            <textarea
                                                placeholder="Add a caption to your snap..."
                                                className="w-full bg-transparent rounded-[16px] px-5 py-4 text-white text-[14px] outline-none font-medium resize-none h-28 placeholder:text-white/20 focus:bg-white/5 transition-colors"
                                                value={caption}
                                                onChange={(e) => setCaption(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            {!showCamera && (
                                <div className="p-6 pt-2 relative z-10">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!imageUrl || isUploading}
                                        className="w-full h-[64px] bg-white text-black rounded-2xl text-[14px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all hover:bg-gray-100"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Upload size={18} className="animate-bounce" />
                                                <span>Broadcasting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Live Broadcast</span>
                                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Grid View Modal */}
                {showGrid && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="w-full max-w-lg bg-stone-900 rounded-[32px] border border-white/10 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                            <div className="p-6 flex justify-between items-center bg-stone-900 border-b border-white/5">
                                <div>
                                    <h4 className="text-[20px] font-black text-white uppercase tracking-tight leading-none">All Snaps</h4>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Today's Broadcasts</p>
                                </div>
                                <button onClick={() => setShowGrid(false)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto no-scrollbar">
                                {activeSnaps.map((snap, idx) => (
                                    <button
                                        key={snap._id}
                                        onClick={() => { setCurrentIndex(idx); setShowGrid(false); }}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border border-white/10 group active:scale-95 transition-all ${idx === currentIndex ? 'ring-2 ring-[var(--accent-orange)]' : ''}`}
                                    >
                                        <img src={snap.imageUrl} className="w-full h-full object-cover" alt="snap" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <p className="text-[10px] font-black text-white truncate">{snap.userName}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

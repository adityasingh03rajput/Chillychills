import React, { useState, useEffect } from 'react';
import { Camera, Check, X, Trophy, Trash2, MonitorPlay } from 'lucide-react';
import { api } from '../utils/api';
import { toast } from 'sonner';

export const SelfieManager = () => {
    const [pendingSelfies, setPendingSelfies] = useState<any[]>([]);
    const [liveSnaps, setLiveSnaps] = useState<any[]>([]);

    useEffect(() => {
        loadPendingSelfies();
        loadLiveSnaps();
        const interval = setInterval(() => {
            loadPendingSelfies();
            loadLiveSnaps();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadPendingSelfies = async () => {
        try {
            const data = await api.getPendingSelfies();
            setPendingSelfies(data);
        } catch (error) {
            console.error('Failed to load pending selfies', error);
        }
    };

    const loadLiveSnaps = async () => {
        try {
            const data = await api.getBestSelfie();
            setLiveSnaps(Array.isArray(data) ? data : (data ? [data] : []));
        } catch (error) {
            console.error('Failed to load live snaps', error);
        }
    };

    const handleAction = async (id: string, action: 'approved' | 'rejected', isBest = false) => {
        try {
            await api.updateSelfieStatus(id, { status: action, isBest });
            toast.success(action === 'approved' ? (isBest ? 'Set as Snap of the Day!' : 'Approved!') : 'Rejected');
            loadPendingSelfies();
            loadLiveSnaps();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteSelfie(id);
            toast.success('Snap Junked!');
            loadPendingSelfies();
            loadLiveSnaps();
        } catch (error) {
            toast.error('Failed to junk snap');
        }
    };

    return (
        <div className="space-y-8">
            {/* Live Section */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <h2 className="text-[16px] font-black text-white uppercase tracking-tight">Live On Air ({liveSnaps.length}/6)</h2>
                </div>

                {liveSnaps.length > 0 && (
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8">
                        {liveSnaps.map((snap) => (
                            <div key={snap._id} className="bg-stone-900 rounded-xl overflow-hidden border border-red-500/20 shadow-lg group relative">
                                <div className="h-32">
                                    <img src={snap.imageUrl} alt="Live Snap" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-2">
                                        <p className="text-white font-bold uppercase text-[10px] truncate">{snap.userName}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(snap._id)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 text-white rounded-md flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                                        title="Remove from Broadcast"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-full h-px bg-white/5" />
            <div className="mb-6">
                <h2 className="text-[20px] font-black text-white uppercase tracking-tight">Snap Approvals</h2>
                <p className="text-[12px] font-black text-white/30 uppercase tracking-widest mt-1">Cafe Live Broadcast</p>
            </div>

            {pendingSelfies.length === 0 ? (
                <div className="bg-stone-900 p-8 rounded-xl text-center border border-white/5 opacity-20">
                    <Camera size={32} className="mx-auto mb-4" />
                    <p className="text-[12px] font-black uppercase tracking-widest">No Pending Snaps</p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {pendingSelfies.map((selfie) => (
                        <div key={selfie._id} className="bg-stone-900 rounded-xl overflow-hidden border border-white/5 shadow-lg group">
                            <div className="h-48 relative">
                                <img src={selfie.imageUrl} alt="User Snap" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                    <p className="text-white font-black uppercase text-[14px]">{selfie.userName}</p>
                                    {selfie.caption && (
                                        <p className="text-white/60 text-[10px] italic line-clamp-1">"{selfie.caption}"</p>
                                    )}
                                </div>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleDelete(selfie._id)}
                                    className="h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
                                    title="Junk (Delete)"
                                >
                                    <Trash2 size={18} />
                                    <span className="text-xs font-bold uppercase">Junk</span>
                                </button>
                                <button
                                    onClick={() => handleAction(selfie._id, 'approved', true)}
                                    className="h-10 rounded-lg bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/20 text-[var(--accent-orange)] flex items-center justify-center gap-2 hover:bg-[var(--accent-orange)]/20 transition-all group-hover:scale-105"
                                    title="Display (Approve & Broadcast)"
                                >
                                    <MonitorPlay size={18} />
                                    <span className="text-xs font-bold uppercase">Display</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

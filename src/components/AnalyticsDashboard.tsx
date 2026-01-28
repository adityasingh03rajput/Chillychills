import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Users, TrendingUp, Award, Clock, Star,
    BarChart2, PieChart, Activity, UserCheck,
    Zap, ChefHat, X
} from 'lucide-react';
import { api } from '../utils/api';
import { toast } from 'sonner';

interface AnalyticsDashboardProps {
    onClose: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'menu' | 'staff'>('overview');
    const [loading, setLoading] = useState(true);

    // Data State
    const [realTimeStats, setRealTimeStats] = useState<any>(null);
    const [customerStats, setCustomerStats] = useState<any>(null);
    const [popularItems, setPopularItems] = useState<any[]>([]);
    const [employeeStats, setEmployeeStats] = useState<any>(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [rt, cust, pop, emp] = await Promise.all([
                api.getRealTimeStats(),
                api.getCustomerBehavior(),
                api.getPopularItems(5),
                api.getEmployeePerformance()
            ]);

            setRealTimeStats(rt);
            setCustomerStats(cust);
            setPopularItems(pop);
            setEmployeeStats(emp);
        } catch (error) {
            console.error('Analytics fetch error:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-orange)]" />
            </div>
        );
    }

    const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 p-5 rounded-xl border border-white/5 relative overflow-hidden flex flex-col gap-1 shadow-lg"
        >
            <div className="flex items-center gap-2 mb-2 opacity-40">
                <Icon size={14} className="text-white" />
                <p className="text-[12px] font-black uppercase tracking-widest">{label}</p>
            </div>
            <h3 className="text-[28px] font-black text-white tabular-nums leading-none tracking-tight">{value}</h3>
            {subValue && <p className="text-[12px] font-bold text-white/20 uppercase tracking-widest mt-1">{subValue}</p>}
        </motion.div>
    );

    return (
        <div className="h-full flex flex-col bg-black overflow-hidden pt-safe">
            {/* Header (56dp Material App Bar) */}
            <div className="h-[64px] px-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-stone-900/50 backdrop-blur-xl">
                <div>
                    <h2 className="text-[20px] font-black text-white tracking-tight uppercase leading-none">Intelligence Hub</h2>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Real-Time Pulse</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
                >
                    <X size={20} strokeWidth={3} />
                </button>
            </div>

            {/* Tab Navigation (48dp height selectors) */}
            <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0 border-b border-white/5">
                {[
                    { id: 'overview', label: 'Pulse', icon: Zap },
                    { id: 'customers', label: 'Users', icon: Users },
                    { id: 'menu', label: 'Menu', icon: Star },
                    { id: 'staff', label: 'Staff', icon: ChefHat },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`h-[40px] px-5 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2 border-2 ${activeTab === tab.id
                            ? 'bg-white text-black border-white'
                            : 'bg-stone-900 text-white/40 border-white/5'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content (24dp screen padding) */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">

                {/* Overview Tab */}
                {activeTab === 'overview' && realTimeStats && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                icon={Zap}
                                label="Active Tasks"
                                value={realTimeStats.activeOrders}
                                subValue="Kitchen Matrix"
                                color="from-orange-500 to-red-600"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Daily Yield"
                                value={`₹${realTimeStats.todayRevenue.toLocaleString()}`}
                                subValue={`${realTimeStats.todayOrders} Signals`}
                                color="from-emerald-500 to-teal-600"
                            />
                            <StatCard
                                icon={Clock}
                                label="Process Latency"
                                value="18m"
                                subValue="Standard Avg"
                                color="from-blue-500 to-indigo-600"
                            />
                            <StatCard
                                icon={UserCheck}
                                label="Retention"
                                value={`${customerStats?.customerRetentionRate}%`}
                                subValue="Recursive User"
                                color="from-purple-500 to-pink-600"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-[var(--accent-orange)] rounded-full" />
                                <h3 className="text-[18px] font-black text-white uppercase tracking-tight">Top Transmissions</h3>
                            </div>
                            <div className="bg-stone-900 rounded-xl border border-white/5 overflow-hidden">
                                {popularItems.map((item, idx) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-none group">
                                        <div className="w-8 h-8 flex items-center justify-center font-black text-white/20 text-[12px] border border-white/10 rounded-lg">
                                            0{idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-white text-[14px] uppercase truncate">{item.name}</div>
                                            <div className="text-[10px] text-white/30 font-black uppercase mt-0.5">{item.totalQuantity} Volume</div>
                                        </div>
                                        <div className="font-black text-[var(--accent-green)] text-[16px]">
                                            ₹{item.totalRevenue.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-stone-900 p-6 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity size={18} className="text-[var(--accent-orange)]" />
                                <h3 className="text-[18px] font-black text-white uppercase tracking-tight">System Core</h3>
                            </div>
                            {employeeStats && (
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <div className="text-[48px] font-black text-white tracking-tighter leading-none mb-2">
                                            {employeeStats.efficiency}%
                                        </div>
                                        <div className="text-[12px] font-black text-white/20 uppercase tracking-widest">Global Capacity</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                                            <div className="text-[18px] font-black text-[var(--accent-green)]">{employeeStats.statusBreakdown.completed}</div>
                                            <div className="text-[10px] font-black text-white/20 uppercase mt-1">Sync</div>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                                            <div className="text-[18px] font-black text-[var(--accent-orange)]">{employeeStats.statusBreakdown.preparing}</div>
                                            <div className="text-[10px] font-black text-white/20 uppercase mt-1">Flow</div>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                                            <div className="text-[18px] font-black text-red-500">{employeeStats.statusBreakdown.cancelled}</div>
                                            <div className="text-[10px] font-black text-white/20 uppercase mt-1">Fault</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Customers Tab */}
                {activeTab === 'customers' && customerStats && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { label: 'Total Matrix Users', val: customerStats.totalCustomers, icon: Users, color: 'text-indigo-500' },
                                { label: 'Recursive Nodes', val: customerStats.repeatCustomers, icon: Target, color: 'text-[var(--accent-orange)]' },
                                { label: 'Avg Frequency', val: customerStats.averageOrdersPerCustomer, icon: Activity, color: 'text-[var(--accent-green)]' }
                            ].map((s, idx) => (
                                <div key={idx} className="bg-stone-900 p-6 rounded-xl border border-white/5 flex items-center justify-between shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center ${s.color}`}>
                                            <s.icon size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black text-white/20 uppercase tracking-widest">{s.label}</p>
                                            <h4 className="text-[28px] font-black text-white tabular-nums leading-none tracking-tight">{s.val}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-[var(--accent-orange)] rounded-full" />
                                <h3 className="text-[18px] font-black text-white uppercase tracking-tight">Priority Nodes</h3>
                            </div>
                            <div className="bg-stone-900 rounded-xl border border-white/5 overflow-hidden">
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-black/50">
                                                <th className="p-4 text-[10px] font-black text-white/20 uppercase tracking-widest">ID</th>
                                                <th className="p-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Vol</th>
                                                <th className="p-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Yield</th>
                                                <th className="p-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Avg</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {customerStats.topCustomers.map((c: any) => (
                                                <tr key={c.userId} className="active:bg-stone-800">
                                                    <td className="p-4 text-[12px] font-black text-white uppercase font-mono">{c.userId.slice(-6)}</td>
                                                    <td className="p-4 text-[12px] font-black text-white">{c.orderCount}</td>
                                                    <td className="p-4 text-[14px] font-black text-[var(--accent-green)] tabular-nums">₹{c.totalSpent.toLocaleString()}</td>
                                                    <td className="p-4 text-[12px] font-black text-white/40 text-right tabular-nums">₹{c.averageOrderValue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

import { Target } from 'lucide-react';

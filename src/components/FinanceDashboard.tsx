import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Clock, Award, AlertCircle, FileSpreadsheet, FileText, X } from 'lucide-react';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { Button } from './ui/Button';

interface BalanceData {
    year: number;
    month: number;
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    refundedAmount: number;
    averageOrderValue: number;
    ordersByBranch: Record<string, number>;
    revenueByCategory: Record<string, number>;
    peakHours: Record<string, number>;
    lastUpdated: number;
}

interface FinanceDashboardProps {
    onClose: () => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ onClose }) => {
    const [balance, setBalance] = useState<BalanceData | null>(null);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [balanceData, summaryData] = await Promise.all([
                api.getCurrentBalance(),
                api.getBalanceSummary()
            ]);
            setBalance(balanceData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            toast.error('Failed to load financial data');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!balance) return;
        try {
            exportToExcel(balance, summary);
            toast.success('📊 Excel report downloaded!');
        } catch (error) {
            console.error('Export  error:', error);
            toast.error('Failed to export Excel');
        }
    };

    const handleExportPDF = () => {
        if (!balance) return;
        try {
            exportToPDF(balance);
            toast.success('📄 PDF report downloaded!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export PDF');
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMonthName = (month: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 p-5 rounded-xl border border-white/5 relative overflow-hidden flex flex-col gap-1 shadow-lg"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-white/5 border border-white/5`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${trend > 0 ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]' : 'bg-red-500/10 text-red-500'}`}>
                        {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="text-[12px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{label}</div>
            <div className="text-[28px] font-black text-white tabular-nums leading-none tracking-tight">{value}</div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-orange)]" />
            </div>
        );
    }

    if (!balance) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 bg-black">
                <AlertCircle className="w-12 h-12 text-white/10" />
                <p className="text-[14px] font-black text-white/20 uppercase tracking-widest">No spectral data found</p>
                <Button onClick={onClose} className="bg-white text-black text-[12px] uppercase h-[56px] px-8 rounded-xl font-black">Abort</Button>
            </div>
        );
    }

    const completionRate = balance.totalOrders > 0
        ? Math.round((balance.completedOrders / balance.totalOrders) * 100)
        : 0;

    const categoryEntries = Object.entries(balance.revenueByCategory || {});
    const branchEntries = Object.entries(balance.ordersByBranch || {});
    const peakHoursEntries = Object.entries(balance.peakHours || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
        <div className="h-full flex flex-col bg-black overflow-hidden pt-safe">
            {/* Header (56dp Material App Bar) */}
            <div className="h-[64px] px-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-stone-900/50 backdrop-blur-xl">
                <div>
                    <h2 className="text-[20px] font-black text-white tracking-tight uppercase leading-none">Earnings Report</h2>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{getMonthName(balance.month)} {balance.year} Summary</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Content (24dp screen padding) */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">

                {/* Export Control Array */}
                <div className="flex gap-2">
                    <button
                        onClick={handleExportExcel}
                        className="flex-1 h-[56px] bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-emerald-900/20"
                    >
                        <FileSpreadsheet size={18} />
                        <span className="text-[12px] font-black uppercase tracking-widest">Excel File</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex-1 h-[56px] bg-red-600 text-white rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-red-900/20"
                    >
                        <FileText size={18} />
                        <span className="text-[12px] font-black uppercase tracking-widest">PDF File</span>
                    </button>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        icon={DollarSign}
                        label="Total Revenue"
                        value={formatCurrency(balance.totalRevenue)}
                        color="from-emerald-500 to-teal-600"
                    />
                    <StatCard
                        icon={ShoppingCart}
                        label="Total Orders"
                        value={balance.totalOrders}
                        color="from-blue-500 to-indigo-600"
                    />
                    <StatCard
                        icon={Award}
                        label="Success Rate"
                        value={`${completionRate}%`}
                        trend={completionRate >= 80 ? 12 : -8}
                        color="from-purple-500 to-pink-600"
                    />
                    <StatCard
                        icon={Users}
                        label="Avg. per Order"
                        value={formatCurrency(balance.averageOrderValue)}
                        color="from-orange-500 to-red-600"
                    />
                </div>
                {/* Explanation helper */}
                <p className="text-[10px] text-white/30 font-medium px-1">
                    * Avg. per Order: The average amount spent on each order this month.
                </p>

                {/* Status Breakdown Action Block */}
                <div className="bg-stone-900 p-6 rounded-xl border border-white/5 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <ShoppingCart size={18} className="text-[var(--accent-orange)]" />
                        <h3 className="text-[18px] font-black text-white uppercase tracking-tight">Order Status</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-[20px] font-black text-[var(--accent-green)]">{balance.completedOrders}</div>
                            <div className="text-[10px] font-black text-white/20 uppercase mt-1">Done</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-[20px] font-black text-red-500">{balance.cancelledOrders}</div>
                            <div className="text-[10px] font-black text-white/20 uppercase mt-1">Cancelled</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-[18px] font-black text-[var(--accent-orange)]">
                                {formatCurrency(balance.refundedAmount)}
                            </div>
                            <div className="text-[10px] font-black text-white/20 uppercase mt-1">Refunded</div>
                        </div>
                    </div>
                </div>

                {/* Category Yield Matrix */}
                {categoryEntries.length > 0 && (
                    <div className="bg-stone-900 p-6 rounded-xl border border-white/5 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <DollarSign size={18} className="text-[var(--accent-green)]" />
                            <h3 className="text-[18px] font-black text-white uppercase tracking-tight">Sales by Category</h3>
                        </div>
                        <div className="space-y-6">
                            {categoryEntries.map(([category, revenue], index) => {
                                const percentage = (revenue / balance.totalRevenue) * 100;
                                return (
                                    <div key={category} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] font-black text-white/40 uppercase tracking-widest">{category}</span>
                                            <span className="text-[14px] font-black text-white tabular-nums">
                                                {formatCurrency(revenue)}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-green)]"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Peak Temporal Nodes */}
                {peakHoursEntries.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-[var(--accent-orange)] rounded-full" />
                            <h3 className="text-[18px] font-black text-white uppercase tracking-tight">Busy Hours</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {peakHoursEntries.map(([hour, count]) => (
                                <div key={hour} className="h-[64px] rounded-xl bg-stone-900 flex items-center justify-between px-6 border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                                            <Clock size={16} className="text-[var(--accent-orange)]" />
                                        </div>
                                        <span className="text-[16px] font-black text-white/40 uppercase">{hour}</span>
                                    </div>
                                    <span className="text-[18px] font-black text-white tabular-nums">{count} ORDERS</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pb-10 opacity-20 text-[10px] font-black uppercase tracking-[0.4em] text-center">
                    End of Monthly Report
                </div>
            </div>
        </div>
    );
};

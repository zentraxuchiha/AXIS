"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import GradientLineGraph from "@/components/GradientLineGraph";

export default function ExpensePage() {
    const { data: expenses, mutate: mutateExpenses, error: expError } = useSWR("/api/expenses", fetcher);
    const { data: incomes, mutate: mutateIncomes, error: incError } = useSWR("/api/income", fetcher);

    const [isAddingMode, setIsAddingMode] = useState<"none" | "expense" | "income">("none");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoading = !expenses || !incomes;
    const isError = expError || incError;

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category) return;

        setIsSubmitting(true);
        const endpoint = isAddingMode === "expense" ? "/api/expenses" : "/api/income";

        await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: parseFloat(amount),
                category: category.toUpperCase(),
            }),
        });

        setAmount("");
        setCategory("");
        setIsAddingMode("none");
        setIsSubmitting(false);
        mutateExpenses();
        mutateIncomes();
    };

    const handleDeleteEntry = async (id: string, type: 'expense' | 'income') => {
        if (!confirm("PURGE THIS RECORD?")) return;
        const endpoint = type === 'expense' ? `/api/expenses/${id}` : `/api/income/${id}`;
        await fetch(endpoint, { method: "DELETE" });
        mutateExpenses();
        mutateIncomes();
    };

    const sortedEntries = useMemo(() => {
        const all = [
            ...(expenses || []).map((e: any) => ({ ...e, type: 'expense' })),
            ...(incomes || []).map((i: any) => ({ ...i, type: 'income' }))
        ];
        return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, incomes]);

    const stats = useMemo(() => {
        const totalExp = (expenses || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);
        const totalInc = (incomes || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);
        return {
            expense: totalExp,
            income: totalInc,
            balance: totalInc - totalExp
        };
    }, [expenses, incomes]);

    const graphData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); // 0-indexed

        // Initialize an array for months up to current month
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const monthlyData = [];

        for (let i = 0; i <= currentMonth; i++) {
            // Filter entries for this specific month and current year
            const monthEntries = sortedEntries.filter(entry => {
                const d = new Date(entry.date);
                return d.getFullYear() === currentYear && d.getMonth() === i;
            });

            const netBalance = monthEntries.reduce((acc, curr) => {
                return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
            }, 0);

            monthlyData.push({
                label: monthNames[i],
                value: netBalance
            });
        }

        return monthlyData;
    }, [sortedEntries]);

    if (isLoading) {
        return (
            <div className="pt-32 text-white text-xs tracking-widest uppercase animate-pulse">
                Syncing Ledger…
            </div>
        );
    }

    return (
        <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 relative pb-20">
            {/* Header */}
            <header className="relative pt-6 md:pt-12 pb-8 border-b border-white/20">
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight uppercase bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-none">
                        Capital
                    </h1>
                    <p className="mt-4 text-white/40 text-[0.6rem] md:text-xs tracking-widest uppercase font-bold">
                        Wealth Defense & Growth.
                    </p>
                </div>
            </header>

            {/* Analytics Section */}
            <section className="border border-white/10 p-4 md:p-8 bg-black/40 backdrop-blur-sm relative overflow-hidden">
                <div className="h-32 md:h-44 mb-8 md:mb-12">
                    <GradientLineGraph
                        data={graphData}
                        strokeColor="#ffffff"
                        gradientStart="rgba(255,255,255,0.1)"
                    />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <p className="text-white/40 text-[0.5rem] md:text-[0.6rem] font-black uppercase tracking-[0.3em] mb-2">Net Balance</p>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums text-white leading-none">
                            ₹{stats.balance.toLocaleString()}
                        </h2>
                    </div>
                    <div className="w-full md:w-auto text-left md:text-right">
                        <p className="text-white/20 text-[0.5rem] font-black uppercase tracking-[0.3em] mb-2">Financial Momentum</p>
                        <div className="flex gap-6 md:gap-4 overflow-x-auto no-scrollbar">
                            <div className="text-white/60 flex-shrink-0">
                                <span className="text-[0.6rem] block font-bold mb-1">INCOME</span>
                                <span className="font-black text-sm text-white">₹{stats.income.toLocaleString()}</span>
                            </div>
                            <div className="text-white/60 flex-shrink-0">
                                <span className="text-[0.6rem] block font-bold mb-1">EXPENSE</span>
                                <span className="font-black text-sm text-white">₹{stats.expense.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Control Panel */}
                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => setIsAddingMode(isAddingMode === "income" ? "none" : "income")}
                            className={`flex-1 border-2 py-4 text-[0.65rem] font-black uppercase tracking-widest transition-all
                                ${isAddingMode === "income" ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white/60"}`}
                        >
                            + Add Income
                        </button>
                        <button
                            onClick={() => setIsAddingMode(isAddingMode === "expense" ? "none" : "expense")}
                            className={`flex-1 border-2 py-4 text-[0.65rem] font-black uppercase tracking-widest transition-all
                                ${isAddingMode === "expense" ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white/60"}`}
                        >
                            - Log Expense
                        </button>
                    </div>

                    {isAddingMode !== "none" && (
                        <form
                            onSubmit={handleAddEntry}
                            className="space-y-6 border-2 border-white p-6 md:p-8 animate-in slide-in-from-top-4 bg-white/5"
                        >
                            <h3 className="text-white text-xs md:text-sm font-black uppercase tracking-widest">
                                New {isAddingMode} Entry
                            </h3>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="AMOUNT (₹)"
                                className="w-full bg-transparent border-b-2 border-white/20 px-0 py-3 text-white text-xl md:text-2xl font-black placeholder:text-white/40 focus:outline-none focus:border-white transition-colors"
                                autoFocus
                            />
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="CATEGORY / SOURCE"
                                className="w-full bg-transparent border-b-2 border-white/20 px-0 py-3 text-white font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase placeholder:text-white/40 focus:outline-none focus:border-white transition-colors text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-white text-black py-4 font-black uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-white/90 disabled:opacity-50 transition-all font-sans text-[0.65rem]"
                            >
                                {isSubmitting ? "TRANSMITTING..." : `CONFIRM ${isAddingMode}`}
                            </button>
                        </form>
                    )}

                    <div className="border border-white/10 p-6">
                        <h4 className="text-white/40 text-[0.5rem] md:text-[0.6rem] font-black uppercase tracking-[0.3em] mb-4">Financial Guidelines</h4>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-white/60 text-[0.55rem] md:text-[0.65rem] font-bold uppercase tracking-widest leading-loose italic">
                                <span>/</span> Maintain a 30% savings rate for tactical reserves.
                            </li>
                            <li className="flex gap-3 text-white/60 text-[0.55rem] md:text-[0.65rem] font-bold uppercase tracking-widest leading-loose italic">
                                <span>/</span> Audit high-leakage categories weekly.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Ledger */}
                <section className="border border-white/10 flex flex-col max-h-[500px] md:max-h-[600px]">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <span className="text-white/60 text-[0.6rem] md:text-xs tracking-[0.3em] uppercase font-bold">Registry</span>
                        <span className="text-white/20 text-[0.5rem] font-black uppercase tracking-[0.2em]">{sortedEntries.length} EVENTS</span>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {sortedEntries.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-white/40 text-[0.6rem] md:text-xs tracking-widest uppercase py-20">
                                No capital records found
                            </div>
                        ) : (
                            <ul className="divide-y divide-white/10">
                                {sortedEntries.map((entry: any) => (
                                    <li
                                        key={entry._id}
                                        className="px-6 py-4 md:py-5 flex justify-between items-center hover:bg-white/5 transition group"
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-white font-black text-[0.65rem] md:text-xs uppercase tracking-widest group-hover:tracking-[0.15em] transition-all truncate">
                                                {entry.category}
                                            </span>
                                            <span className="text-white/30 text-[0.5rem] md:text-[0.55rem] font-bold uppercase tracking-widest mt-1">
                                                {new Date(entry.date).toLocaleDateString()} / {entry.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <span className="tabular-nums font-black text-xs md:text-sm text-white">
                                                {entry.type === 'income' ? "+" : "-"}₹{entry.amount.toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteEntry(entry._id, entry.type)}
                                                className="text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
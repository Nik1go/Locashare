"use client";

import { useState } from "react";
import { createBooking } from "@/app/actions/booking";
import { Calendar } from "lucide-react";

export default function BookingForm({ toolId, pricePerDay }: { toolId: string, pricePerDay: number }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le premier jour
        return diffDays > 0 ? diffDays * pricePerDay : 0;
    };

    const total = calculateTotal();

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            setMessage({ type: 'error', text: "Veuillez sélectionner les dates de réservation." });
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            setMessage({ type: 'error', text: "La date de fin ne peut pas être avant la date de début." });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        const result = await createBooking(toolId, start, end, total);

        if (result.success) {
            setMessage({ type: 'success', text: "Réservation confirmée avec succès !" });
            setStartDate("");
            setEndDate("");
        } else {
            setMessage({ type: 'error', text: result.error || "Une erreur s'est produite." });
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleBooking} className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            {total > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg mt-2 mb-2 border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600 font-medium">Prix unitaire</span>
                        <span className="text-slate-900 font-semibold">{pricePerDay}€ / j</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                        <span className="text-slate-800 font-bold">Total TTC</span>
                        <span className="text-blue-600 font-black text-xl">{total}€</span>
                    </div>
                </div>
            )}

            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || !startDate || !endDate}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2"
            >
                <Calendar size={20} />
                {isLoading ? "Réservation en cours..." : "Réserver cet outil"}
            </button>
        </form>
    );
}

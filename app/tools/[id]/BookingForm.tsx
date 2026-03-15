"use client";

import { useState } from "react";
import { createReservation } from "@/app/actions/booking";
import { deleteTool, updateToolPrice } from "@/app/actions/toolActions";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Lock, Trash2, Info, Edit2, Check, X, AlertTriangle, Settings } from "lucide-react";
import Link from "next/link";
import Calendar from "@/app/components/Calendar";
import { DateRange } from "react-day-picker";
import { format, differenceInDays, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { isRangeAvailable } from "@/lib/calendar-utils";

export default function BookingForm({
    toolId,
    pricePerDay,
    isLoggedIn,
    isOwner = false,
    bookedDates = []
}: {
    toolId: string,
    pricePerDay: number,
    isLoggedIn: boolean,
    isOwner?: boolean,
    bookedDates?: any[]
}) {
    const [range, setRange] = useState<DateRange | undefined>();
    const [proposedPrice, setProposedPrice] = useState<number | undefined>();
    const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    // Owner management state
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [newPrice, setNewPrice] = useState(pricePerDay);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const minPrice = pricePerDay ? 0.8 * pricePerDay : 0;

    const calculateTotal = () => {
        if (!range?.from || !range?.to) return 0;
        const diffDays = differenceInDays(range.to, range.from) + 1;
        return diffDays > 0 ? diffDays * pricePerDay : 0;
    };

    const total = calculateTotal();

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn) return;

        if (!range?.from || !range?.to) {
            setMessage({ type: 'error', text: "Veuillez sélectionner une période sur le calendrier." });
            return;
        }

        // Check for overlaps
        if (!isRangeAvailable({ from: range.from, to: range.to }, bookedDates)) {
            setMessage({ type: 'error', text: "Certaines dates dans votre sélection sont déjà réservées." });
            return;
        }

        if (proposedPrice && !isOwner) {
            const diffDays = differenceInDays(range.to, range.from) + 1;
            const absoluteMin = Math.round(diffDays * pricePerDay * 0.8);
            if (proposedPrice < absoluteMin) {
                setMessage({ type: 'error', text: `Le prix proposé ne peut pas être inférieur à ${absoluteMin}DT ` });
                return;
            }
        }

        setIsLoading(true);
        setMessage(null);

        const result = await createReservation(toolId, range.from, range.to, total, proposedPrice);

        if (result.success && result.conversationId) {
            setMessage({ type: 'success', text: isOwner ? "Dates bloquées avec succès !" : "Réservation confirmée ! Redirection..." });
            // Redirection immédiate vers la conversation
            router.push(`/conversations/${result.conversationId}`);
        } else {
            setMessage({ type: 'error', text: result.error || "Une erreur s'est produite." });
            setIsLoading(false);
        }
    };

    const handleUpdatePrice = async () => {
        if (newPrice === pricePerDay) {
            setIsEditingPrice(false);
            return;
        }

        setIsLoading(true);
        const result = await updateToolPrice(toolId, newPrice);
        if (result.success) {
            setMessage({ type: 'success', text: "Prix mis à jour avec succès !" });
            setIsEditingPrice(false);
            router.refresh();
        } else {
            setMessage({ type: 'error', text: result.error || "Erreur lors de la mise à jour." });
        }
        setIsLoading(false);
    };

    const handleDelete = async () => {
        setIsLoading(true);
        const result = await deleteTool(toolId);
        if (result.success) {
            router.push("/dashboard");
        } else {
            setMessage({ type: 'error', text: result.error || "Erreur lors de la suppression." });
            setIsLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="flex flex-col gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center text-center gap-3">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                        <Lock size={24} />
                    </div>
                    <div>
                        <p className="text-amber-900 font-bold">Connexion requise</p>
                        <p className="text-amber-800 text-sm mt-1">
                            Vous devez être connecté pour pouvoir réserver cet outil.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                        Se connecter
                    </Link>
                    <Link
                        href="/register"
                        className="text-blue-600 hover:underline text-sm font-medium"
                    >
                        Créer un compte gratuitement
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {isOwner && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Settings size={16} className="text-blue-600" />
                        Gestion de l'annonce
                    </h3>
                    
                    {/* Modification du prix */}
                    <div className="flex flex-col gap-3 pb-4 border-b border-slate-200 mb-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">Prix par jour</label>
                        <div className="flex items-center gap-2">
                            {isEditingPrice ? (
                                <>
                                    <div className="relative flex-grow">
                                        <input
                                            type="number"
                                            value={newPrice}
                                            onChange={(e) => setNewPrice(Number(e.target.value))}
                                            className="w-full bg-white border-2 border-blue-500 rounded-lg px-3 py-2 text-sm font-bold outline-none"
                                            autoFocus
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">DT</span>
                                    </div>
                                    <button 
                                        onClick={handleUpdatePrice}
                                        disabled={isLoading}
                                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button 
                                        onClick={() => { setIsEditingPrice(false); setNewPrice(pricePerDay); }}
                                        className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl font-black text-slate-900">{pricePerDay}DT <span className="text-sm font-medium text-slate-500">/ jour</span></span>
                                    <button 
                                        onClick={() => setIsEditingPrice(true)}
                                        className="ml-auto text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Suppression */}
                    {showDeleteConfirm ? (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-lg animate-in fade-in zoom-in duration-200">
                            <p className="text-xs text-red-800 font-bold mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} />
                                Êtes-vous sûr ? Cette action est irréversible.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-grow bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                                >
                                    {isLoading ? "Suppression..." : "Confirmer la suppression"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 text-xs font-bold py-2 px-3 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                        >
                            <Trash2 size={14} />
                            Supprimer cette annonce
                        </button>
                    )}
                </div>
            )}

            <form onSubmit={handleBooking} className="flex flex-col gap-5">
                <div>
                    <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <CalendarIcon size={18} className="text-blue-600" />
                        {isOwner ? "Bloquer des dates d'indisponibilité" : "Choisir vos dates"}
                    </label>

                    <Calendar
                        bookedDates={bookedDates}
                        selectedRange={range}
                        onRangeChange={(newRange) => {
                            setRange(newRange);
                            setMessage(null);
                        }}
                        className="mx-auto"
                    />
                </div>

                {range?.from && range?.to ? (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                        <div className="flex justify-between items-center text-sm font-medium text-blue-900 mb-2">
                            <span>Période sélectionnée</span>
                            <span className="bg-blue-200 px-2 py-0.5 rounded text-xs">
                                {differenceInDays(range.to, range.from) + 1} jours
                            </span>
                        </div>
                        <div className="text-blue-800 text-sm font-bold flex items-center justify-between">
                            <span>{format(range.from, 'dd MMM', { locale: fr })}</span>
                            <div className="h-px flex-grow mx-4 bg-blue-200"></div>
                            <span>{format(range.to, 'dd MMM yyyy', { locale: fr })}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
                        <Info size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {isOwner 
                                ? "Sélectionnez une période pour la rendre indisponible à la location (ex: entretien, utilisation personnelle)." 
                                : "Cliquez sur le premier jour puis le dernier jour de votre souhait de location. Les jours déjà réservés sont grisés."}
                        </p>
                    </div>
                )}

                {total > 0 && !isOwner && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-600 font-medium">Prix unitaire</span>
                                <span className="text-slate-900 font-semibold">{pricePerDay}DT / j</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                <span className="text-slate-800 font-bold">Total TTC (Standard)</span>
                                <span className="text-slate-500 font-bold">{total}DT</span>
                            </div>
                        </div>

                        <div className="border border-blue-100 rounded-lg overflow-hidden transition-all duration-300">
                            <button
                                type="button"
                                onClick={() => setIsNegotiationOpen(!isNegotiationOpen)}
                                className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/50 transition-colors"
                            >
                                <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                                    Proposer un prix (Facultatif)
                                </span>
                                <div className={`transition-transform duration-200 ${isNegotiationOpen ? 'rotate-180' : ''}`}>
                                    <Info size={16} className="text-blue-400" />
                                </div>
                            </button>

                            {isNegotiationOpen && (
                                <div className="p-3 bg-white border-t border-blue-50 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-grow">
                                            <input
                                                type="number"
                                                value={proposedPrice || ''}
                                                onChange={(e) => {
                                            setProposedPrice(e.target.value ? Number(e.target.value) : undefined);
                                            setMessage(null);
                                        }}
                                                placeholder={total.toString()}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">DT</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                                        Le prix minimal accepté pour cette période est de <span className="font-bold text-blue-600">{Math.round(total * 0.8)}DT</span>.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                            <span className="text-slate-900 font-black">Total à payer</span>
                            <span className="text-blue-600 font-black text-2xl">
                                {proposedPrice || total}DT
                            </span>
                        </div>
                    </div>
                )}

                {isOwner && range?.from && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-800 font-medium text-center flex items-center justify-center gap-2">
                            <Info size={14} />
                            En bloquant ces dates, elles ne seront plus réservables.
                        </p>
                    </div>
                )}

                {message && (
                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !range?.from || !range?.to}
                    className={`w-full flex items-center justify-center gap-2 font-bold py-4 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${isOwner
                        ? "bg-slate-900 hover:bg-black text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {isLoading ? (
                        "Action en cours..."
                    ) : isOwner ? (
                        <>
                            <Lock size={20} />
                            Rendre indisponible
                        </>
                    ) : (
                        <>
                            <CalendarIcon size={20} />
                            Demandez une réservation
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage, updateReservationStatus, updateReservationDates, updateReservationPrice } from "@/app/actions/chat";
import { User, Send, Check, X, Calendar, Settings2, Bell, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomCalendar from "@/app/components/Calendar";
import { DateRange } from "react-day-picker";
import { addDays, differenceInDays } from "date-fns";
import { isRangeAvailable } from "@/lib/calendar-utils";

interface Message {
    id: string;
    content: string;
    type: string;
    senderId: string;
    createdAt: Date;
    reservationId?: string | null;
    reservation?: {
        id: string;
        statut: string;
        date_debut: string;
        date_fin: string;
        proprietaire_id: string;
        prix_total: number;
        prix_propose: number | null;
    } | null;
    sender: {
        name: string | null;
        image: string | null;
    };
}

interface Conversation {
    id: string;
    tool?: {
        title: string;
    } | null;
    messages: Message[];
    participants: any[];
}

export default function ChatInterface({
    conversation,
    currentUser,
    currentUserId
}: {
    conversation: any,
    currentUser: any,
    currentUserId: string
}) {
    const [messages, setMessages] = useState<any[]>(conversation.messages);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showCounterOffer, setShowCounterOffer] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [showPriceCounter, setShowPriceCounter] = useState<string | null>(null);
    const [newPrice, setNewPrice] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const otherParticipant = conversation.participants.find((p: any) => p.id !== currentUserId);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Synchroniser l'état local avec les props quand elles changent (après un router.refresh())
    useEffect(() => {
        setMessages(conversation.messages);
    }, [conversation.messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isSending) return;

        setIsSending(true);
        try {
            const tempId = Date.now().toString();
            const newMessage = {
                id: tempId,
                content: inputValue,
                type: "TEXT",
                senderId: currentUserId,
                createdAt: new Date(),
                sender: {
                    name: currentUser.name,
                    image: currentUser.image
                }
            };

            setMessages([...messages, newMessage]);
            setInputValue("");

            await sendMessage(conversation.id, inputValue);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleAction = async (action: string, reservationId: string) => {
        setIsSending(true);
        try {
            let status = "";
            let messageText = "";

            if (action === "accept") {
                status = "valide";
                messageText = "J'ai accepté votre demande de réservation !";
            } else if (action === "refuse") {
                status = "annule";
                messageText = "Désolé, je ne peux pas accepter cette réservation.";
            }

            if (status) {
                await updateReservationStatus(reservationId, status, conversation.id);
                await sendMessage(conversation.id, messageText, "TEXT", reservationId);
                router.refresh();
            }
        } catch (error: any) {
            console.error(error);
            alert("Erreur : " + (error.message || "Une erreur est survenue"));
        } finally {
            setIsSending(false);
        }
    };

    const openCounterOffer = (reservationId: string, startDate: any, endDate: any) => {
        setFormError(null);
        if (startDate && endDate) {
            setDateRange({
                from: new Date(startDate),
                to: new Date(endDate)
            });
        }
        setShowCounterOffer(reservationId);
    };

    const handleCounterOffer = async (reservationId: string) => {
        if (!dateRange?.from || !dateRange?.to) {
            setFormError("Veuillez sélectionner une période complète.");
            return;
        }

        // Check for overlaps
        const bookedDates = conversation.tool?.reservations || [];
        if (!isRangeAvailable({ from: dateRange.from, to: dateRange.to }, bookedDates)) {
            setFormError("Certaines dates dans votre sélection sont déjà réservées.");
            return;
        }

        setFormError(null);
        setIsSending(true);
        try {
            await updateReservationDates(
                reservationId,
                dateRange.from,
                dateRange.to,
                conversation.id
            );

            const formatDateShort = (d: Date) => {
                return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            };

            const msg = `Je vous propose d'autres dates : du ${formatDateShort(dateRange.from)} au ${formatDateShort(dateRange.to)}.`;
            await sendMessage(conversation.id, msg, "TEXT", reservationId);

            setShowCounterOffer(null);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert("Erreur : " + (error.message || "Une erreur est survenue"));
        } finally {
            setIsSending(false);
        }
    };
    const openPriceCounter = (reservationId: string, currentPrice: number) => {
        setFormError(null);
        setNewPrice(currentPrice.toString());
        setShowPriceCounter(reservationId);
    };

    const handlePriceCounter = async (reservation: any) => {
        if (!newPrice || isSending) return;

        const price = Number(newPrice);
        if (isNaN(price) || price < 0) {
            setFormError("Veuillez saisir un prix valide.");
            return;
        }

        const isOwner = reservation.proprietaire_id === currentUserId;
        const originalPrice = reservation.prix_total;
        
        // Règle des 80% seulement pour le locataire
        if (!isOwner && price < Math.round(originalPrice * 0.8)) {
            setFormError(`Prix minimum : ${Math.round(originalPrice * 0.8)}DT (-20%).`);
            return;
        }

        setFormError(null);
        setIsSending(true);
        try {
            await updateReservationPrice(reservation.id, price, conversation.id);
            await sendMessage(conversation.id, `Je vous propose un nouveau prix : ${price}DT.`, "TEXT", reservation.id);
            setShowPriceCounter(null);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert("Erreur : " + (error.message || "Une erreur est survenue"));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex-grow flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center overflow-hidden">
                        {otherParticipant?.image ? (
                            <img src={otherParticipant.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{otherParticipant?.name || "Membre LocaShare"}</h3>
                        <p className="text-xs text-slate-500">
                            {conversation.tool ? `Sujet : ${conversation.tool.title}` : 'Discussion'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/30"
            >
                {(() => {
                    const lastResMsgId = [...messages].reverse().find(m => m.reservationId)?.id;
                    return messages.map((msg, idx) => {
                        const isMe = msg.senderId === currentUserId;
                        const isSystem = msg.type === "BOOKING_REQUEST";
                        const isLatestRes = msg.id === lastResMsgId;

                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm ${isMe
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                                    }`}>
                                    {isSystem && (
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100/20 text-xs font-bold uppercase tracking-wider">
                                            <Calendar size={12} />
                                            Demande de réservation
                                        </div>
                                    )}
                                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>

                                    {msg.reservation && (
                                        <div className={`mt-3 p-2 rounded-lg text-xs border ${isMe ? 'bg-blue-700/30 border-blue-400/30' : 'bg-slate-50 border-slate-100'
                                            }`}>
                                            <div className="flex justify-between items-center">
                                                <span>Statut :</span>
                                                <span className={`font-bold px-2 py-0.5 rounded-full ${msg.reservation.statut === 'valide' ? 'bg-green-100 text-green-700' :
                                                        msg.reservation.statut === 'annule' ? 'bg-red-100 text-red-700' :
                                                            msg.reservation.statut === 'en_attente' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {msg.reservation.statut.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-200/50">
                                                <span>Prix :</span>
                                                <span className="font-bold">
                                                    {msg.reservation.prix_propose ? (
                                                        <>
                                                            <span className={`line-through mr-1 ${isMe ? 'text-blue-200/50' : 'text-slate-400'}`}>{msg.reservation.prix_total}DT</span>
                                                            <span className={isMe ? 'text-amber-300' : 'text-blue-600'}>{msg.reservation.prix_propose}DT</span>
                                                        </>
                                                    ) : (
                                                        `${msg.reservation.prix_total}DT`
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`mt-2 text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Action Buttons - Uniquement sur le DERNIER message de la réservation */}
                                {msg.reservation && !isMe && isLatestRes && (msg.reservation.statut === 'en_attente' || msg.reservation.statut === 'contre_offre') && (
                                    <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <button
                                            onClick={() => handleAction("accept", msg.reservationId!)}
                                            disabled={isSending}
                                            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            <Check size={14} />
                                            {msg.reservation.statut === 'en_attente' ? "Accepter" : "Accepter l'offre"}
                                        </button>
                                        <button
                                            onClick={() => handleAction("refuse", msg.reservationId!)}
                                            disabled={isSending}
                                            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            <X size={14} />
                                            Refuser
                                        </button>
                                        <button
                                            onClick={() => openCounterOffer(msg.reservationId!, msg.reservation!.date_debut, msg.reservation!.date_fin)}
                                            disabled={isSending}
                                            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            <Calendar size={14} />
                                            Dates
                                        </button>
                                        <button
                                            onClick={() => openPriceCounter(msg.reservationId!, msg.reservation!.prix_propose || msg.reservation!.prix_total)}
                                            disabled={isSending}
                                            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            <Settings2 size={14} />
                                            Prix
                                        </button>
                                    </div>
                                )}

                                {/* Counter Offer Form */}
                                {showCounterOffer === msg.reservationId && (
                                    <div className="mt-4 p-4 bg-white border border-blue-200 rounded-xl shadow-lg w-full max-w-sm animate-in zoom-in-95 duration-200">
                                        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <Settings2 size={16} className="text-blue-500" />
                                            Nouvelles dates
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-center">
                                                <CustomCalendar
                                                    bookedDates={conversation.tool?.reservations || []}
                                                    selectedRange={dateRange}
                                                    onRangeChange={(range) => {
                                                        setDateRange(range);
                                                        setFormError(null);
                                                    }}
                                                    className="scale-90 origin-top"
                                                />
                                            </div>
                                            {formError && (
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 p-2 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                                                    <AlertCircle size={14} />
                                                    {formError}
                                                </div>
                                            )}
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleCounterOffer(msg.reservationId!)}
                                                    disabled={isSending}
                                                    className="flex-grow bg-blue-600 text-white text-xs font-bold py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    Valider la contre-offre
                                                </button>
                                                <button
                                                    onClick={() => setShowCounterOffer(null)}
                                                    className="bg-slate-100 text-slate-600 text-xs font-bold py-2 px-3 rounded-md hover:bg-slate-200"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Price Counter Form */}
                                {showPriceCounter === msg.reservationId && (
                                    <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-sm animate-in zoom-in-95 duration-200">
                                        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <Settings2 size={16} className="text-blue-500" />
                                            Nouveau prix
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="w-full text-sm border border-slate-200 rounded-md p-2 pr-8"
                                                    value={newPrice}
                                                    onChange={(e) => {
                                                        setNewPrice(e.target.value);
                                                        setFormError(null);
                                                    }}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">DT</span>
                                            </div>
                                            {formError && (
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 p-2 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                                                    <AlertCircle size={14} />
                                                    {formError}
                                                </div>
                                            )}
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handlePriceCounter(msg.reservation)}
                                                    disabled={isSending}
                                                    className="flex-grow bg-blue-600 text-white text-xs font-bold py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    Valider
                                                </button>
                                                <button
                                                    onClick={() => setShowPriceCounter(null)}
                                                    className="bg-slate-100 text-slate-600 text-xs font-bold py-2 px-3 rounded-md hover:bg-slate-200"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Status Banner after action */}
                                {msg.reservation && msg.reservation.statut !== 'en_attente' && (
                                    <div className={`mt-2 flex items-center gap-2 text-[11px] font-bold ${msg.reservation.statut === 'valide' ? 'text-green-600' :
                                            msg.reservation.statut === 'annule' ? 'text-red-500' :
                                                'text-blue-600'
                                        }`}>
                                        <Bell size={12} />
                                        {msg.reservation.statut === 'valide' && (msg.reservation.proprietaire_id === currentUserId ? "Vous avez accepté cette location" : "Le propriétaire a accepté la location")}
                                        {msg.reservation.statut === 'annule' && "La réservation a été annulée"}
                                        {msg.reservation.statut === 'contre_offre' && (msg.reservation.proprietaire_id === currentUserId ? "Vous avez proposé une contre-offre" : "Vous avez reçu une contre-offre")}
                                    </div>
                                )}
                            </div>
                        );
                    });
                })()}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-grow bg-slate-100 border-none rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isSending}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}

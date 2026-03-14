"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage, updateReservationStatus, updateReservationDates } from "@/app/actions/chat";
import { User, Send, Check, X, Calendar, Settings2, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

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
    const [newStartDate, setNewStartDate] = useState("");
    const [newEndDate, setNewEndDate] = useState("");
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
        // Pre-fill with existing dates if available
        if (startDate) {
            const dateStr = typeof startDate === 'string' ? startDate : new Date(startDate).toISOString();
            setNewStartDate(dateStr.split('T')[0]);
        }
        if (endDate) {
            const dateStr = typeof endDate === 'string' ? endDate : new Date(endDate).toISOString();
            setNewEndDate(dateStr.split('T')[0]);
        }
        setShowCounterOffer(reservationId);
    };

    const handleCounterOffer = async (reservationId: string) => {
        if (!newStartDate || !newEndDate) return;
        setIsSending(true);
        try {
            await updateReservationDates(
                reservationId, 
                new Date(newStartDate), 
                new Date(newEndDate), 
                conversation.id
            );

            const formatDateShort = (d: Date) => {
                return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            };
            
            const msg = `Je vous propose d'autres dates : du ${formatDateShort(new Date(newStartDate))} au ${formatDateShort(new Date(newEndDate))}.`;
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
                            <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                                isMe 
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
                                    <div className={`mt-3 p-2 rounded-lg text-xs border ${
                                        isMe ? 'bg-blue-700/30 border-blue-400/30' : 'bg-slate-50 border-slate-100'
                                    }`}>
                                        <div className="flex justify-between items-center">
                                            <span>Statut :</span>
                                            <span className={`font-bold px-2 py-0.5 rounded-full ${
                                                msg.reservation.statut === 'valide' ? 'bg-green-100 text-green-700' :
                                                msg.reservation.statut === 'annule' ? 'bg-red-100 text-red-700' :
                                                msg.reservation.statut === 'en_attente' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {msg.reservation.statut.replace('_', ' ')}
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
                                        {msg.reservation.statut === 'en_attente' ? "Accepter" : "Accepter les nouvelles dates"}
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
                                        Proposer d'autres dates
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
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Début</label>
                                            <input 
                                                type="date" 
                                                className="w-full text-xs border border-slate-200 rounded-md p-2"
                                                value={newStartDate}
                                                onChange={(e) => setNewStartDate(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fin</label>
                                            <input 
                                                type="date" 
                                                className="w-full text-xs border border-slate-200 rounded-md p-2"
                                                value={newEndDate}
                                                onChange={(e) => setNewEndDate(e.target.value)}
                                            />
                                        </div>
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

                            {/* Status Banner after action */}
                            {msg.reservation && msg.reservation.statut !== 'en_attente' && (
                                <div className={`mt-2 flex items-center gap-2 text-[11px] font-bold ${
                                    msg.reservation.statut === 'valide' ? 'text-green-600' :
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
                })})()}
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

import { getConversations } from "@/app/actions/chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { MessageCircle, User as UserIcon, Calendar, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ConversationsPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    const conversations = await getConversations();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <MessageCircle className="text-blue-600" size={32} />
                    Mes Discussions
                </h1>
                <p className="text-slate-500 mt-2">
                    Gérez vos échanges avec les autres membres concernant vos locations.
                </p>
            </div>

            {conversations.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Aucune conversation</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                        Vous n'avez pas encore de messages. Les conversations s'ouvrent automatiquement lorsque vous réservez un outil.
                    </p>
                    <Link 
                        href="/"
                        className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm"
                    >
                        Explorer les outils
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {conversations.map((conv) => {
                        const otherParticipant = conv.participants.find(p => p.id !== userId);
                        const lastMessage = conv.messages[0];
                        
                        return (
                            <Link 
                                key={conv.id}
                                href={`/conversations/${conv.id}`}
                                className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4"
                            >
                                <div className="hidden sm:flex w-14 h-14 bg-blue-100 rounded-full items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    {otherParticipant?.image ? (
                                        <img src={otherParticipant.image} alt="" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <UserIcon size={24} />
                                    )}
                                </div>
                                
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-900 truncate">
                                            {otherParticipant?.name || "Membre LocaShare"}
                                        </h3>
                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                            {conv.updatedAt.toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                    
                                    {conv.tool && (
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-2">
                                            <Calendar size={14} />
                                            <span>À propos de : {conv.tool.title}</span>
                                        </div>
                                    )}
                                    
                                    <p className="text-sm text-slate-500 truncate italic">
                                        {lastMessage ? lastMessage.content : "Nouvelle conversation"}
                                    </p>
                                </div>
                                
                                <div className="text-slate-300 group-hover:text-blue-500 transition-colors pl-2">
                                    <ArrowRight size={20} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

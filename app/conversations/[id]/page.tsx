import { getConversation } from "@/app/actions/chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ChatInterface from "@/app/components/ChatInterface";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ConversationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    const conversation = await getConversation(resolvedParams.id);

    if (!conversation) {
        notFound();
    }

    const otherParticipant = conversation.participants.find(p => p.id !== userId);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full h-[calc(100vh-140px)] flex flex-col">
            <Link
                href="/conversations"
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4 flex-shrink-0"
            >
                <ArrowLeft size={16} className="mr-1" />
                Retour aux conversations
            </Link>

            <ChatInterface 
                conversation={conversation} 
                currentUser={session.user}
                currentUserId={userId}
            />
        </div>
    );
}

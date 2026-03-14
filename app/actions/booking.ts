"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isToolAvailable } from "@/lib/availability";

export async function createReservation(toolId: string, startDate: Date, endDate: Date, totalPrice: number, proposedPrice?: number) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return { success: false, error: "Vous devez être connecté pour réserver un outil." };
        }

        const userId = (session.user as any).id;
        console.log("CreateReservation started", { toolId, userId, startDate, endDate, totalPrice, proposedPrice });

        if (!userId) {
            return { success: false, error: "Utilisateur non authentifié correctement." };
        }

        // Récupérer les infos de l'outil pour le message automatique
        const tool = await prisma.tool.findUnique({
            where: { id: toolId },
            include: { owner: true }
        });

        if (!tool) {
            return { success: false, error: "Outil non trouvé." };
        }

        if (tool.ownerId === userId) {
            // "Indisponibilité par le propriétaire (Maintenance)"
            // Si c'est le propriétaire qui réserve, on force le statut à "valide" immédiatement
            // et on bypass le check de "ne peut pas louer son propre outil" car c'est pour du blocage.
            console.log("Owner is blocking their own tool");
        } else {
            // Vérifier si l'outil est disponible
            const available = await isToolAvailable(toolId, startDate, endDate);
            if (!available) {
                return { success: false, error: "Désolé, cet outil est déjà réservé pour ces dates." };
            }
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        console.log("Normalized dates", { start, end });

        const isOwner = tool.ownerId === userId;

        const reservation = await prisma.reservation.create({
            data: {
                date_debut: start,
                date_fin: end,
                prix_total: totalPrice,
                prix_propose: proposedPrice || null,
                outil_id: toolId,
                locataire_id: userId,
                proprietaire_id: tool.ownerId,
                statut: isOwner ? "valide" : "en_attente",
            },
        });
        console.log("Reservation created", reservation.id);

        // --- Logique de Messagerie ---
        // 1. Chercher une conversation existante entre ces deux utilisateurs pour cet outil
        let conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: tool.ownerId } } },
                    { toolId: toolId }
                ]
            }
        });

        // Si elle n'existe pas, la créer
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participants: {
                        connect: [
                            { id: userId },
                            { id: tool.ownerId }
                        ]
                    },
                    toolId: toolId
                }
            });
        }

        // 2. Envoyer le message automatique
        const formatDate = (date: Date) => {
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };

        let messageContent = `Bonjour, je souhaiterais réserver votre ${tool.title} du ${formatDate(startDate)} au ${formatDate(endDate)}.`;
        
        if (proposedPrice && proposedPrice !== totalPrice) {
            messageContent += ` Je vous propose un prix de ${proposedPrice}DT pour cette période.`;
        }

        await prisma.message.create({
            data: {
                content: messageContent,
                type: "BOOKING_REQUEST",
                conversationId: conversation.id,
                senderId: userId,
                reservationId: reservation.id
            }
        });
        // ------------------------------

        revalidatePath(`/tools/${toolId}`);
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/owner");
        return { success: true, reservationId: reservation.id, conversationId: conversation.id };
    } catch (error: any) {
        console.error("Erreur lors de la réservation :", error);
        return { 
            success: false, 
            error: error.message || "Impossible de créer la réservation." 
        };
    }
}

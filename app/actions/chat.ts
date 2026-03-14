"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isToolAvailable } from "@/lib/availability";

export async function getConversations() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return [];

    const userId = (session.user as any).id;

    return await prisma.conversation.findMany({
        where: {
            participants: {
                some: { id: userId }
            }
        },
        include: {
            participants: true,
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            tool: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
}

export async function getConversation(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Non autorisé");

    const userId = (session.user as any).id;

    const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
            participants: true,
            messages: {
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: true,
                    reservation: true
                }
            },
            tool: true
        }
    });

    if (!conversation) return null;

    // Vérifier que l'utilisateur participe à la conversation
    const isParticipant = conversation.participants.some((p: any) => p.id === userId);
    if (!isParticipant) throw new Error("Accès refusé");

    return conversation;
}

export async function sendMessage(conversationId: string, content: string, type: string = "TEXT", reservationId?: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Non autorisé");

    const userId = (session.user as any).id;

    const message = await prisma.message.create({
        data: {
            content,
            type,
            conversationId,
            senderId: userId,
            reservationId: reservationId || null
        }
    });

    // Mettre à jour la date de la conversation pour le tri
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });

    revalidatePath(`/conversations/${conversationId}`);
    return message;
}

export async function updateReservationStatus(reservationId: string, status: string, conversationId?: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Non autorisé");

    const userId = (session.user as any).id;

    if (!reservationId || typeof reservationId !== 'string') {
        throw new Error("ID de réservation invalide");
    }

    // Vérifier que l'utilisateur est bien le propriétaire de l'outil dans la réservation
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { outil: true }
    });

    if (!reservation) throw new Error("Réservation non trouvée");
    
    // Trouver le dernier message lié à cette réservation pour déterminer qui doit répondre
    const lastMessage = await prisma.message.findFirst({
        where: { reservationId: reservationId },
        orderBy: { createdAt: 'desc' }
    });

    if (!lastMessage) {
        // Fallback si pas de message (ne devrait pas arriver), on autorise le proprio si c'est en attente
        if (reservation.statut === 'en_attente' && reservation.proprietaire_id !== userId) {
            throw new Error("Seul le propriétaire peut répondre à une demande initiale");
        }
    } else {
        // On ne peut pas répondre à son propre message (contre-offre ou demande)
        if (lastMessage.senderId === userId) {
            throw new Error("Vous devez attendre la réponse de l'autre membre");
        }
        
        // Vérifier que l'utilisateur fait bien partie de la transaction
        if (reservation.proprietaire_id !== userId && reservation.locataire_id !== userId) {
            throw new Error("Vous ne faites pas partie de cette transaction");
        }
    }

    // Si on veut passer à 'valide', on vérifie une dernière fois la disponibilité
    if (status === "valide") {
        const available = await isToolAvailable(
            reservation.outil_id, 
            reservation.date_debut, 
            reservation.date_fin,
            reservationId // Exclure cette réservation du check (évidemment)
        );

        if (!available) {
            throw new Error("Cet outil est déjà réservé pour ces dates par une autre personne.");
        }
    }

    const updated = await prisma.reservation.update({
        where: { id: reservationId },
        data: { statut: status }
    });

    if (conversationId) {
        // Optionnel : Envoyer un message automatique pour notifier le changement ?
        // L'utilisateur le fera peut-être manuellement via l'UI, mais le bandeau d'état sera basé sur ce statut.
        revalidatePath(`/conversations/${conversationId}`);
    }
    
    revalidatePath("/dashboard");
    return updated;
}

export async function updateReservationDates(reservationId: string, startDate: Date, endDate: Date, conversationId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Non autorisé");

    const userId = (session.user as any).id;

    if (!reservationId || typeof reservationId !== 'string') {
        throw new Error("ID de réservation invalide");
    }

    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId }
    });

    if (!reservation) throw new Error("Réservation non trouvée");
    
    // Autoriser soit le proprio soit le locataire à proposer une contre-offre
    const isOwner = reservation.proprietaire_id === userId;
    const isRenter = reservation.locataire_id === userId;
    
    if (!isOwner && !isRenter) throw new Error("Non autorisé");

    const updated = await prisma.reservation.update({
        where: { id: reservationId },
        data: { 
            date_debut: startDate,
            date_fin: endDate,
            statut: "contre_offre"
        }
    });

    revalidatePath(`/conversations/${conversationId}`);
    revalidatePath("/dashboard");
    return updated;
}

export async function getOrCreateConversation(participantId: string, toolId?: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Non autorisé");

    const userId = (session.user as any).id;

    // Éviter de se parler à soi-même
    if (userId === participantId) throw new Error("Impossible de créer une conversation avec soi-même");

    // Chercher une conversation existante entre ces deux utilisateurs (optionnellement liée au même outil)
    const existing = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { id: userId } } },
                { participants: { some: { id: participantId } } },
                toolId ? { toolId } : {}
            ]
        }
    });

    if (existing) return existing;

    // Créer une nouvelle conversation
    return await prisma.conversation.create({
        data: {
            participants: {
                connect: [
                    { id: userId },
                    { id: participantId }
                ]
            },
            toolId: toolId || null
        }
    });
}

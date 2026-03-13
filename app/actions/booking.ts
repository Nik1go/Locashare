"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBooking(toolId: string, startDate: Date, endDate: Date, totalPrice: number) {
    try {
        // Dans le MVP, l'utilisateur connecté est simulé (ID 1), on va chercher le premier utilisateur créé (Alice par exemple)
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            throw new Error("Aucun utilisateur trouvé pour simuler la réservation.");
        }

        const booking = await prisma.booking.create({
            data: {
                startDate,
                endDate,
                totalPrice,
                toolId,
                renterId: mockUser.id,
                status: "CONFIRMED", // Auto-confirmé pour ce MVP
            },
        });

        revalidatePath(`/tools/${toolId}`);
        return { success: true, bookingId: booking.id };
    } catch (error) {
        console.error("Erreur lors de la réservation :", error);
        return { success: false, error: "Impossible de créer la réservation." };
    }
}

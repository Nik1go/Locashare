"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createTool(formData: FormData) {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
        throw new Error("Vous devez être connecté pour ajouter un outil.");
    }

    // Récupérer l'utilisateur correspondant à l'email de session
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        throw new Error("Utilisateur non trouvé.");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const pricePerDay = parseFloat(formData.get("pricePerDay") as string);
    const category = formData.get("category") as string;
    const location = formData.get("location") as string;
    const imageUrl = formData.get("imageUrl") as string || null;

    if (!title || !description || isNaN(pricePerDay) || !category || !location) {
        throw new Error("Tous les champs obligatoires doivent être remplis.");
    }

    await prisma.tool.create({
        data: {
            title,
            description,
            pricePerDay,
            category,
            location,
            imageUrl,
            ownerId: user.id, // Liaison avec le vrai ID de l'utilisateur
        },
    });

    // Revalider la page d'accueil pour afficher le nouvel outil
    revalidatePath("/");
    revalidatePath("/dashboard");

    // Rediriger vers le dashboard
    redirect("/dashboard");
}

export async function deleteTool(toolId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Vous devez être connecté." };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return { success: false, error: "Utilisateur non trouvé." };
    }

    const tool = await prisma.tool.findUnique({
        where: { id: toolId },
    });

    if (!tool || tool.ownerId !== user.id) {
        return { success: false, error: "Vous n'avez pas l'autorisation de supprimer cet outil." };
    }

    try {
        await prisma.tool.delete({
            where: { id: toolId },
        });

        revalidatePath("/");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Delete tool error:", error);
        return { success: false, error: "Erreur lors de la suppression." };
    }
}

export async function updateToolPrice(toolId: string, newPrice: number) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Vous devez être connecté." };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return { success: false, error: "Utilisateur non trouvé." };
    }

    const tool = await prisma.tool.findUnique({
        where: { id: toolId },
    });

    if (!tool || tool.ownerId !== user.id) {
        return { success: false, error: "Vous n'avez pas l'autorisation de modifier cet outil." };
    }

    try {
        await prisma.tool.update({
            where: { id: toolId },
            data: { pricePerDay: newPrice },
        });

        revalidatePath(`/tools/${toolId}`);
        return { success: true };
    } catch (error) {
        console.error("Update price error:", error);
        return { success: false, error: "Erreur lors de la mise à jour du prix." };
    }
}

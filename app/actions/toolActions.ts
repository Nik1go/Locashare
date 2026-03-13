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

    // Rediriger vers l'accueil
    redirect("/dashboard");
}

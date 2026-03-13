import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
  }

  // Vérifier le type de fichier
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté. Utilisez PNG, JPG ou WebP." },
      { status: 400 }
    );
  }

  // Limiter la taille à 5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "Le fichier est trop volumineux (max 5 Mo)." },
      { status: 400 }
    );
  }

  // Générer un nom de fichier unique
  const ext = path.extname(file.name) || ".jpg";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

  // Créer le dossier uploads s'il n'existe pas
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  // Sauvegarder le fichier
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = path.join(uploadsDir, uniqueName);
  await writeFile(filePath, buffer);

  // Retourner le chemin public
  const publicUrl = `/uploads/${uniqueName}`;
  return NextResponse.json({ url: publicUrl });
}

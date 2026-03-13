import prisma from "@/lib/prisma";
import ToolImage from "@/app/components/ToolImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, User, Tag, ArrowLeft } from "lucide-react";
import BookingForm from "./BookingForm";

// Next.js 15: params is a Promise that must be awaited
export default async function ToolPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;

    const tool = await prisma.tool.findUnique({
        where: { id: resolvedParams.id },
        include: {
            owner: true,
        },
    });

    if (!tool) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-8"
            >
                <ArrowLeft size={16} className="mr-1" />
                Retour aux annonces
            </Link>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Colonne Gauche : Détails de l'outil */}
                <div className="lg:w-2/3 flex flex-col gap-6">
                    <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
                        {tool.imageUrl ? (
                            <ToolImage
                                src={tool.imageUrl}
                                alt={tool.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
                                Aucune image disponible
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {tool.category}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                            {tool.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <MapPin size={20} className="text-slate-400" />
                                <span className="font-medium">{tool.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={20} className="text-slate-400" />
                                <span className="font-medium">Loué par <span className="text-slate-900 font-semibold">{tool.owner.name}</span></span>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Tag size={20} className="text-slate-400" />
                                Description
                            </h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                                {tool.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Colonne Droite : Réservation Sticky */}
                <div className="lg:w-1/3">
                    <div className="sticky top-24 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                            Réserver cet outil
                        </h2>
                        <p className="text-slate-500 mb-6 text-sm">
                            Sélectionnez vos dates pour valider la location avec le propriétaire.
                        </p>

                        <BookingForm toolId={tool.id} pricePerDay={tool.pricePerDay} />
                    </div>
                </div>
            </div>
        </div>
    );
}

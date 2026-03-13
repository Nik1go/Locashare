import prisma from "@/lib/prisma";
import Link from "next/link";
import ToolImage from "@/app/components/ToolImage";
import { Package, ShoppingBag, MapPin, CalendarDays, Info } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Helper pour formater les dates
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Helper pour le badge de statut
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
  };
  const labels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    CANCELLED: "Annulée",
    COMPLETED: "Terminée",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-800"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export default async function DashboardPage() {
  // Vérification de la session
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // Récupérer l'utilisateur réel en base
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    // Cas rare : session active mais utilisateur supprimé de la base
    redirect("/login");
  }

  // Requête 1 : Outils que l'utilisateur a mis en ligne
  const myTools = await prisma.tool.findMany({
    where: { ownerId: user.id },
    orderBy: { id: "desc" },
  });

  // Requête 2 : Réservations faites par l'utilisateur, avec les détails de l'outil
  const myBookings = await prisma.booking.findMany({
    where: { renterId: user.id },
    include: { tool: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Tableau de bord
        </h1>
        <p className="mt-2 text-slate-500">
          Bienvenue, <span className="font-semibold text-slate-700">{user.name || user.email}</span>. Gérez vos outils et suivez vos emprunts.
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{myTools.length}</p>
            <p className="text-sm text-slate-500">Outils en location</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{myBookings.length}</p>
            <p className="text-sm text-slate-500">Emprunts effectués</p>
          </div>
        </div>
      </div>

      {/* Section 1 : Mes Outils en location */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Package size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Mes Outils en location</h2>
        </div>

        {myTools.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <Info size={32} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500">Vous n&apos;avez aucun outil en location.</p>
            <Link
              href="/tools/new"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors"
            >
              Ajouter un outil
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group"
              >
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  {tool.imageUrl ? (
                    <ToolImage
                      src={tool.imageUrl}
                      alt={tool.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      Pas d&apos;image
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-700 rounded-full shadow-sm">
                    {tool.category}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1 mb-1">
                    {tool.title}
                  </h3>
                  <div className="flex items-center text-slate-500 text-sm mb-3">
                    <MapPin size={14} className="mr-1" />
                    {tool.location}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-blue-600">
                        {tool.pricePerDay}€
                      </span>
                      <span className="text-slate-500 text-xs"> / jour</span>
                    </div>
                    <Link
                      href={`/tools/${tool.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      Voir →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2 : Mes Emprunts */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-600 text-white p-2 rounded-lg">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Mes Emprunts</h2>
        </div>

        {myBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <Info size={32} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500">Vous n&apos;avez encore fait aucun emprunt.</p>
            <Link
              href="/"
              className="inline-block mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors"
            >
              Parcourir les outils
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* En-tête du tableau */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Outil</div>
              <div className="col-span-3">Dates</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-3 text-right">Prix total</div>
            </div>

            {/* Lignes */}
            {myBookings.map((booking) => (
              <div
                key={booking.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
              >
                {/* Outil */}
                <div className="sm:col-span-4 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {booking.tool.imageUrl ? (
                      <ToolImage
                        src={booking.tool.imageUrl}
                        alt={booking.tool.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                        —
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 line-clamp-1">
                      {booking.tool.title}
                    </p>
                    <p className="text-xs text-slate-500 sm:hidden">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="hidden sm:flex sm:col-span-3 items-center gap-1.5 text-sm text-slate-600">
                  <CalendarDays size={14} className="text-slate-400" />
                  <span>
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </span>
                </div>

                {/* Statut */}
                <div className="sm:col-span-2">
                  <StatusBadge status={booking.status} />
                </div>

                {/* Prix */}
                <div className="sm:col-span-3 text-right">
                  <span className="font-bold text-slate-900">{booking.totalPrice.toFixed(2)}€</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

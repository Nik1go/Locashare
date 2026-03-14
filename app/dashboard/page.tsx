import prisma from "@/lib/prisma";
import Link from "next/link";
import ToolImage from "@/app/components/ToolImage";
import { 
  Package, 
  ShoppingBag, 
  MapPin, 
  CalendarDays, 
  Info,
  Calendar,
  Clock,
  History,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Wrench as ToolIcon
} from "lucide-react";
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
    en_attente: "bg-amber-100 text-amber-800",
    valide: "bg-green-100 text-green-800",
    annule: "bg-red-100 text-red-800",
    contre_offre: "bg-blue-100 text-blue-800",
  };
  const labels: Record<string, string> = {
    en_attente: "À traiter",
    valide: "Validée",
    annule: "Annulée",
    contre_offre: "Contre-offre",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-800"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: any
}) {
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
    redirect("/login");
  }

  // Récupérer l'onglet actif pour la gestion des locations
  const params = await searchParams;
  const activeTab = params.tab || "todo";

  // Requête 1 : Outils que l'utilisateur a mis en ligne
  const myTools = await prisma.tool.findMany({
    where: { ownerId: user.id },
    orderBy: { id: "desc" },
  });

  // Requête 2 : Réservations faites par l'utilisateur (Emprunts)
  const myBookings = await prisma.reservation.findMany({
    where: { locataire_id: user.id },
    include: { outil: true },
    orderBy: { date_debut: "desc" },
  });

  // Requête 3 : Réservations reçues par l'utilisateur (Gestion des locations)
  const incomingReservations = await prisma.reservation.findMany({
    where: { proprietaire_id: user.id },
    include: {
      outil: true,
      locataire: true,
    },
    orderBy: { date_debut: 'asc' }
  });

  // Filtrer les réservations reçues par onglets
  const now = new Date();
  const todo = incomingReservations.filter((r: any) => r.statut === "en_attente" || r.statut === "contre_offre");
  const planning = incomingReservations.filter((r: any) => r.statut === "valide" && r.date_fin >= now).sort((a: any, b: any) => a.date_debut.getTime() - b.date_debut.getTime());
  const history = incomingReservations.filter((r: any) => r.statut === "annule" || (r.statut === "valide" && r.date_fin < now));

  const currentList = activeTab === "todo" ? todo : activeTab === "planning" ? planning : history;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full text-slate-900">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Tableau de bord
        </h1>
        <p className="mt-2 text-slate-500">
          Bienvenue, <span className="font-semibold text-slate-700">{user.name || user.email}</span>. Gérez vos outils et vos locations.
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{myTools.length}</p>
            <p className="text-sm font-medium text-slate-500">Mes outils en ligne</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{myBookings.length}</p>
            <p className="text-sm font-medium text-slate-500">Emprunts effectués</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="bg-amber-100 text-amber-600 p-4 rounded-2xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{todo.length}</p>
            <p className="text-sm font-medium text-slate-500">Demandes à traiter</p>
          </div>
        </div>
      </div>

      {/* SECTION : GESTION DES LOCATIONS (Propriétaire) */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200 text-xs">
              <Calendar size={20} />
            </div>
            Gestion de mes locations
          </h2>
          <p className="text-slate-500 mt-1">Gérez les demandes de réservation reçues pour vos outils.</p>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
          <Link 
            href="/dashboard?tab=todo"
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "todo" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <AlertCircle size={18} />
            À traiter
            {todo.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {todo.length}
              </span>
            )}
          </Link>
          <Link 
            href="/dashboard?tab=planning"
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "planning" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Clock size={18} />
            Planning
            {planning.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {planning.length}
              </span>
            )}
          </Link>
          <Link 
            href="/dashboard?tab=history"
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "history" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <History size={18} />
            Historique
          </Link>
        </div>

        {/* Liste des réservations reçues */}
        {currentList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center">
            <div className="bg-slate-50 p-4 rounded-full text-slate-400 mb-4">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Aucune réservation ici</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Les réservations correspondantes apparaîtront ici quand vous en aurez.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {currentList.map((res: any) => (
              <div key={res.id} className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 hover:shadow-xl transition-all group overflow-hidden relative">
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                  res.statut === 'valide' ? 'bg-green-500' :
                  res.statut === 'annule' ? 'bg-red-500' :
                  res.statut === 'en_attente' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4 flex-grow min-w-0">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm border border-slate-100">
                      {res.outil.imageUrl ? (
                        <ToolImage src={res.outil.imageUrl} alt={res.outil.title} fill className="object-cover" />
                      ) : (
                        <ToolIcon className="w-8 h-8 text-slate-300 absolute inset-0 m-auto" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate text-lg">{res.outil.title}</h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                        <StatusBadge status={res.statut} />
                        <span className="text-slate-300">•</span>
                        <span className="font-medium text-blue-600">{res.prix_total}€</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-12 flex-shrink-0">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Période</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Calendar size={14} className="text-blue-500" />
                        <span>{formatDate(res.date_debut)} — {formatDate(res.date_fin)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Locataire</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                          {res.locataire.image && <img src={res.locataire.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{res.locataire.name || "Locataire"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:ml-4">
                    <Link 
                      href={`/conversations?toolId=${res.outil_id}`}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded-2xl transition-colors md:ml-auto"
                      title="Voir la discussion"
                    >
                      <MessageSquare size={20} />
                    </Link>
                    <Link 
                      href={`/tools/${res.outil_id}`}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-3 rounded-2xl transition-colors"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION : MES EMPRUNTS (Locataire) */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-200">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Mes Emprunts</h2>
        </div>

        {myBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <Info size={32} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500">Vous n&apos;avez encore fait aucun emprunt.</p>
            <Link
              href="/"
              className="inline-block mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-100"
            >
              Parcourir les outils
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-4">Outil</div>
              <div className="col-span-4">Dates</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2 text-right">Prix total</div>
            </div>

            {myBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center px-8 py-6 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
              >
                <div className="sm:col-span-4 flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm border border-slate-100">
                    {booking.outil.imageUrl ? (
                      <ToolImage src={booking.outil.imageUrl} alt={booking.outil.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">—</div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{booking.outil.title}</p>
                    <p className="text-xs text-slate-500 sm:hidden">
                      {formatDate(booking.date_debut)} → {formatDate(booking.date_fin)}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex sm:col-span-4 items-center gap-2 text-sm font-medium text-slate-600">
                  <CalendarDays size={16} className="text-blue-500" />
                  <span>{formatDate(booking.date_debut)} — {formatDate(booking.date_fin)}</span>
                </div>

                <div className="sm:col-span-2">
                  <StatusBadge status={booking.statut} />
                </div>

                <div className="sm:col-span-2 text-right">
                  <span className="font-black text-lg text-slate-900">{booking.prix_total.toFixed(2)}€</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION : MES OUTILS EN LIGNE (Inventaire) */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
              <Package size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Mes Outils en ligne</h2>
          </div>
          <Link
            href="/tools/new"
            className="hidden sm:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-slate-200"
          >
            <ToolIcon size={18} />
            Ajouter un outil
          </Link>
        </div>

        {myTools.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center">
            <Info size={32} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500">Vous n&apos;avez aucun outil en ligne.</p>
            <Link
              href="/tools/new"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl transition-all"
            >
              Ajouter mon premier outil
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {myTools.map((tool: any) => (
              <div
                key={tool.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group"
              >
                <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                  {tool.imageUrl ? (
                    <ToolImage
                      src={tool.imageUrl}
                      alt={tool.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">Pas d&apos;image</div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-800 rounded-full shadow-xl">
                    {tool.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-black text-xl text-slate-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <div className="flex items-center text-slate-500 font-medium text-sm mb-6">
                    <MapPin size={16} className="mr-2 text-slate-400" />
                    {tool.location}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <span className="text-2xl font-black text-blue-600">{tool.pricePerDay}€</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1">/ jour</span>
                    </div>
                    <Link
                      href={`/tools/${tool.id}`}
                      className="bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold py-2 px-4 rounded-xl transition-all border border-transparent hover:border-blue-100 flex items-center gap-2 text-sm"
                    >
                      Détails
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

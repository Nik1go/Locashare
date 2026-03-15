import prisma from "@/lib/prisma";
import ToolImage from "@/app/components/ToolImage";
import Link from "next/link";
import { MapPin } from "lucide-react";
import SearchBar from "@/app/components/SearchBar";
import { searchTools } from "@/app/actions/searchTools";

export const dynamic = 'force-dynamic';

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const name = typeof searchParams.name === 'string' ? searchParams.name : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const latString = typeof searchParams.lat === 'string' ? searchParams.lat : undefined;
  const lngString = typeof searchParams.lng === 'string' ? searchParams.lng : undefined;

  const lat = latString ? parseFloat(latString) : undefined;
  const lng = lngString ? parseFloat(lngString) : undefined;

  const tools = await searchTools({
    name,
    category,
    lat,
    lng,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Trouvez l'outil parfait pour vos travaux
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Louez des outils entre particuliers et professionnels à proximité de chez vous. Rapide, économique et écologique.
        </p>
      </div>

      <SearchBar />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {tools.map((tool: any) => (
          <div key={tool.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-300 flex flex-col h-full group">
            {/* Image section */}
            <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
                  Pas d'image
                </div>
              )}
              {/* Category tag */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-700 rounded-full shadow-sm">
                {tool.category}
              </div>
            </div>

            {/* Content section */}
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">{tool.title}</h3>

              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-4">
                <MapPin size={16} className="mr-1" />
                {tool.location}
              </div>

              <div className="mt-auto flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tool.pricePerDay}DT</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm"> / jour</span>
                </div>
              </div>

              <Link
                href={`/tools/${tool.id}`}
                className="w-full block text-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-colors"
              >
                Voir les détails
              </Link>
            </div>
          </div>
        ))}
      </div>

      {tools.length === 0 && (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
          Aucun outil disponible pour le moment.
        </div>
      )}
    </div>
  );
}

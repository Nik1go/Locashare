import { createTool } from "@/app/actions/toolActions";
import ImageUpload from "./ImageUpload";
import { Wrench } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewToolPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                        <Wrench size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ajouter un outil</h1>
                        <p className="text-slate-500 mt-1">Gagnez de l'argent en proposant vos outils en location.</p>
                    </div>
                </div>

                <form action={createTool} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">
                                Titre de l'annonce *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                placeholder="Ex : Perceuse visseuse 18V"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="pricePerDay" className="block text-sm font-semibold text-slate-700 mb-1">
                                    Prix par jour (€) *
                                </label>
                                <input
                                    type="number"
                                    id="pricePerDay"
                                    name="pricePerDay"
                                    required
                                    min="1"
                                    step="0.5"
                                    placeholder="Ex : 15"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1">
                                    Catégorie *
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Sélectionnez une catégorie</option>
                                    <option value="Bricolage">Bricolage</option>
                                    <option value="Jardinage">Jardinage</option>
                                    <option value="Nettoyage">Nettoyage</option>
                                    <option value="Peinture">Peinture</option>
                                    <option value="Électricité">Électricité</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-1">
                                Ville / Localisation *
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                required
                                placeholder="Ex : Paris 11e, Lyon, etc."
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <ImageUpload />

                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={4}
                                placeholder="Décrivez l'état de l'outil, ses caractéristiques techniques, et les conditions de location."
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-sm text-lg"
                        >
                            Publier l'annonce
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use server";

import prisma from "@/lib/prisma";

export interface SearchParams {
  name?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radiusInKm?: number;
}

/**
 * Calculates the bounding box for a given latitude, longitude and radius.
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @param radius Radius in kilometers
 * @returns Bounding box [minLat, maxLat, minLng, maxLng]
 */
function getBoundingBox(lat: number, lng: number, radius: number) {
  const kmPerDegreeLat = 111;
  const kmPerDegreeLng = 111 * Math.cos(lat * (Math.PI / 180));

  const deltaLat = radius / kmPerDegreeLat;
  const deltaLng = radius / kmPerDegreeLng;

  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLng: lng - deltaLng,
    maxLng: lng + deltaLng,
  };
}

/**
 * Calculates the distance between two points using the Haversine formula.
 * @returns Distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function searchTools(params: SearchParams) {
  const { name, category, lat, lng, radiusInKm = 50 } = params;

  let where: any = {};

  if (name) {
    where.title = {
      contains: name,
    };
  }

  if (category && category !== "Toutes les catégories") {
    where.category = category;
  }

  // If coordinates are provided, apply bounding box filter first (efficient for DB)
  if (lat !== undefined && lng !== undefined) {
    const box = getBoundingBox(lat, lng, radiusInKm);
    where.latitude = {
      gte: box.minLat,
      lte: box.maxLat,
    };
    where.longitude = {
      gte: box.minLng,
      lte: box.maxLng,
    };
  }

  try {
    const tools = await prisma.tool.findMany({
      where,
      orderBy: {
        id: "desc",
      },
    });

    // Final filtering using Haversine if coordinates were provided
    if (lat !== undefined && lng !== undefined) {
      return tools.filter((tool: any) => {
        if (tool.latitude === null || tool.longitude === null) return false;
        const distance = haversineDistance(lat, lng, tool.latitude, tool.longitude);
        return distance <= radiusInKm;
      });
    }

    return tools;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    const tools = await prisma.tool.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });
    return tools.map((t: any) => t.category);
  } catch (error) {
    console.error("Fetch categories error:", error);
    return [];
  }
}

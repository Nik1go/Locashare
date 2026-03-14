import prisma from "./prisma";

/**
 * Checks if a tool is available for a given period.
 * A tool is unavailable if there is an existing "valide" reservation 
 * that overlaps with the requested dates.
 */
export async function isToolAvailable(
  toolId: string,
  startDate: Date,
  endDate: Date,
  excludeReservationId?: string
) {
  const overlappingReservation = await prisma.reservation.findFirst({
    where: {
      outil_id: toolId,
      statut: "valide",
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      OR: [
        {
          // Existing reservation starts within the requested period
          date_debut: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          // Existing reservation ends within the requested period
          date_fin: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          // Existing reservation completely encompasses the requested period
          AND: [
            { date_debut: { lte: startDate } },
            { date_fin: { gte: endDate } },
          ],
        },
      ],
    },
  });

  return !overlappingReservation;
}

/**
 * Returns all dates where the tool is already booked or blocked.
 */
export async function getBookedDates(toolId: string) {
  const validatedReservations = await prisma.reservation.findMany({
    where: {
      outil_id: toolId,
      statut: "valide",
    },
    select: {
      date_debut: true,
      date_fin: true,
    },
  });

  return validatedReservations;
}

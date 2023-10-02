import { Hotel } from '@prisma/client';
import { prisma } from '@/config';

async function getHotels(): Promise<{ hotels: Hotel[]; count: number }> {
  const hotels = await prisma.hotel.findMany();
  const count = await prisma.hotel.count();

  return { hotels: hotels, count };
}

async function getHotelById(hotelId: number) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { Rooms: true },
  });
  return hotel;
}

export const hotelsRepository = {
  getHotels,
  getHotelById,
};

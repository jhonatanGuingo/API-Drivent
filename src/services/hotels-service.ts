import { notFoundError, paymentError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { hotelsRepository } from '@/repositories/hotels-repository';

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.getByUserId(userId);

  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const hotels = await hotelsRepository.getHotels();

  if (!ticket || hotels.hotels.length === 0) throw notFoundError();

  if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw paymentError();
  }

  return hotels.hotels;
}

async function getHotelById(hotelId: string, userId: number) {
  const enrollment = await enrollmentRepository.getByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const hotel = await hotelsRepository.getHotelById(Number(hotelId));

  if (!ticket || !hotel) throw notFoundError();

  if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw paymentError();
  }

  return hotel;
}

export const hotelsService = {
  getHotels,
  getHotelById,
};

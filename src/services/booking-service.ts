import { notFoundError, forbiddenError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { bookingRepository } from '@/repositories/booking-repository';

export async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookingbyUser(userId);
  console.log('cheguei');
  if (!booking) throw notFoundError();

  return booking;
}

export async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  const room = await bookingRepository.findRoom(roomId);
  if (!room) throw notFoundError();
  if (room.capacity === 0) throw forbiddenError();

  const newBooking = await bookingRepository.createBooking(userId, roomId);
  return newBooking;
}

export async function putBooking(userId: number, roomId: number, bookingId: number) {
  const room = await bookingRepository.findRoom(roomId);
  if (!room) throw notFoundError();
  if (room.capacity === 0) throw forbiddenError();

  const booking = await bookingRepository.findBookingbyUser(userId);
  if (!booking) throw forbiddenError();

  const updateBooking = await bookingRepository.updateBooking(roomId, bookingId);
  return updateBooking;
}

export const bookingService = {
  getBooking,
  postBooking,
  putBooking,
};

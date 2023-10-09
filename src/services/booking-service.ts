import { notFoundError, forbiddenError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { bookingRepository } from '@/repositories/booking-repository';

export async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookingbyUser(userId);
  if (!booking) throw notFoundError();
  const body = {
    id: booking.id,
    Room: booking.Room,
  };
  return body;
}

export async function postBooking(userId: number, roomId: number) {
  const room = await bookingRepository.findRoom(roomId);

  if (!room) throw notFoundError();

  if (room.Booking.length >= room.capacity) throw forbiddenError();

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  const newBooking = await bookingRepository.createBooking(userId, roomId);

  const body = {
    bookingId: newBooking.roomId,
  };
  return body;
}

export async function putBooking(userId: number, roomId: number, bookingId: number) {
  const room = await bookingRepository.findRoom(roomId);
  if (!room) throw notFoundError();

  if (room.Booking.length >= room.capacity) throw forbiddenError();

  const booking = await bookingRepository.findBookingbyUser(userId);
  if (!booking) throw forbiddenError();

  const updateBooking = await bookingRepository.updateBooking(roomId, bookingId);
  const body = {
    bookingId: updateBooking.id,
  };
  return body;
}

export const bookingService = {
  getBooking,
  postBooking,
  putBooking,
};

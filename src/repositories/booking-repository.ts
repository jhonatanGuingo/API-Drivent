import { prisma } from '@/config';

async function findBookingbyUser(userId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: userId,
    },
  });
  return booking;
}

async function findBooking(roomId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      roomId,
    },
  });
  return booking;
}

async function createBooking(userId: number, roomId: number) {
  const result = await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
  return result;
}

export const bookingRepository = {
  findBookingbyUser,
  createBooking,
};

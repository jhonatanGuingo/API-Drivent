import { prisma } from '@/config';

async function findBookingbyUser(userId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      Room: true,
      id: true,
    },
  });
  return booking;
}

async function findRoom(roomId: number) {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
  return room;
}

async function createBooking(userId: number, roomId: number) {
  const result = await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    select: {
      roomId: true,
    },
  });
  return result;
}

async function updateBooking(roomId: number, bookingId: number) {
  const update = prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
  return update;
}

export const bookingRepository = {
  findBookingbyUser,
  createBooking,
  findRoom,
  updateBooking,
};

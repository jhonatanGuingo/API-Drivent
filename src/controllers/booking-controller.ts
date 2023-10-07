import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const booking = await bookingService.getBooking(userId);
  res.status(httpStatus.OK).send(booking);
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  const newBooking = await bookingService.postBooking(userId, roomId);
  res.status(httpStatus.OK).send(newBooking);
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } = req.params;

  const updateBooking = await bookingService.putBooking(userId, roomId, Number(bookingId));
  res.send(httpStatus.OK).send(updateBooking);
}

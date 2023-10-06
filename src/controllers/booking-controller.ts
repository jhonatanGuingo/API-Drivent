import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  return;
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  return;
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  return;
}

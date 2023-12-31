import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { bookingRepository } from '@/repositories';
import { getBooking, postBooking, putBooking } from '@/controllers';

const bookingRouter = Router();

bookingRouter.all('/*', authenticateToken).get('/', getBooking).post('/', postBooking).put('/:bookingId', putBooking);

export { bookingRouter };

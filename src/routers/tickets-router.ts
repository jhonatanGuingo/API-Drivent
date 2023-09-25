import { Router } from 'express';
import ticketsController from '@/controllers/tickets-controller';
import { authenticateToken, validateBody } from '@/middlewares';
import { TicketSchema } from '@/schemas/tickets-schema';

const ticketsRouter = Router();

ticketsRouter.get('/types', authenticateToken, ticketsController.getTicketsTypes);
ticketsRouter.get('/', authenticateToken, ticketsController.getTickets);
ticketsRouter.post('/', authenticateToken, validateBody(TicketSchema), ticketsController.newTicket);

export { ticketsRouter };

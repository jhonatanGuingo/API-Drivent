import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { TicketTypeId } from '@/protocols';
import { ticketsService } from '@/services';

async function getTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const TicketTypes = await ticketsService.getTickets(userId);

  return res.status(httpStatus.OK).send(TicketTypes);
}

async function newTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketTypeId } = req.body as TicketTypeId;

  const ticket = await ticketsService.newTicket(userId, ticketTypeId);

  return res.status(httpStatus.CREATED).send(ticket);
}

async function getTicketsTypes(req: AuthenticatedRequest, res: Response) {
  const types = await ticketsService.getTicketsTypes();

  return res.status(httpStatus.OK).send(types);
}

const ticketsController = {
  getTickets,
  newTicket,
  getTicketsTypes,
};

export default ticketsController;

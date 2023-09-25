import { Enrollment, TicketStatus } from '@prisma/client';
import { notFoundError } from '@/errors';
import { ticketsRepository } from '@/repositories/tickets-repository';

export async function getTickets(id: number) {
  const ticket = await ticketsRepository.getTicketsbyUser(id);

  if (!ticket) throw notFoundError();

  return ticket;
}

export async function newTicket(userId: number, ticketTypeId: number) {
  const enrollment: Enrollment = await ticketsRepository.searchEnrollment(userId);

  if (!enrollment) throw notFoundError();

  const data = {
    status: TicketStatus.RESERVED,
    ticketTypeId,
    enrollmentId: enrollment.id,
  };

  const ticket = await ticketsRepository.newTicket(data);

  if (!ticket) throw notFoundError();

  return ticket;
}

export async function getTicketsTypes() {
  const tickets = await ticketsRepository.getTicketsTypes();
  return tickets;
}

export const ticketsService = {
  getTickets,
  newTicket,
  getTicketsTypes,
};

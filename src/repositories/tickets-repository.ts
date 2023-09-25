import { Enrollment, TicketType } from '@prisma/client';
import { prisma } from '@/config';
import { NewTicket, TicketResponse } from '@/protocols';

export async function getTicketsbyUser(userId: number): Promise<TicketResponse | null> {
  const tickets = await prisma.ticket.findFirst({
    where: {
      Enrollment: { userId },
    },
    include: {
      TicketType: true,
    },
  });
  return tickets as TicketResponse;
}
export async function searchEnrollment(userId: number) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId },
  });
  return enrollment as Enrollment;
}
export async function newTicket(data: NewTicket) {
  const create = await prisma.ticket.create({
    data,
  });

  const type = await prisma.ticketType.findFirst({
    where: {
      id: data.ticketTypeId,
    },
  });

  const response = {
    ...create,
    TicketType: type,
  };

  return response as TicketResponse;
}

export async function getTicketsTypes(): Promise<TicketType[]> {
  const ticketType = await prisma.ticketType.findMany();

  return ticketType as TicketType[];
}

export const ticketsRepository = {
  getTicketsbyUser,
  searchEnrollment,
  newTicket,
  getTicketsTypes,
};

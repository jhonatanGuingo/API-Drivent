import Joi from 'joi';
import { TicketTypeId } from '@/protocols';

export const TicketSchema = Joi.object<TicketTypeId>({
  ticketTypeId: Joi.number().integer().required(),
});

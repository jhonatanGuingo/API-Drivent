import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '@prisma/client';
import {
  createBooking,
  createEnrollmentWithAddress,
  createHotel,
  createPayment,
  createRoomWithHotelId,
  createRoomWithNoSlot,
  createTicket,
  createTicketType,
  createTicketTypeRemote,
  createUser,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user has no booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 when list with sucessful a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: expect.objectContaining({
          id: room.id,
          name: room.name,
        }),
      });
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when room Id doesnt exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when room has no slot', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const hotel = await createHotel();
      const room = await createRoomWithNoSlot(hotel.id);
      const body = {
        roomId: room.id,
      };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = {
        roomId: room.id,
      };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when hotel not include', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = {
        roomId: room.id,
      };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when ticket is reserved', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const payment = await createPayment(ticket.id, ticketType.price);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = {
        roomId: room.id,
      };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    it('should respond with status 200 when create booking is correct', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const body = {
        roomId: room.id,
      };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.OK);

      expect(response.body).toEqual({ bookingId: expect.any(Number) });
    });
  });
});

describe('PUT /booking/bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 403 when user has no booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const body = {
        roomId: room.id,
      };

      const response = await server.put('/booking/12321').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should responde with status 404 if room not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();

      const response = await server
        .put('/booking/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: 123156465 });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when room has no slot', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithNoSlot(hotel.id);

      const body = {
        roomId: room.id,
      };

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 when update is success', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const changeRoom = await createRoomWithHotelId(hotel.id);

      const body = {
        roomId: changeRoom.id,
      };

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: booking.id,
      });
    });
  });
});

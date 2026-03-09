import { z } from 'zod';
import { 
  insertUserSchema, users,
  insertPaymentSchema, payments,
  insertWorkSchema, works,
  insertReservationSchema, reservations,
  insertSecurityLogSchema, securityLogs
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/users' as const,
      input: insertUserSchema,
      responses: { 201: z.custom<typeof users.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id' as const,
      input: insertUserSchema.partial(),
      responses: { 200: z.custom<typeof users.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    }
  },
  payments: {
    list: {
      method: 'GET' as const,
      path: '/api/payments' as const,
      responses: { 200: z.array(z.custom<typeof payments.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/payments' as const,
      input: insertPaymentSchema,
      responses: { 201: z.custom<typeof payments.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/payments/:id' as const,
      input: insertPaymentSchema.partial(),
      responses: { 200: z.custom<typeof payments.$inferSelect>(), 404: errorSchemas.notFound }
    }
  },
  works: {
    list: {
      method: 'GET' as const,
      path: '/api/works' as const,
      responses: { 200: z.array(z.custom<typeof works.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/works' as const,
      input: insertWorkSchema,
      responses: { 201: z.custom<typeof works.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/works/:id' as const,
      input: insertWorkSchema.partial(),
      responses: { 200: z.custom<typeof works.$inferSelect>(), 404: errorSchemas.notFound }
    }
  },
  reservations: {
    list: {
      method: 'GET' as const,
      path: '/api/reservations' as const,
      responses: { 200: z.array(z.custom<typeof reservations.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/reservations' as const,
      input: insertReservationSchema,
      responses: { 201: z.custom<typeof reservations.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/reservations/:id' as const,
      input: insertReservationSchema.partial(),
      responses: { 200: z.custom<typeof reservations.$inferSelect>(), 404: errorSchemas.notFound }
    }
  },
  securityLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/security-logs' as const,
      responses: { 200: z.array(z.custom<typeof securityLogs.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/security-logs' as const,
      input: insertSecurityLogSchema,
      responses: { 201: z.custom<typeof securityLogs.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/security-logs/:id' as const,
      input: insertSecurityLogSchema.partial(),
      responses: { 200: z.custom<typeof securityLogs.$inferSelect>(), 404: errorSchemas.notFound }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

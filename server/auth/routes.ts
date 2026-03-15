import { createSessionToken } from './jwt';
import { findUserByEmail } from './repository';
import { parseLoginPayload, verifyPassword } from './users';

const invalidJsonBody = Symbol('invalid-json-body');

const authHeaders = {
  'Cache-Control': 'no-store',
};

const readJsonBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return invalidJsonBody;
  }
};

export const authRoutes = {
  '/api/auth/login': {
    async POST(request: Request) {
      const body = await readJsonBody(request);

      if (body === invalidJsonBody) {
        return Response.json(
          { error: 'Invalid JSON body.' },
          { status: 400, headers: authHeaders },
        );
      }

      const loginRequest = parseLoginPayload(body);

      if (loginRequest === null) {
        return Response.json(
          { error: 'Email and password are required.' },
          { status: 400, headers: authHeaders },
        );
      }

      const user = await findUserByEmail(loginRequest.email);

      if (
        user === null ||
        !(await verifyPassword(loginRequest.password, user.passwordHash))
      ) {
        return Response.json(
          { error: 'Invalid email or password.' },
          { status: 401, headers: authHeaders },
        );
      }

      const token = await createSessionToken({
        userId: user.id,
        email: user.email,
      });

      return Response.json(
        {
          token,
          user: {
            id: user.id,
            email: user.email,
          },
        },
        { headers: authHeaders },
      );
    },
  },
} as const;

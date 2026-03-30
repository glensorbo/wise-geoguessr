import type { NewUser } from './newUser';

export type User = Omit<NewUser, 'password'>;

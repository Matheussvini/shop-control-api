import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import nodemailer from 'nodemailer';
import { CreateUserInput, LoginInput, UpdateUserInput } from '@/schemas';
import { conflictError, invalidCredentialsError, notFoundError, unauthorizedError } from '@/errors';
import { userRepository } from '@/repositories';

async function validateUniqueUserData({ email }: Pick<User, 'email'>) {
  const checkEmail = await userRepository.findByEmail(email);
  if (checkEmail) throw conflictError('Email already exists');
}

async function sendEmailConfirmation(email: string, token: string) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error('API URL not found');
  const confirmationUrl = `${apiUrl}/users/confirm-email/${token}`;

  const htmlContent = `
  <h1 style="text-align: center;">Welcome to Shop Control!</h1>
  <p style="text-align: center;">Thank you for signing up. Please confirm your email address by clicking the button below:</p>
  <div style="text-align: center;">
    <a href="${confirmationUrl}" style="
        background-color: #4CAF50;
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
    ">Confirm Email</a>
  </div>
`;

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Confirmation',
    html: htmlContent,
  });
}

async function create({ username, email, password, type }: CreateUserInput): Promise<void> {
  await validateUniqueUserData({
    email,
  });
  const hashPassword = await bcrypt.hash(password, 12);

  const data = {
    username,
    email,
    password: hashPassword,
    type,
  };
  const validationToken = jwt.sign(data, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });

  await sendEmailConfirmation(email, validationToken);
}

async function confirmEmail(token: string) {
  const data = jwt.verify(token, process.env.JWT_SECRET as string) as CreateUserInput;
  if (!data) throw unauthorizedError('Authentication token invalid');
  const { username, email, password, type } = data;
  await validateUniqueUserData({
    email,
  });
  // if (!data.type) delete data.type;

  await userRepository.create({
    username,
    email,
    password,
    type,
  });
}
async function login({ email, password }: LoginInput): Promise<UserWithToken> {
  const user = await userRepository.findByEmail(email);
  if (!user) throw invalidCredentialsError('Invalid email or password');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw invalidCredentialsError('Invalid email or password');

  const data = { userId: user.id };
  const token = jwt.sign(data, process.env.JWT_SECRET as string, { expiresIn: '1d' });
  delete user.password;

  return { ...user, token };
}

async function getAll({ page, limit, username, email, type }: GetAllUsersParams) {
  const offset = (page - 1) * limit;
  const filters: Prisma.UserWhereInput = {};

  if (username) filters.username = { contains: username, mode: 'insensitive' };
  if (email) filters.email = { contains: email, mode: 'insensitive' };
  if (type) {
    filters.type = type as User['type'];
  }
  const [users, total] = await Promise.all([
    userRepository.findMany({
      skip: offset,
      take: limit,
      where: filters,
    }),
    userRepository.count(filters),
  ]);

  return { data: users, total, page, limit };
}

async function getById(id: number) {
  const user = await userRepository.findById(id);
  if (!user) throw notFoundError('User not found');
  delete user.password;
  return user;
}

async function update(id: number, data: UpdateUserInput) {
  const user = await getById(id);

  if (data.email && data.email !== user.email) {
    await validateUniqueUserData({
      email: data.email,
    });
  }
  const updatedUser = await userRepository.update(id, data);
  delete updatedUser.password;
  return updatedUser;
}

async function deleteById(id: number) {
  await getById(id);

  await userRepository.deleteById(id);
}

async function changePassword(id: number, userId: number, oldPassword: string, newPassword: string) {
  const user = await userRepository.findById(userId);
  if (!user) throw notFoundError('User not found');

  if (user.id !== id) throw unauthorizedError('You do not have permission to change another user password');

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) throw invalidCredentialsError('Invalid password');

  const hashPassword = await bcrypt.hash(newPassword, 12);
  await userRepository.update(id, { password: hashPassword });
}

export type UserWithToken = Omit<User, 'password'> & { token: string };

export interface GetAllUsersParams {
  page: number;
  limit: number;
  username?: string;
  email?: string;
  type?: string;
}

export const userService = {
  create,
  confirmEmail,
  login,
  getAll,
  getById,
  update,
  deleteById,
  changePassword,
};

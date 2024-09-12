import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import nodemailer from 'nodemailer';
import { CreateUserInput } from '@/schemas';
import { conflictError, unauthorizedError } from '@/errors';
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

export const userService = {
  create,
  confirmEmail,
};

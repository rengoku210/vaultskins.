import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: false,
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined
});

export const sendOtpEmail = async (to, code) => {
  if (!env.smtpUser) return;

  await transporter.sendMail({
    from: 'VaultSkins <noreply@vaultskins.app>',
    to,
    subject: 'Your VaultSkins OTP Code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`
  });
};

export const sendWelcomeEmail = async (to) => {
  if (!env.smtpUser) return;

  await transporter.sendMail({
    from: 'VaultSkins <noreply@vaultskins.app>',
    to,
    subject: 'Welcome to VaultSkins',
    text: 'Welcome to VaultSkins. Please follow marketplace safety best practices.'
  });
};

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import { successResponse, errorResponse, createdResponse } from '../utils/response.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

const JWT_SECRET = process.env.SECRETKEY || process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export const register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 400, ERROR_MESSAGES.USER_ALREADY_EXISTS, 'USER_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const emailToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        full_name: fullname,
        role: 'USER',
        email_verification_token: emailToken
      }
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`;
    await sendEmail(email, 'Verify Your Email', emailTemplates.verification(verificationLink));

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    createdResponse(res, {
      user: { id: user.id, email: user.email, full_name: user.full_name },
      token,
      message: 'Verification email sent'
    }, 'User registered successfully');
  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'REGISTER_ERROR');
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, guest_session_id } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, 400, ERROR_MESSAGES.INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 400, ERROR_MESSAGES.INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_tokens: { push: refreshToken } }
    });

    if (guest_session_id) {
      const guestCart = await prisma.cart.findFirst({
        where: { session_id: guest_session_id }
      });

      if (guestCart) {
        const guestItems = await prisma.cartItem.findMany({
          where: { cart_id: guestCart.id }
        });

        let userCart = await prisma.cart.findFirst({
          where: { user_id: user.id }
        });

        if (!userCart) {
          userCart = await prisma.cart.create({
            data: { user_id: user.id }
          });
        }

        for (const item of guestItems) {
          await prisma.cartItem.create({
            data: {
              cart_id: userCart.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              price: item.price
            }
          });
        }

        await prisma.cart.delete({ where: { id: guestCart.id } });
      }
    }

    successResponse(res, 200, {
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      accessToken,
      refreshToken
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'LOGIN_ERROR');
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 401, 'Refresh token is required', 'NO_REFRESH_TOKEN');
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.refresh_tokens.includes(refreshToken)) {
      return errorResponse(res, 401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    successResponse(res, 200, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (error) {
    console.error('Refresh token error:', error);
    errorResponse(res, 401, 'Invalid token', 'TOKEN_ERROR');
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.userId;

    if (refreshToken) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          refresh_tokens: {
            set: (await prisma.user.findUnique({ where: { id: userId } }))
              .refresh_tokens.filter(token => token !== refreshToken)
          }
        }
      });
    }

    successResponse(res, 200, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'LOGOUT_ERROR');
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findUnique({
      where: { email_verification_token: token }
    });

    if (!user) {
      return errorResponse(res, 400, ERROR_MESSAGES.INVALID_TOKEN, 'INVALID_TOKEN');
    }

    if (user.is_verified) {
      return errorResponse(res, 400, ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED, 'ALREADY_VERIFIED');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        email_verification_token: null
      }
    });

    successResponse(res, 200, null, 'Email verified successfully');
  } catch (error) {
    console.error('Email verification error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'VERIFICATION_ERROR');
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, 400, 'User not found', 'USER_NOT_FOUND');
    }

    const resetToken = uuidv4();
    const expiryTime = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: resetToken,
        password_reset_expires: expiryTime
      }
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'Reset Your Password', emailTemplates.passwordReset(resetLink));

    successResponse(res, 200, null, 'Password reset link sent to email');
  } catch (error) {
    console.error('Forgot password error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'FORGOT_PASSWORD_ERROR');
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { password_reset_token: token }
    });

    if (!user) {
      return errorResponse(res, 400, ERROR_MESSAGES.INVALID_TOKEN, 'INVALID_TOKEN');
    }

    if (user.password_reset_expires < new Date()) {
      return errorResponse(res, 400, 'Token expired', 'TOKEN_EXPIRED');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null
      }
    });

    successResponse(res, 200, null, 'Password reset successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'RESET_PASSWORD_ERROR');
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { current_password, new_password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isCurrentPasswordValid) {
      return errorResponse(res, 400, 'Current password is incorrect', 'INVALID_PASSWORD');
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    successResponse(res, 200, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'CHANGE_PASSWORD_ERROR');
  }
};

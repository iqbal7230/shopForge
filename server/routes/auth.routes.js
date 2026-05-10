import express from 'express';
import { authSchemas } from '../utils/schemas.js';
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
} from '../controller/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { error } = authSchemas.register.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    register(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error } = authSchemas.login.validate({
      email: req.body.email,
      password: req.body.password
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    login(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    refreshToken(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', verifyToken, async (req, res, next) => {
  try {
    logout(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    verifyEmail(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { error } = authSchemas.forgotPassword.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    forgotPassword(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { error } = authSchemas.resetPassword.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    resetPassword(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/change-password', verifyToken, async (req, res, next) => {
  try {
    const { error } = authSchemas.changePassword.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    changePassword(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
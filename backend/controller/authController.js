import passport from 'passport';
import bcrypt from 'bcryptjs';
import { DataStore } from '../services/dataStore.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await DataStore.findUserByEmail(email);
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409, {
        email: 'Email address is already registered',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await DataStore.createUser(name, email, passwordHash);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    req.login(safeUser, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      req.session.regenerate((regenErr) => {
        if (regenErr) {
          return next(regenErr);
        }

        req.session.passport = { user: safeUser.id };
        req.session.save((saveErr) => {
          if (saveErr) return next(saveErr);
          return sendSuccess(
            res,
            safeUser,
            'Account registered and authenticated successfully.',
            201
          );
        });
      });
    });
  } catch (error) {
    return next(error);
  }
};

export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return sendError(res, info?.message || 'Invalid email or password.', 401);
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      req.session.regenerate((regenErr) => {
        if (regenErr) {
          return next(regenErr);
        }
        req.session.passport = { user: user.id };
        req.session.save((saveErr) => {
          if (saveErr) return next(saveErr);
          return sendSuccess(res, user, 'Logged in successfully.');
        });
      });
    });
  })(req, res, next);
};

export const getMe = (req, res) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }
  return sendSuccess(res, req.user, 'Current session retrieved.');
};

export const logout = (req, res, next) => {
  req.logout((logoutErr) => {
    if (logoutErr) {
      return next(logoutErr);
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return next(destroyErr);
      }
      res.clearCookie('ttm.sid', { path: '/' });
      return sendSuccess(res, null, 'Logged out successfully.');
    });
  });
};

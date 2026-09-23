import Admin from '../models/admin.model.js';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import UserAccount from '../models/userAccount.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import EmailChangeRequest from '../models/emailChangeRequest.model.js';
import PasswordChangeRequest from '../models/passwordChangeRequest.model.js';
import { ApiError } from '../utils/apiError.js';
import { sendOtpEmail, sendEmailChangeOtp, sendPasswordChangeOtp } from '../utils/email.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const timing = process.env.NODE_ENV !== 'production';


forgotPassword,
  verifyOtp,
  resetPassword,
  updatePassword,
  verifyEmailPassword,
  sendEmailChangeOtp: sendEmailChangeOtpService,
    verifyEmailChangeOtp: verifyEmailChangeOtpService,
      initiatePasswordChange,
      verifyPasswordChangeOtp: verifyPasswordChangeOtpService,
        completePasswordChange,
        verifyRefreshToken,
        revokeRefreshToken,
        rotateRefreshToken,
        generateAccessToken,
};

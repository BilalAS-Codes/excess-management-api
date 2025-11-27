import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  createUser,
  findByEmail,
  updateLastLogin,
  getUsers,
  createSession,
  findSessionByToken,
  updateSessionToken,
  deleteSession,
  saveOtp,
  findOtpByUserAndType,
  deleteAllOtpsForUser,
  deleteOtpById,
  updateSessionDevice,
  updateSessionActivity,
  isSessionExpired
} from "./auth.repository.js";
import { sendEmailOTP } from "../../shared/services/EmailOtp.js";
import logger from "../../shared/loggers/logger.js";




// REGISTER
export const register = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);

  const user = await createUser({
    ...data,
    password_hash: hashed,
    email_verified: false,
    phone_verified: false,
    business_docs_verified: false,
    admin_verification_status: "pending",
    status: "active",
  });

  return user;
};

// LOGIN → sends OTP 
export const login = async ({ email, password }) => {
logger.info("Login attempt started", { meta: { email } });
try{  
var user = await findByEmail(email);

  if (!user) {
   logger.warn("Login failed: user not found", { meta: { email } });
    throw new Error("User is not registered");
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid){
    logger.warn("Login failed: invalid password", { meta: { email, userId: user.id } });
    throw new Error("Invalid credentials");
  }
  if(!user.email_verified) {
   logger.warn("Login blocked: email not verified", { meta: { email, userId: user.id } });
    throw new Error("Email is not verified")
  }
    // if(!phon.phone_verified) throw new Error("Phone is not verified")

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp_hash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Remove old OTPs
  await deleteAllOtpsForUser(user.id);

  // Save new OTP for "login" type
  await saveOtp(uuidv4(), user.id, otp_hash, "email", expiresAt);

  // send OTP to email
  await sendEmailOTP(user.email, otp);
  logger.info("OTP generated", { meta: { userId: user.id, expiresAt } });

  return {
    otpRequired: true,
    userId: user.id, 
    email: user.email
  };
}
  catch (err) {
    logger.error("OTP verification failed", { meta: { userId : user?.id, error: err.message, stack: err.stack } });
    throw err;
  }
};

// VERIFY LOGIN OTP → return tokens
export const verifyLoginOtp = async ({ userId, otpCode,ip, device }) => {
  logger.info("OTP verification attempt", { meta: { userId } });
  try {

  const otpRow = await findOtpByUserAndType(userId, "email");
  if (!otpRow){
    logger.warn("OTP verification failed: OTP not found", { meta: { userId } });
    throw new Error("OTP not found");
  }

  // check expiration
  if (new Date(otpRow.expires_at) < new Date()) {
    await deleteOtpById(otpRow.id);
    logger.warn("OTP expired", { meta: { userId, expiresAt: otpRow.expires_at } });
    throw new Error("OTP expired");
  }

  // compare hash
  const valid = await bcrypt.compare(otpCode, otpRow.otp_hash);
  if (!valid) {
  logger.warn("Invalid OTP provided", { meta: { userId } });
    throw new Error("Invalid OTP");
  }

  
  logger.info("OTP successfully validated", { meta: { userId } });

  // Generate tokens
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId, session: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Save session
  const session = await createSession({ userId, refreshToken });
  await updateSessionDevice(session.id, ip, device);
await updateSessionActivity(session.id);


  await updateLastLogin(userId);
  logger.info("Tokens generated successfully", { meta: { userId } });
  // Delete OTP after use
  await deleteOtpById(otpRow.id);

  return { accessToken, refreshToken };

} catch (err) {
    logger.error("OTP verification failed", { meta: { userId, error: err.message, stack: err.stack } });
    throw err;
  }
};

//Refresh tokens
export const refresh = async (refreshToken ,ip, device) => {
  const session = await findSessionByToken(refreshToken);
  if (!session) throw new Error("Invalid refresh token");
  if (isSessionExpired(session)) {
  await deleteSession(refreshToken);
  throw new Error("Session expired");
}


  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const newAccess = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const newRefresh = jwt.sign(
    { id: decoded.id, session: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // 🔥 Important fix: TRIM before saving
  await updateSessionToken(session.id, newRefresh);
  await updateSessionActivity(session.id);
await updateSessionDevice(session.id, ip, device);


  return {
    accessToken: newAccess,
    refreshToken: newRefresh,
  };
};

// LOGOUT = REMOVE REFRESH TOKEN
export const logout = async (refreshToken) => {
  await deleteSession(refreshToken);
};

// GET ALL USERS
export const users = async () => {
  return await getUsers();
};

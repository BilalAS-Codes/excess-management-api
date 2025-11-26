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
} from "./auth.repository.js";

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

// LOGIN = CREATE TOKENS + SAVE REFRESH TOKEN
export const login = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, session: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // SAVE REFRESH TOKEN
  await createSession({
    userId: user.id,
    refreshToken,
  });

  await updateLastLogin(user.id);

  return {
    accessToken,
    refreshToken,
    user,
  };
};

export const refresh = async (refreshToken) => {
  const session = await findSessionByToken(refreshToken);
  if (!session) throw new Error("Invalid refresh token");

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

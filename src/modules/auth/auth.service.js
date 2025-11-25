import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findByEmail, updateLastLogin , getUsers } from "./auth.repository.js";

export const register = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);

  const user = await createUser({
    ...data,
    password_hash: hashed,
    email_verified: false,
    phone_verified: false,
    business_docs_verified: false,
    admin_verification_status: "pending",
    status: "active"
  });

  return user;
};

export const login = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  await updateLastLogin(user.id);

  return { token, user };
};

export const users = async()=>{
const users = await getUsers()
return users
}

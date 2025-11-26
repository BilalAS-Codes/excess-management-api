import pool from "../../config/database.js";

export const createUser = async (user) => {
  const query = `
    INSERT INTO users (
      email, password_hash, company_name, company_name_ar,
      company_address, region, industry, phone_number, role,
      email_verified, phone_verified, business_docs_verified,
      admin_verification_status, notification_preferences,
      language_preference, status
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8, $9,
      $10, $11, $12,
      $13, $14,
      $15, $16
    )
    RETURNING id, email, company_name, role, created_at;
  `;

  const values = [
    user.email,
    user.password_hash,
    user.company_name,
    user.company_name_ar,
    user.company_address,
    user.region,
    user.industry,
    user.phone_number,
    user.role,
    user.email_verified,
    user.phone_verified,
    user.business_docs_verified,
    user.admin_verification_status,
    user.notification_preferences,
    user.language_preference,
    user.status,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return result.rows[0];
};

export const updateLastLogin = async (id) => {
  await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [id]);
};

export const getUsers = async () => {
  const query = `
    SELECT
      id, email, company_name, company_name_ar, company_address,
      region, industry, phone_number, role,
      email_verified, phone_verified, business_docs_verified,
      admin_verification_status, notification_preferences,
      language_preference, status, last_login, created_at, updated_at
    FROM users
  `;

  const result = await pool.query(query);
  return result.rows;
};

// CREATE SESSION
export const createSession = async ({ userId, refreshToken }) => {
  const query = `
    INSERT INTO user_sessions (
      id,
      user_id,
      jwt_token,
      device_info,
      ip_address,
      expires_at
    )
    VALUES (
      gen_random_uuid(),
      $1,
      TRIM($2),
      '{}'::jsonb,
      'unknown',
      NOW() + INTERVAL '7 days'
    )
    RETURNING *;
  `;

  const values = [userId, refreshToken];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// FIND REFRESH TOKEN
export const findSessionByToken = async (refreshToken) => {
  const result = await pool.query(
    `SELECT * FROM user_sessions WHERE TRIM(jwt_token) = TRIM($1) LIMIT 1`,
    [refreshToken]
  );
  return result.rows[0];
};

// UPDATE REFRESH TOKEN (ROTATION)
export const updateSessionToken = async (sessionId, newToken) => {
  const result = await pool.query(
    `
    UPDATE user_sessions
    SET jwt_token = TRIM($1),
        expires_at = NOW() + INTERVAL '7 days',
        last_activity = NOW()
    WHERE id = $2
    RETURNING *;
  `,
    [newToken, sessionId]
  );

  return result.rows[0];
};

// DELETE SESSION
export const deleteSession = async (refreshToken) => {
  await pool.query(
    `DELETE FROM user_sessions WHERE TRIM(jwt_token) = TRIM($1)`,
    [refreshToken]
  );
};

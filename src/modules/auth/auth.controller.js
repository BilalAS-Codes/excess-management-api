import * as authService from "./auth.service.js";

// REGISTER
export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Verification codes sent to email and phone.",

      data: { userId: user.id, email: user.email, verificationRequired: true },
    });
  } catch (err) {
    next(err);
  }
};


// LOGIN
export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// VERIFY LOGIN OTP 

export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { user_id, otp_code } = req.body;

    const result = await authService.verifyLoginOtp({
      userId: user_id,
      otpCode: otp_code,
    });

    return res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};


// REFRESH TOKEN
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
      });

    const tokens = await authService.refresh(refreshToken);

    return res.json({
      success: true,
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL USERS
export const listUsers = async (req, res, next) => {
  try {
    const users = await authService.users();
    return res.json(users);
  } catch (err) {
    next(err);
  }
};

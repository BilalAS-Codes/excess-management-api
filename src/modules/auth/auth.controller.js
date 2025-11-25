import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({ message: "Registered", user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const response = await authService.login(req.body);
    return res.json(response);
  } catch (err) {
    next(err);
  }
};


export const listUsers = async(req,res,next)=>{
    try {
        const users = await authService.users();
        return res.json(users)
    } catch (err) {
        next(err)
    }
}
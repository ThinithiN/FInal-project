//import axios from "axios";

import Api from "./Api";

const faceId = async (name, id, profile_pic) => {
  const response = await Api.post("/auth_face", {
    name,
    id,
    profile_pic,
  });

  return response;
};

const register = async (name, email, password) => {
  const response = await Api.post("/register_user", {
    name,
    email,
    password,
    // profile_pic,
  });

  return response;
};

const loginAdmin = async (email, password) => {
  const response = await Api.post("/login_admin", {
    email,
    password,
  });

  return response;
};

const loginUser = async (email, password) => {
  const response = await Api.post("/login_user", {
    email,
    password,
  });

  return response;
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("Test Info");
};

const AuthService = {
  faceId,
  register,
  loginAdmin,
  loginUser,
  logout,
};

export default AuthService;

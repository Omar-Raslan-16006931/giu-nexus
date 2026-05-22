import api from "./api";

export const loginUser = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const registerUser = async (name, email, password, role) => {
  const { data } = await api.post("/auth/register", { name, email, password, role });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

export const verifyOtp = async (email, otpCode) => {
  const { data } = await api.post("/auth/verify-otp", { email, otpCode });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.patch(`/auth/reset-password/${token}`, { password });
  return data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.patch("/profile/change-password", { currentPassword, newPassword });
  return data;
};
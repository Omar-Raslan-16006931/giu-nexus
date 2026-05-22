import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.patch("/profile", formData);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.patch("/profile/change-password", { currentPassword, newPassword });
  return data;
};

export const extractSkills = async () => {
  const response = await api.post("/profile/extract-skills");
  return response.data;
};
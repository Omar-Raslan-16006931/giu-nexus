import api from "./api";

export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data.stats;
};

export const getPendingRecruiters = async () => {
  const response = await api.get("/users", {
    params: { role: "recruiter", status: "pending" },
  });
  return response.data.users;
};

export const updateUserStatus = async (userId, status) => {
  const response = await api.patch(`/users/${userId}/status`, { status });
  return response.data;
};

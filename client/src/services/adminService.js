import api from "./api";


export const approveRecruiter = async (recruiterId) => {
  const response = await api.patch(`/admin/recruiters/${recruiterId}/approve`);
  return response.data;
};

export const rejectRecruiter = async (recruiterId) => {
  const response = await api.patch(`/admin/recruiters/${recruiterId}/reject`);
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const { data } = await api.get("/users", { params });
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/users/${userId}`);
  return data;
};

export const getAllJobsAdmin = async () => {
  const response = await api.get("/admin/jobs");
  return response.data;
};

export const deleteJobAdmin = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};


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
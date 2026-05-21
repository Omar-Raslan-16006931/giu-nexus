import api from "./api";

export const createJob = async (jobData) => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await api.patch(`/jobs/${id}`, jobData);
  return response.data;
};
export const getMyJobs = async () => {
  const response = await api.get("/jobs/my-jobs");
  return response.data;
};
export const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
}
export const getAllJobs = async (filters) => {
  const response = await api.get("/jobs", { params: filters });
  return response.data;
}
export const toggleSaveJob = async (jobId) => {
  const response = await api.post(`/jobs/${jobId}/save`);
  return response.data;
}
export const getSavedJobs = async () => {
  const response = await api.get("/jobs/saved");
  return response.data;
}

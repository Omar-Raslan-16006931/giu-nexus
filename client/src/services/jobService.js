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
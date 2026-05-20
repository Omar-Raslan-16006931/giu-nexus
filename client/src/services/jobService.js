import api from "./api";

export const createJob = async (jobData) => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};
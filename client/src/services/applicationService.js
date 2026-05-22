import api from "./api";

export const applyToJob = async (jobId, coverLetter = "") => {
  const response = await api.post(`/applications/jobs/${jobId}/apply`, { coverLetter });
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get("/applications/my");
  return response.data;
};

export const getJobApplicants = async (jobId) => {
  const response = await api.get(`/applications/jobs/${jobId}/applicants`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.patch(`/applications/${applicationId}/status`, { status });
  return response.data;
};

export const getAllApplications = async () => {
  const response = await api.get("/applications");
  return response.data;
};
export const getApplicants= async (jobId) => {
  const response = await api.get(`/applications/jobs/${jobId}/applicants`);
  return response.data;
};
import api from "./api";

export const generateCoverLetter = async ({ jobTitle, companyName, jobDescription }) => {
  const res = await api.post("/jobs/cover-letter", { jobTitle, companyName, jobDescription });
  return res.data;
};
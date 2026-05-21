import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Briefcase } from "lucide-react";
import { createJob } from "../services/jobService";
import PopupMessage from "../components/PopupMessage";

export default function CreateJobPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    location: "",
    type: "full-time",
    salary: "",
    totalSlots: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      setError("Title, company, and description are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        salary: Number(formData.salary),
        totalSlots: Number(formData.totalSlots),
      };

      await createJob(jobData);

      setPopup({
        variant: "success",
        title: "Job created!",
        message: "Your job listing has been posted. Redirecting...",
      });

      setTimeout(() => navigate("/recruiter/dashboard"), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-14 text-white">
      <PopupMessage
        open={!!popup}
        onClose={() => setPopup(null)}
        variant={popup?.variant}
        title={popup?.title}
        message={popup?.message || ""}
        durationMs={4000}
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-2 text-neutral-400">
          <Briefcase className="h-4 w-4" />
          <span className="text-sm uppercase tracking-widest">Recruiter</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
        >
          <h1 className="text-3xl font-bold">Create Job</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Add a new job listing for students to apply.
          </p>

          <div className="mt-6 space-y-4">
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Job title"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />

            <input
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Job description"
              rows="5"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />

            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Requirements separated by commas"
              rows="3"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
                <option value="contract">Contract</option>
              </select>

              <input
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Salary"
                type="number"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />

              <input
                name="totalSlots"
                value={formData.totalSlots}
                onChange={handleChange}
                placeholder="Total slots"
                type="number"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </div>

            <p
              className={`overflow-hidden text-sm text-red-400 transition-all duration-300 ${
                error ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {error}
            </p>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-black transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:cursor-pointer hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

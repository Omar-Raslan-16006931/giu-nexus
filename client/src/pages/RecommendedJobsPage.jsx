import { useEffect, useState } from "react";
import api from "../services/api";
import JobCard from "../components/JobCard";

export default function RecommendedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      const res = await api.get("/jobs/recommended");

      console.log(res.data);

      setJobs(res.data.jobs || []);
    } catch (err) {
      console.log(err);
      setError("Failed to load recommended jobs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>Recommended Jobs</h1>

      {jobs.length === 0 ? (
        <p>No recommended jobs found.</p>
      ) : (
        jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))
      )}
    </div>
  );
}
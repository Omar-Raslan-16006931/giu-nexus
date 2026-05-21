
import { useState } from "react";
import { Bookmark } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SaveJobButton({ jobId, initialSaved = false, jobStatus }) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isDisabled = jobStatus !== "open" || loading;

  const handleSave = async (e) => {
    e.stopPropagation(); 

    if (!isAuthenticated) return navigate("/login");
    if (isDisabled) return;

    
    setSaved((prev) => !prev);
    setLoading(true);

    try {
      const { data } = await api.post(`/jobs/${jobId}/save`);
      setSaved(data.saved); 
    } catch {
      setSaved((prev) => !prev); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isDisabled}
      title={
        jobStatus !== "open"
          ? "This job is closed"
          : saved
          ? "Unsave job"
          : "Save job"
      }
      className={`p-2 rounded-xl transition-all ${
        isDisabled && jobStatus !== "open"
          ? "opacity-30 cursor-not-allowed text-neutral-600"
          : saved
          ? "bg-white text-black hover:bg-neutral-200"
          : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10"
      }`}
    >
      <Bookmark
        className="w-4 h-4"
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
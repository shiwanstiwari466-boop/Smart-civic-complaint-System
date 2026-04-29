import { useState } from "react";
import { Camera, MapPin, Loader2, Send, CheckCircle } from "lucide-react";
import { analyzeComplaint } from "../services/aiService";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";

export default function SubmitComplaint() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        }
      );
    }
  };

  const handleAnalyze = async () => {
    if (!title || !description) return;
    setIsAnalyzing(true);
    const result = await analyzeComplaint(title, description);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !analysis) return;

    setIsSubmitting(true);
    const path = "complaints";
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        title,
        description,
        issueType: analysis.issueType,
        priority: analysis.priority,
        department: analysis.department,
        status: "Pending",
        location: { address: location },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"
        >
          <CheckCircle size={48} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Complaint Submitted!</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Your complaint has been registered and assigned to the <strong>{analysis?.department}</strong>. 
            You can track its status from your dashboard.
          </p>
        </div>
        <button onClick={() => window.location.href = "/"} className="btn btn-primary px-8">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Report an Issue</h1>
        <p className="text-slate-500">Provide details and our AI will categorize it automatically</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Issue Title</label>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input" 
            placeholder="e.g., Broken street light, Pothole on Sector 5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[120px]" 
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input pl-10 pr-24" 
                placeholder="GPS or Manual Address"
              />
              <button 
                type="button" 
                onClick={handleGetLocation}
                disabled={isLocating}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
              >
                {isLocating ? "..." : "Get GPS"}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Add Photo (Optional)</label>
            <button type="button" className="w-full bg-white border-2 border-dashed border-slate-300 rounded-md py-2 flex items-center justify-center gap-2 text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-all">
              <Camera size={20} />
              <span className="text-sm">Upload Photo</span>
            </button>
          </div>
        </div>

        {!analysis && (
          <button 
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !title || !description}
            className="w-full btn btn-primary py-3"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            <span>{isAnalyzing ? "Analyzing Issue..." : "Analyze with AI"}</span>
          </button>
        )}

        <AnimatePresence>
          {analysis && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-blue-50 border border-blue-100 rounded-lg p-6 space-y-4"
            >
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                AI Classification Result
                <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  {Math.round(analysis.confidence * 100)}% Confidence
                </span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-blue-600 uppercase font-bold tracking-wider">Issue Type</span>
                  <p className="font-medium text-slate-900">{analysis.issueType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-blue-600 uppercase font-bold tracking-wider">Priority</span>
                  <p className={cn(
                    "font-bold",
                    analysis.priority === "High" ? "text-red-600" : 
                    analysis.priority === "Medium" ? "text-orange-600" : "text-emerald-600"
                  )}>{analysis.priority}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-blue-600 uppercase font-bold tracking-wider">Assign To</span>
                  <p className="font-medium text-slate-900">{analysis.department}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-blue-600 uppercase font-bold tracking-wider">Smart Summary</span>
                  <p className="font-medium text-slate-900 text-sm line-clamp-1">{analysis.summary}</p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full btn bg-blue-600 text-white hover:bg-blue-700 py-3 mt-2"
              >
                Submit Official Complaint
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

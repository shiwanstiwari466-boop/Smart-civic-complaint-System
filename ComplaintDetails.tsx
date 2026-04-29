import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, MapPin, Calendar, Tag, ShieldCheck, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { Complaint } from "../types";

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const path = `complaints/${id}`;
    const unsubscribe = onSnapshot(doc(db, "complaints", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setComplaint({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
        } as Complaint);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center space-y-4 py-20">
        <h2 className="text-2xl font-bold text-slate-900">Complaint not found</h2>
        <Link to="/" className="btn btn-primary inline-flex">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Dashboard</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                complaint.status === "Pending" ? "bg-amber-100 text-amber-700" :
                complaint.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
              )}>
                {complaint.status}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                complaint.priority === "High" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
              )}>
                {complaint.priority} Priority
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {complaint.title}
              </h1>
              <div className="flex items-center gap-6 text-slate-500 text-sm">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar size={16} />
                  <span>Reported on {new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin size={16} />
                  <span>{complaint.location.address || "No location info"}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-bold text-slate-900 mb-2 underline decoration-blue-500 decoration-2 underline-offset-4">Description</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {complaint.description}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-4">
              <div className="flex-1 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Department</span>
                <p className="font-bold text-slate-900">{complaint.department}</p>
              </div>
              <div className="flex-1 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Issue Category</span>
                <p className="font-bold text-slate-900">{complaint.issueType}</p>
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={24} className="text-blue-500" />
              Timeline & Updates
            </h3>
            <div className="space-y-6">
              <div className="relative pl-8 border-l-2 border-slate-100 last:border-0 pb-6">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Complaint registered</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {new Date(complaint.createdAt).toLocaleDateString()} • System
                  </p>
                </div>
              </div>
              {complaint.adminNotes && (
                <div className="relative pl-8 border-l-2 border-slate-100 last:border-0 pb-6">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{complaint.adminNotes}</p>
                    <p className="text-xs text-slate-500 font-medium">Admin Note</p>
                  </div>
                </div>
              ) }
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-blue-600 text-white space-y-4">
            <ShieldCheck size={40} className="text-blue-200" />
            <h3 className="text-lg font-bold">Trusted Citizen Program</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Your reports help create a better community. High-accuracy regular reporters 
              get priority status for their future complaints.
            </p>
          </div>

          <div className="card p-6 space-y-4 text-center">
            <h4 className="font-bold text-slate-900">Need immediate help?</h4>
            <p className="text-xs text-slate-500">
              For life-threatening emergencies, please call the local emergency number (e.g., 911 or 100) immediately.
            </p>
            <button className="w-full btn btn-secondary text-sm">Contact Hotline</button>
          </div>
        </div>
      </div>
    </div>
  );
}

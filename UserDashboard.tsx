import { useState, useEffect } from "react";
import { Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import type { Complaint } from "../types";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";

export default function UserDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;

    const path = "complaints";
    const q = query(
      collection(db, path),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      })) as Complaint[];
      setComplaints(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredComplaints = complaints.filter(c => {
    const matchesFilter = filter === "all" || c.status.toLowerCase().replace(" ", "-") === filter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusIcons = {
    "Pending": <Clock className="text-amber-500" size={16} />,
    "In Progress": <AlertCircle className="text-blue-500" size={16} />,
    "Resolved": <CheckCircle2 className="text-emerald-500" size={16} />,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Complaints</h1>
          <p className="text-slate-500">Track and manage your reports</p>
        </div>
        <Link to="/submit" className="btn btn-primary">
          <Plus size={20} />
          <span>New Complaint</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={18} />
          <input 
            type="text" 
            placeholder="Search complaints..." 
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-white rounded-md border border-slate-200 p-1">
          {["all", "pending", "in-progress", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md capitalize transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                filter === s ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {s.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Filter className="text-slate-300" size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900">No complaints found</h3>
            <p className="text-slate-500 text-sm">
              {search || filter !== "all" ? "Try adjusting your filters" : "Start by reporting a new civic issue"}
            </p>
          </div>
          {!search && filter === "all" && (
            <Link to="/submit" className="btn btn-primary inline-flex">
              Report Issue
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="card p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] uppercase font-bold rounded-full tracking-wider",
                    complaint.priority === "High" ? "bg-red-100 text-red-700" : 
                    complaint.priority === "Medium" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {complaint.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">{complaint.issueType}</span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900">{complaint.title}</h3>
                <p className="text-slate-600 line-clamp-2 text-sm">{complaint.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                  <div className="flex items-center gap-1.5">
                    {statusIcons[complaint.status]}
                    <span className="font-semibold">{complaint.status}</span>
                  </div>
                  <span>•</span>
                  <span>{complaint.location.address || "No location"}</span>
                  <span>•</span>
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex md:flex-col gap-2 w-full md:w-auto">
                <Link to={`/complaint/${complaint.id}`} className="btn btn-secondary flex-1 py-1.5 text-sm text-center">View Details</Link>
                <button className="btn btn-secondary flex-1 py-1.5 text-sm">Track Progress</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


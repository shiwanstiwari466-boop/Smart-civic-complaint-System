import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, CheckCircle2, Clock, Users, ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
    critical: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = "complaints";
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      const newStats = {
        total: data.length,
        pending: data.filter(d => d.status === "Pending").length,
        resolved: data.filter(d => d.status === "Resolved").length,
        inProgress: data.filter(d => d.status === "In Progress").length,
        critical: data.filter(d => d.priority === "High").length
      };
      setStats(newStats);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  const CHART_DATA = [
    { name: "Pnd.", count: stats.pending },
    { name: "Prog.", count: stats.inProgress },
    { name: "Res.", count: stats.resolved },
  ];

  const PIE_DATA = [
    { name: "Resolved", value: stats.resolved || 1, color: "#10b981" },
    { name: "In Progress", value: stats.inProgress || 1, color: "#3b82f6" },
    { name: "Pending", value: stats.pending || 1, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-slate-500">System-wide complaint statistics and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints", value: stats.total, icon: Users, color: "blue" },
          { label: "Pending Issues", value: stats.pending, icon: Clock, color: "amber" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "emerald" },
          { label: "Critical Priority", value: stats.critical, icon: AlertTriangle, color: "red" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div className={cn("p-2 rounded-lg", 
                stat.color === 'blue' ? "bg-blue-100 text-blue-600" :
                stat.color === 'amber' ? "bg-amber-100 text-amber-600" :
                stat.color === 'emerald' ? "bg-emerald-100 text-emerald-600" :
                "bg-red-100 text-red-600"
              )}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h2 className="text-2xl font-bold text-slate-900">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-slate-900 mb-6 underline decoration-blue-500 decoration-2 underline-offset-4">Complaints Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-6 underline decoration-emerald-500 decoration-2 underline-offset-4">Resolution Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {PIE_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

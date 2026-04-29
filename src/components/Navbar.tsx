import { LogOut, LayoutDashboard, FileText, Settings, UserCircle, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "./AuthProvider";

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/submit", icon: FileText, label: "Submit Complaint" },
  ];

  if (user?.role === "admin") {
    links.push({ to: "/admin", icon: Settings, label: "Admin" });
  }

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 p-4 hidden md:flex flex-col">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Bell className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-blue-600">SmartCivic</span>
      </div>

      <div className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
          ) : (
            <UserCircle className="text-slate-400" size={32} />
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-slate-900 truncate">{user?.displayName}</span>
            <span className="text-xs text-slate-500 truncate capitalize">{user?.role}</span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}


export function MobileNavbar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50">
      <Link to="/" className="flex flex-col items-center gap-1 text-slate-600">
        <LayoutDashboard size={24} />
        <span className="text-[10px]">Dashboard</span>
      </Link>
      <Link to="/submit" className="flex flex-col items-center gap-1 text-slate-600">
        <FileText size={24} />
        <span className="text-[10px]">Report</span>
      </Link>
      <Link to="/admin" className="flex flex-col items-center gap-1 text-slate-600">
        <Settings size={24} />
        <span className="text-[10px]">Admin</span>
      </Link>
    </nav>
  );
}

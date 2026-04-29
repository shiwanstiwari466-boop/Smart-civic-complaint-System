import { Bell, Loader2 } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { useState } from "react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = async () => {
    setIsPending(true);
    try {
      await signIn();
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white space-y-4">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
            <Bell size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">SmartCivic</h1>
            <p className="text-blue-100 font-medium">Empowering Citizens, Fixing Cities</p>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Join thousands of citizens reporting issues in real-time</p>
          </div>

          <button 
            onClick={handleSignIn}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            )}
            <span>{isPending ? "Connecting..." : "Sign in with Google"}</span>
          </button>


          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">or use guest access</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full btn btn-secondary py-3 text-slate-600 font-bold"
          >
            Continue as Guest
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

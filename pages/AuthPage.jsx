import React, { useState } from "react";
import InputField from "../components/InputField";
import { auth } from "../services/firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import * as api from "../services/apiService";
const AuthPage = ({ onAuthComplete, onBack, initialMode = "signin" }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Automatically forward if already authenticated
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user = {
          username: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          email: firebaseUser.email,
          tier: "Elite Engineer",
          uid: firebaseUser.uid
        };
        onAuthComplete(user);
      }
    });
    return () => unsubscribe();
  }, [onAuthComplete]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = {
        username: result.user.displayName,
        email: result.user.email,
        tier: "Elite Engineer",
        uid: result.user.uid,
        photoURL: result.user.photoURL || null
      };
      try {
        await api.updateUserProfile(user.uid, {
          id: user.uid,
          name: user.username,
          username: user.username,
          email: user.email
        });
      } catch (dbErr) {
        console.error("DB Sync Error:", dbErr);
      }
      onAuthComplete(user);
    } catch (err) {
      console.error("Google Auth error:", err);
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        await updateProfile(userCredential.user, {
          displayName: formData.username
        });
        
        const user = {
          username: formData.username,
          email: userCredential.user.email,
          tier: "New Pilot",
          uid: userCredential.user.uid
        };
        try {
          await api.updateUserProfile(user.uid, {
            id: user.uid,
            name: user.username,
            username: user.username,
            email: user.email,
            password: formData.password,
            orderHistory: [],
            cart: []
          });
        } catch (dbErr) {
          console.error("DB Sync Error:", dbErr);
        }
        onAuthComplete(user);
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        const user = {
          username: userCredential.user.displayName || userCredential.user.email.split("@")[0],
          email: userCredential.user.email,
          tier: "Elite Engineer",
          uid: userCredential.user.uid
        };
        try {
          await api.updateUserProfile(user.uid, {
            id: user.uid,
            name: user.username,
            username: user.username,
            email: user.email,
            password: formData.password
          });
        } catch (dbErr) {
          console.error("DB Sync Error:", dbErr);
        }
        onAuthComplete(user);
      }
    } catch (err) {
      console.error("Auth error:", err);
      let message = err.message.replace("Firebase: ", "");
      if (err.code === "auth/invalid-credential") {
        message = "Incorrect email or password. Please try again.";
      } else if (err.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Network connection lost. Check your signal.";
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-6 py-20 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none opacity-20 transition-opacity">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-3xl p-10 shadow-2xl backdrop-blur-xl transition-all duration-300 relative">
          <button
            onClick={onBack}
            className="absolute top-8 left-8 text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back</span>
          </button>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6 transition-all">
              <span className="material-symbols-outlined text-4xl">bolt</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2 transition-colors">
              {mode === "signin" ? "Link System" : "Create Identity"}
            </h1>
            <p className="text-gray-500 text-sm font-medium transition-colors">
              Access your engineering dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <InputField
                label="Pilot Name"
                required
                placeholder="e.g. NeoArch"
                icon="person"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            )}

            <InputField
              label="Neural Address (Email)"
              required
              type="email"
              placeholder="name@nexus.com"
              icon="alternate_email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <InputField
              label="Access Code (Password)"
              required
              type="password"
              placeholder="••••••••"
              icon="key"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <button
              disabled={isLoading}
              className="w-full bg-primary hover:bg-[#6a19b0] disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] shadow-glow transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  {mode === "signin" ? "Initialize" : "Register"}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/5 dark:border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-surface-dark px-4 text-gray-500 font-bold tracking-widest">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-5 h-5"
              />
              <span>Google Identity</span>
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 text-center transition-colors">
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              {mode === "signin"
                ? "Don't have an ID? Create one"
                : "Already registered? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { isLoggedIn, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [fullName, setFullName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 400));

    const result = login(username.trim(), password);
    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const result = register({
      username: newUsername.trim(),
      password: newPassword,
      name: fullName.trim(),
      role: "Staff",
    });

    if (result.success) {
      login(newUsername.trim(), newPassword);
      navigate("/", { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img
            src="https://growth.ethara.ai/web/image/res.company/1/logo"
            alt="Ethara AI"
            className="h-10 w-auto object-contain"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div>
            <h1 className="text-xl font-bold text-white">
              {mode === "login" ? "Sign In" : "Create Account"}
            </h1>
            <p className="mt-0.5 text-sm text-white/55">
              {mode === "login" ? "Sign in to your account" : "Set up your new account"}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          {mode === "login" ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/75" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/75" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-white/25 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition-colors hover:text-white"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="text-center text-sm text-white/55">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setUsername("");
                    setPassword("");
                  }}
                  className="font-medium text-accent-400 transition-colors hover:text-accent-300"
                >
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/75">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/75">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Choose a username"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/75">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="At least 6 characters"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-white/25 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition-colors hover:text-white"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/75">Confirm Password</label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value);
                    setError("");
                  }}
                  placeholder="Re-enter your password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400/30"
                />
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : null}
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-white/55">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setFullName("");
                    setNewUsername("");
                    setNewPassword("");
                    setConfirmPass("");
                  }}
                  className="font-medium text-accent-400 transition-colors hover:text-accent-300"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        {mode === "login" && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/55">
            <p className="mb-1.5 font-medium text-white/70">Demo credentials:</p>
            <p>
              Username: <span className="font-mono text-white/85">admin</span> · Password:{" "}
              <span className="font-mono text-white/85">admin123</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

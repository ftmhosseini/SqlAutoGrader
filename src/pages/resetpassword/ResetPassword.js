import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../firebase";
import "../register/Register.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (!oobCode) return setError("Invalid or expired reset link.");

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Reset link is invalid or has expired. Please request a new one.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Set New Password</h2>
        <p className="auth-subtitle">Enter your new password below.</p>

        {message && <p style={{ color: "green", marginBottom: "10px" }}>{message}</p>}
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="auth-footer">
          <span onClick={() => navigate("/login")}>Back to Login</span>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;

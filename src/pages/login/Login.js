import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getUser, markUserVerified } from "../../components/model/users";
import userSession from "../../components/services/UserSession";
import "../register/Register.css";

function Login() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loggedIn) navigate("/dashboard", { replace: true });
  }, [loggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await user.reload();

      if (!user.emailVerified) {
        try {
          await sendEmailVerification(user);
          setError("Email not verified. We've sent a NEW verification link to your inbox. Please check it!");
        } catch (error) {
          setError("Email not verified. Failed to send verification email. Please try again later.");
        }
        setIsLoading(false);
        return;
      }

      await markUserVerified(user.uid);
      const userData = await getUser(user.uid);
      if (!userData) throw new Error("USER_NOT_FOUND_IN_DB");

      userSession.set(userData);
      setLoggedIn(true);

    } catch (err) {
      setError("Wrong email or password. Or user does not exist.");
    } finally {
      setIsLoading(false);
    }
  };




  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        {error && <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{error}</p>}
        <p className="auth-subtitle">Log in to your account</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="name@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
              <span className="forgot-link" onClick={() => navigate("/forgot-password")}>Forgot?</span>


            </div>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required />
          </div>
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>        </form>

        <p className="auth-footer">
          Don't have an account? <span onClick={() => navigate("/register")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
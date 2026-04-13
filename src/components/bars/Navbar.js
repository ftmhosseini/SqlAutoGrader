import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import userSession from "../../components/services/UserSession";
import "./components.css"

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const userName = currentUser ? (userSession.fullName || "") : "";
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => setCurrentUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => { userSession.set(null); window.location.replace("/"); });
  };

  const Avatar = () => (
    <div className="nav-avatar">
      {userName ? userName.charAt(0).toUpperCase() : "U"}
    </div>
  );

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">🌐 SQL Practice Platform</Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>

        <div className={`nav-links${menuOpen ? " open" : ""}`}>

          {currentUser && (
            <Link to="/dashboard/profile" className="nav-mobile-user" onClick={() => setMenuOpen(false)}>
              <Avatar />
              <span>{userName || "User"}</span>
            </Link>
          )}

          {currentUser && <Link to="/dashboard" className="nav-item" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          <Link to="/" className="nav-item" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className="nav-item" onClick={() => setMenuOpen(false)}>About</Link>

          {currentUser && (
            <div ref={dropdownRef} className="nav-desktop-avatar">
              <div onClick={() => setDropdownOpen(!dropdownOpen)} className="nav-avatar-trigger">
                <span className="nav-username">{userName || "User"}</span>
                <Avatar />
              </div>
              {dropdownOpen && (
                <div className="nav-dropdown" style={{marginRight:'10px'}}>
                  <button onClick={handleLogout} className="nav-dropdown-btn">Sign Out</button>
                </div>
              )}
            </div>
          )}
          {!currentUser && <Link to="/login" className="login-button" onClick={() => setMenuOpen(false)}>Login</Link>}

          {currentUser && (
            <button className="nav-mobile-signout" onClick={handleLogout}>Sign Out</button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;

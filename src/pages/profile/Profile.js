import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { getUser } from "../../components/model/users";
import userSession from "../../components/services/UserSession";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: userSession.fullName,
    role: userSession.role,
    email: userSession.email,
    createdAt: userSession.createdAt,
  });

  useEffect(() => {
    if (profile.role) return; // already populated
    const uid = userSession.uid || auth.currentUser?.uid;
    if (!uid) return;
    getUser(uid).then(data => { if (data) setProfile(data); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { fullName, role, email, createdAt } = profile;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {fullName?.charAt(0) || "U"}
          </div>
          <h2>{fullName || "User Name"}</h2>
          <p className="profile-role">{role?.toUpperCase()}</p>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <label>Email Address</label>
            <span>{email}</span>
          </div>
          <div className="info-item">
            <label>Member Since</label>
            <span>{createdAt?.toDate().toLocaleDateString("en-CA") || "Recently"}</span>
          </div>
        </div>

        {/* <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-val">12</span>
            <span className="stat-label">Solved</span>
          </div>
          <div className="stat-box">
            <span className="stat-val">85%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
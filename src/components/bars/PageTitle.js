import { useNavigate } from "react-router-dom";
import './components.css';

export const PageTitle = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 99,
      background: "#fff",
      borderBottom: "1px solid #eef2f6",
      padding: "10px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent:'space-between',
      gap: 16,
      marginBottom: 20,
      marginLeft: -24,
      marginRight: -24,
    }}>
      <button onClick={() => navigate(-1)}
        style={{ 
          background: "none", 
          border: "none", 
          color: "#4e73df", 
          fontWeight: 600, 
          cursor: "pointer", 
          fontSize: 14, 
          padding: 0, 
          marginBottom:'10px',
          whiteSpace: "nowrap" 
          }}>
        ← Back
      </button>
      <h2 style={{ 
        margin: 0, 
        fontSize: 22, 
        fontWeight: 700, 
        color: "#1a2b4b" 
        }}>{title}</h2>
    </div>
  );
};

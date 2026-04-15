import { useNavigate } from "react-router-dom";
import userSession from "../../components/services/UserSession";
import { FaAndroid, FaApple } from 'react-icons/fa';
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const userRole = userSession.role;

  return (
    <div className="home-container">



      <section className="hero">
        <h1>SQL Practice Platform</h1>
        <p>Learn SQL interactively in your browser using real datasets.</p>
        <button className="start-btn" onClick={() => userRole ? navigate("dashboard") : navigate("/login")}>
          Start Practicing
        </button>
      </section>


      <section className="features">
        <h2>Explore Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">📄</div>
            <h3>Real Datasets</h3>
            <p>Instant access to datasets: Employees, Customers, Movies.</p>
          </div>
          <div className="feature-card">
            <div className="icon">⌨️</div>
            <h3>Instant Query Execution</h3>
            <p>Real Database deploys right in your browser.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🤖</div>
            <h3>Automatic Grading</h3>
            <p>Get instant feedback on your SQL queries.</p>
          </div>
        </div>
      </section>

      <section className="features" style={{ marginTop: 40, background: '#f8f9fc' }}>
        <h2>For Teachers</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">🗂️</div>
            <h3>Dataset Manager</h3>
            <p>Create custom datasets with tables and seed data for your students.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📝</div>
            <h3>Assignments & Quizzes</h3>
            <p>Build multi-question assignments with AI-generated SQL questions. Publish when ready.</p>
          </div>
          <div className="feature-card">
            <div className="icon">👥</div>
            <h3>Cohort Management</h3>
            <p>Organise students into cohorts and distribute assignments with a join code.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📊</div>
            <h3>Submission Status</h3>
            <p>Track every student's progress and override scores when needed.</p>
          </div>
        </div>
      </section>

      <section className="features" style={{ marginTop: 40 }}>
        <h2>For Students</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">💻</div>
            <h3>SQL Editor</h3>
            <p>Write and run SQL queries directly in the browser — no setup required.</p>
          </div>
          <div className="feature-card">
            <div className="icon">✅</div>
            <h3>Instant Feedback</h3>
            <p>Your query is graded automatically against the expected result set.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🎓</div>
            <h3>SQL Tutor</h3>
            <p>7 structured lessons with a live sandbox and an AI chat assistant.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🏆</div>
            <h3>Results & Progress</h3>
            <p>View your scores across all assignments and track your improvement.</p>
          </div>
        </div>
      </section>

      <section className="features" style={{ background: '#1a2b4b', padding: '60px 20px', marginTop:'20px'}}>
        <h2 style={{ color: 'white', marginBottom: '8px' }}>Get the Mobile App</h2>
        {/* <p style={{color: '#ffffff99', marginBottom: '40px'}}>The same platform, on your iOS and Android device.</p> */}
        <div className="features-grid" style={{ marginTop: 0 }}>
          <a
            href="https://a3.files.diawi.com/app-file/4DTKrAj9U2YvgKtWJApk.apk"
            //https://a3.files.diawi.com/app-file/mGWIpUIekefvxHJNhsiG.apk"//https://a4.files.diawi.com/app-file/5fX7DSJ9NVSWGre8RRpu.apk//https://i.diawi.com/K8a6fE"
            className="feature-card"
            style={{ textDecoration: 'none', background: '#ffffff15', border: '1px solid #ffffff30', borderRadius: '12px', color: 'white', maxWidth: '280px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <FaAndroid style={{ color: '#3DDC84' }} />

              <h3 style={{ color: 'white' }}>Android</h3>
            </div>
            <p style={{ color: '#ffffffcc' }}>Download the APK and install directly on your Android device.</p>
            <span style={{ marginTop: '12px', background: '#4e73df', color: 'white', padding: '10px 24px', borderRadius: '6px', fontWeight: 600 }}>
              Download APK
            </span>
          </a>
          {/* <a
            href="YOUR_IOS_DOWNLOAD_URL"
            className="feature-card"
            style={{textDecoration: 'none', background: '#ffffff15', border: '1px solid #ffffff30', borderRadius: '12px', color: 'white', maxWidth: '280px'}}
          >
            <div style={{ textAlign: 'center' }}>
        <FaApple style={{ color: '#555555' }} />
        <h3 style={{color: 'white'}}>iOS</h3>
      </div>
            
            <p style={{color: '#ffffffcc'}}>Download and install on your iPhone or iPad.</p>
            <span style={{marginTop: '12px', background: '#4e73df', color: 'white', padding: '10px 24px', borderRadius: '6px', fontWeight: 600}}>
              Download IPA
            </span>
          </a> */}
        </div>
      </section>
    </div>
  );
}

export default Home;
import AssignmentTable from "./studentAssignment/AssignmentTable";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import QuizTable from "./QuizTable";
import "./Submission.css"; 
import { PageTitle } from "../../../../components/bars/PageTitle";

function SubmissionStatusPage() {
  return (
    <>
      <PageTitle title={"Submission Status"}/>
        <div className="card shadow mb-4">
        <Tabs>
          <TabList>
            <Tab>Assignments</Tab>
            <Tab>Quizzes</Tab>
          </TabList>
          <TabPanel>
            <AssignmentTable />
          </TabPanel>
          <TabPanel>
            <QuizTable />
          </TabPanel>
          </Tabs>
          </div>
      {/* {(selectedStudentId !== "") ? (
        <div className="card shadow mb-4">
          <div className="card-body">
             <StudentAssignmentPage
                studentId={selectedStudentId}
                assignmentId={selectedAssignmetId}
                onBack={() => setSelectedStudentId("")}
              />
          </div>
        </div>
      ) : (
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "assignments" ? "active" : ""}`}
                  onClick={() => setActiveTab("assignments")}
                >
                  Assignments
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "quizzes" ? "active" : ""}`}
                  onClick={() => setActiveTab("quizzes")}
                >
                  Quizzes
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body">
            {activeTab === "assignments" ? (
              <AssignmentTable 
                onSelectStudent={setSelectedStudentId} 
                onselectAssignmentId={setselectedAssignmetId}
              />
            ) : (
              <QuizTable onSelectStudent={setSelectedStudentId} />
            )}
          </div>
        </div>
      )} */}
    </>
  );
}

export default SubmissionStatusPage;

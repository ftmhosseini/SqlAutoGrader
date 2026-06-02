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

    </>
  );
}

export default SubmissionStatusPage;

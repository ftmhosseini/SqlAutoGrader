import { useState, useEffect } from "react";
import { useAppContext } from "../../../../../components/db/service/context";
import { getPresetQuestions } from '../../../../../components/model/presetQuestions';
import TableSchema from '../../../tableView/TableSchema';
import { CodeEditor } from "./CodeEditor";
import CollapsiblePanel from '../collapsiblepanel/CollapsiblePanel';
import './CreateQuestionSet.css';
import { filteredPresets, generateQuestionsFromSchema } from "../../../../../components/services/aiQuestions";

const calculateTotal = (qs) => qs.reduce((acc, q) => acc + (parseInt(q.mark) || 0), 0);

function CreateQuestionSet({ onAddQuestions, setDb, existingQuestions = [], existingDataset = "", setTotalMarks, datasets }) {
  const { allTables, getTableSchemaInTable, runSelectQuery } = useAppContext();

  const [selectedDataset, setSelectedDataset] = useState(existingDataset);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState({}); // per-question: { [question_id]: string[] }
  const [selectedTableForSchema, setSelectedTableForSchema] = useState("");
  const [tableSchemas, setTableSchemas] = useState({});
  const [presets, setPresets] = useState([]);
  const [presetError, setPresetError] = useState("")
  const [questions, setQuestions] = useState(existingQuestions);
  const [savedCount, setSavedCount] = useState(existingQuestions.length);
  const [total, setTotal] = useState(calculateTotal(existingQuestions));

  // const filteredPresets = (questionId) => {
  //   const tables = selectedTable[questionId] || [];

  //   return tables.length > 0
  //     ? presets.filter(p => {
  //       if (!Array.isArray(p.tables) || p.tables.length !== tables.length) {
  //         return false;
  //       }
  //       // Sort both to ensure matching content regardless of JSON order
  //       const sortedP = [...p.tables].sort();
  //       const sortedSelected = [...tables].sort();

  //       return sortedP.every((val, index) => val === sortedSelected[index]);
  //     })
  //     : presets;
  // };


  useEffect(() => {
    if (!selectedDataset) return;
    allTables(selectedDataset).then(async (tables) => {
      const names = tables.map((t) => t.tableName);
      setAvailableTables(names);
      // names.forEach((table) => {
      //   getTableSchemaInTable(selectedDataset, table).then((schema) =>
      //     setTableSchemas((prev) => ({ ...prev, [table]: schema }))
      //   );
      // });
      const schemas = {};
      await Promise.all(names.map(async (table) => {
        schemas[table] = await getTableSchemaInTable(selectedDataset, table);
      }));
      if(schemas.length === 0)
        return(<p></p>)
      setTableSchemas(schemas);
      generateQuestionsFromSchema(schemas).then(setPresets).catch(setPresetError)
    });
  }, [selectedDataset, allTables]);

  const handleDatasetChange = (e) => {
    const val = e.target.value;
    if (questions.length > 0 && !window.confirm("Changing dataset will clear questions. Continue?")) return;
    setSelectedDataset(val);
    setDb(val);
    setQuestions([]);
    setSavedCount(0);
    onAddQuestions([]);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question_id: crypto.randomUUID(),
      question: "", answer: "", mark: 1,
      orderMatters: false, aliasStrict: false,
      tables: [], collapsed: false
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const saveQuestions = async () => {

    if (questions.some(q => !q.question.trim() || !q.answer.trim()))
      return alert("All questions must have text and an answer.");

    for (const [i, q] of questions.entries()) {
      const res = await runSelectQuery(selectedDataset, q.answer);
      if (!res?.isSuccessful) return alert(`Question ${i + 1}: SQL error — ${res?.message || "query returned no results or is invalid"}`);
    }

    const finalQuestions = questions.map(q => ({
      ...q,
      tables: availableTables.filter(t => q.answer.toLowerCase().includes(t.toLowerCase())),
      collapsed: true
    }));

    const totalScore = calculateTotal(finalQuestions);
    setQuestions(finalQuestions);
    setSavedCount(finalQuestions.length);
    setTotal(totalScore);
    setTotalMarks(totalScore);
    onAddQuestions(finalQuestions);
  };
  return (
    <div className="create-question-container">
      <div className="row">
        <div className="col-md-8">
          <section className="mb-4">
            <label className="font-weight-bold">Select Dataset</label>
            <select className="form-control" value={selectedDataset} onChange={handleDatasetChange}>
              <option value="">-- Choose Dataset --</option>
              {datasets.map(ds => <option key={ds} value={ds}>{ds}</option>)}
            </select>
          </section>

          {selectedDataset && (
            <section className="mb-4">
              <label className="font-weight-bold">Table Schema Viewer</label>
              <select className="form-control mb-2" onChange={(e) => setSelectedTableForSchema(e.target.value)}>
                <option value="">-- Select Table --</option>
                {availableTables.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {selectedTableForSchema && <TableSchema info={tableSchemas[selectedTableForSchema]} />}
            </section>
          )}

          <hr />

          {selectedDataset && (
            <div className="questions-section">
              <div className="d-flex justify-content-between align-items-center mb-3">

                <h4>Questions ({questions.length})</h4>
                <button className="btn btn-primary btn-sm" onClick={addQuestion}>+ Add Question</button>
              </div>

              {savedCount > 0 && (
                <div className="alert alert-success py-1">
                  ✓ {savedCount} saved | Total Marks: {total}
                </div>
              )}

              {questions.map((q, index) => (
                <CollapsiblePanel
                  key={q.question_id}
                  title={`Question ${index + 1}`}
                  isCollapsed={q.collapsed}
                  onToggle={() => updateQuestion(index, 'collapsed', !q.collapsed)}
                >
                  <div className="p-3 border rounded bg-light mb-3">


                    <div className="mb-2">
                      <label className="small font-weight-bold">Filter Presets by Table:  </label>
                      {availableTables.map((table) => (
                        <label key={table} className="mr-3 small">
                          <input type="checkbox" className="mr-1"
                            checked={(selectedTable[q.question_id] || []).includes(table)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedTable(prev => ({
                                ...prev,
                                [q.question_id]: checked
                                  ? [...(prev[q.question_id] || []), table]
                                  : (prev[q.question_id] || []).filter(t => t !== table)
                              }));
                            }}
                          />
                          {table}
                        </label>
                      ))}
                    </div>

                    <select className="form-control form-control-sm mb-2" onChange={(e) => {
                      const p = JSON.parse(e.target.value);
                      updateQuestion(index, "question", p.question);
                      updateQuestion(index, "answer", p.answer);
                      updateQuestion(index, "mark", p.mark);
                      updateQuestion(index, 'orderMatters', p.orderMatters)
                      updateQuestion(index, 'aliasStrict', p.aliasStrict)
                    }}>
                      {presetError?<p>AI is not available</p>:(<option value="">-- Use a Preset Question --</option>)}
                      {filteredPresets(q.question_id,selectedTable, presets).map(p => <option key={p.id} value={JSON.stringify(p)}>{p.question}</option>)}
                    </select>

                    <textarea className="form-control mb-2" placeholder="Question text..." value={q.question} onChange={e => updateQuestion(index, 'question', e.target.value)} />
                    <textarea className="form-control mb-2 font-weight-bold text-primary" placeholder="SQL Answer..." value={q.answer} onChange={e => updateQuestion(index, 'answer', e.target.value)} />

                    <div className="d-flex align-items-center small gap-3">
                      <label className="mb-0 mr-3"><input type="checkbox" checked={q.orderMatters} onChange={e => updateQuestion(index, 'orderMatters', e.target.checked)} /> Order Matters</label>
                      <label className="mb-0 mr-3"><input type="checkbox" checked={q.aliasStrict} onChange={e => updateQuestion(index, 'aliasStrict', e.target.checked)} /> Alias Strict</label>
                      <label className="mb-0">Marks: <input type="number" className="ml-1" style={{ width: '50px' }} value={q.mark} onChange={e => updateQuestion(index, 'mark', e.target.value)} /></label>
                    </div>
                  </div>
                </CollapsiblePanel>
              ))}

              {questions.length > 0 && (
                <button className="btn btn-success btn-block mt-4" onClick={saveQuestions} disabled={savedCount === questions.length}>
                  Save All Questions
                </button>
              )}
            </div>
          )}
        </div>

        <div className="col-md-4">
          <div className="sticky-top pt-2">
            <CodeEditor selectedDataset={selectedDataset} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateQuestionSet;
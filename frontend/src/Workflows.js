import React, { useState, useEffect } from "react";
import "./Workflows.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch workflows from backend on component mount
  useEffect(() => {
    async function fetchWorkflows() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiUrl}/api/workflows`);
        if (!res.ok) {
          throw new Error("Failed to fetch workflows");
        }
        const data = await res.json();
        setWorkflows(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflows();
  }, []);

  // Handle form submission to add a new workflow
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!newName.trim()) {
      setSubmitError("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        let errorMsg = "Failed to add workflow";
        try {
          const errorData = await res.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errorMsg);
      }

      const newWorkflow = await res.json();
      setWorkflows((prev) => [...prev, newWorkflow]); // Append the new workflow to state
      setNewName(""); // Clear input
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading workflows...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="workflow-container">
      <h2>Workflows</h2>
      {workflows.length === 0 ? (
        <p>No workflows found.</p>
      ) : (
        <ul className="workflow-list">
          {workflows.map((workflow) => (
            <li key={workflow.id} className="workflow-item">
              {workflow.name}
            </li>
          ))}
        </ul>
      )}
      <h3>Add New Workflow</h3>
      <form className="workflow-form" onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          placeholder="Workflow name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={isSubmitting}
          aria-label="Workflow name"
        />
        <button
          type="submit"
          className="add-button"
          disabled={!newName.trim() || isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </form>
      {submitError && <div className="error-message">Error: {submitError}</div>}
    </div>
  );
}

export default Workflows;

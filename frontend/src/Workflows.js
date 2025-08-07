// src/Workflows.js
import React, { useState, useEffect } from "react";
import "./Workflows.css"; // Ensure this file exists to apply styles
import { useAuth0 } from "@auth0/auth0-react";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Workflows() {
  // Auth0 hooks
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();

  // State hooks
  const [workflows, setWorkflows] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editing state
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Fetch workflows on component mount or when authenticated
  useEffect(() => {
    if (!isAuthenticated) return; // Wait until the user logs in

    async function fetchWorkflows() {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessTokenSilently();

        const res = await fetch(`${apiUrl}/api/workflows`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch workflows");
        const data = await res.json();
        setWorkflows(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflows();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Add new workflow
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!newName.trim()) {
      setSubmitError("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAccessTokenSilently();

      const res = await fetch(`${apiUrl}/api/workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to add workflow");
      const newWorkflow = await res.json();
      setWorkflows((prev) => [...prev, newWorkflow]);
      setNewName("");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a workflow
  const startEdit = (workflow) => {
    setEditingWorkflowId(workflow.id);
    setEditingName(workflow.name);
    setSubmitError(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingWorkflowId(null);
    setEditingName("");
    setSubmitError(null);
  };

  // Submit edited workflow
  const submitEdit = async (e) => {
    e.preventDefault();

    if (!editingName.trim()) {
      setSubmitError("Name is required");
      return;
    }

    try {
      const token = await getAccessTokenSilently();

      const res = await fetch(`${apiUrl}/api/workflows/${editingWorkflowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update workflow");
      const updatedWorkflow = await res.json();

      setWorkflows(workflows.map((w) => (w.id === editingWorkflowId ? updatedWorkflow : w)));
      cancelEdit();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  // Delete a workflow
  const deleteWorkflow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;

    try {
      const token = await getAccessTokenSilently();

      const res = await fetch(`${apiUrl}/api/workflows/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete workflow");
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  // If user not authenticated, show login button
  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={() => loginWithRedirect()} className="add-button">
          Log in to manage workflows
        </button>
      </div>
    );
  }

  // Loading and error UI
  if (loading) return <div>Loading workflows...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  // Main render
  return (
    <div className="workflow-container">
      <h2>Workflows</h2>

      {workflows.length === 0 ? (
        <p>No workflows found.</p>
      ) : (
        <ul className="workflow-list">
          {workflows.map((workflow) => (
            <li key={workflow.id} className="workflow-item">
              {editingWorkflowId === workflow.id ? (
                <form onSubmit={submitEdit} style={{ display: "inline" }}>
                  <input
                    className="input-field"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="add-button">
                    Save
                  </button>
                  <button type="button" className="add-button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  {workflow.name}{" "}
                  <button className="add-button" onClick={() => startEdit(workflow)}>
                    Edit
                  </button>
                  <button
                    className="add-button"
                    onClick={() => deleteWorkflow(workflow.id)}
                    style={{ marginLeft: "8px", backgroundColor: "#dc3545" }}
                    aria-label={`Delete workflow ${workflow.name}`}
                  >
                    Delete
                  </button>
                </>
              )}
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
          autoComplete="off"
        />
        <button type="submit" className="add-button" disabled={!newName.trim() || isSubmitting}>
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </form>

      {submitError && (
        <div className="error-message" role="alert" style={{ color: "red", marginTop: "10px" }}>
          Error: {submitError}
        </div>
      )}
    </div>
  );
}

export default Workflows;

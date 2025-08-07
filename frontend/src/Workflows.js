import React, { useState, useEffect } from "react";
import "./Workflows.css"; // Import CSS for styling
import { useAuth0 } from "@auth0/auth0-react";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Workflows() {
  // Auth0 hooks for authentication and token retrieval
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();

  // States for workflows list, form inputs, loading, errors, submission & editing
  const [workflows, setWorkflows] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Fetch workflows when the user is authenticated or on component mount
  useEffect(() => {
    if (!isAuthenticated) return; // Don't fetch if not authenticated

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

        // Expect backend returns { success: true, workflows: [...] }
        setWorkflows(data.workflows || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflows();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Handle adding a new workflow
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

      // Append the new workflow to the state list
      setWorkflows((prev) => [...prev, newWorkflow.workflow || newWorkflow]);

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

  // Submit edits to workflow
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

      // Replace the updated workflow in the state array
      setWorkflows(workflows.map((w) => (w.id === editingWorkflowId ? updatedWorkflow.workflow || updatedWorkflow : w)));

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

      // Remove the deleted workflow from the state list
      setWorkflows(workflows.filter((w) => w.id !== id));
      setSubmitError(null);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  // Show login prompt if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={() => loginWithRedirect()} className="add-button">
          Log in to manage workflows
        </button>
      </div>
    );
  }

  // Show loading indicator while fetching
  if (loading) return <div>Loading workflows...</div>;

  // Show error if failed to fetch workflows
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  // Main rendering
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
                    aria-label={`Edit name for ${workflow.name}`}
                    autoComplete="off"
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
                  <button
                    className="add-button"
                    onClick={() => startEdit(workflow)}
                    aria-label={`Edit workflow ${workflow.name}`}
                  >
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
          aria-label="New workflow name"
          autoComplete="off"
        />
        <button type="submit" className="add-button" disabled={!newName.trim() || isSubmitting}>
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </form>

      {/* Display any submission errors */}
      {submitError && (
        <div className="error-message" role="alert" style={{ color: "red", marginTop: "10px" }}>
          Error: {submitError}
        </div>
      )}
    </div>
  );
}

export default Workflows;

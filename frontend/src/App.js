import React, { useState, useEffect } from "react";
import { login, listInstances, createInstance, startInstance, stopInstance, getLogs } from "./api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("admintoken") || "");
  const [password, setPassword] = useState("");
  const [instances, setInstances] = useState([]);
  const [name, setName] = useState("");
  const [logs, setLogs] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  async function doLogin(e) {
    e.preventDefault();
    try {
      const data = await login(password);
      setToken(data.token);
      localStorage.setItem("admintoken", data.token);
      setPassword("");
    } catch (err) {
      alert("Login failed");
    }
  }

  async function refresh() {
    if (!token) return;
    setLoading(true);
    try {
      const list = await listInstances(token);
      setInstances(list);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch instances");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) refresh();
  }, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name) return alert("name required");
    await createInstance(token, name);
    setName("");
    await refresh();
  }

  async function handleStart(id) {
    await startInstance(token, id);
    await refresh();
  }
  async function handleStop(id) {
    await stopInstance(token, id);
    await refresh();
  }
  async function handleLogs(id) {
    const l = await getLogs(token, id);
    setLogs(l);
    setSelected(id);
  }

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin Login</h2>
        <form onSubmit={doLogin}>
          <input placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>WhatsApp Bot Dashboard (Starter)</h2>
      <div>
        <button onClick={() => { localStorage.removeItem("admintoken"); setToken(""); }}>Logout</button>
        <button onClick={refresh} disabled={loading}>Refresh</button>
      </div>

      <h3>Create Instance</h3>
      <form onSubmit={handleCreate}>
        <input placeholder="container name" value={name} onChange={e => setName(e.target.value)} />
        <button type="submit">Create & Start</button>
      </form>

      <h3>Instances</h3>
      {loading ? <div>Loading...</div> : null}
      <table border="1" cellPadding="6">
        <thead><tr><th>Name</th><th>Image</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {instances.map(i => (
            <tr key={i.id}>
              <td>{(i.names || []).join(", ")}</td>
              <td>{i.image}</td>
              <td>{i.status || i.state}</td>
              <td>
                <button onClick={() => handleStart(i.id)}>Start</button>
                <button onClick={() => handleStop(i.id)}>Stop</button>
                <button onClick={() => handleLogs(i.id)}>Logs</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected ? (
        <div style={{ marginTop: 20 }}>
          <h4>Logs for {selected}</h4>
          <pre style={{ maxHeight: 400, overflow: "auto", background: "#111", color: "#eee", padding: 10 }}>{logs}</pre>
        </div>
      ) : null}
    </div>
  );
      }

const BACKEND = process.env.REACT_APP_BACKEND || "http://localhost:4000";

export async function login(password) {
  const res = await fetch(`${BACKEND}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function listInstances(token) {
  const res = await fetch(`${BACKEND}/instances`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to list");
  return res.json();
}

export async function createInstance(token, name, env = []) {
  const res = await fetch(`${BACKEND}/instances`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, env })
  });
  return res.json();
}

export async function startInstance(token, id) {
  return fetch(`${BACKEND}/instances/${id}/start`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
}

export async function stopInstance(token, id) {
  return fetch(`${BACKEND}/instances/${id}/stop`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
}

export async function getLogs(token, id) {
  const res = await fetch(`${BACKEND}/instances/${id}/logs`, { headers: { Authorization: `Bearer ${token}` } });
  return res.text();
}

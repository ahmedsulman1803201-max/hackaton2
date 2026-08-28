const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const express = require("express");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "admin-route-test-secret";

const User = require("../models/User");
const Project = require("../models/Project");
const Application = require("../models/Application");
const Task = require("../models/Task");
const VolunteerScore = require("../models/VolunteerScore");
const adminRoutes = require("../routes/adminRoutes");

const ids = { admin: "64b000000000000000000001", student: "64b000000000000000000002", manager: "64b000000000000000000003" };
const users = Object.fromEntries(Object.entries(ids).map(([role, _id]) => [_id, {
  _id, role, name: role, email: `${role}@impacthub.test`,
  toPublicJSON() { return { id: this._id, name: this.name, email: this.email, role: this.role }; },
}]));
const project = {
  _id: "64b000000000000000000010", title: "Clean water", status: "pending",
  toPublicJSON() { return { id: this._id, title: this.title, status: this.status }; },
  async save() { return this; },
};
const application = {
  _id: "64b000000000000000000020", status: "pending", student: { name: "student", email: "student@impacthub.test" }, project: { title: "Clean water" },
  toPublicJSON() { return { id: this._id, status: this.status, student: this.student, project: this.project }; },
};

// Route tests deliberately stub only model calls: authorization and HTTP routing stay real.
User.findById = async (id) => users[id] || null;
User.countDocuments = async (filter = {}) => ({
  "{}": 3, '{"role":"student"}': 1, '{"role":"manager"}': 1,
}[JSON.stringify(filter)] || 0);
User.find = () => ({ sort: async () => Object.values(users) });
User.findByIdAndDelete = async (id) => {
  const user = users[id];
  if (user) delete users[id];
  return user || null;
};
Project.countDocuments = async (filter = {}) => ({ "{}": 1, '{"status":"pending"}': 1, '{"status":"approved"}': 0 }[JSON.stringify(filter)] || 0);
Project.find = () => ({ populate() { return this; }, sort: async () => [project] });
Project.findById = async (id) => (id === project._id ? project : null);
Application.countDocuments = async (filter = {}) => ({ "{}": 1, '{"status":"pending"}': 1 }[JSON.stringify(filter)] || 0);
Application.find = () => ({ populate() { return this; }, sort: async () => [application] });
Task.countDocuments = async (filter = {}) => ({ "{}": 2, '{"status":"completed"}': 1 }[JSON.stringify(filter)] || 0);
VolunteerScore.aggregate = async () => [{ total: 50 }];

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

let server;
let baseUrl;
test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => new Promise((resolve) => server.close(resolve)));

const tokenFor = (role) => jwt.sign({ id: ids[role] }, process.env.JWT_SECRET, { expiresIn: "1h" });
const request = async (path, { method = "GET", role } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: role ? { Authorization: `Bearer ${tokenFor(role)}` } : {},
  });
  return { status: response.status, body: await response.json() };
};

test("admin routes return 401 without a token and 403 to students and managers", async () => {
  assert.equal((await request("/api/admin/dashboard")).status, 401);
  assert.equal((await request("/api/admin/dashboard", { role: "student" })).status, 403);
  assert.equal((await request("/api/admin/dashboard", { role: "manager" })).status, 403);
});

test("admin can read dashboard, users, projects, and applications without password data", async () => {
  const dashboard = await request("/api/admin/dashboard", { role: "admin" });
  assert.equal(dashboard.status, 200);
  assert.deepEqual(dashboard.body.data.stats, {
    totalUsers: 3, totalStudents: 1, totalManagers: 1, totalProjects: 1,
    pendingProjects: 1, approvedProjects: 0, activeProjects: 0, completedProjects: 0,
    totalVolunteers: 1, totalApplications: 1, pendingApplications: 1,
    totalTasks: 2, completedTasks: 1, volunteerContributions: 50,
  });

  const userResponse = await request("/api/admin/users", { role: "admin" });
  assert.equal(userResponse.status, 200);
  assert.equal(Object.hasOwn(userResponse.body.data.users[0], "password"), false);
  assert.equal((await request("/api/admin/projects", { role: "admin" })).status, 200);
  const applications = await request("/api/admin/applications", { role: "admin" });
  assert.equal(applications.status, 200);
  assert.equal(applications.body.data.applications[0].project.title, "Clean water");
});

test("admin can approve and reject projects", async () => {
  project.status = "pending";
  const approved = await request(`/api/admin/projects/${project._id}/approve`, { method: "PUT", role: "admin" });
  assert.equal(approved.status, 200);
  assert.equal(project.status, "approved");

  const rejected = await request(`/api/admin/projects/${project._id}/reject`, { method: "PUT", role: "admin" });
  assert.equal(rejected.status, 200);
  assert.equal(project.status, "rejected");
});

test("only an admin can remove another user, and cannot remove themself", async () => {
  assert.equal((await request(`/api/admin/users/${ids.manager}`, { method: "DELETE", role: "student" })).status, 403);
  assert.equal((await request(`/api/admin/users/${ids.admin}`, { method: "DELETE", role: "admin" })).status, 400);
  assert.equal((await request(`/api/admin/users/${ids.manager}`, { method: "DELETE", role: "admin" })).status, 200);
});

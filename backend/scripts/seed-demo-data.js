require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Application = require("../models/Application");
const Task = require("../models/Task");
const TaskSubmission = require("../models/TaskSubmission");
const Notification = require("../models/Notification");
const Comment = require("../models/Comment");
const VolunteerScore = require("../models/VolunteerScore");

const upsertUser = async (data) => {
  const existing = await User.findOne({ email: data.email }).select("+password");
  if (!existing) return User.create(data);
  existing.name = data.name;
  existing.role = data.role;
  existing.city = data.city;
  existing.skills = data.skills || [];
  if (!(await existing.comparePassword(data.password))) existing.password = data.password;
  await existing.save();
  return existing;
};
const upsertProject = async (data) => Project.findOneAndUpdate({ title: data.title }, { $setOnInsert: data }, { upsert: true, new: true, runValidators: true });
const upsertTask = async (data) => Task.findOneAndUpdate({ title: data.title, project: data.project }, { $setOnInsert: data }, { upsert: true, new: true, runValidators: true });

const seedDemoData = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required to seed demo data");
  await mongoose.connect(process.env.MONGO_URI);

  const [admin, sarah, omar, maya, daniel, aisha, bilal, zain] = await Promise.all([
    upsertUser({ name: "ImpactHub Admin", email: "admin@impacthub.com", password: "admin123", role: "admin", city: "Lahore" }),
    upsertUser({ name: "ImpactHub Manager", email: "manager@impacthub.com", password: "manager123", role: "manager", city: "Lahore" }),
    upsertUser({ name: "Omar Ali", email: "omar.manager@impacthub.test", password: "Manager123!", role: "manager", city: "Karachi" }),
    upsertUser({ name: "Maya Shah", email: "maya.student@impacthub.test", password: "Student123!", role: "student", city: "Islamabad", skills: ["Design", "Community outreach"] }),
    upsertUser({ name: "Daniel Ahmed", email: "daniel.student@impacthub.test", password: "Student123!", role: "student", city: "Lahore", skills: ["Teaching", "Research"] }),
    upsertUser({ name: "Aisha Noor", email: "aisha.student@impacthub.test", password: "Student123!", role: "student", city: "Karachi", skills: ["Photography", "Social media"] }),
    upsertUser({ name: "Bilal Raza", email: "bilal.student@impacthub.test", password: "Student123!", role: "student", city: "Rawalpindi", skills: ["Engineering", "Data collection"] }),
    upsertUser({ name: "Zain Malik", email: "zain.student@impacthub.test", password: "Student123!", role: "student", city: "Lahore", skills: ["Logistics", "First aid"] }),
  ]);

  const [greenStreets, digitalSkills, garden, relief] = await Promise.all([
    upsertProject({ title: "Green Streets Initiative", description: "Residents plant trees and improve shared public spaces.", category: "Environment", skillsRequired: ["Community outreach", "Photography"], location: "Lahore", startDate: new Date("2026-09-10"), endDate: new Date("2026-11-10"), requiredVolunteers: 12, status: "active", createdBy: sarah._id, members: [maya._id, aisha._id] }),
    upsertProject({ title: "Digital Skills for Youth", description: "Weekend mentoring that gives young people practical digital skills.", category: "Education", skillsRequired: ["Teaching", "Design"], location: "Karachi", startDate: new Date("2026-09-20"), endDate: new Date("2026-12-20"), requiredVolunteers: 8, status: "approved", createdBy: omar._id, members: [daniel._id] }),
    upsertProject({ title: "Community Garden Network", description: "Build a shared urban garden and teach sustainable growing.", category: "Community", skillsRequired: ["Gardening", "Community outreach"], location: "Islamabad", startDate: new Date("2026-10-01"), endDate: new Date("2027-01-15"), requiredVolunteers: 10, status: "pending", createdBy: sarah._id, members: [] }),
    upsertProject({ title: "Flood Relief Supply Drive", description: "Coordinate donation sorting and delivery support for affected families.", category: "Humanitarian", skillsRequired: ["Logistics", "Data collection"], location: "Rawalpindi", startDate: new Date("2026-07-01"), endDate: new Date("2026-08-15"), requiredVolunteers: 20, status: "completed", createdBy: omar._id, members: [bilal._id, zain._id] }),
  ]);

  await Promise.all([
    Application.findOneAndUpdate({ student: bilal._id, project: digitalSkills._id }, { $setOnInsert: { student: bilal._id, project: digitalSkills._id, status: "pending", message: "I can support session logistics." } }, { upsert: true }),
    Application.findOneAndUpdate({ student: maya._id, project: garden._id }, { $setOnInsert: { student: maya._id, project: garden._id, status: "pending", message: "I would love to coordinate volunteers." } }, { upsert: true }),
    Application.findOneAndUpdate({ student: daniel._id, project: greenStreets._id }, { $setOnInsert: { student: daniel._id, project: greenStreets._id, status: "rejected", reviewedAt: new Date(), reviewedBy: sarah._id } }, { upsert: true }),
  ]);

  const [mapping, workshop, completedTask] = await Promise.all([
    upsertTask({ title: "Map tree planting locations", description: "Prepare a verified list of planting locations and permissions.", project: greenStreets._id, assignedTo: maya._id, assignedBy: sarah._id, dueDate: new Date("2026-09-15"), priority: "high", status: "in_progress" }),
    upsertTask({ title: "Prepare workshop plan", description: "Draft the first four digital-skills workshop sessions.", project: digitalSkills._id, assignedTo: daniel._id, assignedBy: omar._id, dueDate: new Date("2026-09-25"), priority: "medium", status: "pending" }),
    upsertTask({ title: "Sort relief supply inventory", description: "Verify and catalogue the completed supply inventory.", project: relief._id, assignedTo: bilal._id, assignedBy: omar._id, dueDate: new Date("2026-08-01"), priority: "high", status: "completed" }),
  ]);

  await TaskSubmission.findOneAndUpdate({ task: completedTask._id, volunteer: bilal._id }, { $setOnInsert: { task: completedTask._id, volunteer: bilal._id, description: "Inventory completed and verified.", status: "reviewed", score: 90, scoredBy: omar._id, scoredAt: new Date() } }, { upsert: true });
  await VolunteerScore.findOneAndUpdate({ volunteer: bilal._id }, { $set: { totalScore: 90, tasksCompleted: 1, tasksSubmitted: 1, averageScore: 90, level: "beginner" } }, { upsert: true, runValidators: true });
  await VolunteerScore.findOneAndUpdate({ volunteer: maya._id }, { $set: { totalScore: 45, tasksCompleted: 0, tasksSubmitted: 0, averageScore: 0, level: "beginner" } }, { upsert: true, runValidators: true });

  await Promise.all([
    Notification.findOneAndUpdate({ recipient: maya._id, relatedTask: mapping._id }, { $setOnInsert: { recipient: maya._id, type: "TASK_ASSIGNED", message: "You were assigned Map tree planting locations", relatedProject: greenStreets._id, relatedTask: mapping._id } }, { upsert: true }),
    Notification.findOneAndUpdate({ recipient: sarah._id, relatedProject: garden._id }, { $setOnInsert: { recipient: sarah._id, type: "APPLICATION_RECEIVED", message: "New volunteer application for Community Garden Network", relatedProject: garden._id } }, { upsert: true }),
    Comment.findOneAndUpdate({ project: greenStreets._id, author: maya._id, content: "Excited to map the first planting locations this week." }, { $setOnInsert: { project: greenStreets._id, author: maya._id, content: "Excited to map the first planting locations this week." } }, { upsert: true }),
  ]);

  const counts = await Promise.all([User.countDocuments(), Project.countDocuments(), Application.countDocuments(), Task.countDocuments(), Notification.countDocuments(), Comment.countDocuments()]);
  console.log(JSON.stringify({ users: counts[0], projects: counts[1], applications: counts[2], tasks: counts[3], notifications: counts[4], comments: counts[5], demoCredentials: { admin: "admin@impacthub.com / admin123", manager: "manager@impacthub.com / manager123", student: "maya.student@impacthub.test / Student123!" } }, null, 2));
  await mongoose.disconnect();
};

seedDemoData().catch(async (error) => {
  console.error("Demo seed failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

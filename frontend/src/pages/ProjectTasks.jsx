import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicNavbar from "../components/layout/PublicNavbar";
import PublicFooter from "../components/layout/PublicFooter";
import ProjectSubNav from "../components/projects/ProjectSubNav";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import api from "../services/api";
import { getProject, getTasks, updateTaskStatus } from "../services/projects";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { entityId } from "../utils/ids";

const ProjectTasks = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "", dueDate: "", priority: "medium" });

  const load = async () => {
    const [projectData, taskData] = await Promise.all([getProject(id), getTasks({ project: id })]);
    setProject(projectData);
    setTasks(taskData);
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      try {
        const [projectData, taskData] = await Promise.all([getProject(id), getTasks({ project: id })]);
        if (!active) return;
        setProject(projectData);
        setTasks(taskData);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || "Unable to load project tasks.");
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [id]);

  if (!user) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><PublicNavbar /><EmptyState title="Sign in to view tasks" description="Project task boards are available to signed-in members." action={<Link to="/login" className="text-brand-600 font-semibold">Sign in</Link>} /><PublicFooter /></div>;
  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><PublicNavbar /><LoadingSpinner label="Loading project tasks..." /><PublicFooter /></div>;
  if (error || !project) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><PublicNavbar /><EmptyState title="Tasks unavailable" description={error || "Project not found."} action={<Link to="/discover" className="text-brand-600 font-semibold">Browse projects</Link>} /><PublicFooter /></div>;

  const isManager = user.role === "admin" || project.managerId === user.id;
  const isMember = project.memberIds.includes(user.id);
  const members = project.members || [];

  const changeStatus = async (task, status) => {
    try {
      const updated = await updateTaskStatus(task.id, status, user.role);
      setTasks((current) => current.map((item) => item.id === task.id ? updated : item));
      toast("Task status updated", "success");
    } catch (requestError) { toast(requestError.response?.data?.message || "Unable to update task.", "error"); }
  };

  const createTask = async (event) => {
    event.preventDefault();
    try {
      await api.post("/tasks", { ...form, project: id });
      setShowCreate(false); setForm({ title: "", description: "", assignedTo: "", dueDate: "", priority: "medium" });
      await load(); toast("Task assigned successfully", "success");
    } catch (requestError) { toast(requestError.response?.data?.message || "Unable to create task.", "error"); }
  };

  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><PublicNavbar /><main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ProjectSubNav />
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6"><div><h1 className="text-2xl font-bold">{project.title} tasks</h1><p className="text-sm text-slate-500 mt-1">Track real assignments and submission-ready work.</p></div>{isManager && <Button onClick={() => setShowCreate(true)}>Assign task</Button>}</div>
    {!isManager && !isMember ? <EmptyState title="Project membership required" description="Only project members can view the task board." /> : tasks.length === 0 ? <EmptyState title="No tasks yet" description={isManager ? "Assign the first task to an approved volunteer." : "Your manager has not assigned work yet."} /> : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{tasks.map((task) => <article key={task.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"><div className="flex justify-between gap-3"><h2 className="font-semibold">{task.title}</h2><Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{task.priority}</Badge></div><p className="text-sm text-slate-500 mt-2">{task.description}</p><p className="text-xs text-slate-400 mt-4">Due {new Date(task.dueDate).toLocaleDateString()}</p><p className="text-xs text-slate-400 mt-1">Assigned to {task.assignedTo?.name || "Volunteer"}</p>{entityId(task.assignedTo) === user.id && task.status !== "submitted" && task.status !== "completed" && <div className="flex gap-2 mt-4"><Button variant="secondary" onClick={() => changeStatus(task, "pending")}>To do</Button><Button onClick={() => changeStatus(task, "in_progress")}>In progress</Button></div>}<p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-600">{task.status.replace("_", " ")}</p></article>)}</div>}
  </main><PublicFooter />
  <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Assign a task"><form onSubmit={createTask} className="space-y-4"><input required aria-label="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Task title" className="w-full rounded-xl border p-3" /><textarea required aria-label="Task description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the work" className="w-full rounded-xl border p-3" /><select required value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} className="w-full rounded-xl border p-3"><option value="">Choose an approved member</option>{members.map((member) => <option key={entityId(member)} value={entityId(member)}>{member.name}</option>)}</select><input required type="date" aria-label="Due date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="w-full rounded-xl border p-3" /><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="w-full rounded-xl border p-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><Button type="submit" className="w-full">Assign task</Button></form></Modal>
  </div>;
};

export default ProjectTasks;

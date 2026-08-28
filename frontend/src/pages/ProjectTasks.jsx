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
import api, { getUploadUrl } from "../services/api";
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
  const [showSubmit, setShowSubmit] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "", dueDate: "", priority: "medium" });
  const [submissionForm, setSubmissionForm] = useState({ description: "", files: [] });
  const [submissions, setSubmissions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");

  const load = async () => {
    const [projectData, taskData, submissionData] = await Promise.all([getProject(id), getTasks({ project: id }), api.get("/submissions")]);
    setProject(projectData);
    setTasks(taskData);
    setSubmissions(submissionData.data.data.submissions || []);
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      try {
        const [projectData, taskData, submissionData] = await Promise.all([getProject(id), getTasks({ project: id }), api.get("/submissions")]);
        if (!active) return;
        setProject(projectData);
        setTasks(taskData);
        setSubmissions(submissionData.data.data.submissions || []);
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

  const submissionFor = (task) => submissions.find((submission) => entityId(submission.task) === task.id);
  const submitTask = async (event) => {
    event.preventDefault();
    const body = new FormData();
    body.append("task", selectedTask.id);
    body.append("description", submissionForm.description);
    [...submissionForm.files].forEach((file) => body.append("files", file));
    try {
      await api.post("/submissions", body);
      setShowSubmit(false); setSubmissionForm({ description: "", files: [] }); await load();
      toast("Task submitted for manager review", "success");
    } catch (requestError) { toast(requestError.response?.data?.message || "Unable to submit task.", "error"); }
  };

  const reviewSubmission = async (action) => {
    try {
      if (action === "accept") await api.put(`/submissions/${selectedSubmission.id}/accept`, { feedback });
      if (action === "score") await api.put(`/submissions/${selectedSubmission.id}/score`, { score: Number(score), feedback });
      if (action === "redo") await api.put(`/submissions/${selectedSubmission.id}/resubmit`, { feedback });
      if (action === "delete") await api.delete(`/submissions/${selectedSubmission.id}`);
      setShowReview(false); setFeedback(""); await load();
      toast(action === "score" ? "Score awarded and task accepted" : action === "accept" ? "Submission accepted" : action === "redo" ? "Student asked to redo the task" : "Submission deleted", "success");
    } catch (requestError) { toast(requestError.response?.data?.message || "Unable to review submission.", "error"); }
  };

  const acknowledgeScore = async (submission) => {
    try {
      await api.put(`/submissions/${submission.id}/reaction`);
      await load();
      toast("Score acknowledged", "success");
    } catch (requestError) { toast(requestError.response?.data?.message || "Unable to acknowledge score.", "error"); }
  };

  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><PublicNavbar /><main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ProjectSubNav />
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6"><div><h1 className="text-2xl font-bold">{project.title} tasks</h1><p className="text-sm text-slate-500 mt-1">Students submit work here; managers review it here.</p></div>{isManager && <Button onClick={() => setShowCreate(true)}>Assign task</Button>}</div>
    {!isManager && !isMember ? <EmptyState title="Project membership required" description="Only project members can view the task board." /> : tasks.length === 0 ? <EmptyState title="No tasks yet" description={isManager ? "Assign the first task to an approved volunteer." : "Your manager has not assigned work yet."} /> : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{tasks.map((task) => { const submission = submissionFor(task); const isAssignee = entityId(task.assignedTo) === user.id; return <article key={task.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"><div className="flex justify-between gap-3"><h2 className="font-semibold">{task.title}</h2><Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{task.priority}</Badge></div><p className="text-sm text-slate-500 mt-2">{task.description}</p><p className="text-xs text-slate-400 mt-4">Due {new Date(task.dueDate).toLocaleDateString()}</p><p className="text-xs text-slate-400 mt-1">Assigned to {task.assignedTo?.name || "Volunteer"}</p>{submission && <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm"><p className="font-medium capitalize">Submission: {submission.status.replaceAll("_", " ")}</p>{submission.description && <p className="mt-1 text-slate-500">{submission.description}</p>}{submission.files?.map((file) => <a key={file.filename} href={getUploadUrl(file.path)} target="_blank" rel="noreferrer" className="block mt-1 text-brand-600 hover:underline">{file.originalName}</a>)}{submission.score !== null && submission.score !== undefined && <div className="mt-3 rounded-lg bg-brand-50 dark:bg-brand-500/10 p-3"><p className="font-semibold text-brand-700 dark:text-brand-300">Score: {submission.score} / {task.maxScore}</p>{submission.studentReaction === "acknowledged" ? <p className="mt-1 text-xs text-slate-500">Student acknowledged this score.</p> : isAssignee ? <button onClick={() => acknowledgeScore(submission)} className="mt-2 text-sm font-semibold text-brand-600">Acknowledge score</button> : null}</div>}{submission.feedback && <p className="mt-2 text-slate-600 dark:text-slate-300"><strong>Manager comment:</strong> {submission.feedback}</p>}</div>}{isAssignee && task.status !== "submitted" && task.status !== "completed" && <div className="flex flex-wrap gap-2 mt-4"><Button variant="secondary" onClick={() => changeStatus(task, "pending")}>To do</Button><Button onClick={() => changeStatus(task, "in_progress")}>In progress</Button><Button onClick={() => { setSelectedTask(task); setSubmissionForm({ description: "", files: [] }); setShowSubmit(true); }}>{submission?.status === "resubmission_required" ? "Resubmit task" : "Submit task"}</Button></div>}{isManager && submission?.status === "submitted" && <Button className="mt-4 w-full" onClick={() => { setSelectedSubmission(submission); setFeedback(""); setScore(""); setShowReview(true); }}>Review & score</Button>}<p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-600">{task.status.replace("_", " ")}</p></article>; })}</div>}
  </main><PublicFooter />
  <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Assign a task"><form onSubmit={createTask} className="space-y-4"><input required aria-label="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Task title" className="w-full rounded-xl border p-3" /><textarea required aria-label="Task description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the work" className="w-full rounded-xl border p-3" /><select required value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} className="w-full rounded-xl border p-3"><option value="">Choose an approved member</option>{members.map((member) => <option key={entityId(member)} value={entityId(member)}>{member.name}</option>)}</select><input required type="date" aria-label="Due date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="w-full rounded-xl border p-3" /><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="w-full rounded-xl border p-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><Button type="submit" className="w-full">Assign task</Button></form></Modal>
  <Modal open={showSubmit} onClose={() => setShowSubmit(false)} title={selectedTask ? `Submit: ${selectedTask.title}` : "Submit task"}><form onSubmit={submitTask} className="space-y-4"><textarea required aria-label="Submission details" value={submissionForm.description} onChange={(event) => setSubmissionForm({ ...submissionForm, description: event.target.value })} placeholder="Describe the completed work and include any links." className="w-full rounded-xl border p-3" rows={4} /><input type="file" multiple onChange={(event) => setSubmissionForm({ ...submissionForm, files: event.target.files || [] })} className="w-full text-sm" /><Button type="submit" className="w-full">Submit task</Button></form></Modal>
  <Modal open={showReview} onClose={() => setShowReview(false)} title="Review and score submission"><div className="space-y-4"><label className="block text-sm font-medium">Score (maximum {selectedSubmission?.task?.maxScore || "task limit"})<input type="number" min="0" max={selectedSubmission?.task?.maxScore} value={score} onChange={(event) => setScore(event.target.value)} placeholder="Enter score to award marks" className="mt-1 w-full rounded-xl border p-3" /></label><textarea aria-label="Manager comment" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Comment for the student (required when requesting a redo)" className="w-full rounded-xl border p-3" rows={4} /><div className="grid grid-cols-2 gap-2"><Button disabled={score === ""} onClick={() => reviewSubmission("score")}>Award score</Button><Button variant="secondary" onClick={() => reviewSubmission("accept")}>Accept only</Button><Button variant="secondary" onClick={() => reviewSubmission("redo")}>Redo</Button><button onClick={() => reviewSubmission("delete")} className="rounded-xl border border-red-200 text-red-600 font-semibold">Delete</button></div></div></Modal>
  </div>;
};

export default ProjectTasks;

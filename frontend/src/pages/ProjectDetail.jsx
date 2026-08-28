import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiMapPin, FiCalendar, FiUsers, FiStar, FiEdit2, FiCheckSquare, FiMessageSquare, FiArrowRight, FiActivity, FiFolder } from "react-icons/fi";
import PublicNavbar from "../components/layout/PublicNavbar";
import PublicFooter from "../components/layout/PublicFooter";
import ProjectSubNav from "../components/projects/ProjectSubNav";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import Avatar from "../components/ui/Avatar";
import ProjectImage from "../components/ui/ProjectImage";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import { formatDate, getStatusBadge } from "../data/mockData";
import { applyToProject, getMyApplications, getProject as getProjectFromApi, getTasks } from "../services/projects";
import { getProjectComments } from "../services/comments";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import api, { getUploadUrl } from "../services/api";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [showApply, setShowApply] = useState(false);
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [comments, setComments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [resources, setResources] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [resourceFile, setResourceFile] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getProjectFromApi(id).then(setProject).catch((error) => setLoadError(error.response?.data?.message || "Project not found"));
    getProjectComments(id).then(({ comments: items }) => setComments(items.slice(-3).reverse())).catch(() => setComments([]));
    if (user?.role === "student") {
      getMyApplications().then((apps) => setExistingApp(apps.find((app) => (app.project.id || app.project._id || app.project) === id) || null)).catch(() => setExistingApp(null));
    }
    api.get(`/projects/${id}/folders`).then(({ data }) => { setFolders(data.data.folders || []); setResources(data.data.files || []); }).catch(() => { setFolders([]); setResources([]); });
    if (user) getTasks({ project: id }).then(setTasks).catch(() => setTasks([]));
  }, [id, user]);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <PublicNavbar />
        <ErrorState title={loadError || "Loading project"} description={loadError || "Fetching project details..."} actionLabel="Browse projects" actionTo="/discover" />
        <PublicFooter />
      </div>
    );
  }

  const manager = typeof project.createdBy === "object" ? project.createdBy : null;
  const members = (project.members || []).filter((member) => typeof member === "object");
  const status = getStatusBadge(project.status);
  const previewComments = comments.filter((comment) => !comment.parentComment).slice(0, 3);
  const isManager = user?.id === project.managerId || user?.role === "admin";
  const isMember = project.memberIds.includes(user?.id);
  const isAcceptingVolunteers = ["approved", "active"].includes(project.status) && project.volunteersJoined < project.volunteersNeeded;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    try {
      const application = await applyToProject(id, message);
      setExistingApp(application);
      setApplied(true);
      setShowApply(false);
      toast("Application submitted successfully!", "success");
    } catch (error) {
      toast(error.response?.data?.message || "Unable to submit your application.", "error");
    }
  };

  const refreshResources = async () => { const { data } = await api.get(`/projects/${id}/folders`); setFolders(data.data.folders || []); setResources(data.data.files || []); };
  const createFolder = async (event) => { event.preventDefault(); try { await api.post(`/projects/${id}/folders`, { name: folderName }); setFolderName(""); await refreshResources(); toast("Folder created", "success"); } catch (error) { toast(error.response?.data?.message || "Unable to create folder", "error"); } };
  const uploadResource = async (event) => { event.preventDefault(); if (!resourceFile) return; const form = new FormData(); form.append("file", resourceFile); if (selectedFolder) form.append("folder", selectedFolder); try { await api.post(`/projects/${id}/resources`, form); setResourceFile(null); setSelectedFolder(""); event.target.reset(); await refreshResources(); toast("Resource uploaded", "success"); } catch (error) { toast(error.response?.data?.message || "Unable to upload resource", "error"); } };
  const renameFolder = async (folder) => { const name = window.prompt("Folder name", folder.name); if (!name?.trim() || name === folder.name) return; try { await api.put(`/projects/${id}/folders/${folder.id}`, { name }); await refreshResources(); toast("Folder renamed", "success"); } catch (error) { toast(error.response?.data?.message || "Unable to rename folder", "error"); } };
  const deleteFolder = async (folder) => { if (!window.confirm(`Delete ${folder.name}?`)) return; try { await api.delete(`/projects/${id}/folders/${folder.id}`); await refreshResources(); toast("Folder deleted", "success"); } catch (error) { toast(error.response?.data?.message || "Move resources before deleting this folder.", "error"); } };
  const deleteResource = async (file) => { if (!window.confirm(`Remove ${file.originalName}?`)) return; try { await api.delete(`/projects/${id}/resources/${file.id || file._id}`); await refreshResources(); toast("Resource removed", "success"); } catch (error) { toast(error.response?.data?.message || "Unable to remove resource", "error"); } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectSubNav />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ProjectImage src={project.image || project.projectImage} alt={project.title} className="w-full aspect-video object-cover rounded-2xl shadow-sm" />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-2">About this project</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{project.longDescription || project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.skillsNeeded.map((s) => (
                  <span key={s} className="text-sm bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-3 py-1 rounded-lg font-medium">{s}</span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1"><FiFolder size={18} /> Shared resources</h2>
                <p className="text-sm text-slate-500 mb-3">Resources uploaded by the manager are available to everyone.</p>
                {isManager && <div className="grid sm:grid-cols-2 gap-3 mb-4"><form onSubmit={createFolder} className="flex gap-2"><input required value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="New folder name" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><Button type="submit" variant="secondary">Create</Button></form><form onSubmit={uploadResource} className="space-y-2"><div className="flex gap-2"><input required type="file" onChange={(event) => setResourceFile(event.target.files?.[0] || null)} className="min-w-0 flex-1 text-sm" /><Button type="submit" variant="secondary">Upload</Button></div><select value={selectedFolder} onChange={(event) => setSelectedFolder(event.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="">Project root</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></form></div>}
                {folders.length === 0 && resources.length === 0 ? <p className="text-sm text-slate-400">No shared resources yet.</p> : <div className="space-y-3">{folders.map((folder) => <div key={folder.id} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">📁 {folder.name}</p>{isManager && <span className="flex gap-2 text-xs"><button onClick={() => renameFolder(folder)} className="text-brand-600">Rename</button><button onClick={() => deleteFolder(folder)} className="text-red-600">Delete</button></span>}</div>{resources.filter((file) => (file.folder?.id || file.folder?._id || file.folder) === folder.id).map((file) => <div key={file.id || file.filename} className="mt-2 flex justify-between gap-2"><a href={getUploadUrl(file.path)} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">{file.originalName}</a>{isManager && <button onClick={() => deleteResource(file)} className="text-xs text-red-600">Remove</button>}</div>)}</div>)}{resources.filter((file) => !file.folder).map((file) => <div key={file.id || file.filename} className="flex justify-between gap-2"><a href={getUploadUrl(file.path)} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">{file.originalName}</a>{isManager && <button onClick={() => deleteResource(file)} className="text-xs text-red-600">Remove</button>}</div>)}</div>}
              </div>
            </div>

            {/* Task progress preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><FiCheckSquare size={18} /> Tasks</h2>
                <Link to={`/projects/${id}/tasks`} className="text-sm font-semibold text-brand-600 inline-flex items-center gap-1">View board <FiArrowRight size={14} /></Link>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                   <span className="text-slate-500">{completedTasks} of {tasks.length} completed</span>
                  <span className="font-semibold text-brand-600">{taskProgress}%</span>
                </div>
                 <ProgressBar value={completedTasks} max={tasks.length || 1} showLabel={false} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{[["pending", "To do"], ["in_progress", "In progress"], ["submitted", "Submitted"], ["completed", "Completed"], ["overdue", "Overdue"]].map(([taskStatus, label]) => <div key={taskStatus} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><p className="text-lg font-bold text-slate-900 dark:text-white">{tasks.filter((task) => task.status === taskStatus).length}</p><p className="text-xs text-slate-500">{label}</p></div>)}</div>
            </div>


            {/* Comments preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><FiMessageSquare size={18} /> Discussion</h2>
                <Link to={`/projects/${id}/discussion`} className="text-sm font-semibold text-brand-600 inline-flex items-center gap-1">Join discussion <FiArrowRight size={14} /></Link>
              </div>
              {previewComments.length === 0 ? (
                <p className="text-sm text-slate-400">No discussions yet. Be the first to post!</p>
              ) : (
                <div className="space-y-3">
                  {previewComments.map((c) => {
                    const author = typeof c.author === "object" ? c.author : null;
                    return (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm font-medium">{author?.name || "Member"}</p>
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{c.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sticky top-24 shadow-sm">
              <Badge className={status.cls}>{status.label}</Badge>
              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <p className="flex items-center gap-2"><FiMapPin size={14} className="text-brand-500" /> {project.location}</p>
                <p className="flex items-center gap-2"><FiCalendar size={14} className="text-brand-500" /> {formatDate(project.startDate)} – {formatDate(project.endDate)}</p>
                <p className="flex items-center gap-2"><FiStar size={14} className="text-amber-400" /> {project.rating} ({project.reviewCount} reviews)</p>
                <p className="flex items-center gap-2"><FiActivity size={14} className="text-brand-500" /> {project.impactHours} impact hours</p>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-1">Volunteer spots</p>
                <ProgressBar value={project.volunteersJoined} max={project.volunteersNeeded} />
              </div>

              {isManager && (
                <Link to={`/projects/${id}/edit`} className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
                  <FiEdit2 size={14} /> Edit Project
                </Link>
              )}

              {!isManager && !isMember && isAcceptingVolunteers && (
                existingApp || applied ? (
                  <div className="mt-4 text-center text-sm font-medium text-brand-600 bg-brand-50 dark:bg-brand-500/10 py-2.5 rounded-xl capitalize">
                    Application {existingApp?.status || "submitted"}
                  </div>
                ) : (
                  <Button onClick={() => user ? setShowApply(true) : navigate("/login")} className="mt-4 w-full">
                    Apply to Volunteer
                  </Button>
                )
              )}

              {!isManager && !isMember && !isAcceptingVolunteers && (
                <div className="mt-4 text-center text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 py-2.5 rounded-xl">
                  {project.status === "pending" ? "Applications open after admin approval" : project.volunteersJoined >= project.volunteersNeeded ? "All volunteer places are filled" : "Volunteer applications are closed"}
                </div>
              )}

              {isMember && (
                <div className="mt-4 text-center text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 py-2.5 rounded-xl">
                  ✓ You're a team member
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Project Manager</h3>
              {manager && (
                <div className="flex items-center gap-3">
                  <Avatar src={manager.avatar} name={manager.name} />
                  <div>
                    <p className="font-medium text-sm">{manager.name}</p>
                    <p className="text-xs text-slate-400">{manager.email}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FiUsers size={16} /> Team ({members.length})
              </h3>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Avatar src={m.avatar} name={m.name} size="sm" />
                    <span className="text-sm">{m.name}</span>
                  </div>
                ))}
                {members.length === 0 && <p className="text-xs text-slate-400">No members yet — be the first!</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />

      <Modal open={showApply} onClose={() => setShowApply(false)} title="Apply to Volunteer">
        <form onSubmit={handleApply} className="space-y-4">
          <p className="text-sm text-slate-500">Tell {manager?.name?.split(" ")[0] || "the manager"} why you'd be a great fit for <strong>{project.title}</strong>.</p>
          <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your motivation, relevant skills, and availability..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none outline-none focus:ring-2 focus:ring-brand-500" />
          <Button type="submit" className="w-full">Submit Application</Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;

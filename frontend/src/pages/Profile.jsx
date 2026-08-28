import { useEffect, useState } from "react";
import { FiEdit2, FiAward, FiCheckSquare, FiFolder } from "react-icons/fi";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import api from "../services/api";
import { getMyApplications, getProjects, getTasks } from "../services/projects";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "", city: user?.city || "", skills: user?.skills?.join(", ") || "" });
  const [summary, setSummary] = useState({ projects: 0, applications: 0, tasks: 0, completed: 0, score: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getProjects(), getMyApplications().catch(() => []), getTasks().catch(() => []), api.get(`/scores/${user.id}`).catch(() => ({ data: { data: { score: null } } }))])
      .then(([projects, applications, tasks, scoreResponse]) => {
        if (!active) return;
        setSummary({ projects: projects.filter((project) => project.memberIds.includes(user.id)).length, applications: applications.length, tasks: tasks.length, completed: tasks.filter((task) => task.status === "completed").length, score: scoreResponse.data.data.score });
      }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user.id]);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await updateProfile({ name: form.name, bio: form.bio, city: form.city, skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean) });
      setEditing(false); toast("Profile updated", "success");
    } catch (error) { toast(error.response?.data?.message || error.message || "Could not save profile", "error"); }
  };

  if (loading) return <LoadingSpinner label="Loading your contribution profile..." />;
  const score = summary.score;
  return <div className="max-w-3xl mx-auto space-y-6 animate-fade-in"><PageHeader title="My Profile" description="Your persisted profile and community contribution record." /><section className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden"><div className="h-24 bg-gradient-to-r from-brand-600 to-accent-600" /><div className="px-6 pb-6 -mt-10"><Avatar src={user.profilePicture} name={user.name} size="xl" className="ring-4 ring-white dark:ring-slate-900" /><div className="mt-4 flex justify-between gap-4"><div><h1 className="text-2xl font-bold">{user.name}</h1><p className="text-sm text-slate-500 capitalize">{user.role} · {user.city || "Community member"}</p></div><button onClick={() => setEditing((value) => !value)} className="inline-flex gap-1.5 text-sm font-semibold text-brand-600"><FiEdit2 size={14} /> Edit</button></div>{editing ? <form onSubmit={handleSave} className="mt-4 space-y-3"><input required aria-label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border p-3" /><input aria-label="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="City" className="w-full rounded-xl border p-3" /><textarea aria-label="Bio" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Tell the community about yourself" className="w-full rounded-xl border p-3" /><input aria-label="Skills" value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Skills, comma separated" className="w-full rounded-xl border p-3" /><button className="rounded-xl bg-brand-600 text-white px-4 py-2 font-semibold">Save profile</button></form> : <><p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{user.bio || "Add a short bio to help project managers understand your strengths."}</p><div className="flex flex-wrap gap-2 mt-3">{user.skills?.map((skill) => <Badge key={skill} className="bg-brand-50 text-brand-700 dark:bg-brand-500/10">{skill}</Badge>)}</div></>}</div></section><div className="grid sm:grid-cols-3 gap-4"><StatCard icon={FiAward} label="Contribution points" value={score?.totalScore || 0} color="text-brand-600" /><StatCard icon={FiCheckSquare} label="Completed tasks" value={summary.completed} color="text-emerald-600" /><StatCard icon={FiFolder} label="Projects joined" value={summary.projects} color="text-sky-600" /></div><section className="bg-white dark:bg-slate-900 rounded-2xl border p-6"><h2 className="font-bold mb-4">Activity summary</h2><dl className="grid sm:grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-400">Applications</dt><dd className="font-medium">{summary.applications}</dd></div><div><dt className="text-slate-400">Assigned tasks</dt><dd className="font-medium">{summary.tasks}</dd></div><div><dt className="text-slate-400">Average marks</dt><dd className="font-medium">{score?.averageScore || 0}</dd></div><div><dt className="text-slate-400">Contribution level</dt><dd className="font-medium capitalize">{score?.level || "beginner"}</dd></div></dl></section></div>;
};

export default Profile;

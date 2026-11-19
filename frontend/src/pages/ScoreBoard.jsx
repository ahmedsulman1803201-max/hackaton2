import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiEdit3, FiFilter, FiSearch, FiUsers } from "react-icons/fi";
import api from "../services/api";
import { useToast } from "../context/useToast";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

const getId = (value) => value?.id || value?._id || value || "";
const getName = (value, fallback = "Unknown") => value?.name || fallback;

const ScoreBoard = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("project");
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    const response = await api.get("/submissions");
    setSubmissions(response.data.data.submissions || []);
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      load().catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load score board."))
        .finally(() => active && setLoading(false));
    });
    return () => { active = false; };
  }, []);

  const projects = useMemo(() => [...new Map(submissions.map((item) => {
    const project = item.task?.project;
    return [getId(project), { id: getId(project), title: project?.title || "Unassigned project" }];
  })).values()].sort((a, b) => a.title.localeCompare(b.title)), [submissions]);

  const visibleSubmissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return submissions.filter((submission) => {
      const projectId = getId(submission.task?.project);
      const searchable = [submission.task?.title, submission.task?.project?.title, submission.volunteer?.name, submission.status].join(" ").toLowerCase();
      return (projectFilter === "all" || projectId === projectFilter) && (!normalizedQuery || searchable.includes(normalizedQuery));
    }).sort((a, b) => {
      if (sortBy === "score") return (b.score ?? -1) - (a.score ?? -1);
      if (sortBy === "student") return getName(a.volunteer).localeCompare(getName(b.volunteer));
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return `${a.task?.project?.title || ""}${a.task?.title || ""}`.localeCompare(`${b.task?.project?.title || ""}${b.task?.title || ""}`);
    });
  }, [projectFilter, query, sortBy, submissions]);

  const reviewed = submissions.filter((submission) => submission.score !== null && submission.score !== undefined);
  const average = reviewed.length ? Math.round(reviewed.reduce((total, submission) => total + submission.score, 0) / reviewed.length) : 0;

  const openEditor = (submission) => {
    setSelected(submission);
    setScore(submission.score ?? "");
    setFeedback(submission.feedback || "");
  };

  const saveScore = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/submissions/${selected.id}/score`, { score: Number(score), feedback });
      await load();
      setSelected(null);
      toast("Score updated successfully", "success");
    } catch (requestError) {
      toast(requestError.response?.data?.message || "Unable to update score.", "error");
    }
  };

  if (loading) return <LoadingSpinner label="Loading score board..." />;
  if (error) return <EmptyState title="Score board unavailable" description={error} />;

  return (
    <div className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 mb-2">Manager workspace</p><h1 className="text-3xl font-bold text-slate-900 dark:text-white">Score board</h1><p className="text-sm text-slate-500 mt-2">Review student submissions, compare results by project, and update scores without leaving the board.</p></div>
      <div className="grid sm:grid-cols-3 gap-4"><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><p className="text-sm text-slate-500">Total submissions</p><p className="text-3xl font-bold mt-2">{submissions.length}</p></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><p className="text-sm text-slate-500">Reviewed</p><p className="text-3xl font-bold mt-2 flex items-center gap-2"><FiCheckCircle className="text-emerald-500" />{reviewed.length}</p></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><p className="text-sm text-slate-500">Average score</p><p className="text-3xl font-bold mt-2">{average}<span className="text-base text-slate-400"> / 100</span></p></div></div>
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"><div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between"><div className="relative flex-1 max-w-md"><FiSearch className="absolute left-3 top-3.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project, task, or student" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent pl-10 pr-3 py-2.5 text-sm" /></div><div className="flex flex-wrap gap-2"><label className="sr-only" htmlFor="project-filter">Filter by project</label><select id="project-filter" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm"><option value="all">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select><label className="sr-only" htmlFor="sort-scores">Sort scores</label><select id="sort-scores" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm"><option value="project">Sort by project</option><option value="student">Sort by student</option><option value="score">Highest score</option><option value="status">Sort by status</option></select><span className="inline-flex items-center gap-1 text-xs text-slate-400 px-2"><FiFilter /> {visibleSubmissions.length} shown</span></div></div>{visibleSubmissions.length === 0 ? <EmptyState title="No submissions found" description="Try another project or search term." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Project / task</th><th className="px-5 py-3">Student</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Score</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{visibleSubmissions.map((submission) => <tr key={getId(submission)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40"><td className="px-5 py-4"><p className="font-semibold text-slate-900 dark:text-white">{submission.task?.project?.title || "Unassigned project"}</p><p className="text-xs text-slate-500 mt-1">{submission.task?.title || "Task"}</p></td><td className="px-5 py-4"><span className="inline-flex items-center gap-2"><FiUsers className="text-slate-400" />{getName(submission.volunteer)}</span></td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${submission.status === "reviewed" ? "bg-emerald-50 text-emerald-700" : submission.status === "resubmission_required" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{submission.status.replaceAll("_", " ")}</span></td><td className="px-5 py-4 font-semibold">{submission.score ?? "Pending"}<span className="font-normal text-slate-400">{submission.score !== null && submission.score !== undefined ? ` / ${submission.task?.maxScore ?? 100}` : ""}</span></td><td className="px-5 py-4 text-right"><button onClick={() => openEditor(submission)} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"><FiEdit3 />{submission.score === null || submission.score === undefined ? "Review" : "Edit score"}</button></td></tr>)}</tbody></table></div>}</section>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.score === null || selected?.score === undefined ? "Review submission" : "Edit score"}><form onSubmit={saveScore} className="space-y-4"><div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4"><p className="font-semibold">{selected?.task?.title}</p><p className="text-sm text-slate-500 mt-1">{selected?.task?.project?.title} · {getName(selected?.volunteer)}</p></div><label className="block text-sm font-medium">Score <span className="text-slate-400">/ {selected?.task?.maxScore ?? 100}</span><input required type="number" min="0" max={selected?.task?.maxScore ?? 100} value={score} onChange={(event) => setScore(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm font-medium">Feedback<textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={4} placeholder="Add a useful note for the student" className="mt-1 w-full rounded-xl border p-3" /></label><Button type="submit" className="w-full">Save score</Button></form></Modal>
    </div>
  );
};

export default ScoreBoard;
import { useEffect, useState } from "react";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import Avatar from "../components/ui/Avatar";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { FiClipboard } from "react-icons/fi";
import { getStatusBadge, timeAgo } from "../data/mockData";
import { approveApplication, getManagedApplications, getMyApplications, rejectApplication } from "../services/projects";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { useNotifications } from "../context/useNotifications";
import { entityId } from "../utils/ids";

const VolunteerApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refresh } = useNotifications();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const isReviewer = user.role === "manager" || user.role === "admin";

  const load = async () => {
    const data = isReviewer ? await getManagedApplications() : await getMyApplications();
    setApps(data);
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      setLoading(true);
      load()
        .catch(() => active && toast("Could not load applications.", "error"))
        .finally(() => active && setLoading(false));
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const handleStatus = async (appId, status) => {
    setBusyId(appId);
    try {
      if (status === "approved") await approveApplication(appId);
      else await rejectApplication(appId);
      await load();
      await refresh();
      toast(status === "approved" ? "Application approved" : "Application rejected", "success");
    } catch (error) {
      toast(error.response?.data?.message || "Unable to update application.", "error");
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <LoadingSpinner label="Loading applications..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Applications"
        description={user.role === "student" ? "Track your application status" : "Review and manage volunteer applications"}
      />

      {apps.length === 0 ? (
        <EmptyState icon={FiClipboard} title="No applications" description={user.role === "student" ? "Apply to projects to see them here." : "No applications to review yet."} />
      ) : (
        <div className="space-y-4">
          {apps.map((application) => {
            const project = application.project;
            const applicant = application.student;
            const st = getStatusBadge(application.status);

            return (
              <div key={entityId(application.id)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {isReviewer && applicant && <Avatar src={applicant.profilePicture || applicant.avatar} name={applicant.name} />}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{project?.title || "Project"}</p>
                      {isReviewer && applicant && <p className="text-sm text-slate-500">{applicant.name} · {applicant.email}</p>}
                      {application.message && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{application.message}</p>}
                      <p className="text-xs text-slate-400 mt-2">{timeAgo(application.appliedAt || application.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isReviewer && application.status === "pending" ? (
                      <>
                        <button disabled={busyId === application.id} onClick={() => handleStatus(application.id, "approved")} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl">Approve</button>
                        <button disabled={busyId === application.id} onClick={() => handleStatus(application.id, "rejected")} className="border border-red-200 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-50">Reject</button>
                      </>
                    ) : (
                      <Badge className={st.cls}>{st.label}</Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VolunteerApplications;

import { Link } from "react-router-dom";
import { FiBell, FiCheck, FiTrash2 } from "react-icons/fi";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { timeAgo } from "../data/mockData";
import { useNotifications } from "../context/useNotifications";

const typeIcons = { application: "📋", task: "✅", comment: "💬", system: "🔔" };

const Notifications = () => {
  const { notifications, unreadCount, loading, markRead, markAllRead, remove } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <FiCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <LoadingSpinner label="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState icon={FiBell} title="All caught up!" description="You have no notifications." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                n.read
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  : "bg-brand-50 dark:bg-brand-500/5 border-brand-200 dark:border-brand-500/20"
              }`}
            >
              <span className="text-xl shrink-0">{typeIcons[n.kind] || "🔔"}</span>
              <Link to={n.link || "#"} onClick={() => markRead(n.id)} className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 bg-brand-600 rounded-full shrink-0" />}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
              </Link>
              <button onClick={() => remove(n.id)} className="p-2 text-slate-400 hover:text-red-500" aria-label="Delete notification">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

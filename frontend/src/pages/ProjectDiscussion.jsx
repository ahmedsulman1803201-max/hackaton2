import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiSend, FiMessageCircle, FiTrash2 } from "react-icons/fi";
import PublicNavbar from "../components/layout/PublicNavbar";
import PublicFooter from "../components/layout/PublicFooter";
import ProjectSubNav from "../components/projects/ProjectSubNav";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { timeAgo } from "../data/mockData";
import { createComment, deleteComment, getProjectComments } from "../services/comments";
import { getProject } from "../services/projects";
import { entityId, sameId } from "../utils/ids";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { useNotifications } from "../context/useNotifications";

const authorOf = (comment) => (typeof comment.author === "object" ? comment.author : null);

const ProjectDiscussion = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { refresh } = useNotifications();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [canComment, setCanComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ comments: items, canComment: allowed }] = await Promise.all([
      getProjectComments(id),
      getProject(id).then(setProject).catch(() => setProject(null)),
    ]);
    setComments(items);
    setCanComment(allowed);
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      setLoading(true);
      load()
        .catch(() => active && toast("Could not load discussion.", "error"))
        .finally(() => active && setLoading(false));
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const threads = useMemo(() => {
    const topLevel = comments.filter((comment) => !comment.parentComment);
    return topLevel.map((comment) => ({
      ...comment,
      replies: comments.filter((reply) => sameId(reply.parentComment, comment.id)),
    })).reverse();
  }, [comments]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim() || saving) return;
    setSaving(true);
    try {
      await createComment({ project: id, content: newComment.trim() });
      setNewComment("");
      await load();
      refresh();
      toast("Comment posted", "success");
    } catch (error) {
      toast(error.response?.data?.message || "Unable to post comment.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!user || !replyText.trim() || saving) return;
    setSaving(true);
    try {
      await createComment({ project: id, content: replyText.trim(), parentComment: commentId });
      setReplyTo(null);
      setReplyText("");
      await load();
      refresh();
      toast("Reply posted", "success");
    } catch (error) {
      toast(error.response?.data?.message || "Unable to post reply.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      await load();
      toast("Comment removed", "success");
    } catch (error) {
      toast(error.response?.data?.message || "Unable to delete comment.", "error");
    }
  };

  const canDelete = (comment) => {
    if (!user) return false;
    return sameId(authorOf(comment)?.id || comment.author, user.id) || user.role === "admin" || sameId(project?.managerId, user.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectSubNav />

        {user && canComment ? (
          <form onSubmit={handlePost} className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            <div className="flex gap-3">
              <Avatar src={user.profilePicture || user.avatar} name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share an update, question, or idea..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                />
                <div className="mt-3 flex justify-end">
                  <button type="submit" disabled={saving || !newComment.trim()} className="inline-flex items-center gap-2 bg-brand-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700">
                    <FiSend size={14} /> {saving ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : user ? (
          <p className="mb-6 text-sm text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3">
            Join this project as a team member to post in the discussion.
          </p>
        ) : (
          <p className="mb-6 text-sm text-slate-500">
            <Link to="/login" className="text-brand-600 font-semibold">Sign in</Link> to join the discussion.
          </p>
        )}

        {loading ? (
          <LoadingSpinner label="Loading discussion..." />
        ) : threads.length === 0 ? (
          <EmptyState icon={FiMessageCircle} title="No discussions yet" description="Be the first to start a conversation." />
        ) : (
          <div className="space-y-4">
            {threads.map((comment) => {
              const author = authorOf(comment);
              return (
                <div key={entityId(comment.id)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <div className="flex items-start gap-3">
                    <Avatar src={author?.profilePicture || author?.avatar} name={author?.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{author?.name || "Member"}</span>
                        <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
                        {canDelete(comment) && (
                          <button onClick={() => handleDelete(comment.id)} className="ml-auto text-slate-400 hover:text-red-500" aria-label="Delete comment">
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
                      {user && canComment && (
                        <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-xs text-brand-600 font-medium mt-2">Reply</button>
                      )}
                      {comment.replies.map((reply) => {
                        const replyAuthor = authorOf(reply);
                        return (
                          <div key={entityId(reply.id)} className="mt-3 ml-1 sm:ml-4 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <Avatar src={replyAuthor?.profilePicture || replyAuthor?.avatar} name={replyAuthor?.name} size="sm" />
                              <span className="font-medium text-xs">{replyAuthor?.name || "Member"}</span>
                              <span className="text-xs text-slate-400">{timeAgo(reply.createdAt)}</span>
                              {canDelete(reply) && (
                                <button onClick={() => handleDelete(reply.id)} className="text-slate-400 hover:text-red-500" aria-label="Delete reply">
                                  <FiTrash2 size={12} />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 ml-0 sm:ml-9 whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        );
                      })}
                      {replyTo === comment.id && (
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                          <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..."
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none" />
                          <button onClick={() => handleReply(comment.id)} disabled={saving || !replyText.trim()} className="bg-brand-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-semibold">Send</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
};

export default ProjectDiscussion;

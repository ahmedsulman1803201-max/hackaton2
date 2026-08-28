import api from "./api";

export const getProjectComments = async (projectId) => {
  const { data } = await api.get(`/comments/project/${projectId}`);
  return {
    comments: data.data.comments || [],
    canComment: Boolean(data.data.canComment),
  };
};

export const createComment = async ({ project, content, parentComment }) => {
  const { data } = await api.post("/comments", { project, content, parentComment });
  return data.data.comment;
};

export const deleteComment = async (id) => {
  await api.delete(`/comments/${id}`);
};

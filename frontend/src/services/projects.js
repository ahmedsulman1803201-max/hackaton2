import api from "./api";

export const normalizeProject = (project) => ({
  ...project,
  image: project.projectImage || "",
  skillsNeeded: project.skillsRequired || [],
  volunteersNeeded: project.requiredVolunteers || 0,
  volunteersJoined: project.members?.length || 0,
  memberIds: (project.members || []).map((member) => typeof member === "string" ? member : member.id || member._id),
  managerId: typeof project.createdBy === "string" ? project.createdBy : project.createdBy?.id || project.createdBy?._id,
});

export const getProjects = async (params) => {
  const { data } = await api.get("/projects", { params });
  return data.data.projects.map(normalizeProject);
};

export const getProject = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return normalizeProject(data.data.project);
};

export const applyToProject = async (project, message) => {
  const { data } = await api.post("/applications", { project, message });
  return data.data.application;
};

export const getMyApplications = async () => {
  const { data } = await api.get("/applications/my");
  return data.data.applications;
};

export const getManagedApplications = async () => {
  const { data } = await api.get("/applications/managed");
  return data.data.applications;
};

export const approveApplication = async (id) => {
  const { data } = await api.put(`/applications/${id}/approve`);
  return data.data.application;
};

export const rejectApplication = async (id) => {
  const { data } = await api.put(`/applications/${id}/reject`);
  return data.data.application;
};

export const getTasks = async (params) => {
  const { data } = await api.get("/tasks", { params });
  return data.data.tasks || [];
};

export const updateTaskStatus = async (id, status, role) => {
  const path = role === "student" ? `/tasks/${id}/status` : `/tasks/${id}`;
  const { data } = await api.put(path, { status });
  return data.data.task;
};

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave } from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import { PROJECT_CATEGORIES } from "../data/mockData";
import { getProject } from "../services/projects";
import { useToast } from "../context/useToast";
import api, { getUploadUrl } from "../services/api";
const empty = {
  title: "", description: "", longDescription: "", category: "Community", status: "recruiting",
  image: "", skillsNeeded: "", location: "", startDate: "", endDate: "",
  volunteersNeeded: 10, volunteersJoined: 0, impactHours: 0, featured: false,
};

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = !!id;

  useEffect(() => {
    if (!id) return;
    getProject(id).then((project) => {
      setForm({
        ...empty,
        ...project,
        startDate: project.startDate ? project.startDate.slice(0, 10) : "",
        endDate: project.endDate ? project.endDate.slice(0, 10) : "",
        status: project.status === "pending" ? "recruiting" : project.status,
        skillsNeeded: project.skillsNeeded.join(", "),
      });
      setImagePreview(getUploadUrl(project.image || ""));
    }).catch((requestError) => setError(requestError.response?.data?.message || "Could not load this project."));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setIsRemovingImage(false);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setIsRemovingImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.startDate || !form.endDate) { setError("Start date and end date are required."); return; }
    setError("");
    setSaving(true);
    
    try {
      const formData = new FormData();
      
      // Map frontend form fields to backend API fields
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      
      // Handle skills - split comma-separated string and convert to array
      const skillsArray = form.skillsNeeded 
        ? form.skillsNeeded.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      formData.append('skillsRequired', JSON.stringify(skillsArray));
      
      formData.append('location', form.location);
      formData.append('startDate', form.startDate);
      formData.append('endDate', form.endDate);
      formData.append('requiredVolunteers', form.volunteersNeeded);
      formData.append('status', form.status === 'recruiting' ? 'pending' : form.status);
      
      // Add file if present, or mark for removal
      if (imageFile) {
        formData.append('projectImage', imageFile);
      } else if (isRemovingImage) {
        formData.append('projectImage', '');
      }
      projectFiles.forEach((file) => formData.append('projectFiles', file));
      formData.append('projectFilePaths', JSON.stringify(projectFiles.map((file) => file.webkitRelativePath || file.name)));
      
      if (isEdit) {
        // Update existing project
        await api.put(`/projects/${id}`, formData);
        toast("Project updated successfully", "success");
      } else {
        // Create new project
        const response = await api.post('/projects', formData);
        toast("Project created successfully", "success");
        navigate(`/projects/${response.data.data.project.id}`);
        return;
      }
      
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error saving project:', error);
      setError(error.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: "title", label: "Project Title", required: true },
    { name: "description", label: "Description", required: true, textarea: true },
    { name: "location", label: "Location" },
    { name: "skillsNeeded", label: "Skills Needed (comma-separated)" },
    { name: "startDate", label: "Start Date", type: "date", required: true },
    { name: "endDate", label: "End Date", type: "date", required: true },
    { name: "volunteersNeeded", label: "Volunteers Needed", type: "number" },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title={isEdit ? "Edit Project" : "Create New Project"}
        description={isEdit ? "Update project details" : "Launch a new community initiative"}
      />
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-2">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Image</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
            />
            {imagePreview && (
              <div className="mt-2 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload project folder</label>
          <input type="file" multiple webkitdirectory="" directory="" onChange={(e) => setProjectFiles(Array.from(e.target.files || []))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          <p className="mt-1 text-xs text-slate-500">Select a folder to upload its files and keep its folder structure in the shared project area.</p>
          {projectFiles.length > 0 && <p className="mt-2 text-sm text-brand-600">{projectFiles[0].webkitRelativePath?.split("/")[0] || "Selected files"} — {projectFiles.length} file(s) ready to upload</p>}
        </div>
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{f.label}</label>
            {f.textarea ? (
              <textarea name={f.name} value={form[f.name]} onChange={handleChange} rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            ) : (
              <input name={f.name} type={f.type || "text"} required={f.required} value={form[f.name]} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
            )}
          </div>
        ))}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              {PROJECT_CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <option value="recruiting">Recruiting</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
          Feature this project
        </label>
        <button disabled={saving} type="submit" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl">
          <FiSave size={16} /> {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;

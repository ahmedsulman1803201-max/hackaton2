import healthFairImage from "../assets/community-health-fair.png";
import muralImage from "../assets/community-mural.jpg";

const img = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const PROJECT_CATEGORIES = ["All", "Environment", "Education", "Health", "Technology", "Community", "Arts"];
export const PROJECT_STATUSES = ["recruiting", "active", "completed"];
export const TASK_COLUMNS = [
  { id: "todo", label: "To Do", color: "bg-slate-400" },
  { id: "in_progress", label: "In Progress", color: "bg-brand-500" },
  { id: "review", label: "Review", color: "bg-amber-500" },
  { id: "done", label: "Done", color: "bg-emerald-500" },
];
export const APP_STATUSES = ["pending", "approved", "rejected"];

export const defaultUsers = [
  {
    id: "u-admin",
    name: "Sarah Admin",
    email: "admin@impacthub.com",
    password: "admin123",
    role: "admin",
    avatar: img("1472099645785-5658abf4ff4e", 200),
    bio: "Platform administrator ensuring smooth operations across all community projects.",
    skills: ["Leadership", "Operations", "Analytics"],
    impactScore: 980,
    projectsJoined: 0,
    projectsManaged: 0,
    hoursVolunteered: 120,
    badges: ["Founder", "Top Contributor"],
    joinedAt: "2024-01-15",
  },
  {
    id: "u-manager",
    name: "James Mitchell",
    email: "manager@impacthub.com",
    password: "manager123",
    role: "manager",
    avatar: img("1507003211169-0a1dd7228f2d", 200),
    bio: "Community project manager passionate about environmental sustainability.",
    skills: ["Project Management", "Team Leadership", "Fundraising"],
    impactScore: 720,
    projectsJoined: 2,
    projectsManaged: 4,
    hoursVolunteered: 340,
    badges: ["Project Lead", "Eco Champion"],
    joinedAt: "2024-03-20",
  },
  {
    id: "u-student",
    name: "Emily Chen",
    email: "student@impacthub.com",
    password: "student123",
    role: "student",
    avatar: img("1494790108377-be9c29b29330", 200),
    bio: "Computer science student eager to contribute to meaningful community projects.",
    skills: ["React", "Python", "UI Design"],
    impactScore: 450,
    projectsJoined: 3,
    projectsManaged: 0,
    hoursVolunteered: 86,
    badges: ["Rising Star", "Team Player"],
    joinedAt: "2025-01-10",
  },
  {
    id: "u-student2",
    name: "Marcus Johnson",
    email: "marcus@example.com",
    password: "student123",
    role: "student",
    avatar: img("1500648767791-00dcc994a43e", 200),
    bio: "Volunteer focused on education and youth mentorship programs.",
    skills: ["Teaching", "Public Speaking", "Event Planning"],
    impactScore: 380,
    projectsJoined: 2,
    projectsManaged: 0,
    hoursVolunteered: 64,
    badges: ["Mentor"],
    joinedAt: "2025-02-05",
  },
];

export const seedProjects = [
  {
    id: "proj-1",
    title: "Green Campus Initiative",
    description: "Transform our university campus into a sustainable, eco-friendly environment through tree planting, waste reduction, and renewable energy advocacy.",
    longDescription: "The Green Campus Initiative aims to reduce the university's carbon footprint by 30% over two years. Volunteers will organize weekly clean-up drives, install recycling stations, and run awareness campaigns. We're looking for passionate students to lead sub-teams for planting, recycling, and digital outreach.",
    category: "Environment",
    status: "active",
    image: img("1542601906990-b4d3fb778b09"),
    managerId: "u-manager",
    memberIds: ["u-student", "u-student2"],
    skillsNeeded: ["Event Planning", "Social Media", "Research"],
    location: "Campus North",
    startDate: "2025-09-01",
    endDate: "2026-06-30",
    volunteersNeeded: 20,
    volunteersJoined: 14,
    impactHours: 420,
    rating: 4.8,
    reviewCount: 12,
    featured: true,
  },
  {
    id: "proj-2",
    title: "Code for Community",
    description: "Build free web tools and mobile apps for local nonprofits — websites, donation portals, and volunteer management systems.",
    longDescription: "Nonprofits often lack technical resources. Code for Community pairs student developers with local organizations to build custom solutions. Current sprint includes a food bank inventory system and a shelter booking portal.",
    category: "Technology",
    status: "recruiting",
    image: img("1522071820081-009f0129c71c"),
    managerId: "u-manager",
    memberIds: ["u-student"],
    skillsNeeded: ["React", "Node.js", "UI/UX Design"],
    location: "Remote / Hybrid",
    startDate: "2026-01-15",
    endDate: "2026-08-15",
    volunteersNeeded: 15,
    volunteersJoined: 8,
    impactHours: 180,
    rating: 4.9,
    reviewCount: 8,
    featured: true,
  },
  {
    id: "proj-3",
    title: "Youth Literacy Program",
    description: "Provide free tutoring and reading resources to underserved elementary school students in the downtown area.",
    longDescription: "Every Saturday, volunteers tutor children aged 6–12 in reading and writing. We provide training, materials, and transportation stipends. Help us expand to three additional schools this semester.",
    category: "Education",
    status: "active",
    image: img("1503676260728-1c00da094a0b"),
    managerId: "u-manager",
    memberIds: ["u-student2"],
    skillsNeeded: ["Teaching", "Patience", "Communication"],
    location: "Downtown Community Center",
    startDate: "2025-08-01",
    endDate: "2026-05-31",
    volunteersNeeded: 25,
    volunteersJoined: 22,
    impactHours: 560,
    rating: 4.7,
    reviewCount: 18,
    featured: false,
  },
  {
    id: "proj-4",
    title: "Community Health Fair",
    description: "Organize quarterly health fairs offering free screenings, vaccinations, and wellness education to local residents.",
    longDescription: "Partner with local clinics to deliver accessible healthcare services. Volunteers needed for logistics, registration, translation services, and health education booths.",
    category: "Health",
    status: "recruiting",
    image: healthFairImage,
    managerId: "u-manager",
    memberIds: [],
    skillsNeeded: ["Healthcare", "Logistics", "Translation"],
    location: "City Park Pavilion",
    startDate: "2026-03-01",
    endDate: "2026-12-31",
    volunteersNeeded: 30,
    volunteersJoined: 11,
    impactHours: 90,
    rating: 4.5,
    reviewCount: 5,
    featured: false,
  },
  {
    id: "proj-5",
    title: "Neighborhood Art Mural",
    description: "Collaborate with local artists and residents to create vibrant murals that celebrate community diversity and history.",
    longDescription: "This project transforms blank walls into storytelling canvases. We need artists, designers, community liaisons, and documentation volunteers to capture the creative process.",
    category: "Arts",
    status: "completed",
    image: muralImage,
    managerId: "u-manager",
    memberIds: ["u-student", "u-student2"],
    skillsNeeded: ["Art", "Photography", "Community Outreach"],
    location: "Riverside District",
    startDate: "2025-04-01",
    endDate: "2025-10-31",
    volunteersNeeded: 12,
    volunteersJoined: 12,
    impactHours: 280,
    rating: 4.9,
    reviewCount: 22,
    featured: false,
  },
  {
    id: "proj-6",
    title: "Senior Tech Support",
    description: "Help elderly community members learn to use smartphones, video calls, and online services through one-on-one sessions.",
    longDescription: "Bridge the digital divide by teaching seniors essential tech skills. Sessions run twice weekly at the senior center with flexible scheduling for volunteers.",
    category: "Community",
    status: "active",
    image: img("1559027415-ef4f4f8e0a44"),
    managerId: "u-manager",
    memberIds: [],
    skillsNeeded: ["Patience", "Tech Support", "Communication"],
    location: "Golden Years Senior Center",
    startDate: "2025-11-01",
    endDate: "2026-06-30",
    volunteersNeeded: 10,
    volunteersJoined: 6,
    impactHours: 145,
    rating: 4.6,
    reviewCount: 9,
    featured: false,
  },
];

export const seedTasks = [
  { id: "t-1", projectId: "proj-1", title: "Design recycling signage", description: "Create visual guides for new recycling stations", status: "done", assigneeId: "u-student", priority: "medium", dueDate: "2026-02-01" },
  { id: "t-2", projectId: "proj-1", title: "Organize tree planting event", description: "Coordinate 50 volunteers for March planting", status: "in_progress", assigneeId: "u-student2", priority: "high", dueDate: "2026-03-15" },
  { id: "t-3", projectId: "proj-1", title: "Social media campaign", description: "Launch #GreenCampus awareness campaign", status: "todo", assigneeId: null, priority: "medium", dueDate: "2026-03-20" },
  { id: "t-4", projectId: "proj-1", title: "Measure baseline carbon data", description: "Collect energy usage data from facilities", status: "review", assigneeId: "u-student", priority: "high", dueDate: "2026-02-28" },
  { id: "t-5", projectId: "proj-2", title: "Food bank API integration", description: "Connect inventory system to supplier APIs", status: "in_progress", assigneeId: "u-student", priority: "high", dueDate: "2026-04-01" },
  { id: "t-6", projectId: "proj-2", title: "User testing sessions", description: "Run usability tests with nonprofit staff", status: "todo", assigneeId: null, priority: "medium", dueDate: "2026-04-15" },
  { id: "t-7", projectId: "proj-2", title: "Deploy staging environment", description: "Set up CI/CD pipeline for staging", status: "todo", assigneeId: "u-student", priority: "low", dueDate: "2026-03-30" },
];

export const seedApplications = [
  { id: "app-1", projectId: "proj-4", userId: "u-student", message: "I have first-aid certification and event experience.", status: "pending", createdAt: "2026-03-01T10:00:00Z" },
  { id: "app-2", projectId: "proj-6", userId: "u-student", message: "I helped my grandparents with tech — would love to volunteer.", status: "approved", createdAt: "2026-02-20T14:30:00Z" },
  { id: "app-3", projectId: "proj-2", userId: "u-student2", message: "Experienced in React and passionate about nonprofit tech.", status: "pending", createdAt: "2026-03-05T09:15:00Z" },
];

export const seedComments = [
  {
    id: "c-1", projectId: "proj-1", userId: "u-manager", content: "Great progress on the recycling stations! Let's finalize signage by Friday.",
    createdAt: "2026-03-08T08:00:00Z",
    replies: [
      { id: "r-1", userId: "u-student", content: "Signage drafts are ready for review in the shared folder.", createdAt: "2026-03-08T10:30:00Z" },
      { id: "r-2", userId: "u-student2", content: "I'll review them tonight and leave feedback.", createdAt: "2026-03-08T11:00:00Z" },
    ],
  },
  {
    id: "c-2", projectId: "proj-1", userId: "u-student", content: "Can we get more volunteers for the tree planting event? We need at least 30.",
    createdAt: "2026-03-07T16:00:00Z", replies: [],
  },
  {
    id: "c-3", projectId: "proj-2", userId: "u-student", content: "API docs from the food bank are uploaded. Ready to start integration.",
    createdAt: "2026-03-06T12:00:00Z",
    replies: [
      { id: "r-3", userId: "u-manager", content: "Perfect — prioritize the inventory endpoint first.", createdAt: "2026-03-06T14:00:00Z" },
    ],
  },
];

export const seedReviews = [
  { id: "rev-1", projectId: "proj-1", userId: "u-student", rating: 5, comment: "Amazing leadership and clear goals. Learned so much about sustainability!", createdAt: "2026-02-15T00:00:00Z" },
  { id: "rev-2", projectId: "proj-1", userId: "u-student2", rating: 4, comment: "Well organized project. Would love more flexible meeting times.", createdAt: "2026-02-20T00:00:00Z" },
  { id: "rev-3", projectId: "proj-5", userId: "u-student", rating: 5, comment: "Creative and impactful. The mural transformed the whole block!", createdAt: "2025-11-01T00:00:00Z" },
];

export const seedNotifications = [
  { id: "n-1", userId: "u-student", type: "application", title: "Application Approved", message: "Your application to Senior Tech Support was approved!", read: false, createdAt: "2026-03-06T09:00:00Z", link: "/my-projects" },
  { id: "n-2", userId: "u-student", type: "task", title: "Task Assigned", message: "You were assigned 'Social media campaign' in Green Campus Initiative.", read: false, createdAt: "2026-03-07T11:00:00Z", link: "/projects/proj-1/tasks" },
  { id: "n-3", userId: "u-student", type: "comment", title: "New Reply", message: "James replied to your discussion post.", read: true, createdAt: "2026-03-08T10:30:00Z", link: "/projects/proj-1/discussion" },
  { id: "n-4", userId: "u-manager", type: "application", title: "New Application", message: "Emily Chen applied to Community Health Fair.", read: false, createdAt: "2026-03-01T10:00:00Z", link: "/applications" },
  { id: "n-5", userId: "u-manager", type: "task", title: "Task in Review", message: "'Measure baseline carbon data' is ready for review.", read: false, createdAt: "2026-03-08T08:00:00Z", link: "/projects/proj-1/tasks" },
];

export const seedUpdates = [
  { id: "up-1", projectId: "proj-1", userId: "u-manager", type: "milestone", title: "Recycling stations installed", content: "All 12 recycling stations are now live across campus buildings A–D.", createdAt: "2026-03-08T09:00:00Z" },
  { id: "up-2", projectId: "proj-1", userId: "u-student", type: "progress", title: "Signage design complete", content: "Final signage designs approved and sent to print.", createdAt: "2026-03-07T14:00:00Z" },
  { id: "up-3", projectId: "proj-2", userId: "u-student", type: "update", title: "API integration started", content: "Connected to food bank inventory endpoint — first data sync successful.", createdAt: "2026-03-06T11:00:00Z" },
  { id: "up-4", projectId: "proj-1", userId: "u-manager", type: "announcement", title: "Tree planting event scheduled", content: "Mark your calendars — March 15 at Campus North. 50 volunteers needed!", createdAt: "2026-03-05T08:00:00Z" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "volunteers", label: "Most Volunteers" },
];

export const analyticsData = {
  monthlyVolunteers: [
    { month: "Sep", count: 45 }, { month: "Oct", count: 62 }, { month: "Nov", count: 78 },
    { month: "Dec", count: 55 }, { month: "Jan", count: 88 }, { month: "Feb", count: 102 },
  ],
  projectsByCategory: [
    { name: "Environment", value: 8 }, { name: "Education", value: 12 }, { name: "Health", value: 6 },
    { name: "Technology", value: 10 }, { name: "Community", value: 9 }, { name: "Arts", value: 5 },
  ],
  impactHours: [
    { month: "Sep", hours: 320 }, { month: "Oct", hours: 480 }, { month: "Nov", hours: 620 },
    { month: "Dec", hours: 410 }, { month: "Jan", hours: 750 }, { month: "Feb", hours: 890 },
  ],
};

export const landingStats = [
  { label: "Active Projects", value: "50+", icon: "📋" },
  { label: "Volunteers", value: "1,200+", icon: "🙌" },
  { label: "Impact Hours", value: "15K+", icon: "⏱️" },
  { label: "Communities Served", value: "28", icon: "🌍" },
];

export const howItWorks = [
  { step: "01", title: "Discover Projects", desc: "Browse initiatives by category, skills, and location. Find causes that match your passion." },
  { step: "02", title: "Apply & Join", desc: "Submit your volunteer application and get approved by project managers." },
  { step: "03", title: "Collaborate", desc: "Use Kanban boards, discussions, and team tools to deliver real impact together." },
  { step: "04", title: "Track Impact", desc: "Earn impact scores, collect badges, and climb the community leaderboard." },
];

export const testimonials = [
  { name: "Ayesha Khan", role: "Student Volunteer", avatar: "https://i.pravatar.cc/150?u=ayesha", quote: "ImpactHub helped me find meaningful projects and track my contributions. I've volunteered 120+ hours this semester!" },
  { name: "Omar Hassan", role: "Project Manager", avatar: "https://i.pravatar.cc/150?u=omar", quote: "Managing volunteers used to be chaotic. Now I have Kanban boards, applications, and analytics all in one place." },
  { name: "Fatima Ali", role: "Community Lead", avatar: "https://i.pravatar.cc/150?u=fatima", quote: "Our tree planting initiative grew from 5 to 45 volunteers in two weeks thanks to ImpactHub's discover page." },
];

export const getStatusBadge = (status) => {
  const map = {
    recruiting: { label: "Recruiting", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
    active: { label: "Active", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" },
    completed: { label: "Completed", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
    pending: { label: "Pending", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
    in_progress: { label: "In progress", cls: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400" },
    submitted: { label: "Submitted", cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400" },
    overdue: { label: "Overdue", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
    approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
  };
  return map[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
};

export const getPriorityBadge = (priority) => {
  const map = {
    high: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    low: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
  };
  return map[priority] || map.medium;
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

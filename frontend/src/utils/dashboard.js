export const getDashboardPath = (role) => {
  const map = { admin: "/dashboard/admin", manager: "/dashboard/manager", student: "/dashboard/student" };
  return map[role] || "/dashboard/student";
};

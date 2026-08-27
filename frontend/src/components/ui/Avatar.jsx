import { useState } from "react";

const Avatar = ({ src, name, size = "md", className = "" }) => {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-lg" };
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return <img src={src} alt={name} onError={() => setFailed(true)} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-900 ${className}`} />;
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 ${className}`}>
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
};

export default Avatar;

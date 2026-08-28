import { useState } from "react";
import fallbackImage from "../../assets/project-placeholder.svg";
import { getUploadUrl } from "../../services/api";

const ProjectImage = ({ src, alt, className = "" }) => {
  const [imageSrc, setImageSrc] = useState(getUploadUrl(src) || fallbackImage);

  return <img src={imageSrc} alt={alt} className={className} onError={() => setImageSrc(fallbackImage)} />;
};

export default ProjectImage;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface SubjectBadgeProps {
  subject: string;
  className?: string;
}

export default function SubjectBadge({ subject, className = "" }: SubjectBadgeProps) {
  let colorClasses = "bg-slate-100 text-slate-800 border-slate-200";

  switch (subject) {
    case "数学":
      colorClasses = "bg-brand-muted text-brand-primary border-brand-primary/25";
      break;
    case "英语":
      colorClasses = "bg-[#F3E7DC] text-[#A66E4E] border-[#E8D0BB]";
      break;
    case "语文":
      colorClasses = "bg-brand-highlight/25 text-brand-accent border-brand-highlight/50";
      break;
    case "物理":
      colorClasses = "bg-[#EDEEE4] text-[#6B7547] border-[#D3D6BE]";
      break;
    case "化学":
      colorClasses = "bg-[#F6F4EB] text-[#8F7D5B] border-[#DEDAC4]";
      break;
    case "生物":
      colorClasses = "bg-[#E3EEEB] text-[#4F8073] border-[#C1DFD7]";
      break;
    case "历史":
      colorClasses = "bg-[#F5EFE6] text-[#917652] border-[#DDD0BC]";
      break;
    case "地理":
      colorClasses = "bg-[#E8F0F5] text-[#50728C] border-[#CCE0ED]";
      break;
    case "政治":
      colorClasses = "bg-[#F7EFE3] text-[#A6753C] border-[#EBD5B7]";
      break;
    default:
      colorClasses = "bg-brand-muted text-brand-primary border-brand-border/60";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
    >
      {subject}
    </span>
  );
}

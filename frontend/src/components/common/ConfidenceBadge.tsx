import React from 'react';
import { ConfidenceLevel } from '../../types/api';

interface ConfidenceBadgeProps {
  confidence?: ConfidenceLevel;
  reason?: string;
  showReasonInline?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  reason,
  showReasonInline = false,
}) => {
  if (!confidence) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-[#737782]">
        <span className="font-medium">Confidence:</span>
        <span className="text-[#9A9DA6]">Not available</span>
      </div>
    );
  }

  const normalized = String(confidence).toUpperCase();

  let badgeStyles = 'bg-[#FAFAFC] text-[#737782] border-[#E7E8ED]';
  let dotColor = '#9A9DA6';

  if (normalized === 'HIGH') {
    badgeStyles = 'bg-[#E8F6EF] text-[#248259] border-[#D0EFE0]';
    dotColor = '#3BAA78';
  } else if (normalized === 'MEDIUM') {
    badgeStyles = 'bg-[#FFF6DF] text-[#A6781E] border-[#FCE8B3]';
    dotColor = '#D9A441';
  } else if (normalized === 'LOW') {
    badgeStyles = 'bg-[#FCEBED] text-[#B83E4C] border-[#F8D2D7]';
    dotColor = '#D65A67';
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="inline-flex items-center gap-2">
        <span className="text-xs font-medium text-[#737782]">Confidence</span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${badgeStyles}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
          {normalized}
        </span>
      </div>
      {reason && showReasonInline && (
        <p className="text-xs text-[#737782] leading-relaxed italic pl-0.5">
          "{reason}"
        </p>
      )}
    </div>
  );
};

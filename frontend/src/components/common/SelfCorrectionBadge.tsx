import React from 'react';
import { Check, RefreshCw, AlertCircle } from 'lucide-react';

interface SelfCorrectionBadgeProps {
  retryCount?: number;
  correctionExhausted?: boolean;
}

export const SelfCorrectionBadge: React.FC<SelfCorrectionBadgeProps> = ({
  retryCount = 0,
  correctionExhausted = false,
}) => {
  let label = 'Evidence sufficient';
  let icon = <Check className="w-3.5 h-3.5 text-[#3BAA78]" />;
  let badgeClass = 'text-[#248259] bg-[#E8F6EF] border-[#D0EFE0]';

  if (correctionExhausted) {
    label = 'Correction limit reached';
    icon = <AlertCircle className="w-3.5 h-3.5 text-[#D65A67]" />;
    badgeClass = 'text-[#B83E4C] bg-[#FCEBED] border-[#F8D2D7]';
  } else if (retryCount === 1) {
    label = 'Refined after 1 retry';
    icon = <RefreshCw className="w-3 h-3 text-[#625FEF]" />;
    badgeClass = 'text-[#625FEF] bg-[#ECEBFF] border-[#D9D7FF]';
  } else if (retryCount > 1) {
    label = `Refined after ${retryCount} retries`;
    icon = <RefreshCw className="w-3 h-3 text-[#625FEF]" />;
    badgeClass = 'text-[#625FEF] bg-[#ECEBFF] border-[#D9D7FF]';
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="inline-flex items-center gap-2">
        <span className="text-xs font-medium text-[#737782]">
          Self-Correction
        </span>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${badgeClass}`}
        >
          {icon}
          {label}
        </span>
      </div>
    </div>
  );
};
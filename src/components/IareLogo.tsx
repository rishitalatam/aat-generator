import React from 'react';

interface IareLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const IareLogo: React.FC<IareLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${sizeMap[size]} shrink-0 rounded-xl bg-gradient-to-br from-[#0B3B60] to-[#1E3A8A] p-2 shadow-md ring-2 ring-blue-500/20`}>
        {/* IARE Crest SVG Vector */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Shield Outline */}
          <path
            d="M50 8L85 20V52C85 72 50 92 50 92C50 92 15 72 15 52V20L50 8Z"
            fill="#0B3B60"
            stroke="#F59E0B"
            strokeWidth="3.5"
          />
          {/* Wings / Aeronautical symbol */}
          <path
            d="M26 38C35 34 45 42 50 48C55 42 65 34 74 38C66 45 58 50 50 56C42 50 34 45 26 38Z"
            fill="#F59E0B"
          />
          {/* Open Book of Knowledge */}
          <path
            d="M32 58C38 55 45 56 50 59C55 56 62 55 68 58V72C62 69 55 70 50 73C45 70 38 69 32 72V58Z"
            fill="#FFFFFF"
            stroke="#1E3A8A"
            strokeWidth="1.5"
          />
          {/* Central Star of Excellence */}
          <polygon
            points="50,22 52,27 57,27 53,30 55,35 50,32 45,35 47,30 43,27 48,27"
            fill="#FBBF24"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base md:text-lg">
              IARE
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs md:text-sm tracking-wide bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              SMART AI
            </span>
          </div>
          <span className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 -mt-0.5 tracking-tight truncate max-w-[210px] md:max-w-none">
            Institute of Aeronautical Engineering
          </span>
        </div>
      )}
    </div>
  );
};

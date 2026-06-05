/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Shield, User, HelpCircle, Eye, Trophy, Heart } from 'lucide-react';
import { sfx } from '../utils/audio';

interface BilingualTextProps {
  idText: string;
  enText: string;
  className?: string;
  enClassName?: string;
  inline?: boolean;
}

export const BilingualText: React.FC<BilingualTextProps> = ({
  idText,
  enText,
  className = '',
  enClassName = '',
  inline = false
}) => {
  if (inline) {
    return (
      <span className={`font-sans text-xs tracking-tight ${className}`}>
        <span className="font-bold text-gray-900">{idText}</span>
        <span className={`text-slate-500 font-normal ml-1 border-l pl-1 border-black/20 ${enClassName}`}>
          {enText}
        </span>
      </span>
    );
  }

  return (
    <div className={`flex flex-col leading-tight ${className}`}>
      <span className="font-bold font-display text-gray-900 leading-none">{idText}</span>
      <span className={`text-[11px] font-sans font-medium text-slate-500 mt-1 leading-none uppercase tracking-wide ${enClassName}`}>
        {enText}
      </span>
    </div>
  );
};

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'lime' | 'teal' | 'coral' | 'sunflower' | 'grape' | 'paper' | 'ghost' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  idLabel: string;
  enLabel: string;
  icon?: React.ReactNode;
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({
  variant = 'lime',
  size = 'md',
  idLabel,
  enLabel,
  icon,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'lime':
        return 'bg-[#DFFF00] text-black hover:bg-[#c9e600]';
      case 'teal':
        return 'bg-[#2EC4B6] text-black hover:bg-[#25ab9e]';
      case 'coral':
        return 'bg-[#FF6B35] text-white hover:bg-[#e05624]';
      case 'sunflower':
        return 'bg-[#FFD23F] text-black hover:bg-[#e0b72c]';
      case 'grape':
        return 'bg-[#9B5DE5] text-white hover:bg-[#8049c4]';
      case 'paper':
        return 'bg-white text-black hover:bg-[#F0EDE6]';
      case 'ghost':
        return 'bg-transparent text-black border-2 hover:bg-black/5';
      case 'gray':
        return 'bg-[#F0EDE6] text-slate-700 hover:bg-slate-200';
      default:
        return 'bg-white text-black';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-1 px-3 text-xs rounded-lg border-[2px] brutal-shadow-sm';
      case 'lg':
        return 'py-3.5 px-6 text-lg rounded-xl border-[3px] brutal-shadow-lg';
      case 'md':
      default:
        return 'py-2.5 px-5 text-sm rounded-xl border-[3px] brutal-shadow';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sfx.playClick();
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      className={`
        relative inline-flex items-center justify-center font-mono font-bold tracking-tight
        brutal-press border-black border-solid outline-none transition-all duration-100 uppercase
        ${getVariantStyles()} ${getSizeStyles()} ${className}
      `}
      {...props}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
        <div className="flex flex-col text-center">
          <span className="leading-tight font-extrabold">{idLabel}</span>
          <span className="text-[10px] lowercase font-sans font-semibold tracking-wider opacity-85 leading-tight -mt-0.5">
            {enLabel}
          </span>
        </div>
      </div>
    </button>
  );
};

interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  bg?: 'paper' | 'cream' | 'sand' | 'navy' | 'light-yellow' | 'lime' | 'coral' | 'teal';
  hasGradients?: boolean;
}

export const BrutalCard: React.FC<BrutalCardProps> = ({
  bg = 'paper',
  hasGradients = false,
  children,
  className = '',
  ...props
}) => {
  const getBgClass = () => {
    if (hasGradients) {
      return 'bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-black';
    }
    switch (bg) {
      case 'cream':
        return 'bg-[#F7F4EE] text-black';
      case 'sand':
        return 'bg-[#F0EDE6] text-black';
      case 'navy':
        return 'bg-[#12182B] text-white';
      case 'light-yellow':
        return 'bg-[#FFD23F]/20 text-black';
      case 'lime':
        return 'bg-[#DFFF00] text-black';
      case 'coral':
        return 'bg-[#FF6B35] text-white';
      case 'teal':
        return 'bg-[#2EC4B6] text-black';
      case 'paper':
      default:
        return 'bg-white text-black';
    }
  };

  return (
    <div
      className={`
        border-3 border-black rounded-2xl brutal-shadow p-5 relative overflow-hidden
        ${getBgClass()} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const ScallopLine: React.FC<{ inverted?: boolean; color?: string }> = ({
  inverted = false,
  color = '#F7F4EE'
}) => {
  // Uses beautiful SVG curves to simulate realistic retro paper scallops
  return (
    <div className="w-full overflow-hidden leading-none h-[18px]">
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 20"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={
            inverted
              ? "M0,20 Q15,5 30,20 T60,20 T90,20 T120,20 T150,20 T180,20 T210,20 T240,20 T270,20 T300,20 T330,20 T360,20 T390,20 T420,20 T450,20 T480,20 T510,20 T540,20 T570,20 T600,20 T630,20 T660,20 T690,20 T720,20 T750,20 T780,20 T810,20 T840,20 T870,20 T900,20 T930,20 T960,20 T990,20 T1020,20 T1050,20 T1080,20 T1110,20 T1140,20 T1170,20 T1200,20 V20 H0 Z"
              : "M0,0 Q15,15 30,0 T60,0 T90,0 T120,0 T150,0 T180,0 T210,0 T240,0 T270,0 T300,0 T330,0 T360,0 T390,0 T420,0 T450,0 T480,0 T510,0 T540,0 T570,0 T600,0 T630,0 T660,0 T690,0 T720,0 T750,0 T780,0 T810,0 T840,0 T870,0 T900,0 T930,0 T960,0 T990,0 T1020,0 T1050,0 T1080,0 T1110,0 T1140,0 T1170,0 T1200,0 V0 H0 Z"
          }
          fill={color}
        />
      </svg>
    </div>
  );
};

export const PixelStars: React.FC<{ count?: number; activeCount?: number; className?: string }> = ({
  count = 5,
  activeCount = 3,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`text-sm shrink-0 leading-none select-none ${
            i < activeCount ? 'text-[#FFD23F]' : 'text-slate-300'
          }`}
          style={{ textShadow: i < activeCount ? '1px 1px 0px #000000' : 'none' }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export const PixelAvatar: React.FC<{
  avatar: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ avatar, className = '', size = 'md' }) => {
  const getDims = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10 border-[2px]';
      case 'lg':
        return 'w-20 h-20 border-[3px]';
      case 'xl':
        return 'w-32 h-32 border-[3px]';
      case 'md':
      default:
        return 'w-14 h-14 border-[3px]';
    }
  };

  // Dedicated handcrafted high-fidelity SVG graphic maps
  const renderSvgBody = () => {
    switch (avatar) {
      case 'detective':
        return (
          <svg className="w-full h-full bg-[#3B82F6]" viewBox="0 0 64 64" fill="none">
            {/* Fedora Hat */}
            <rect x="12" y="16" width="40" height="6" fill="#1E293B" />
            <rect x="20" y="8" width="24" height="8" fill="#1E293B" />
            <rect x="20" y="14" width="24" height="2" fill="#D1D5DB" />
            {/* Face */}
            <rect x="20" y="22" width="24" height="20" fill="#FDBA74" />
            {/* Eyes / Glasses */}
            <rect x="18" y="26" width="28" height="6" fill="#000000" />
            <rect x="22" y="28" width="8" height="3" fill="#60A5FA" opacity="0.6" />
            <rect x="34" y="28" width="8" height="3" fill="#60A5FA" opacity="0.6" />
            {/* Mouth */}
            <rect x="28" y="36" width="8" height="2" fill="#000" />
            {/* Hair */}
            <rect x="18" y="22" width="4" height="12" fill="#F59E0B" />
            <rect x="42" y="22" width="4" height="12" fill="#F59E0B" />
            {/* Collar & Coat */}
            <rect x="12" y="42" width="40" height="22" fill="#4B5563" />
            <rect x="28" y="42" width="8" height="12" fill="#1E293B" />
            <rect x="30" y="48" width="4" height="16" fill="#3B82F6" /> {/* Tie */}
          </svg>
        );

      case 'spy':
        return (
          <svg className="w-full h-full bg-[#1F2937]" viewBox="0 0 64 64" fill="none">
            {/* Background pattern */}
            <circle cx="32" cy="32" r="30" fill="#111827" stroke="#374151" strokeWidth="2" strokeDasharray="4 4" />
            {/* Hair */}
            <rect x="18" y="14" width="28" height="12" fill="#111827" />
            {/* Face */}
            <rect x="20" y="20" width="24" height="22" fill="#F3F4F6" />
            {/* Cool retro glasses */}
            <rect x="16" y="24" width="32" height="8" fill="#000000" />
            <rect x="20" y="26" width="10" height="4" fill="#000" />
            <rect x="34" y="26" width="10" height="4" fill="#000" />
            {/* Suit & tie */}
            <rect x="14" y="42" width="36" height="22" fill="#111111" />
            <rect x="28" y="42" width="8" height="22" fill="#FFF" />
            <polygon points="32,42 28,54 36,54" fill="#EF4444" />
          </svg>
        );

      case 'villain':
        return (
          <svg className="w-full h-full bg-[#6B21A8]" viewBox="0 0 64 64" fill="none">
            {/* Eye Patch */}
            <rect x="18" y="20" width="28" height="22" fill="#FCA5A5" />
            <rect x="18" y="14" width="28" height="8" fill="#1E1B4B" />
            {/* Face */}
            <rect x="20" y="22" width="24" height="20" fill="#F1F5F9" />
            {/* Eyepatch strap and patch */}
            <line x1="20" y1="18" x2="44" y2="30" stroke="#000000" strokeWidth="4" />
            <rect x="22" y="24" width="10" height="10" fill="#000000" />
            {/* Red Evil Eye */}
            <circle cx="38" cy="28" r="3" fill="#DC2626" />
            <rect x="34" y="24" width="8" height="2" fill="#312E81" />
            {/* Mustache */}
            <path d="M22,34 L42,34 L44,38 L38,36 L32,38 L26,36 L20,38 Z" fill="#111827" />
            {/* Elizabethan ruff collar */}
            <rect x="12" y="42" width="40" height="10" fill="#FFFFFF" rx="4" />
            <line x1="16" y1="42" x2="16" y2="52" stroke="#D1D5DB" strokeWidth="2" />
            <line x1="24" y1="42" x2="24" y2="52" stroke="#D1D5DB" strokeWidth="2" />
            <line x1="32" y1="42" x2="32" y2="52" stroke="#D1D5DB" strokeWidth="2" />
            <line x1="40" y1="42" x2="40" y2="52" stroke="#D1D5DB" strokeWidth="2" />
            <line x1="48" y1="42" x2="48" y2="52" stroke="#D1D5DB" strokeWidth="2" />
            {/* Purple Suit */}
            <rect x="14" y="52" width="36" height="12" fill="#4C1D95" />
          </svg>
        );

      case 'hacker':
        return (
          <svg className="w-full h-full bg-[#065F46]" viewBox="0 0 64 64" fill="none">
            {/* Hacker Hoody */}
            <path d="M12,64 C12,38 20,10 32,10 C44,10 52,38 52,64 Z" fill="#111827" />
            {/* Inside Hood dark shadow */}
            <path d="M18,64 C18,44 24,20 32,20 C40,20 46,44 46,64 Z" fill="#000000" stroke="#10B981" strokeWidth="1" />
            {/* Green glowing neon Matrix goggles */}
            <rect x="22" y="28" width="20" height="6" fill="#10B981" rx="2" />
            <rect x="24" y="29" width="7" height="4" fill="#D1FAE5" />
            <rect x="33" y="29" width="7" height="4" fill="#D1FAE5" />
            {/* Glowing neon code lines on shirt */}
            <line x1="26" y1="48" x2="38" y2="48" stroke="#10B981" strokeWidth="2" />
            <line x1="24" y1="54" x2="34" y2="54" stroke="#10B981" strokeWidth="2" />
          </svg>
        );

      case 'cat':
        return (
          <svg className="w-full h-full bg-[#EC4899]" viewBox="0 0 64 64" fill="none">
            {/* Pink Retro Alien Cat */}
            {/* Ears */}
            <polygon points="16,24 10,8 24,18" fill="#DB2777" />
            <polygon points="48,24 54,8 40,18" fill="#DB2777" />
            {/* Head */}
            <rect x="16" y="16" width="32" height="28" fill="#F472B6" />
            {/* Inner Ears */}
            <polygon points="14,21 11,12 20,18" fill="#FDF2F8" />
            <polygon points="50,21 53,12 44,18" fill="#FDF2F8" />
            {/* Cyber Eyes */}
            <rect x="20" y="24" width="8" height="8" fill="#2EC4B6" />
            <rect x="36" y="24" width="8" height="8" fill="#2EC4B6" />
            <rect x="23" y="27" width="2" height="2" fill="#FFFFFF" />
            <rect x="39" y="27" width="2" height="2" fill="#FFFFFF" />
            {/* Cat Snout / Nose */}
            <polygon points="32,34 29,31 35,31" fill="#FFF" />
            {/* Cheeks */}
            <rect x="12" y="30" width="4" height="2" fill="#FDBA74" />
            <rect x="48" y="30" width="4" height="2" fill="#FDBA74" />
            {/* Whiskers */}
            <line x1="8" y1="36" x2="16" y2="34" stroke="#4C0519" strokeWidth="1.5" />
            <line x1="8" y1="38" x2="16" y2="38" stroke="#4C0519" strokeWidth="1.5" />
            <line x1="48" y1="34" x2="56" y2="36" stroke="#4C0519" strokeWidth="1.5" />
            <line x1="48" y1="38" x2="56" y2="38" stroke="#4C0519" strokeWidth="1.5" />
          </svg>
        );

      case 'boy1':
        return (
          <svg className="w-full h-full bg-[#10B981]" viewBox="0 0 64 64" fill="none">
            {/* Cute anime style boy - Felix */}
            {/* Blue Cap */}
            <rect x="14" y="10" width="36" height="12" fill="#3B82F6" />
            <rect x="32" y="10" width="22" height="4" fill="#1D4ED8" />
            {/* Hair */}
            <rect x="16" y="20" width="32" height="8" fill="#4B5563" />
            {/* Face */}
            <rect x="18" y="24" width="28" height="24" fill="#FDBA74" />
            {/* Eyes */}
            <rect x="22" y="30" width="6" height="4" fill="#000" />
            <rect x="36" y="30" width="6" height="4" fill="#000" />
            {/* Blush */}
            <rect x="20" y="36" width="3" height="2" fill="#EF4444" opacity="0.5" />
            <rect x="41" y="36" width="3" height="2" fill="#EF4444" opacity="0.5" />
            {/* Smile */}
            <path d="M28,40 Q32,44 36,40" stroke="#000" strokeWidth="2" fill="none" />
            {/* Shirt */}
            <rect x="14" y="48" width="36" height="16" fill="#1E293B" />
          </svg>
        );

      case 'girl1':
        return (
          <svg className="w-full h-full bg-[#818CF8]" viewBox="0 0 64 64" fill="none">
            {/* Anya character */}
            {/* Orange Hair */}
            <rect x="12" y="8" width="40" height="28" fill="#F97316" />
            {/* Face */}
            <rect x="18" y="20" width="28" height="24" fill="#FFD8A8" />
            {/* Bangs */}
            <rect x="18" y="16" width="28" height="6" fill="#EA580C" />
            {/* Eyes */}
            <rect x="22" y="28" width="4" height="4" fill="#5F3DC4" />
            <rect x="38" y="28" width="4" height="4" fill="#5F3DC4" />
            {/* Shy Blush */}
            <rect x="20" y="34" width="4" height="2" fill="#F03E3E" opacity="0.6" />
            <rect x="40" y="34" width="4" height="2" fill="#F03E3E" opacity="0.6" />
            {/* Dress */}
            <rect x="12" y="44" width="40" height="20" fill="#EC4899" />
            <circle cx="32" cy="54" r="3" fill="#FFF" />
          </svg>
        );

      case 'boy2':
        return (
          <svg className="w-full h-full bg-amber-400" viewBox="0 0 64 64" fill="none">
            {/* Budi (Alpaca) - blond curly boy */}
            {/* Curly Blond hair */}
            <rect x="14" y="8" width="36" height="20" fill="#F59E0B" rx="6" />
            {/* Face */}
            <rect x="18" y="20" width="28" height="24" fill="#FDF2E9" />
            {/* Eyes */}
            <rect x="22" y="28" width="5" height="4" fill="#111" />
            <rect x="37" y="28" width="5" height="4" fill="#111" />
            {/* Smile */}
            <rect x="30" y="36" width="4" height="2" fill="#E11D48" />
            {/* Green jacket */}
            <rect x="14" y="44" width="36" height="20" fill="#047857" />
          </svg>
        );

      case 'glasses-girl':
        return (
          <svg className="w-full h-full bg-blue-500" viewBox="0 0 64 64" fill="none">
            {/* Ratu_Intel character */}
            {/* Hair */}
            <rect x="12" y="10" width="40" height="34" fill="#4C0519" />
            {/* Face */}
            <rect x="18" y="20" width="28" height="24" fill="#FED7AA" />
            {/* Goggles / Red glasses */}
            <rect x="16" y="24" width="32" height="8" fill="#DC2626" />
            <rect x="22" y="26" width="6" height="4" fill="#000" />
            <rect x="36" y="26" width="6" height="4" fill="#000" />
            {/* Collar */}
            <rect x="14" y="44" width="36" height="20" fill="#312E81" />
          </svg>
        );

      case 'monster':
        return (
          <svg className="w-full h-full bg-[#1e293b]" viewBox="0 0 64 64" fill="none">
            {/* Cute pixel monster */}
            <rect x="16" y="12" width="32" height="36" fill="#A855F7" rx="8" />
            <rect x="12" y="20" width="40" height="20" fill="#A855F7" />
            {/* Horns */}
            <polygon points="16,14 10,2 22,10" fill="#E879F9" />
            <polygon points="48,14 54,2 42,10" fill="#E879F9" />
            {/* Glowing eye */}
            <circle cx="32" cy="24" r="8" fill="#FDE047" />
            <circle cx="32" cy="24" r="3" fill="#000" />
            {/* Mouth with fangs */}
            <rect x="24" y="36" width="16" height="6" fill="#111" />
            <polygon points="26,36 29,36 27.5,40" fill="#FFF" />
            <polygon points="35,36 38,36 36.5,40" fill="#FFF" />
          </svg>
        );

      case 'ninja':
        return (
          <svg className="w-full h-full bg-[#000000]" viewBox="0 0 64 64" fill="none">
            {/* Shadow Master Gold Ninja */}
            <rect x="12" y="12" width="40" height="40" fill="#1E293B" />
            {/* Gold Headband */}
            <rect x="12" y="14" width="40" height="6" fill="#F59E0B" />
            {/* Gold Badge */}
            <polygon points="32,12 28,17 36,17" fill="#F59E0B" />
            {/* Eye mask slit */}
            <rect x="16" y="24" width="32" height="10" fill="#FCD34D" />
            {/* Narrow eyes */}
            <path d="M20,29 L28,29 C28,29 26,26 24,26 Z" fill="#000" />
            <path d="M44,29 L36,29 C36,29 38,26 40,26 Z" fill="#000" />
            {/* Suit */}
            <rect x="14" y="44" width="36" height="20" fill="#0F172A" />
            {/* Gold stripes */}
            <line x1="22" y1="44" x2="22" y2="64" stroke="#F59E0B" strokeWidth="2" />
            <line x1="42" y1="44" x2="42" y2="64" stroke="#F59E0B" strokeWidth="2" />
          </svg>
        );

      case 'girl2':
        return (
          <svg className="w-full h-full bg-slate-900" viewBox="0 0 64 64" fill="none">
            {/* Techno Ghost */}
            <rect x="14" y="10" width="36" height="34" fill="#DDB3FF" rx="4" />
            {/* Helmet Shield */}
            <rect x="18" y="20" width="28" height="14" fill="#9333EA" rx="2" />
            {/* Cyber eyes */}
            <line x1="22" y1="27" x2="42" y2="27" stroke="#00FFF0" strokeWidth="3" />
            {/* Headphones */}
            <rect x="10" y="20" width="5" height="14" fill="#EC4899" />
            <rect x="49" y="20" width="5" height="14" fill="#EC4899" />
            <path d="M12,20 A 20 20 0 0 1 52 20" stroke="#EC4899" strokeWidth="4" fill="none" />
            {/* Dark suit */}
            <rect x="14" y="44" width="36" height="20" fill="#3B0764" />
          </svg>
        );

      case 'sci-fi':
        return (
          <svg className="w-full h-full bg-blue-950" viewBox="0 0 64 64" fill="none">
            {/* Agent Frost Helmet */}
            <rect x="16" y="12" width="32" height="36" fill="#E2E8F0" rx="4" />
            {/* Visor glowing neon turquoise */}
            <path d="M16,22 L48,22 L44,32 L20,32 Z" fill="#00E5FF" />
            {/* Cyber grid lines */}
            <line x1="32" y1="12" x2="32" y2="22" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="24" y1="38" x2="40" y2="38" stroke="#00E5FF" strokeWidth="2" />
            {/* White space collar */}
            <rect x="12" y="48" width="40" height="16" fill="#F8FAFC" />
            <rect x="24" y="48" width="16" height="16" fill="#64748B" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className={`
        brutal-border brutal-shadow-sm select-none shrink-0 overflow-hidden rounded-xl bg-white
        ${getDims()} ${className}
      `}
    >
      {renderSvgBody()}
    </div>
  );
};

interface BrutalBadgeProps {
  type: 'SIVIL' | 'UNDERCOVER' | 'MR_WHITE' | 'SPECIAL' | 'READY' | 'NOT_READY' | 'ELIMINATED' | 'MEMBER';
}

export const BrutalBadge: React.FC<BrutalBadgeProps> = ({ type }) => {
  const getLabelAndStyles = () => {
    switch (type) {
      case 'SIVIL':
        return {
          idText: 'SIPIL',
          enText: 'CIVILIAN',
          styles: 'bg-[#DFFF00] text-black border-2 border-black'
        };
      case 'UNDERCOVER':
        return {
          idText: 'PENYAMAR',
          enText: 'UNDERCOVER',
          styles: 'bg-[#FF6B35] text-white border-2 border-black font-semibold'
        };
      case 'MR_WHITE':
        return {
          idText: 'MR. WHITE',
          enText: 'MR. WHITE',
          styles: 'bg-[#FFD23F] text-black border-2 border-black text-xs'
        };
      case 'SPECIAL':
        return {
          idText: 'SPESIAL',
          enText: 'SPECIAL',
          styles: 'bg-[#9B5DE5] text-white border-2 border-black text-xs'
        };
      case 'READY':
        return {
          idText: '● SIAP',
          enText: 'READY',
          styles: 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500'
        };
      case 'NOT_READY':
        return {
          idText: '○ MENUNGGU',
          enText: 'WAITING',
          styles: 'bg-amber-50 text-amber-700 border-2 border-amber-300'
        };
      case 'ELIMINATED':
        return {
          idText: 'ELIMINASI',
          enText: 'ELIMINATED',
          styles: 'bg-red-50 text-red-500 border-2 border-red-500 line-through decoration-black decoration-2'
        };
      case 'MEMBER':
        return {
          idText: 'ELITE MEMBER',
          enText: 'ELITE MEMBER',
          styles: 'bg-[#DFFF00] text-black border-2 border-black shadow-[1px_1px_0px_#000]'
        };
      default:
        return {
          idText: 'INFO',
          enText: 'INFO',
          styles: 'bg-gray-100 text-gray-800 border-2 border-black'
        };
    }
  };

  const { idText, enText, styles } = getLabelAndStyles();

  return (
    <div className={`inline-flex flex-col items-center px-2 py-0.5 rounded-lg leading-none ${styles}`}>
      <span className="font-sans font-bold text-[10px] uppercase">{idText}</span>
      <span className="text-[7px] opacity-80 uppercase font-semibold font-sans">{enText}</span>
    </div>
  );
};

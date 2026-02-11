import { HelpCircle } from 'lucide-react';
import { getStretchTutorialUrl } from '@/data/stretch-tutorials';

interface StretchHelpLinkProps {
  stretchId: string;
  onClickBeforeNavigate?: () => void;
  className?: string;
}

export function StretchHelpLink({ stretchId, onClickBeforeNavigate, className = '' }: StretchHelpLinkProps) {
  const tutorialUrl = getStretchTutorialUrl(stretchId);
  
  if (!tutorialUrl) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    // Call the callback before navigating (e.g., to pause timer)
    if (onClickBeforeNavigate) {
      onClickBeforeNavigate();
    }
    // Don't prevent default - let the link open in new tab
  };
  
  return (
    <a
      href={tutorialUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-primary border border-primary/50 rounded-lg px-2.5 py-1 hover:bg-primary/10 hover:border-primary transition-all ${className}`}
    >
      <HelpCircle className="w-4 h-4" />
      <span>Need help?</span>
    </a>
  );
}

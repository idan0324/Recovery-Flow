import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AudioToggleProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
}

export function AudioToggle({ enabled, onToggle, className }: AudioToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={cn(
        "gap-2 transition-colors",
        enabled && "border-primary/50 bg-primary/10 text-primary",
        className
      )}
    >
      {enabled ? (
        <>
          <Volume2 className="w-4 h-4" />
          <span className="text-xs">Audio On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4" />
          <span className="text-xs">Audio Off</span>
        </>
      )}
    </Button>
  );
}

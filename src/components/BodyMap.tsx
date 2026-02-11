import { BodyRegion, BodySelection } from '@/types/recovery';
import { cn } from '@/lib/utils';

interface BodyMapProps {
  selections: BodySelection[];
  onToggle: (region: BodyRegion) => void;
}

const bodyRegions: { id: BodyRegion; label: string; position: string }[] = [
  { id: 'neck', label: 'Neck', position: 'top-[8%] left-1/2 -translate-x-1/2' },
  { id: 'shoulders', label: 'Shoulders', position: 'top-[14%] left-1/2 -translate-x-1/2 w-32' },
  { id: 'chest', label: 'Chest', position: 'top-[22%] left-1/2 -translate-x-1/2' },
  { id: 'upper-back', label: 'Upper Back', position: 'top-[18%] left-1/2 -translate-x-1/2 translate-y-8' },
  { id: 'arms', label: 'Arms', position: 'top-[24%] left-[18%]' },
  { id: 'wrists', label: 'Wrists', position: 'top-[38%] left-[12%]' },
  { id: 'lower-back', label: 'Lower Back', position: 'top-[38%] left-1/2 -translate-x-1/2' },
  { id: 'hips', label: 'Hips', position: 'top-[48%] left-1/2 -translate-x-1/2 w-28' },
  { id: 'quads', label: 'Quads', position: 'top-[58%] left-1/2 -translate-x-1/2' },
  { id: 'hamstrings', label: 'Hamstrings', position: 'top-[65%] left-1/2 -translate-x-1/2' },
  { id: 'calves', label: 'Calves', position: 'top-[78%] left-1/2 -translate-x-1/2' },
  { id: 'ankles', label: 'Ankles', position: 'top-[90%] left-1/2 -translate-x-1/2' },
];

export function BodyMap({ selections, onToggle }: BodyMapProps) {
  const isSelected = (region: BodyRegion) =>
    selections.some(s => s.region === region);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-foreground mb-2">Where are you sore?</h2>
      <p className="text-muted-foreground mb-6">
        Tap areas that feel tight or sore
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {bodyRegions.map((region) => {
          const selected = isSelected(region.id);
          return (
            <button
              key={region.id}
              onClick={() => onToggle(region.id)}
              className={cn(
                "px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium",
                "hover:scale-105 active:scale-95",
                selected
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "bg-card/60 hover:bg-card/80 border border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {region.label}
            </button>
          );
        })}
      </div>

      {selections.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-accent/30 border border-primary/20">
          <p className="text-sm text-primary font-medium">
            {selections.length} area{selections.length > 1 ? 's' : ''} selected
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            We'll prioritize stretches for: {selections.map(s => 
              bodyRegions.find(r => r.id === s.region)?.label
            ).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

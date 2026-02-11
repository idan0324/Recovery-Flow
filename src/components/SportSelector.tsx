import { useState } from 'react';
import { Sport } from '@/types/recovery';
import { sports } from '@/data/sports';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SportSelectorProps {
  selected: Sport | null;
  onSelect: (sport: Sport) => void;
}

export function SportSelector({ selected, onSelect }: SportSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSportName, setCustomSportName] = useState('');

  const handleSportClick = (sport: Sport) => {
    if (sport.id === 'other') {
      setShowCustomInput(true);
    } else {
      onSelect(sport);
    }
  };

  const handleCustomSportSubmit = () => {
    if (customSportName.trim()) {
      const otherSport = sports.find(s => s.id === 'other')!;
      const customSport: Sport = {
        ...otherSport,
        name: customSportName.trim(),
      };
      onSelect(customSport);
      setShowCustomInput(false);
      setCustomSportName('');
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-foreground mb-2">What's your sport?</h2>
      <p className="text-muted-foreground mb-6">
        We'll customize stretches based on your sport's demands
      </p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => handleSportClick(sport)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300",
              "hover:scale-105 active:scale-95",
              selected?.id === sport.id
                ? "glass-card ring-2 ring-primary shadow-glow"
                : "bg-card/60 hover:bg-card/80 border border-border/50"
            )}
          >
            <span className="text-3xl mb-2">{sport.icon}</span>
            <span className={cn(
              "text-xs font-medium text-center",
              selected?.id === sport.id ? "text-primary" : "text-muted-foreground"
            )}>
              {sport.id === 'other' && selected?.id === 'other' && selected?.name !== 'Other' 
                ? selected.name 
                : sport.name}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={showCustomInput} onOpenChange={setShowCustomInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your sport</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="e.g., Rock Climbing, CrossFit, Martial Arts..."
            value={customSportName}
            onChange={(e) => setCustomSportName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSportSubmit()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomInput(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomSportSubmit} disabled={!customSportName.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

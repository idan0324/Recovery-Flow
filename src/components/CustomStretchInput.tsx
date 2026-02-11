import { useState } from 'react';
import { Stretch, BodyRegion } from '@/types/recovery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Plus, X, PenLine } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CustomStretchInputProps {
  onAddStretch: (stretch: Stretch) => void;
}

const bodyRegionLabels: Record<BodyRegion, string> = {
  'neck': 'Neck',
  'shoulders': 'Shoulders',
  'upper-back': 'Upper Back',
  'lower-back': 'Lower Back',
  'chest': 'Chest',
  'arms': 'Arms',
  'wrists': 'Wrists',
  'hips': 'Hips',
  'quads': 'Quads',
  'hamstrings': 'Hamstrings',
  'calves': 'Calves',
  'ankles': 'Ankles',
};

const allBodyRegions: BodyRegion[] = Object.keys(bodyRegionLabels) as BodyRegion[];

export function CustomStretchInput({ onAddStretch }: CustomStretchInputProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedAreas, setSelectedAreas] = useState<BodyRegion[]>([]);

  const toggleArea = (area: BodyRegion) => {
    setSelectedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleAdd = () => {
    if (!name.trim() || selectedAreas.length === 0) return;

    const customStretch: Stretch = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom stretch',
      duration,
      targetAreas: selectedAreas,
    };

    onAddStretch(customStretch);
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setDuration(30);
    setSelectedAreas([]);
  };

  const isValid = name.trim() && selectedAreas.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PenLine className="w-4 h-4" />
          Add Custom Stretch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Stretch</DialogTitle>
          <DialogDescription>
            Add your own stretch to include in custom routines. Note: Custom stretches don't have animations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Stretch Name *
            </label>
            <Input
              placeholder="e.g., Figure Four Stretch"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <Textarea
              placeholder="Brief description of how to perform this stretch..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">
                Duration
              </label>
              <span className="text-sm text-muted-foreground">
                {duration} seconds
              </span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={(values) => setDuration(values[0])}
              min={15}
              max={90}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15s</span>
              <span>90s</span>
            </div>
          </div>

          {/* Target Areas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Target Areas * <span className="text-muted-foreground font-normal">(select at least one)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {allBodyRegions.map(area => (
                <Badge
                  key={area}
                  variant={selectedAreas.includes(area) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleArea(area)}
                >
                  {selectedAreas.includes(area) && (
                    <X className="w-3 h-3 mr-1" />
                  )}
                  {bodyRegionLabels[area]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!isValid}>
            <Plus className="w-4 h-4 mr-2" />
            Add Stretch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

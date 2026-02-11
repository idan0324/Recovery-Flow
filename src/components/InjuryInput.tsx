import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, AlertTriangle } from 'lucide-react';

export type InjuryType = 
  | 'knee-pain'
  | 'achilles-pain'
  | 'hamstring-strain'
  | 'lower-back-pain'
  | 'shoulder-injury'
  | 'ankle-sprain'
  | 'hip-pain'
  | 'wrist-pain'
  | 'neck-pain'
  | 'other';

export interface InjuryPreset {
  id: InjuryType;
  label: string;
  description: string;
  adjustments: string[];
}

export const injuryPresets: InjuryPreset[] = [
  {
    id: 'knee-pain',
    label: 'Knee Pain',
    description: 'Limits deep squats and high knee flexion',
    adjustments: ['Limiting deep knee bends', 'Avoiding quad stretches with full flexion'],
  },
  {
    id: 'achilles-pain',
    label: 'Achilles Pain',
    description: 'Caps calf stretch intensity',
    adjustments: ['Reducing calf stretch intensity', 'Avoiding aggressive heel drops'],
  },
  {
    id: 'hamstring-strain',
    label: 'Hamstring Strain',
    description: 'Shorter durations, gentler stretches',
    adjustments: ['Shorter hold durations', 'Gentler hamstring stretches'],
  },
  {
    id: 'lower-back-pain',
    label: 'Lower Back Pain',
    description: 'Avoids deep forward folds',
    adjustments: ['Avoiding deep forward bends', 'Modified spinal movements'],
  },
  {
    id: 'shoulder-injury',
    label: 'Shoulder Injury',
    description: 'Limits overhead and cross-body movements',
    adjustments: ['Limiting overhead stretches', 'Gentler shoulder mobility'],
  },
  {
    id: 'ankle-sprain',
    label: 'Ankle Sprain',
    description: 'Reduces ankle range of motion exercises',
    adjustments: ['Limited ankle rotation', 'Avoiding weight-bearing ankle stretches'],
  },
  {
    id: 'hip-pain',
    label: 'Hip Pain',
    description: 'Gentler hip openers',
    adjustments: ['Modified hip flexor stretches', 'Gentler pigeon pose variations'],
  },
  {
    id: 'wrist-pain',
    label: 'Wrist Pain',
    description: 'Avoids weight-bearing wrist positions',
    adjustments: ['Modified hand positions', 'Avoiding full wrist extension'],
  },
  {
    id: 'neck-pain',
    label: 'Neck Pain',
    description: 'Gentler neck movements',
    adjustments: ['Reduced neck rotation', 'Gentler stretches'],
  },
];

interface InjuryInputProps {
  injuries: string[];
  onAddInjury: (injury: string) => void;
  onRemoveInjury: (injury: string) => void;
}

export function InjuryInput({ injuries, onAddInjury, onRemoveInjury }: InjuryInputProps) {
  const [customInjury, setCustomInjury] = useState('');
  const [showPresets, setShowPresets] = useState(true);

  const handleAddCustom = () => {
    if (customInjury.trim() && !injuries.includes(customInjury.trim())) {
      onAddInjury(customInjury.trim());
      setCustomInjury('');
    }
  };

  const handlePresetClick = (preset: InjuryPreset) => {
    if (injuries.includes(preset.id)) {
      onRemoveInjury(preset.id);
    } else {
      onAddInjury(preset.id);
    }
  };

  const getInjuryLabel = (injury: string): string => {
    const preset = injuryPresets.find(p => p.id === injury);
    return preset ? preset.label : injury;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" />
        <h4 className="text-sm font-medium text-foreground">
          Any injuries to consider? <span className="text-muted-foreground font-normal">(optional)</span>
        </h4>
      </div>

      {/* Preset buttons */}
      {showPresets && (
        <div className="flex flex-wrap gap-2">
          {injuryPresets.map((preset) => (
            <Button
              key={preset.id}
              variant={injuries.includes(preset.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(preset)}
              className="text-xs"
            >
              {preset.label}
              {injuries.includes(preset.id) && <X className="w-3 h-3 ml-1" />}
            </Button>
          ))}
        </div>
      )}

      {/* Custom injury input */}
      <div className="flex gap-2">
        <Input
          placeholder="Type a specific injury..."
          value={customInjury}
          onChange={(e) => setCustomInjury(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          className="flex-1"
        />
        <Button
          onClick={handleAddCustom}
          variant="outline"
          size="icon"
          disabled={!customInjury.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Current injuries display */}
      {injuries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Active adjustments:</p>
          <div className="flex flex-wrap gap-2">
            {injuries.map((injury) => (
              <Badge
                key={injury}
                variant="secondary"
                className="flex items-center gap-1 bg-warning/10 text-warning border-warning/20"
              >
                <AlertTriangle className="w-3 h-3" />
                {getInjuryLabel(injury)}
                <button
                  onClick={() => onRemoveInjury(injury)}
                  className="ml-1 hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Toggle presets visibility */}
      <button
        onClick={() => setShowPresets(!showPresets)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showPresets ? 'Hide common injuries' : 'Show common injuries'}
      </button>
    </div>
  );
}

// Utility functions for injury-based adjustments
export function getInjuryAdjustments(injuries: string[]): {
  excludeStretches: string[];
  reducedDuration: string[];
  warnings: string[];
} {
  const excludeStretches: string[] = [];
  const reducedDuration: string[] = [];
  const warnings: string[] = [];

  injuries.forEach((injury) => {
    switch (injury) {
      case 'knee-pain':
        excludeStretches.push('hip-flexor-lunge-left', 'hip-flexor-lunge-right');
        reducedDuration.push('standing-quad-left', 'standing-quad-right', 'pigeon-pose-left', 'pigeon-pose-right');
        warnings.push('Keeping stretches light due to reported knee pain');
        break;
      case 'achilles-pain':
        reducedDuration.push('wall-calf-left', 'wall-calf-right', 'downward-dog');
        warnings.push('Capping calf stretch intensity for Achilles safety');
        break;
      case 'hamstring-strain':
        reducedDuration.push('standing-hamstring-left', 'standing-hamstring-right', 'downward-dog');
        warnings.push('Shorter hamstring stretches due to reported strain');
        break;
      case 'lower-back-pain':
        excludeStretches.push('seated-twist');
        reducedDuration.push('child-pose', 'cat-cow');
        warnings.push('Modified movements for lower back protection');
        break;
      case 'shoulder-injury':
        excludeStretches.push('overhead-tricep');
        reducedDuration.push('cross-body-shoulder', 'doorway-chest');
        warnings.push('Limiting shoulder stretch intensity');
        break;
      case 'ankle-sprain':
        excludeStretches.push('ankle-circles-left', 'ankle-circles-right');
        reducedDuration.push('downward-dog');
        warnings.push('Modified ankle movements for sprain recovery');
        break;
      case 'hip-pain':
        reducedDuration.push('pigeon-pose-left', 'pigeon-pose-right', 'hip-flexor-lunge-left', 'hip-flexor-lunge-right', 'figure-four-left', 'figure-four-right');
        warnings.push('Gentler hip stretches due to reported pain');
        break;
      case 'wrist-pain':
        reducedDuration.push('wrist-flexor');
        warnings.push('Modified wrist positions for comfort');
        break;
      case 'neck-pain':
        reducedDuration.push('neck-tilt', 'neck-rotation');
        warnings.push('Gentler neck movements for safety');
        break;
      default:
        // Custom injury - add generic warning
        if (injury && !injuryPresets.find(p => p.id === injury)) {
          warnings.push(`Taking care with ${injury}`);
        }
        break;
    }
  });

  return {
    excludeStretches: [...new Set(excludeStretches)],
    reducedDuration: [...new Set(reducedDuration)],
    warnings: [...new Set(warnings)],
  };
}

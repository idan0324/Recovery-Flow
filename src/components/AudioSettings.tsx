import { useState } from 'react';
import { Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export type VoiceGender = 'female' | 'male' | 'none';

export interface AudioSettingsState {
  enabled: boolean;
  volume: number;
  voiceGender: VoiceGender;
}

interface AudioSettingsProps {
  settings: AudioSettingsState;
  onSettingsChange: (settings: AudioSettingsState) => void;
  onActivateAudio?: () => void;
  onTestVoice?: () => void;
  className?: string;
}

export function AudioSettings({ 
  settings, 
  onSettingsChange, 
  onActivateAudio, 
  onTestVoice,
  className 
}: AudioSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    if (!settings.enabled) {
      // When turning on, expand to show options and activate speech synthesis
      setIsExpanded(true);
      onActivateAudio?.();
    }
    onSettingsChange({ ...settings, enabled: !settings.enabled });
  };

  const handleVolumeChange = (values: number[]) => {
    onSettingsChange({ ...settings, volume: values[0] });
  };

  const handleVoiceGenderChange = (gender: VoiceGender) => {
    onSettingsChange({ ...settings, voiceGender: gender });
  };

  const handleTestVoice = () => {
    console.log('[AudioSettings] Test button clicked');
    onTestVoice?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main toggle button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          className={cn(
            "gap-2 transition-colors",
            settings.enabled && "border-primary/50 bg-primary/10 text-primary"
          )}
        >
          {settings.enabled ? (
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

        {settings.enabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Expanded settings */}
      {settings.enabled && isExpanded && (
        <div className="glass-card rounded-xl p-4 space-y-4 animate-fade-up">
          <p className="text-xs text-muted-foreground">
            ✨ Recommended defaults for clear guidance. Adjust as needed.
          </p>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Voice</label>
            <p className="text-xs text-muted-foreground">
              Select a voice or choose "None" for beeps only
            </p>
            <div className="flex gap-2">
              <Button
                variant={settings.voiceGender === 'female' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVoiceGenderChange('female')}
                className={cn(
                  "flex-1",
                  settings.voiceGender === 'female' && "gradient-hero"
                )}
              >
                Female
              </Button>
              <Button
                variant={settings.voiceGender === 'male' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVoiceGenderChange('male')}
                className={cn(
                  "flex-1",
                  settings.voiceGender === 'male' && "gradient-hero"
                )}
              >
                Male
              </Button>
              <Button
                variant={settings.voiceGender === 'none' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVoiceGenderChange('none')}
                className={cn(
                  "flex-1",
                  settings.voiceGender === 'none' && "gradient-hero"
                )}
              >
                None
              </Button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">Volume</label>
              <span className="text-sm text-muted-foreground">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={handleVolumeChange}
              min={0.1}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Quiet</span>
              <span>Loud</span>
            </div>
          </div>

          {/* Test Voice Button - only show when voice is selected */}
          {settings.voiceGender !== 'none' && (
            <div className="pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestVoice}
                className="w-full gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Test Voice
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Click to hear a sample. If silent, check browser permissions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Settings, User, Trash2, Check, Info, Heart, Moon, Sun } from 'lucide-react';
interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onChangeName: (name: string) => void;
  onResetData: () => void;
}
export function SettingsDialog({
  open,
  onOpenChange,
  currentName,
  onChangeName,
  onResetData
}: SettingsDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const isDarkMode = theme === 'dark';
  const handleSaveName = () => {
    if (newName.trim() && newName.trim() !== currentName) {
      onChangeName(newName.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };
  const handleResetData = () => {
    onResetData();
    setShowResetConfirm(false);
    onOpenChange(false);
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when closing
      setNewName(currentName);
      setNameSaved(false);
    }
    onOpenChange(isOpen);
  };
  return <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Change Name Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <User className="w-4 h-4" />
                Your Name
              </label>
              <div className="flex gap-2">
                <Input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter your name" className="flex-1" autoFocus={false} />
                <Button onClick={handleSaveName} disabled={!newName.trim() || newName.trim() === currentName} variant={nameSaved ? 'outline' : 'default'} size="default" className={nameSaved ? 'bg-green-500/20 border-green-500 text-green-400' : ''}>
                  {nameSaved ? <>
                      <Check className="w-4 h-4 mr-1" />
                      Saved
                    </> : 'Save'}
                </Button>
              </div>
            </div>

            {/* Theme Toggle Section */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                {isDarkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-warning" />}
                Appearance
              </label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Light</span>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Dark</span>
                  <Moon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Reset Data Section */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Trash2 className="w-4 h-4 text-destructive" />
                Reset All Data
              </label>
              <p className="text-xs text-muted-foreground">
                This will permanently delete all your sessions, streaks, saved routines, and custom stretches.
              </p>
              <Button onClick={() => setShowResetConfirm(true)} variant="destructive" size="sm" className="w-full">
                Reset All Data
              </Button>
            </div>

            {/* About Section */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Info className="w-4 h-4 text-primary" />
                About RecoverFlow
              </label>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Version 1.0.0</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  RecoverFlow was created by a high school athlete who experienced injury firsthand. 
                  The goal is simple: <span className="text-foreground font-medium">make stretching a daily habit</span>.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Input your sport, mark sore areas, note any injuries, and get a personalized 5-15 minute stretching routine designed to minimize injury, promote recovery, and reduce stress.
                </p>
                <p className="text-xs text-muted-foreground/80 pt-2 border-t border-border">
                  Train hard. Recover harder. 💪
                </p>
                <a href="https://forms.gle/JoP7CWRrQRiUpifM6" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-center text-xs font-extrabold">
                  📝 Please send feedback! Anything you have to say is much appreciated.                   
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All completed sessions and history</li>
                <li>Your current and longest streak</li>
                <li>All saved custom routines</li>
                <li>All custom stretches you've created</li>
                <li>Your name and preferences</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Check, AlertTriangle, HardDrive, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'recovery-app-profile';
const CUSTOM_STRETCHES_KEY = 'recovery-app-custom-stretches';

interface DataBackupProps {
  onImportComplete?: () => void;
  onClearOldSessions?: () => boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getStorageUsage(): { used: number; profileSize: number; customStretchesSize: number; oldSessionsCount: number } {
  const profileData = localStorage.getItem(STORAGE_KEY) || '';
  const customStretchesData = localStorage.getItem(CUSTOM_STRETCHES_KEY) || '';
  
  const profileSize = new Blob([profileData]).size;
  const customStretchesSize = new Blob([customStretchesData]).size;
  
  // Count sessions older than 1 year
  let oldSessionsCount = 0;
  try {
    const profile = JSON.parse(profileData || '{}');
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    const cutoffStr = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}-${String(cutoffDate.getDate()).padStart(2, '0')}`;
    
    const completedDates = profile.completedDates || [];
    const completedSessions = profile.completedSessions || [];
    
    oldSessionsCount = completedDates.filter((date: string) => date < cutoffStr).length +
                       completedSessions.filter((s: { date: string }) => s.date < cutoffStr).length;
  } catch {
    // Ignore parsing errors
  }
  
  return {
    used: profileSize + customStretchesSize,
    profileSize,
    customStretchesSize,
    oldSessionsCount,
  };
}

export function DataBackup({ onImportComplete, onClearOldSessions }: DataBackupProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [importData, setImportData] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<{
    totalSessions: number;
    currentStreak: number;
    longestStreak: number;
    savedRoutines: number;
    completedDates: number;
  } | null>(null);
  const [storageInfo, setStorageInfo] = useState(() => getStorageUsage());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Refresh storage info periodically
  useEffect(() => {
    const updateStorage = () => setStorageInfo(getStorageUsage());
    updateStorage();
    
    const interval = setInterval(updateStorage, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      toast({
        title: "No data to export",
        description: "Start a session first to create progress data.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recoverflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup exported",
      description: "Your progress has been saved to a file.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Validate the data structure
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid data format');
        }

        // Create preview
        setImportPreview({
          totalSessions: parsed.totalSessions || 0,
          currentStreak: parsed.currentStreak || 0,
          longestStreak: parsed.longestStreak || 0,
          savedRoutines: (parsed.savedRoutines || []).length,
          completedDates: (parsed.completedDates || []).length,
        });
        setImportData(content);
        setShowImportDialog(true);
      } catch {
        toast({
          title: "Invalid backup file",
          description: "The selected file is not a valid RecoverFlow backup.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const confirmImport = () => {
    if (importData) {
      localStorage.setItem(STORAGE_KEY, importData);
      toast({
        title: "Progress restored",
        description: "Your backup has been imported successfully.",
      });
      setShowImportDialog(false);
      setImportData(null);
      setImportPreview(null);
      
      // Trigger a page reload to refresh the state
      onImportComplete?.();
      window.location.reload();
    }
  };

  const handleClearOldSessions = () => {
    if (onClearOldSessions) {
      onClearOldSessions();
      setStorageInfo(getStorageUsage());
      toast({
        title: "Old sessions cleared",
        description: "Sessions older than 1 year have been removed.",
      });
    }
    setShowClearDialog(false);
  };

  return (
    <div className="space-y-4">
      {/* Storage Usage with Clear Option */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Storage</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              {formatBytes(storageInfo.used)} / 5 MB ({((storageInfo.used / (5 * 1024 * 1024)) * 100).toFixed(2)}%)
            </span>
            {onClearOldSessions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                title="Remove session history older than 1 year to free up space"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear old
              </Button>
            )}
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min((storageInfo.used / (5 * 1024 * 1024)) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground/70">
          {storageInfo.oldSessionsCount > 0 
            ? `${storageInfo.oldSessionsCount} entries older than 1 year can be cleared`
            : 'Session history is stored locally on this device'}
        </p>
      </div>

      {/* Import/Export Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleImportClick}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
      </div>


      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Import Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Import Backup?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This will replace all your current progress with the backup data:</p>
                
                {importPreview && (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sessions:</span>
                      <span className="font-medium text-foreground">{importPreview.totalSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current streak:</span>
                      <span className="font-medium text-foreground">{importPreview.currentStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best streak:</span>
                      <span className="font-medium text-foreground">{importPreview.longestStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saved routines:</span>
                      <span className="font-medium text-foreground">{importPreview.savedRoutines}</span>
                    </div>
                  </div>
                )}

                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  Your current progress will be permanently overwritten.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              <Check className="w-4 h-4 mr-2" />
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Old Sessions Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Clear Old Sessions?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {storageInfo.oldSessionsCount} session entries older than 1 year. 
              Your streaks and total session count will remain unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearOldSessions} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Old Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

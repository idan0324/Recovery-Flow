import { SavedRoutine, StretchingRoutine, Stretch } from '@/types/recovery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Trash2, Clock, Calendar, Pencil } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SavedRoutinesProps {
  savedRoutines: SavedRoutine[];
  onLoadRoutine: (routine: StretchingRoutine) => void;
  onDeleteRoutine: (id: string) => void;
  onEditRoutine: (stretches: Stretch[], routineId: string, routineName: string) => void;
}

export function SavedRoutines({ savedRoutines, onLoadRoutine, onDeleteRoutine, onEditRoutine }: SavedRoutinesProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (savedRoutines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No saved routines yet.</p>
        <p className="text-xs mt-1">Build a custom routine and save it for quick access!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-3 pr-4">
        {savedRoutines.map((saved) => (
          <div
            key={saved.id}
            className="p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{saved.name}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(saved.routine.totalDuration)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {saved.routine.stretches.length} exercises
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(saved.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditRoutine(saved.routine.stretches, saved.id, saved.name)}
                  title="Edit routine"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onLoadRoutine(saved.routine)}
                  title="Start routine"
                >
                  <Play className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete routine?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{saved.name}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteRoutine(saved.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

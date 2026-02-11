import { useState, useMemo } from 'react';
import { Stretch, BodyRegion, StretchingRoutine, SavedRoutine } from '@/types/recovery';
import { stretches } from '@/data/stretches';
import { foamRollingExercises } from '@/data/foam-rolling';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { SavedRoutines } from '@/components/SavedRoutines';
import { CustomStretchInput } from '@/components/CustomStretchInput';
import { 
  ArrowRight, 
  Clock, 
  Search,
  Filter,
  Plus,
  Minus,
  CircleDot,
  Save,
  Heart,
  PenLine,
  Trash2,
  GripVertical
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CustomRoutineBuilderProps {
  onStartRoutine: (routine: StretchingRoutine) => void;
  savedRoutines: SavedRoutine[];
  onSaveRoutine: (name: string, routine: StretchingRoutine, existingId?: string) => void;
  onDeleteRoutine: (id: string) => void;
  customStretches: Stretch[];
  onAddCustomStretch: (stretch: Stretch) => void;
  onRemoveCustomStretch: (id: string) => void;
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

export function CustomRoutineBuilder({ 
  onStartRoutine, 
  savedRoutines, 
  onSaveRoutine, 
  onDeleteRoutine,
  customStretches,
  onAddCustomStretch,
  onRemoveCustomStretch 
}: CustomRoutineBuilderProps) {
  const [selectedStretches, setSelectedStretches] = useState<Stretch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<BodyRegion[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  const handleAddCustomStretch = (stretch: Stretch) => {
    onAddCustomStretch(stretch);
    setSelectedStretches(prev => [...prev, stretch]);
  };

  const handleEditRoutine = (stretches: Stretch[], routineId: string, name: string) => {
    setSelectedStretches(stretches);
    setRoutineName(name);
    setEditingRoutineId(routineId);
  };

  const allExercises = useMemo(() => [...stretches, ...foamRollingExercises, ...customStretches], [customStretches]);

  const filteredExercises = useMemo(() => {
    let filtered = allExercises;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s => s.name.toLowerCase().includes(query) || 
             s.description.toLowerCase().includes(query) ||
             s.targetAreas.some(area => area.toLowerCase().includes(query))
      );
    }
    
    // Apply body region filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(s => 
        s.targetAreas.some(area => activeFilters.includes(area))
      );
    }
    
    return filtered;
  }, [allExercises, searchQuery, activeFilters]);

  const stretchingExercises = filteredExercises.filter(e => !e.id.startsWith('foam-roll') && !e.id.startsWith('custom-'));
  const foamRolling = filteredExercises.filter(e => e.id.startsWith('foam-roll'));
  const customExercises = filteredExercises.filter(e => e.id.startsWith('custom-'));
  
  const totalDuration = selectedStretches.reduce((sum, s) => sum + s.duration, 0);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const isSelected = (stretch: Stretch) => 
    selectedStretches.some(s => s.id === stretch.id);

  const toggleStretch = (stretch: Stretch) => {
    if (isSelected(stretch)) {
      setSelectedStretches(prev => prev.filter(s => s.id !== stretch.id));
    } else {
      setSelectedStretches(prev => [...prev, stretch]);
    }
  };

  const toggleFilter = (region: BodyRegion) => {
    setActiveFilters(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const handleStartRoutine = () => {
    if (selectedStretches.length === 0) return;
    
    const focusAreas = [...new Set(selectedStretches.flatMap(s => s.targetAreas))];
    
    const routine: StretchingRoutine = {
      stretches: selectedStretches,
      totalDuration,
      focusAreas,
    };
    
    onStartRoutine(routine);
  };

  const handleSaveRoutine = () => {
    if (selectedStretches.length === 0 || !routineName.trim()) return;
    
    const focusAreas = [...new Set(selectedStretches.flatMap(s => s.targetAreas))];
    
    const routine: StretchingRoutine = {
      stretches: selectedStretches,
      totalDuration,
      focusAreas,
    };
    
    onSaveRoutine(routineName.trim(), routine, editingRoutineId || undefined);
    setRoutineName('');
    setShowSaveDialog(false);
    setSelectedStretches([]);
    setEditingRoutineId(null);
  };

  const handleDeleteCustomStretch = (e: React.MouseEvent, stretchId: string) => {
    e.stopPropagation();
    onRemoveCustomStretch(stretchId);
    setSelectedStretches(prev => prev.filter(s => s.id !== stretchId));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedStretches((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDurationChange = (stretchId: string, newDuration: number) => {
    setSelectedStretches(prev =>
      prev.map(s => s.id === stretchId ? { ...s, duration: newDuration } : s)
    );
  };

  const ExerciseCard = ({ exercise, showDeleteButton = false }: { exercise: Stretch; showDeleteButton?: boolean }) => {
    const selected = isSelected(exercise);
    const isFoamRoll = exercise.id.startsWith('foam-roll');
    const isCustom = exercise.id.startsWith('custom-');
    
    return (
      <div 
        className={`
          p-4 rounded-xl border-2 transition-all cursor-pointer
          ${selected 
            ? 'border-primary bg-primary/10 shadow-md' 
            : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80'
          }
        `}
        onClick={() => toggleStretch(exercise)}
      >
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isFoamRoll && (
                  <CircleDot className="w-4 h-4 text-accent-foreground shrink-0" />
                )}
                {isCustom && (
                  <PenLine className="w-4 h-4 text-primary shrink-0" />
                )}
                <h4 className="font-medium text-foreground truncate">{exercise.name}</h4>
              </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {exercise.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {exercise.targetAreas.map(area => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {bodyRegionLabels[area]}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {exercise.duration}s
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
              ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
              {selected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            {showDeleteButton && isCustom && (
              <button
                onClick={(e) => handleDeleteCustomStretch(e, exercise.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                title="Delete custom stretch"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SortableStretchItem = ({ stretch }: { stretch: Stretch }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: stretch.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50"
      >
        <button
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-foreground truncate flex-1">
          {stretch.name.split(' ').slice(0, 3).join(' ')}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={stretch.duration}
            onChange={(e) => handleDurationChange(stretch.id, parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="text-xs bg-background border border-border rounded px-2 py-1 text-foreground"
          >
            {[25, 30, 35, 40, 45, 50, 55, 60].map(d => (
              <option key={d} value={d}>{d}s</option>
            ))}
          </select>
          <button
            onClick={() => setSelectedStretches(prev => prev.filter(s => s.id !== stretch.id))}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Build Your Routine</h2>
        <p className="text-muted-foreground text-sm">
          Explore stretches and foam rolling exercises, then create your custom routine.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={showFilters ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
          {activeFilters.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setActiveFilters([])}
            >
              Clear all
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg animate-fade-in">
            {allBodyRegions.map(region => (
              <Badge
                key={region}
                variant={activeFilters.includes(region) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleFilter(region)}
              >
                {bodyRegionLabels[region]}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Exercise Tabs */}
      <Tabs defaultValue="saved" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4 mb-3">
          <TabsTrigger value="saved">
            <Heart className="w-3 h-3 mr-1" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="stretches">
            Stretches
          </TabsTrigger>
          <TabsTrigger value="foam-rolling">
            Foam Roll
          </TabsTrigger>
          <TabsTrigger value="custom">
            <PenLine className="w-3 h-3 mr-1" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="flex-1 min-h-0 mt-0">
          <SavedRoutines 
            savedRoutines={savedRoutines}
            onLoadRoutine={onStartRoutine}
            onDeleteRoutine={onDeleteRoutine}
            onEditRoutine={handleEditRoutine}
          />
        </TabsContent>
        
        <TabsContent value="stretches" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-[calc(100vh-520px)] min-h-[200px]">
            <div className="space-y-3 pr-4">
              {stretchingExercises.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No stretches match your filters
                </p>
              ) : (
                stretchingExercises.map(exercise => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="foam-rolling" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-[calc(100vh-520px)] min-h-[200px]">
            <div className="space-y-3 pr-4">
              {foamRolling.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No foam rolling exercises match your filters
                </p>
              ) : (
                foamRolling.map(exercise => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="custom" className="flex-1 min-h-0 mt-0">
          <div className="mb-4">
            <CustomStretchInput onAddStretch={handleAddCustomStretch} />
          </div>
          <ScrollArea className="h-[calc(100vh-580px)] min-h-[150px]">
            <div className="space-y-3 pr-4">
              {customExercises.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No custom stretches yet. Create one above!
                </p>
              ) : (
                customExercises.map(exercise => (
                  <ExerciseCard key={exercise.id} exercise={exercise} showDeleteButton={true} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Selected Summary & Start Button */}
      <div className="pt-4 border-t border-border/50 mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selectedStretches.length} exercise{selectedStretches.length !== 1 ? 's' : ''} selected
          </span>
          <span className="font-medium text-foreground">
            <Clock className="w-4 h-4 inline mr-1" />
            {formatDuration(totalDuration)}
          </span>
        </div>
        
        {selectedStretches.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedStretches.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedStretches.map(s => (
                  <SortableStretchItem key={s.id} stretch={s} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => setShowSaveDialog(true)}
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={selectedStretches.length === 0}
          >
            <Save className="w-5 h-5 mr-2" />
            {editingRoutineId ? 'Update' : 'Save'}
          </Button>
          <Button
            onClick={handleStartRoutine}
            variant="hero"
            size="lg"
            className="flex-[2]"
            disabled={selectedStretches.length === 0}
          >
            Start Routine
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        
        {editingRoutineId && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => {
              setSelectedStretches([]);
              setRoutineName('');
              setEditingRoutineId(null);
            }}
          >
            Cancel editing
          </Button>
        )}
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoutineId ? 'Update Routine' : 'Save Custom Routine'}</DialogTitle>
            <DialogDescription>
              {editingRoutineId 
                ? 'Update the name and save your changes.'
                : 'Give your routine a name so you can quickly access it later.'}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g., Morning Stretch, Post-Run Recovery"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveRoutine()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoutine} disabled={!routineName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              {editingRoutineId ? 'Update Routine' : 'Save Routine'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

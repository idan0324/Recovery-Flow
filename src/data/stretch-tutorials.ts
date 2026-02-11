// Maps stretch IDs to external tutorial URLs (YouTube videos, images, etc.)
// Uses base IDs (without -left/-right suffixes) for consistency

const stretchTutorialUrls: Record<string, string> = {
  // Neck stretches
  'neck-tilt': 'https://www.google.com/search?q=neck+tilt+stretch+tutorial',
  'neck-rotation': 'https://www.google.com/search?q=neck+rotation+stretch+tutorial',
  
  // Shoulder stretches
  'cross-body-shoulder': 'https://www.google.com/search?q=cross+body+shoulder+stretch+tutorial',
  'overhead-tricep': 'https://www.google.com/search?q=overhead+tricep+stretch+tutorial',
  
  // Back stretches
  'cat-cow': 'https://www.google.com/search?q=cat+cow+stretch+tutorial',
  'child-pose': 'https://www.google.com/search?q=child+pose+stretch+tutorial',
  'seated-twist': 'https://www.google.com/search?q=seated+spinal+twist+tutorial',
  
  // Chest stretch
  'doorway-chest': 'https://www.google.com/search?q=doorway+chest+stretch+tutorial',
  
  // Arm stretches
  'wrist-flexor': 'https://www.google.com/search?q=wrist+flexor+stretch+tutorial',
  
  // Hip stretches
  'hip-flexor-lunge': 'https://www.google.com/search?q=hip+flexor+lunge+stretch+tutorial',
  'pigeon-pose': 'https://www.google.com/search?q=pigeon+pose+stretch+tutorial',
  'figure-four': 'https://www.google.com/search?q=figure+four+stretch+tutorial',
  
  // Quad stretches
  'standing-quad': 'https://www.google.com/search?q=standing+quad+stretch+tutorial',
  
  // Hamstring stretches
  'standing-hamstring': 'https://www.google.com/search?q=standing+hamstring+stretch+tutorial',
  
  // Calf stretches
  'wall-calf': 'https://www.google.com/search?q=wall+calf+stretch+tutorial',
  'soleus-stretch': 'https://www.google.com/search?q=soleus+stretch+tutorial',
  
  // Full body
  'downward-dog': 'https://www.google.com/search?q=downward+dog+stretch+tutorial',
  
  // Ankle stretches
  'ankle-circles': 'https://www.google.com/search?q=ankle+circles+mobility+tutorial',
  
  // Foam rolling exercises
  'foam-roll-upper-back': 'https://www.google.com/search?q=foam+roll+upper+back+tutorial',
  'foam-roll-lats': 'https://www.google.com/search?q=foam+roll+lats+tutorial',
  'foam-roll-quads': 'https://www.google.com/search?q=foam+roll+quads+tutorial',
  'foam-roll-vmo': 'https://www.google.com/search?q=foam+roll+vmo+inner+quad+tutorial',
  'foam-roll-hamstrings': 'https://www.google.com/search?q=foam+roll+hamstrings+tutorial',
  'foam-roll-it-band': 'https://www.google.com/search?q=foam+roll+it+band+tutorial',
  'foam-roll-calves': 'https://www.google.com/search?q=foam+roll+calves+tutorial',
  'foam-roll-glutes': 'https://www.google.com/search?q=foam+roll+glutes+tutorial',
  'foam-roll-hip-flexors': 'https://www.google.com/search?q=foam+roll+hip+flexors+tutorial',
  'foam-roll-lower-back': 'https://www.google.com/search?q=foam+roll+lower+back+tutorial',
};

// Gets tutorial URL for a stretch, handling left/right variants
export const getStretchTutorialUrl = (stretchId: string): string | null => {
  // Try exact match first
  if (stretchTutorialUrls[stretchId]) {
    return stretchTutorialUrls[stretchId];
  }
  
  // Remove -left or -right suffix
  const baseId = stretchId.replace(/-left$/, '').replace(/-right$/, '');
  
  return stretchTutorialUrls[baseId] || null;
};

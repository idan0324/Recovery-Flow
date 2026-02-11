import { Stretch } from '@/types/recovery';

export const stretches: Stretch[] = [
  // Neck stretches
  {
    id: 'neck-tilt',
    name: 'Neck Tilt Stretch',
    duration: 30,
    description: 'Gently tilt your head to one side, bringing your ear toward your shoulder. Hold, then switch sides.',
    targetAreas: ['neck'],
  },
  {
    id: 'neck-rotation',
    name: 'Neck Rotation',
    duration: 30,
    description: 'Slowly rotate your head in a circular motion, keeping movements smooth and controlled.',
    targetAreas: ['neck'],
  },
  
  // Shoulder stretches
  {
    id: 'cross-body-shoulder',
    name: 'Cross-Body Shoulder Stretch',
    duration: 30,
    description: 'Bring one arm across your body at chest height. Use your other hand to gently pull it closer.',
    targetAreas: ['shoulders'],
  },
  {
    id: 'overhead-tricep',
    name: 'Overhead Tricep Stretch',
    duration: 30,
    description: 'Raise one arm overhead, bend at the elbow. Use the other hand to gently push the elbow back.',
    targetAreas: ['shoulders', 'arms'],
  },

  // Back stretches
  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    duration: 45,
    description: 'On hands and knees, alternate between arching your back up (cat) and dipping it down (cow).',
    targetAreas: ['upper-back', 'lower-back'],
  },
  {
    id: 'child-pose',
    name: "Child's Pose",
    duration: 45,
    description: 'Kneel and sit back on your heels, then fold forward with arms extended. Breathe deeply.',
    targetAreas: ['lower-back', 'hips'],
  },
  {
    id: 'seated-twist',
    name: 'Seated Spinal Twist',
    duration: 30,
    description: 'Sit with legs extended, cross one leg over. Twist your torso toward the bent knee.',
    targetAreas: ['lower-back', 'upper-back'],
  },

  // Chest stretch
  {
    id: 'doorway-chest',
    name: 'Doorway Chest Stretch',
    duration: 30,
    description: 'Place forearm against a doorway, step through to feel a stretch in your chest and front shoulder.',
    targetAreas: ['chest', 'shoulders'],
  },

  // Arm stretches
  {
    id: 'wrist-flexor',
    name: 'Wrist Flexor Stretch',
    duration: 30,
    description: 'Extend arm forward, palm up. Use other hand to gently pull fingers down and back.',
    targetAreas: ['wrists', 'arms'],
  },

  // Hip stretches - LEFT
  {
    id: 'hip-flexor-lunge-left',
    name: 'Hip Flexor Lunge (Left)',
    duration: 30,
    description: 'Step your LEFT leg forward into a lunge, keeping back knee on ground. Push hips forward gently.',
    targetAreas: ['hips', 'quads'],
  },
  // Hip stretches - RIGHT
  {
    id: 'hip-flexor-lunge-right',
    name: 'Hip Flexor Lunge (Right)',
    duration: 30,
    description: 'Step your RIGHT leg forward into a lunge, keeping back knee on ground. Push hips forward gently.',
    targetAreas: ['hips', 'quads'],
  },
  {
    id: 'pigeon-pose-left',
    name: 'Pigeon Pose (Left)',
    duration: 30,
    description: 'Bring your LEFT leg forward with knee bent. Extend the right leg back. Sink into the stretch.',
    targetAreas: ['hips'],
  },
  {
    id: 'pigeon-pose-right',
    name: 'Pigeon Pose (Right)',
    duration: 30,
    description: 'Bring your RIGHT leg forward with knee bent. Extend the left leg back. Sink into the stretch.',
    targetAreas: ['hips'],
  },
  {
    id: 'figure-four-left',
    name: 'Figure Four (Left Hip)',
    duration: 30,
    description: 'Lie on back, cross LEFT ankle over right knee. Pull the right leg toward your chest.',
    targetAreas: ['hips'],
  },
  {
    id: 'figure-four-right',
    name: 'Figure Four (Right Hip)',
    duration: 30,
    description: 'Lie on back, cross RIGHT ankle over left knee. Pull the left leg toward your chest.',
    targetAreas: ['hips'],
  },

  // Quad stretches - LEFT & RIGHT
  {
    id: 'standing-quad-left',
    name: 'Quad Stretch (Left Leg)',
    duration: 25,
    description: 'Stand on your right leg, grab your LEFT ankle behind you. Keep knees together and push hips forward.',
    targetAreas: ['quads'],
  },
  {
    id: 'standing-quad-right',
    name: 'Quad Stretch (Right Leg)',
    duration: 25,
    description: 'Stand on your left leg, grab your RIGHT ankle behind you. Keep knees together and push hips forward.',
    targetAreas: ['quads'],
  },

  // Hamstring stretches - LEFT & RIGHT
  {
    id: 'standing-hamstring-left',
    name: 'Hamstring Stretch (Left Leg)',
    duration: 25,
    description: 'Place your LEFT heel on a low surface, keep leg straight. Hinge at hips to lean forward.',
    targetAreas: ['hamstrings'],
  },
  {
    id: 'standing-hamstring-right',
    name: 'Hamstring Stretch (Right Leg)',
    duration: 25,
    description: 'Place your RIGHT heel on a low surface, keep leg straight. Hinge at hips to lean forward.',
    targetAreas: ['hamstrings'],
  },

  // Calf stretches - LEFT & RIGHT
  {
    id: 'wall-calf-left',
    name: 'Calf Stretch (Left Leg)',
    duration: 25,
    description: 'Face a wall, step your LEFT foot back. Keep back heel down and lean into the wall.',
    targetAreas: ['calves'],
  },
  {
    id: 'wall-calf-right',
    name: 'Calf Stretch (Right Leg)',
    duration: 25,
    description: 'Face a wall, step your RIGHT foot back. Keep back heel down and lean into the wall.',
    targetAreas: ['calves'],
  },
  {
    id: 'soleus-stretch-left',
    name: 'Soleus Stretch (Left Leg)',
    duration: 25,
    description: 'Face a wall, step your LEFT foot back with a BENT knee. Keep heel down and lean forward to stretch the lower calf.',
    targetAreas: ['calves'],
  },
  {
    id: 'soleus-stretch-right',
    name: 'Soleus Stretch (Right Leg)',
    duration: 25,
    description: 'Face a wall, step your RIGHT foot back with a BENT knee. Keep heel down and lean forward to stretch the lower calf.',
    targetAreas: ['calves'],
  },

  // Full body
  {
    id: 'downward-dog',
    name: 'Downward Dog',
    duration: 45,
    description: 'Form an inverted V shape. Press heels toward ground while pushing hips up and back.',
    targetAreas: ['calves', 'hamstrings', 'shoulders'],
  },

  // Ankle stretches - LEFT & RIGHT
  {
    id: 'ankle-circles-left',
    name: 'Ankle Circles (Left)',
    duration: 20,
    description: 'Lift your LEFT foot off the ground and rotate your ankle in circles. Switch directions halfway.',
    targetAreas: ['ankles'],
  },
  {
    id: 'ankle-circles-right',
    name: 'Ankle Circles (Right)',
    duration: 20,
    description: 'Lift your RIGHT foot off the ground and rotate your ankle in circles. Switch directions halfway.',
    targetAreas: ['ankles'],
  },
];

// Map for illustration lookup (handles left/right variants)
export const getStretchIllustrationId = (stretchId: string): string => {
  // Handle soleus stretch mapping
  if (stretchId.includes('soleus')) return 'soleus-stretch';
  // Remove -left or -right suffix for illustration matching
  return stretchId
    .replace(/-left$/, '')
    .replace(/-right$/, '');
};

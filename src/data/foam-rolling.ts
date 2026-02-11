import { Stretch } from '@/types/recovery';

export const foamRollingExercises: Stretch[] = [
  // Upper body foam rolling
  {
    id: 'foam-roll-upper-back',
    name: 'Upper Back Roll',
    duration: 45,
    description: 'Place foam roller under upper back. Cross arms over chest and roll from mid-back to shoulders slowly.',
    targetAreas: ['upper-back'],
  },
  {
    id: 'foam-roll-lats-left',
    name: 'Lats Roll (Left)',
    duration: 30,
    description: 'Lie on your LEFT side with roller under armpit. Roll from armpit to mid-ribcage.',
    targetAreas: ['upper-back', 'shoulders'],
  },
  {
    id: 'foam-roll-lats-right',
    name: 'Lats Roll (Right)',
    duration: 30,
    description: 'Lie on your RIGHT side with roller under armpit. Roll from armpit to mid-ribcage.',
    targetAreas: ['upper-back', 'shoulders'],
  },

  // Lower body foam rolling
  {
    id: 'foam-roll-quads-left',
    name: 'Quad Roll (Left)',
    duration: 30,
    description: 'Lie face down with roller under LEFT thigh. Roll from hip to just above knee.',
    targetAreas: ['quads'],
  },
  {
    id: 'foam-roll-quads-right',
    name: 'Quad Roll (Right)',
    duration: 30,
    description: 'Lie face down with roller under RIGHT thigh. Roll from hip to just above knee.',
    targetAreas: ['quads'],
  },
  {
    id: 'foam-roll-vmo-left',
    name: 'VMO Roll (Left)',
    duration: 25,
    description: 'Lie face down with roller under LEFT inner thigh just above the knee. Roll the VMO (teardrop muscle) slowly.',
    targetAreas: ['quads'],
  },
  {
    id: 'foam-roll-vmo-right',
    name: 'VMO Roll (Right)',
    duration: 25,
    description: 'Lie face down with roller under RIGHT inner thigh just above the knee. Roll the VMO (teardrop muscle) slowly.',
    targetAreas: ['quads'],
  },
  {
    id: 'foam-roll-hamstrings-left',
    name: 'Hamstring Roll (Left)',
    duration: 30,
    description: 'Sit with roller under LEFT thigh. Roll from glute to just above knee.',
    targetAreas: ['hamstrings'],
  },
  {
    id: 'foam-roll-hamstrings-right',
    name: 'Hamstring Roll (Right)',
    duration: 30,
    description: 'Sit with roller under RIGHT thigh. Roll from glute to just above knee.',
    targetAreas: ['hamstrings'],
  },
  {
    id: 'foam-roll-it-band-left',
    name: 'IT Band Roll (Left)',
    duration: 30,
    description: 'Lie on LEFT side with roller under outer thigh. Roll from hip to just above knee.',
    targetAreas: ['quads', 'hips'],
  },
  {
    id: 'foam-roll-it-band-right',
    name: 'IT Band Roll (Right)',
    duration: 30,
    description: 'Lie on RIGHT side with roller under outer thigh. Roll from hip to just above knee.',
    targetAreas: ['quads', 'hips'],
  },
  {
    id: 'foam-roll-calves-left',
    name: 'Calf Roll (Left)',
    duration: 25,
    description: 'Sit with roller under LEFT calf. Roll from ankle to below knee.',
    targetAreas: ['calves'],
  },
  {
    id: 'foam-roll-calves-right',
    name: 'Calf Roll (Right)',
    duration: 25,
    description: 'Sit with roller under RIGHT calf. Roll from ankle to below knee.',
    targetAreas: ['calves'],
  },
  {
    id: 'foam-roll-glutes-left',
    name: 'Glute Roll (Left)',
    duration: 30,
    description: 'Sit on roller with LEFT glute. Cross left ankle over right knee and roll in circles.',
    targetAreas: ['hips'],
  },
  {
    id: 'foam-roll-glutes-right',
    name: 'Glute Roll (Right)',
    duration: 30,
    description: 'Sit on roller with RIGHT glute. Cross right ankle over left knee and roll in circles.',
    targetAreas: ['hips'],
  },
  {
    id: 'foam-roll-hip-flexors-left',
    name: 'Hip Flexor Roll (Left)',
    duration: 25,
    description: 'Lie face down with roller under LEFT hip flexor. Gently rock side to side.',
    targetAreas: ['hips', 'quads'],
  },
  {
    id: 'foam-roll-hip-flexors-right',
    name: 'Hip Flexor Roll (Right)',
    duration: 25,
    description: 'Lie face down with roller under RIGHT hip flexor. Gently rock side to side.',
    targetAreas: ['hips', 'quads'],
  },

  // Back
  {
    id: 'foam-roll-lower-back',
    name: 'Lower Back Roll',
    duration: 30,
    description: 'Place roller under lower back. Support head and gently roll. Be gentle in this area.',
    targetAreas: ['lower-back'],
  },
];

// Map foam rolling IDs to illustration types
export const getFoamRollingIllustrationId = (exerciseId: string): string => {
  if (exerciseId.includes('vmo')) return 'foam-roll-vmo';
  if (exerciseId.includes('quads')) return 'foam-roll-quads';
  if (exerciseId.includes('hamstrings')) return 'foam-roll-hamstrings';
  if (exerciseId.includes('it-band')) return 'foam-roll-it-band';
  if (exerciseId.includes('calves')) return 'foam-roll-calves';
  if (exerciseId.includes('glutes')) return 'foam-roll-glutes';
  if (exerciseId.includes('hip-flexors')) return 'foam-roll-hip-flexors';
  if (exerciseId.includes('lats')) return 'foam-roll-lats';
  if (exerciseId.includes('upper-back')) return 'foam-roll-upper-back';
  if (exerciseId.includes('lower-back')) return 'foam-roll-lower-back';
  return 'foam-roll-generic';
};

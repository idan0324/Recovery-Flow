export type VoiceGender = 'female' | 'male' | 'none';

type VoicePickDebug = {
  gender: VoiceGender;
  picked?: { name: string; lang: string; localService: boolean; isDefault: boolean };
  topCandidates: Array<{ name: string; lang: string; score: number }>;
};

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);

// IMPORTANT: these are compared as TOKENS (not substring matches)
// to avoid bugs like: "Samantha" matching "man".
// British female voices - these are distinctly feminine
const BRITISH_FEMALE_VOICES = new Set([
  'kate',      // Microsoft Kate (en-GB)
  'hazel',     // Microsoft Hazel (en-GB)
  'martha',    // macOS Martha (British)
  'serena',    // macOS Serena (British)
  'stephanie', // Some systems
]);

// British male voices - these are distinctly masculine  
const BRITISH_MALE_VOICES = new Set([
  'daniel',    // macOS Daniel (British) - deep voice
  'oliver',    // macOS Oliver (British)
  'george',    // Some systems
  'arthur',    // Some systems
  'rishi',     // Clear British male
]);

const FEMALE_NAME_TOKENS = new Set([
  'samantha',
  'victoria',
  'karen',
  'moira',
  'fiona',
  'tessa',
  'veena',
  'zira',
  'hazel',
  'susan',
  'catherine',
  'allison',
  'ava',
  'evelyn',
  'salli',
  'kendra',
  'joanna',
  'ivy',
  'kimberly',
  'nicole',
  'emma',
  'amy',
  'raveena',
  'kate',
  'martha',
  'serena',
  'stephanie',
]);

const MALE_NAME_TOKENS = new Set([
  'daniel',
  'david',
  'james',
  'tom',
  'thomas',
  'matthew',
  'brian',
  'oliver',
  'rishi',
  'george',
  'william',
  'arthur',
]);

// Novelty/robotic voices to avoid - these sound unnatural
const NOVELTY_VOICE_TOKENS = new Set([
  'grandpa',
  'grandma',
  'whisper',
  'fred',
  'ralph',
  'albert',
  'junior',
  'jester',
  'zarvox',
  'trinoids',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'organ',
  'bad',
  'good',
  'superstar',
  'wobble',
  'bahh',
  'news', // "Bad News", "Good News"
  'eddy',
  'flo',
  'reed',
  'rocko',
  'sandy',
  'shelley',
]);

const FEMALE_HINT_TOKENS = new Set(['female', 'woman', 'girl']);
const MALE_HINT_TOKENS = new Set(['male', 'man', 'boy']);

function scoreVoice(voice: SpeechSynthesisVoice, gender: VoiceGender): number {
  const tokens = tokenize(`${voice.name} ${voice.voiceURI ?? ''}`);
  const tokenSet = new Set(tokens);

  const isEnglish = voice.lang?.toLowerCase().startsWith('en');
  const isUk = voice.lang?.toLowerCase().startsWith('en-gb');
  const isUs = voice.lang?.toLowerCase().startsWith('en-us');

  // Check for explicit British gender-specific voices
  const isBritishFemale = tokens.some((t) => BRITISH_FEMALE_VOICES.has(t));
  const isBritishMale = tokens.some((t) => BRITISH_MALE_VOICES.has(t));

  const femaleNameHit = tokens.some((t) => FEMALE_NAME_TOKENS.has(t));
  const maleNameHit = tokens.some((t) => MALE_NAME_TOKENS.has(t));
  const femaleHintHit = tokens.some((t) => FEMALE_HINT_TOKENS.has(t));
  const maleHintHit = tokens.some((t) => MALE_HINT_TOKENS.has(t));
  const isNoveltyVoice = tokens.some((t) => NOVELTY_VOICE_TOKENS.has(t));

  let score = 0;

  // STRONGLY penalize novelty/robotic voices
  if (isNoveltyVoice) {
    score -= 100;
  }

  // STRONGLY prefer British English voices - this is now mandatory
  if (isUk) {
    score += 50; // Major boost for British voices
  } else if (isUs) {
    score -= 30; // Penalize American voices heavily
  } else if (isEnglish) {
    score -= 20; // Other English variants deprioritized
  }

  // Prefer local voices slightly
  if (voice.localService) score += 1;
  if (voice.default) score += 0.5;

  // CRITICAL: Gender-specific scoring with strong differentiation
  if (gender === 'female') {
    // Massive boost for known British female voices
    if (isBritishFemale && isUk) score += 100;
    
    // Strong boost for female indicators
    if (femaleNameHit) score += 30;
    if (femaleHintHit) score += 25;
    
    // HEAVILY penalize male voices for female selection
    if (maleNameHit) score -= 80;
    if (maleHintHit) score -= 60;
    if (isBritishMale) score -= 100; // Never pick British male voice for female
    
    // Google female voices are excellent
    if (tokenSet.has('google') && tokenSet.has('female')) score += 50;
  } else {
    // Male voice selection
    // Massive boost for known British male voices
    if (isBritishMale && isUk) score += 100;
    
    // Strong boost for male indicators
    if (maleNameHit) score += 30;
    if (maleHintHit) score += 25;
    
    // HEAVILY penalize female voices for male selection
    if (femaleNameHit) score -= 80;
    if (femaleHintHit) score -= 60;
    if (isBritishFemale) score -= 100; // Never pick British female voice for male

    // Special case: avoid "Samantha" for male
    if (tokenSet.has('samantha')) score -= 100;
    
    // Google male voices are excellent
    if (tokenSet.has('google') && tokenSet.has('male')) score += 50;
  }

  return score;
}

export function selectSpeechSynthesisVoice(
  voices: SpeechSynthesisVoice[],
  gender: VoiceGender
): { voice: SpeechSynthesisVoice | null; debug: VoicePickDebug } {
  const englishVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'));
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  const scored = pool
    .map((v) => ({
      voice: v,
      score: scoreVoice(v, gender),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.voice ?? null;

  return {
    voice: best,
    debug: {
      gender,
      picked: best
        ? {
            name: best.name,
            lang: best.lang,
            localService: !!best.localService,
            isDefault: !!best.default,
          }
        : undefined,
      topCandidates: scored.slice(0, 6).map((s) => ({
        name: s.voice.name,
        lang: s.voice.lang,
        score: Math.round(s.score * 10) / 10,
      })),
    },
  };
}

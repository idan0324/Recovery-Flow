import { cn } from '@/lib/utils';

interface StretchIllustrationProps {
  stretchId: string;
  className?: string;
  isActive?: boolean;
}

export function StretchIllustration({ stretchId, className, isActive = false }: StretchIllustrationProps) {
  const baseClass = cn(
    "w-full h-full",
    isActive && "animate-breathe",
    className
  );

  // Map stretch IDs to illustration types
  const getIllustration = () => {
    switch (stretchId) {
      case 'neck-tilt':
      case 'neck-rotation':
        return <NeckStretch className={baseClass} isActive={isActive} />;
      case 'cross-body-shoulder':
      case 'shoulder-circles':
        return <ShoulderStretch className={baseClass} isActive={isActive} />;
      case 'overhead-tricep':
        return <TricepStretch className={baseClass} isActive={isActive} />;
      case 'cat-cow':
        return <CatCowStretch className={baseClass} isActive={isActive} />;
      case 'child-pose':
        return <ChildPose className={baseClass} isActive={isActive} />;
      case 'seated-twist':
        return <SeatedTwist className={baseClass} isActive={isActive} />;
      case 'doorway-chest':
        return <ChestStretch className={baseClass} isActive={isActive} />;
      case 'wrist-flexor':
      case 'wrist-extensor':
        return <WristStretch className={baseClass} isActive={isActive} />;
      case 'hip-flexor-lunge':
        return <HipFlexorLunge className={baseClass} isActive={isActive} />;
      case 'pigeon-pose':
        return <PigeonPose className={baseClass} isActive={isActive} />;
      case 'figure-four':
        return <FigureFour className={baseClass} isActive={isActive} />;
      case 'standing-quad':
      case 'lying-quad':
        return <QuadStretch className={baseClass} isActive={isActive} />;
      case 'standing-hamstring':
      case 'seated-hamstring':
      case 'lying-hamstring':
        return <HamstringStretch className={baseClass} isActive={isActive} />;
      case 'wall-calf':
        return <CalfStretch className={baseClass} isActive={isActive} />;
      case 'soleus-stretch':
        return <SoleusStretch className={baseClass} isActive={isActive} />;
      case 'downward-dog':
        return <DownwardDog className={baseClass} isActive={isActive} />;
      case 'ankle-circles':
      case 'toe-raises':
        return <AnkleStretch className={baseClass} isActive={isActive} />;
      // Foam rolling exercises
      case 'foam-roll-upper-back':
      case 'foam-roll-lower-back':
        return <FoamRollBack className={baseClass} isActive={isActive} />;
      case 'foam-roll-lats':
        return <FoamRollLats className={baseClass} isActive={isActive} />;
      case 'foam-roll-quads':
      case 'foam-roll-hip-flexors':
        return <FoamRollQuads className={baseClass} isActive={isActive} />;
      case 'foam-roll-vmo':
        return <FoamRollVMO className={baseClass} isActive={isActive} />;
      case 'foam-roll-hamstrings':
        return <FoamRollHamstrings className={baseClass} isActive={isActive} />;
      case 'foam-roll-it-band':
        return <FoamRollITBand className={baseClass} isActive={isActive} />;
      case 'foam-roll-calves':
        return <FoamRollCalves className={baseClass} isActive={isActive} />;
      case 'foam-roll-glutes':
        return <FoamRollGlutes className={baseClass} isActive={isActive} />;
      default:
        return <GenericStretch className={baseClass} isActive={isActive} />;
    }
  };

  return (
    <div className={cn("w-full h-full flex items-center justify-center", className)}>
      {getIllustration()}
    </div>
  );
}

// Shared SVG props
const svgProps = {
  viewBox: "0 0 100 100",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

interface IllustrationProps {
  className?: string;
  isActive?: boolean;
}

// Shared color constants for consistency
const primaryColor = "hsl(168, 76%, 42%)";
const accentColor = "hsl(180, 60%, 50%)";
const ghostColor = "hsl(168, 76%, 42%, 0.25)";

// Stroke widths for front/back limb distinction
const frontLimbWidth = 3.5;
const backLimbWidth = 2.5;
const frontLimbColor = accentColor;
const backLimbColor = primaryColor;
const backLimbOpacity = 0.75;

// Motion arrow component for showing direction
function MotionArrow({ x1, y1, x2, y2, curved = false }: { x1: number; y1: number; x2: number; y2: number; curved?: boolean }) {
  const id = `arrow-${x1}-${y1}-${x2}-${y2}`;
  return (
    <>
      <defs>
        <marker id={id} markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0,0 L4,2 L0,4 Z" fill={accentColor} opacity="0.7" />
        </marker>
      </defs>
      {curved ? (
        <path 
          d={`M${x1},${y1} Q${(x1+x2)/2 + 10},${(y1+y2)/2} ${x2},${y2}`}
          stroke={accentColor}
          strokeWidth="1.5"
          strokeDasharray="3 2"
          fill="none"
          opacity="0.6"
          markerEnd={`url(#${id})`}
        />
      ) : (
        <line 
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={accentColor}
          strokeWidth="1.5"
          strokeDasharray="3 2"
          opacity="0.6"
          markerEnd={`url(#${id})`}
        />
      )}
    </>
  );
}

// Neck Stretch - head tilting side to side with ghost positions
function NeckStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes tiltHead {
          0%, 10% { transform: rotate(-20deg); }
          45%, 55% { transform: rotate(20deg); }
          90%, 100% { transform: rotate(-20deg); }
        }
        .neck-head { 
          animation: tiltHead 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 50px 50px;
        }
      `}</style>
      
      {/* Ghost positions showing range */}
      <g opacity="0.2">
        {/* Left tilt ghost */}
        <g transform="rotate(-20, 50, 50)">
          <line x1="50" y1="40" x2="50" y2="50" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="30" r="10" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        </g>
        {/* Right tilt ghost */}
        <g transform="rotate(20, 50, 50)">
          <line x1="50" y1="40" x2="50" y2="50" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="30" r="10" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        </g>
      </g>
      
      {/* Body (static) */}
      <line x1="50" y1="50" x2="50" y2="75" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      {/* Shoulders */}
      <line x1="30" y1="55" x2="70" y2="55" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <line x1="50" y1="75" x2="35" y2="92" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="75" x2="65" y2="92" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Motion arrows */}
      <MotionArrow x1={32} y1={25} x2={42} y2={20} curved />
      <MotionArrow x1={68} y1={25} x2={58} y2={20} curved />
      
      {/* Animated head group */}
      <g className={isActive ? "neck-head" : ""}>
        <line x1="50" y1="40" x2="50" y2="50" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="30" r="10" stroke={accentColor} strokeWidth="3" fill="none" />
        {/* Simple face dots */}
        <circle cx="46" cy="28" r="1.5" fill={accentColor} />
        <circle cx="54" cy="28" r="1.5" fill={accentColor} />
      </g>
    </svg>
  );
}

// Shoulder Stretch - arm crossing body with clear range
function ShoulderStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes crossArm {
          0%, 15% { transform: translateX(0) rotate(0deg); }
          40%, 60% { transform: translateX(-12px) rotate(-5deg); }
          85%, 100% { transform: translateX(0) rotate(0deg); }
        }
        .cross-arm { 
          animation: crossArm 3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 50px 42px;
        }
      `}</style>
      
      {/* Ghost showing end position */}
      <g opacity="0.2">
        <path d="M50 42 L25 42 L12 38" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      
      {/* Head */}
      <circle cx="50" cy="22" r="9" stroke={primaryColor} strokeWidth="3" fill="none" />
      {/* Body */}
      <line x1="50" y1="31" x2="50" y2="62" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Left arm (helper arm) holding */}
      <path d="M50 42 L68 48 L72 58" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="72" cy="58" r="3" fill={primaryColor} />
      
      {/* Right arm crossing (animated) */}
      <g className={isActive ? "cross-arm" : ""}>
        <path d="M50 42 L30 42 L18 38" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="18" cy="38" r="3" fill={accentColor} />
      </g>
      
      {/* Motion arrow */}
      <MotionArrow x1={35} y1={35} x2={20} y2={32} />
      
      {/* Legs */}
      <line x1="50" y1="62" x2="38" y2="88" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="62" x2="62" y2="88" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Tricep Stretch - arm overhead with clear elbow push
function TricepStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes pushElbow {
          0%, 15% { transform: translateX(0); }
          40%, 60% { transform: translateX(-6px); }
          85%, 100% { transform: translateX(0); }
        }
        .push-elbow { 
          animation: pushElbow 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Ghost showing pushed position */}
      <g opacity="0.2">
        <path d="M44 42 L50 20 L44 42 L38 55" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      
      {/* Head */}
      <circle cx="50" cy="28" r="9" stroke={primaryColor} strokeWidth="3" fill="none" />
      {/* Body */}
      <line x1="50" y1="37" x2="50" y2="65" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Left arm pushing elbow */}
      <path d="M50 44 L38 25 L50 20" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
      
      {/* Right arm bent overhead (animated) */}
      <g className={isActive ? "push-elbow" : ""}>
        <path d="M50 44 L58 22 L52 44 L46 58" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Hand behind back */}
        <circle cx="46" cy="58" r="3" fill={accentColor} />
      </g>
      
      {/* Motion arrow showing push direction */}
      <MotionArrow x1={62} y1={18} x2={52} y2={18} />
      
      {/* Legs */}
      <line x1="50" y1="65" x2="38" y2="90" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="65" x2="62" y2="90" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Cat-Cow - clear arch vs round with spine highlight
function CatCowStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes catCowSpine {
          0%, 15% { d: path("M22 52 Q50 32 78 52"); }
          40%, 60% { d: path("M22 52 Q50 72 78 52"); }
          85%, 100% { d: path("M22 52 Q50 32 78 52"); }
        }
        @keyframes catCowHead {
          0%, 15% { transform: translateY(5px) rotate(10deg); }
          40%, 60% { transform: translateY(-5px) rotate(-15deg); }
          85%, 100% { transform: translateY(5px) rotate(10deg); }
        }
        .cat-cow-spine { animation: catCowSpine 4.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        .cat-cow-head { 
          animation: catCowHead 4.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 22px 45px;
        }
      `}</style>
      
      {/* Ghost positions - cow (arched down) */}
      <g opacity="0.15">
        <path d="M22 52 Q50 70 78 52" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      {/* Ghost positions - cat (rounded up) */}
      <g opacity="0.15">
        <path d="M22 52 Q50 34 78 52" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      
      {/* Hands on ground */}
      <circle cx="18" cy="72" r="4" fill={primaryColor} />
      <circle cx="82" cy="72" r="4" fill={primaryColor} />
      
      {/* Arms */}
      <line x1="18" y1="72" x2="22" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="72" x2="78" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Animated spine */}
      <path 
        d="M22 52 Q50 32 78 52" 
        stroke={accentColor} 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        fill="none"
        className={isActive ? "cat-cow-spine" : ""}
      />
      
      {/* Knees to feet */}
      <line x1="22" y1="52" x2="22" y2="72" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="52" x2="78" y2="72" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Animated head */}
      <g className={isActive ? "cat-cow-head" : ""}>
        <circle cx="15" cy="42" r="7" stroke={primaryColor} strokeWidth="3" fill="none" />
      </g>
      
      {/* Motion arrows showing up/down */}
      <MotionArrow x1={50} y1={58} x2={50} y2={42} curved />
    </svg>
  );
}

// Child's Pose - showing sink and reach
function ChildPose({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes breatheReach {
          0%, 15% { transform: translateX(0); }
          40%, 60% { transform: translateX(-8px); }
          85%, 100% { transform: translateX(0); }
        }
        @keyframes breatheSink {
          0%, 15% { transform: translateY(0); }
          40%, 60% { transform: translateY(3px); }
          85%, 100% { transform: translateY(0); }
        }
        .breathe-arms { animation: breatheReach 5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        .breathe-body { animation: breatheSink 5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
      `}</style>
      
      {/* Ghost showing extended reach */}
      <g opacity="0.2">
        <line x1="28" y1="52" x2="5" y2="42" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="58" x2="5" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      </g>
      
      {/* Curled body */}
      <g className={isActive ? "breathe-body" : ""}>
        <ellipse cx="55" cy="55" rx="18" ry="10" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Head down */}
        <circle cx="32" cy="62" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
      </g>
      
      {/* Arms extended forward (animated) */}
      <g className={isActive ? "breathe-arms" : ""}>
        <line x1="32" y1="54" x2="12" y2="45" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="58" x2="12" y2="55" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        {/* Hands */}
        <circle cx="12" cy="45" r="2.5" fill={accentColor} />
        <circle cx="12" cy="55" r="2.5" fill={accentColor} />
      </g>
      
      {/* Motion arrow */}
      <MotionArrow x1={20} y1={48} x2={8} y2={44} />
      
      {/* Legs folded under */}
      <path d="M73 55 Q82 58 78 72" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Seated Twist - clear rotation with upper body
function SeatedTwist({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes twistTorso {
          0%, 15% { transform: rotate(-12deg); }
          40%, 60% { transform: rotate(12deg); }
          85%, 100% { transform: rotate(-12deg); }
        }
        .twist-torso { 
          animation: twistTorso 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 50px 65px;
        }
      `}</style>
      
      {/* Ghost showing rotation range */}
      <g opacity="0.15">
        <g transform="rotate(-12, 50, 65)">
          <line x1="50" y1="65" x2="50" y2="38" stroke={primaryColor} strokeWidth="3" />
          <circle cx="50" cy="28" r="8" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        </g>
        <g transform="rotate(12, 50, 65)">
          <line x1="50" y1="65" x2="50" y2="38" stroke={primaryColor} strokeWidth="3" />
          <circle cx="50" cy="28" r="8" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        </g>
      </g>
      
      {/* Legs crossed on floor (static) */}
      <path d="M28 78 L50 70 L72 78" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M42 72 L58 68" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Motion arrows */}
      <MotionArrow x1={65} y1={30} x2={75} y2={38} curved />
      <MotionArrow x1={35} y1={30} x2={25} y2={38} curved />
      
      {/* Animated torso */}
      <g className={isActive ? "twist-torso" : ""}>
        {/* Body */}
        <line x1="50" y1="65" x2="50" y2="38" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Head */}
        <circle cx="50" cy="28" r="9" stroke={accentColor} strokeWidth="3" fill="none" />
        {/* Arms showing twist */}
        <line x1="50" y1="48" x2="30" y2={44} stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="48" x2="70" y2={52} stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="44" r="2.5" fill={accentColor} />
        <circle cx="70" cy="52" r="2.5" fill={accentColor} />
      </g>
    </svg>
  );
}

// Chest Stretch - doorway with lean forward
function ChestStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes leanThrough {
          0%, 15% { transform: translateX(0); }
          40%, 60% { transform: translateX(8px); }
          85%, 100% { transform: translateX(0); }
        }
        .lean-body { 
          animation: leanThrough 3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Doorway frame */}
      <rect x="8" y="8" width="6" height="84" fill="hsl(var(--muted))" rx="2" />
      
      {/* Ghost showing lean position */}
      <g opacity="0.2" transform="translate(8, 0)">
        <circle cx="48" cy="28" r="8" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        <line x1="48" y1="36" x2="52" y2="62" stroke={primaryColor} strokeWidth="3" />
      </g>
      
      {/* Arm anchor point on door */}
      <circle cx="14" cy="38" r="3" fill={accentColor} />
      
      {/* Motion arrow */}
      <MotionArrow x1={48} y1={45} x2={58} y2={45} />
      
      {/* Body leaning through */}
      <g className={isActive ? "lean-body" : ""}>
        {/* Head */}
        <circle cx="48" cy="28" r="9" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Body */}
        <line x1="48" y1="37" x2="50" y2="62" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Arm on doorway - stretched */}
        <path d="M48 44 L28 32 L14 38" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Other arm relaxed */}
        <line x1="48" y1="44" x2="62" y2="55" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Legs */}
        <line x1="50" y1="62" x2="42" y2="90" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="62" x2="58" y2="90" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Wrist Stretch - clear flex motion
function WristStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes flexWrist {
          0%, 15% { transform: rotate(-25deg); }
          40%, 60% { transform: rotate(25deg); }
          85%, 100% { transform: rotate(-25deg); }
        }
        .flex-hand { 
          animation: flexWrist 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 45px 50px;
        }
      `}</style>
      
      {/* Ghost showing range */}
      <g opacity="0.15">
        <g transform="rotate(-25, 45, 50)">
          <path d="M45 50 L62 48 L70 52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
        <g transform="rotate(25, 45, 50)">
          <path d="M45 50 L62 48 L70 52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      </g>
      
      {/* Forearm */}
      <line x1="15" y1="50" x2="45" y2="50" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
      
      {/* Other hand helping pull */}
      <ellipse cx="58" cy="62" rx="8" ry="6" stroke={primaryColor} strokeWidth="2" fill="none" />
      <line x1="58" y1="56" x2="60" y2="52" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
      
      {/* Motion arrows */}
      <MotionArrow x1={72} y1={38} x2={72} y2={48} curved />
      <MotionArrow x1={72} y1={62} x2={72} y2={52} curved />
      
      {/* Animated hand */}
      <g className={isActive ? "flex-hand" : ""}>
        <path d="M45 50 L60 48 L68 50" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Fingers */}
        <line x1="68" y1="50" x2="78" y2="48" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
        <line x1="68" y1="50" x2="80" y2="50" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
        <line x1="68" y1="50" x2="78" y2="54" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Hip Flexor Lunge - kneeling lunge with back knee on ground
function HipFlexorLunge({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes pushHipsForward {
          0%, 15% { transform: translateX(0); }
          40%, 60% { transform: translateX(5px); }
          85%, 100% { transform: translateX(0); }
        }
        .push-hips { 
          animation: pushHipsForward 3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Ghost showing pushed position */}
      <g opacity="0.2" transform="translate(5, 0)">
        <circle cx="38" cy="22" r="7" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        <line x1="38" y1="29" x2="40" y2="52" stroke={primaryColor} strokeWidth="3" />
      </g>
      
      {/* Floor line */}
      <line x1="5" y1="92" x2="95" y2="92" stroke="hsl(var(--border))" strokeWidth="1.5" />
      
      {/* Motion arrow */}
      <MotionArrow x1={45} y1={42} x2={55} y2={42} />
      
      {/* Animated upper body */}
      <g className={isActive ? "push-hips" : ""}>
        {/* Head - properly aligned over hips */}
        <circle cx="38" cy="22" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Torso - upright spine */}
        <line x1="38" y1="30" x2="42" y2="55" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* Hands resting on front knee */}
        <path d="M38 40 L28 52 L22 58" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="22" cy="58" r="2.5" fill={primaryColor} />
      </g>
      
      {/* Hips - clear horizontal alignment */}
      <ellipse cx="45" cy="55" rx="10" ry="4" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.4" />
      
      {/* Front leg - 90° knee angle, shin vertical, foot flat on ground */}
      <path d="M42 55 L22 68 L22 90" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" fill="none" />
      <circle cx="22" cy="90" r="3" fill={frontLimbColor} />
      {/* Front knee indicator - at 90 degrees */}
      <circle cx="22" cy="68" r="3" stroke={frontLimbColor} strokeWidth="1.5" fill="none" opacity="0.6" />
      
      {/* Back leg - thigh angled back, KNEE ON GROUND */}
      <line x1="48" y1="55" x2="72" y2="82" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" opacity={backLimbOpacity} />
      {/* Back knee on ground - clearly visible */}
      <circle cx="72" cy="82" r="4" fill={accentColor} opacity="0.8" />
      {/* Shin and foot extended back along floor */}
      <line x1="72" y1="82" x2="88" y2="88" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" opacity={backLimbOpacity} />
      {/* Top of foot on ground */}
      <ellipse cx="88" cy="88" rx="4" ry="2" fill={backLimbColor} opacity={backLimbOpacity} />
    </svg>
  );
}

// Pigeon Pose - sink into hip stretch with proper form
function PigeonPose({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes sinkDeep {
          0%, 15% { transform: translateY(0); }
          40%, 60% { transform: translateY(4px); }
          85%, 100% { transform: translateY(0); }
        }
        .sink-hips { 
          animation: sinkDeep 4.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Ghost showing sunk position */}
      <g opacity="0.2" transform="translate(0, 4)">
        <circle cx="28" cy="32" r="7" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        <path d="M35 38 L50 55" stroke={primaryColor} strokeWidth="3" fill="none" />
      </g>
      
      {/* Floor */}
      <line x1="5" y1="82" x2="95" y2="82" stroke="hsl(var(--border))" strokeWidth="1.5" />
      
      {/* Motion arrow - down */}
      <MotionArrow x1={40} y1={42} x2={40} y2={52} />
      
      {/* Animated body */}
      <g className={isActive ? "sink-hips" : ""}>
        {/* Head - upright or slightly forward */}
        <circle cx="28" cy="32" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Torso - more upright, slight forward lean */}
        <path d="M32 40 L50 58" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* Arms for support - hands on either side */}
        <line x1="38" y1="48" x2="22" y2="62" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="62" r="2.5" fill={primaryColor} />
        <line x1="44" y1="52" x2="60" y2="62" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="62" r="2.5" fill={primaryColor} />
      </g>
      
      {/* Hip indicator - showing square hips */}
      <ellipse cx="50" cy="60" rx="8" ry="3" stroke={accentColor} strokeWidth="1" fill="none" opacity="0.4" />
      
      {/* Front leg - thigh forward at ~35° bend, shin folded back toward body */}
      <path d="M50 58 L38 68 L48 74" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" fill="none" />
      {/* Front foot tucked near hip */}
      <circle cx="48" cy="74" r="3" fill={frontLimbColor} />
      {/* Front knee highlight - 35 degree bend */}
      <circle cx="38" cy="68" r="3" stroke={frontLimbColor} strokeWidth="1" fill="none" opacity="0.5" />
      
      {/* Back leg extended straight behind - hip square */}
      <path d="M50 58 L72 62 L92 66" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" fill="none" opacity={backLimbOpacity} />
      {/* Back foot pointed */}
      <line x1="92" y1="66" x2="95" y2="62" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" opacity={backLimbOpacity} />
    </svg>
  );
}

// Figure Four - lying supine, pulling leg toward chest with clear 4 shape
function FigureFour({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes pullToChest {
          0%, 15% { transform: translateY(0) rotate(0deg); }
          40%, 60% { transform: translateY(-6px) rotate(-3deg); }
          85%, 100% { transform: translateY(0) rotate(0deg); }
        }
        .pull-leg { 
          animation: pullToChest 3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 52px 52px;
        }
      `}</style>
      
      {/* Floor/mat indicator */}
      <rect x="8" y="58" width="84" height="4" rx="2" fill="hsl(var(--muted))" opacity="0.5" />
      
      {/* Ghost showing pulled position */}
      <g opacity="0.2" transform="translate(0, -6) rotate(-3, 52, 52)">
        <path d="M52 52 L60 38 L78 42" stroke={primaryColor} strokeWidth="3" fill="none" />
      </g>
      
      {/* Head on ground - side view, slightly tilted */}
      <ellipse cx="18" cy="52" rx="10" ry="8" stroke={primaryColor} strokeWidth="3" fill="none" />
      
      {/* Torso on ground - flat */}
      <line x1="28" y1="52" x2="52" y2="52" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
      
      {/* Motion arrow */}
      <MotionArrow x1={72} y1={48} x2={70} y2={38} />
      
      {/* Animated legs - clear figure 4 shape */}
      <g className={isActive ? "pull-leg" : ""}>
        {/* Bottom leg - knee bent, thigh vertical, shin angled toward chest */}
        <line x1="52" y1="52" x2="62" y2="35" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" opacity={backLimbOpacity} />
        <line x1="62" y1="35" x2="80" y2="38" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" opacity={backLimbOpacity} />
        <circle cx="80" cy="38" r="3" fill={backLimbColor} opacity={backLimbOpacity} />
        {/* Bottom knee indicator */}
        <circle cx="62" cy="35" r="2.5" stroke={backLimbColor} strokeWidth="1" fill="none" opacity="0.5" />
        
        {/* Top leg crossed - ankle on opposite knee, making "4" shape */}
        <line x1="52" y1="52" x2="58" y2="44" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
        {/* Crossed ankle on bottom thigh */}
        <line x1="58" y1="44" x2="62" y2="35" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
        {/* Foot position indicator */}
        <circle cx="62" cy="35" r="4" stroke={frontLimbColor} strokeWidth="1.5" fill="none" opacity="0.6" />
        
        {/* "4" shape highlight - the crossed shin */}
        <line x1="58" y1="44" x2="72" y2="52" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
        <circle cx="72" cy="52" r="3" fill={frontLimbColor} />
      </g>
      
      {/* Arms reaching through to pull bottom thigh */}
      <path d="M38 50 L55 40" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M38 54 L52 46" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// Quad Stretch - standing, pulling heel to glute with proper form
function QuadStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes pullHeel {
          0%, 15% { transform: rotate(0deg); }
          40%, 60% { transform: rotate(6deg); }
          85%, 100% { transform: rotate(0deg); }
        }
        .pull-heel { 
          animation: pullHeel 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 48px 50px;
        }
      `}</style>
      
      {/* Floor */}
      <line x1="10" y1="92" x2="90" y2="92" stroke="hsl(var(--border))" strokeWidth="1.5" />
      
      {/* Ghost showing pulled position */}
      <g opacity="0.2" transform="rotate(6, 48, 50)">
        <path d="M48 50 L58 68 L58 48" stroke={primaryColor} strokeWidth="3" fill="none" />
      </g>
      
      {/* Head - aligned over standing hip */}
      <circle cx="44" cy="16" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
      {/* Body - upright spine */}
      <line x1="44" y1="24" x2="44" y2="50" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
      
      {/* Standing leg - straight, directly under body */}
      <line x1="44" y1="50" x2="42" y2="90" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" opacity={backLimbOpacity} />
      <circle cx="42" cy="90" r="3" fill={backLimbColor} opacity={backLimbOpacity} />
      
      {/* Balance arm out - for stability */}
      <line x1="44" y1="36" x2="22" y2="30" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="22" cy="30" r="2" fill={primaryColor} />
      
      {/* Hip alignment indicator */}
      <ellipse cx="46" cy="50" rx="8" ry="3" stroke={accentColor} strokeWidth="1" fill="none" opacity="0.4" />
      
      {/* Motion arrow */}
      <MotionArrow x1={68} y1={58} x2={64} y2={48} curved />
      
      {/* Bent leg being stretched (animated) - knees together, heel to glute */}
      <g className={isActive ? "pull-heel" : ""}>
        {/* Thigh parallel to standing leg, knee pointing down */}
        <line x1="48" y1="50" x2="54" y2="68" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
        {/* Shin bent back, heel toward glute */}
        <line x1="54" y1="68" x2="56" y2="48" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
        {/* Foot - heel near glute */}
        <circle cx="56" cy="48" r="3" fill={frontLimbColor} />
        {/* Knee indicator - both knees together */}
        <circle cx="54" cy="68" r="3" stroke={frontLimbColor} strokeWidth="1" fill="none" opacity="0.5" />
      </g>
      
      {/* Arm holding foot behind */}
      <path d="M44 36 L62 44 L56 48" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Hamstring Stretch - forward fold reach with proper form (elevated surface)
function HamstringStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes reachForward {
          0%, 15% { transform: rotate(0deg); }
          40%, 60% { transform: rotate(8deg); }
          85%, 100% { transform: rotate(0deg); }
        }
        .reach-toes { 
          animation: reachForward 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 35px 70px;
        }
      `}</style>
      
      {/* Floor */}
      <line x1="5" y1="90" x2="95" y2="90" stroke="hsl(var(--border))" strokeWidth="1.5" />
      
      {/* Low surface/step for heel */}
      <rect x="60" y="72" width="30" height="8" rx="2" fill="hsl(var(--muted))" opacity="0.6" />
      
      {/* Ghost showing reached position */}
      <g opacity="0.2" transform="rotate(8, 35, 70)">
        <path d="M35 70 L48 48 L58 28" stroke={primaryColor} strokeWidth="3" fill="none" />
        <circle cx="60" cy="24" r="7" stroke={primaryColor} strokeWidth="2.5" fill="none" />
      </g>
      
      {/* Standing leg - straight, weight-bearing */}
      <line x1="35" y1="70" x2="30" y2="88" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" opacity={backLimbOpacity} />
      <circle cx="30" cy="88" r="3" fill={backLimbColor} opacity={backLimbOpacity} />
      
      {/* Stretched leg - straight, on elevated surface */}
      <line x1="35" y1="70" x2="75" y2="70" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
      {/* Foot flexed */}
      <path d="M75 70 L82 64" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
      
      {/* Motion arrow */}
      <MotionArrow x1={56} y1={48} x2={68} y2={58} />
      
      {/* Animated torso hinging forward - flat back */}
      <g className={isActive ? "reach-toes" : ""}>
        {/* Torso - flat back, hinging at hips */}
        <line x1="35" y1="70" x2="50" y2="40" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* Head - neutral spine, looking forward */}
        <circle cx="54" cy="34" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Arms reaching toward foot - keeping back flat */}
        <line x1="46" y1="45" x2="68" y2="58" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="68" cy="58" r="2.5" fill={accentColor} />
      </g>
      
      {/* Hip hinge indicator */}
      <circle cx="35" cy="70" r="4" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

// Calf Stretch - wall push with proper form (back leg STRAIGHT)
function CalfStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes pressIntoWall {
          0%, 15% { transform: translateX(0); }
          40%, 60% { transform: translateX(-4px); }
          85%, 100% { transform: translateX(0); }
        }
        .press-wall { 
          animation: pressIntoWall 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Wall */}
      <rect x="8" y="8" width="6" height="84" fill="hsl(var(--muted))" rx="2" />
      {/* Floor */}
      <line x1="8" y1="92" x2="92" y2="92" stroke="hsl(var(--border))" strokeWidth="1.5" />
      
      {/* Ghost showing pressed position */}
      <g opacity="0.2" transform="translate(-4, 0)">
        <circle cx="35" cy="26" r="7" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        <line x1="35" y1="33" x2="40" y2="55" stroke={primaryColor} strokeWidth="3" />
      </g>
      
      {/* Motion arrow */}
      <MotionArrow x1={40} y1={40} x2={28} y2={40} />
      
      {/* Body pressing into wall */}
      <g className={isActive ? "press-wall" : ""}>
        {/* Head - looking forward */}
        <circle cx="35" cy="26" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Torso - straight line from head through hips */}
        <line x1="35" y1="34" x2="42" y2="55" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* Arms on wall - shoulder width apart */}
        <line x1="35" y1="40" x2="14" y2="32" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="38" y1="46" x2="14" y2="42" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="14" cy="32" r="2.5" fill={primaryColor} />
        <circle cx="14" cy="42" r="2.5" fill={primaryColor} />
      </g>
      
      {/* Hip alignment */}
      <ellipse cx="44" cy="55" rx="8" ry="3" stroke={accentColor} strokeWidth="1" fill="none" opacity="0.4" />
      
      {/* Front leg - bent at clear angle */}
      <path d="M44 55 L35 72 L35 90" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" fill="none" opacity={backLimbOpacity} />
      <circle cx="35" cy="90" r="3" fill={backLimbColor} opacity={backLimbOpacity} />
      {/* Front knee indicator */}
      <circle cx="35" cy="72" r="2.5" stroke={backLimbColor} strokeWidth="1" fill="none" opacity="0.4" />
      
      {/* Back leg - COMPLETELY STRAIGHT from hip to heel */}
      <line x1="44" y1="55" x2="82" y2="90" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
      {/* Heel on ground - key form cue */}
      <circle cx="82" cy="90" r="4" fill={frontLimbColor} />
    </svg>
  );
}

// Downward Dog - inverted V with proper form
function DownwardDog({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes pedalHeels {
          0%, 20% { transform: translateY(0); }
          35%, 45% { transform: translateY(-3px); }
          55%, 65% { transform: translateY(3px); }
          80%, 100% { transform: translateY(0); }
        }
        .pedal-feet { 
          animation: pedalHeels 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Floor */}
      <line x1="5" y1="88" x2="95" y2="88" stroke="hsl(var(--border))" strokeWidth="1.5" />
      
      {/* Ghost showing heel positions */}
      <g opacity="0.2">
        <circle cx="78" cy="82" r="3" fill={primaryColor} />
        <circle cx="78" cy="88" r="3" fill={primaryColor} />
      </g>
      
      {/* Hands on ground - shoulder width, fingers spread */}
      <circle cx="18" cy="82" r="4" fill={primaryColor} />
      <circle cx="26" cy="82" r="4" fill={primaryColor} />
      
      {/* Arms - straight, pushing into ground */}
      <line x1="18" y1="82" x2="28" y2="48" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      <line x1="26" y1="82" x2="35" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Shoulders/upper back */}
      <line x1="28" y1="48" x2="35" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Spine - straight line from shoulders to hips (peak of V) */}
      <line x1="32" y1="50" x2="50" y2="25" stroke={accentColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
      
      {/* Head hanging between arms - neutral spine */}
      <circle cx="25" cy="58" r="7" stroke={primaryColor} strokeWidth="3" fill="none" />
      
      {/* Hips at peak - highest point */}
      <circle cx="50" cy="25" r="4" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.5" />
      
      {/* Legs - straight, heels pressing toward ground */}
      <line x1="50" y1="25" x2="70" y2="55" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" opacity={backLimbOpacity} />
      <line x1="50" y1="25" x2="68" y2="58" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" opacity={backLimbOpacity} />
      
      {/* Motion arrows for heel press */}
      <MotionArrow x1={82} y1={78} x2={82} y2={86} />
      
      {/* Animated feet - heels pressing down */}
      <g className={isActive ? "pedal-feet" : ""}>
        <line x1="70" y1="55" x2="75" y2="85" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
        <line x1="68" y1="58" x2="78" y2="85" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
        {/* Heels - pressing toward ground */}
        <circle cx="75" cy="85" r="3" fill={frontLimbColor} />
        <circle cx="78" cy="85" r="3" fill={frontLimbColor} />
      </g>
    </svg>
  );
}

// Ankle Circles - clear rotation
function AnkleStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes circleAnkle {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .rotate-ankle { 
          animation: circleAnkle 2.5s linear infinite;
          transform-origin: 50px 55px;
        }
      `}</style>
      
      {/* Leg */}
      <line x1="50" y1="15" x2="50" y2="55" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" />
      
      {/* Circle showing rotation path */}
      <circle cx="50" cy="55" r="18" stroke="hsl(var(--muted))" strokeWidth="2" fill="none" strokeDasharray="4 3" />
      
      {/* Direction arrows around circle */}
      <g opacity="0.6">
        <path d="M68 55 L72 52 L72 58 Z" fill={accentColor} />
        <path d="M32 55 L28 52 L28 58 Z" fill={accentColor} />
        <path d="M50 37 L47 33 L53 33 Z" fill={accentColor} />
        <path d="M50 73 L47 77 L53 77 Z" fill={accentColor} />
      </g>
      
      {/* Animated foot */}
      <g className={isActive ? "rotate-ankle" : ""}>
        <path d="M50 55 L50 72 L68 78" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="68" cy="78" r="3" fill={accentColor} />
      </g>
    </svg>
  );
}

// Foam Roll Back - rolling motion
function FoamRollBack({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes rollBackForth {
          0%, 15% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
          85%, 100% { transform: translateX(-8px); }
        }
        .roll-back { 
          animation: rollBackForth 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Foam Roller */}
      <rect x="35" y="52" width="30" height="14" rx="7" fill={accentColor} opacity="0.85" />
      
      {/* Ghost showing roll range */}
      <g opacity="0.2">
        <g transform="translate(-8, 0)">
          <line x1="30" y1="48" x2="50" y2="52" stroke={primaryColor} strokeWidth="3" />
        </g>
        <g transform="translate(8, 0)">
          <line x1="30" y1="48" x2="50" y2="52" stroke={primaryColor} strokeWidth="3" />
        </g>
      </g>
      
      {/* Motion arrows */}
      <MotionArrow x1={28} y1={40} x2={18} y2={40} />
      <MotionArrow x1={72} y1={40} x2={82} y2={40} />
      
      {/* Body on roller (animated) */}
      <g className={isActive ? "roll-back" : ""}>
        {/* Head */}
        <circle cx="22" cy="42" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Upper body on roller */}
        <line x1="28" y1="46" x2="50" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Lower body */}
        <line x1="50" y1="52" x2="72" y2="48" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Legs bent, feet on floor */}
        <path d="M72 48 L78 65 L72 82" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="72" cy="82" r="3" fill={primaryColor} />
        {/* Arms crossed on chest */}
        <path d="M38 46 L32 52 L42 52" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// Foam Roll Lats - side rolling
function FoamRollLats({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes rollLatsUpDown {
          0%, 15% { transform: translateY(-6px); }
          40%, 60% { transform: translateY(6px); }
          85%, 100% { transform: translateY(-6px); }
        }
        .roll-lats { 
          animation: rollLatsUpDown 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Foam Roller - vertical for side lie */}
      <ellipse cx="38" cy="50" rx="8" ry="22" fill={accentColor} opacity="0.85" />
      
      {/* Motion arrows */}
      <MotionArrow x1={58} y1={28} x2={58} y2={18} />
      <MotionArrow x1={58} y1={72} x2={58} y2={82} />
      
      {/* Body on side (animated) */}
      <g className={isActive ? "roll-lats" : ""}>
        {/* Head */}
        <circle cx="62" cy="28" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Body on roller */}
        <line x1="58" y1="34" x2="42" y2="50" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Legs */}
        <line x1="42" y1="50" x2="38" y2="75" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Arm extended overhead */}
        <line x1="58" y1="36" x2="75" y2="22" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="75" cy="22" r="2.5" fill={accentColor} />
      </g>
    </svg>
  );
}

// Foam Roll Quads - face down rolling
function FoamRollQuads({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes rollQuadsFB {
          0%, 15% { transform: translateX(8px); }
          40%, 60% { transform: translateX(-8px); }
          85%, 100% { transform: translateX(8px); }
        }
        .roll-quads { 
          animation: rollQuadsFB 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Foam Roller */}
      <rect x="38" y="58" width="24" height="12" rx="6" fill={accentColor} opacity="0.85" />
      
      {/* Motion arrows */}
      <MotionArrow x1={30} y1={48} x2={20} y2={48} />
      <MotionArrow x1={70} y1={48} x2={80} y2={48} />
      
      {/* Body face down (animated) */}
      <g className={isActive ? "roll-quads" : ""}>
        {/* Head looking to side */}
        <circle cx="18" cy="42" r="7" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Arms supporting */}
        <line x1="20" y1="48" x2="25" y2="68" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="25" cy="68" r="3" fill={primaryColor} />
        {/* Torso face down */}
        <line x1="24" y1="46" x2="48" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Leg on roller - quad area */}
        <line x1="48" y1="52" x2="78" y2="52" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="78" cy="52" r="2.5" fill={accentColor} />
      </g>
    </svg>
  );
}

// Foam Roll Hamstrings - sitting and rolling
function FoamRollHamstrings({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes rollHamsFB {
          0%, 15% { transform: translateX(-6px); }
          40%, 60% { transform: translateX(6px); }
          85%, 100% { transform: translateX(-6px); }
        }
        .roll-hamstrings { 
          animation: rollHamsFB 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Foam Roller */}
      <rect x="42" y="52" width="24" height="12" rx="6" fill={accentColor} opacity="0.85" />
      
      {/* Motion arrows */}
      <MotionArrow x1={32} y1={40} x2={22} y2={40} />
      <MotionArrow x1={68} y1={40} x2={78} y2={40} />
      
      {/* Body sitting (animated) */}
      <g className={isActive ? "roll-hamstrings" : ""}>
        {/* Head */}
        <circle cx="25" cy="28" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Torso upright */}
        <line x1="25" y1="36" x2="30" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Arms behind for support */}
        <line x1="28" y1="42" x2="15" y2="58" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="15" cy="58" r="3" fill={primaryColor} />
        {/* Leg on roller - hamstring */}
        <line x1="30" y1="52" x2="78" y2="48" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="78" cy="48" r="2.5" fill={accentColor} />
      </g>
    </svg>
  );
}

// Foam Roll IT Band - side lying, rolling up/down along outer thigh
function FoamRollITBand({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes rollITBandUD {
          0%, 15% { transform: translateX(-5px); }
          40%, 60% { transform: translateX(5px); }
          85%, 100% { transform: translateX(-5px); }
        }
        .roll-itband { 
          animation: rollITBandUD 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Foam Roller - positioned under outer thigh */}
      <ellipse cx="58" cy="58" rx="8" ry="14" fill={accentColor} opacity="0.85" />
      
      {/* Motion arrows - up/down along outer quad/IT band */}
      <MotionArrow x1={58} y1={42} x2={58} y2={32} />
      <MotionArrow x1={58} y1={74} x2={58} y2={84} />
      
      {/* Body on side (animated) */}
      <g className={isActive ? "roll-itband" : ""}>
        {/* Head */}
        <circle cx="18" cy="32" r="7" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Torso on side */}
        <line x1="22" y1="38" x2="40" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Bottom leg on roller - IT band (outer thigh) */}
        <line x1="40" y1="52" x2="85" y2="58" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* IT band highlight zone */}
        <line x1="48" y1="54" x2="72" y2="58" stroke={accentColor} strokeWidth="5" strokeLinecap="round" opacity="0.4" />
        {/* Top leg crossed in front, foot on ground for support */}
        <path d="M45 52 L50 65 L55 78" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="55" cy="78" r="3" fill={primaryColor} />
        {/* Forearm on ground supporting */}
        <line x1="24" y1="40" x2="15" y2="55" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="15" cy="55" r="3" fill={primaryColor} />
      </g>
    </svg>
  );
}

// Foam Roll Calves
function FoamRollCalves({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes rollCalvesFB {
          0%, 15% { transform: translateX(-5px); }
          40%, 60% { transform: translateX(5px); }
          85%, 100% { transform: translateX(-5px); }
        }
        .roll-calves { 
          animation: rollCalvesFB 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Foam Roller */}
      <rect x="55" y="52" width="20" height="12" rx="6" fill={accentColor} opacity="0.85" />
      
      {/* Motion arrows */}
      <MotionArrow x1={32} y1={42} x2={22} y2={42} />
      <MotionArrow x1={78} y1={42} x2={88} y2={42} />
      
      {/* Body sitting back (animated) */}
      <g className={isActive ? "roll-calves" : ""}>
        {/* Head */}
        <circle cx="22" cy="32" r="7" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Torso */}
        <line x1="22" y1="39" x2="28" y2="52" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Arms back supporting */}
        <line x1="25" y1="45" x2="12" y2="58" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="12" cy="58" r="3" fill={primaryColor} />
        {/* Leg extended - calf on roller */}
        <line x1="28" y1="52" x2="55" y2="48" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="55" y1="48" x2="82" y2="42" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="82" cy="42" r="2.5" fill={accentColor} />
      </g>
    </svg>
  );
}

// Foam Roll Glutes - sitting on roller with figure-4 position, rolling back and forth
function FoamRollGlutes({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes rollGlutesFB {
          0%, 15% { transform: translateY(-4px); }
          40%, 60% { transform: translateY(4px); }
          85%, 100% { transform: translateY(-4px); }
        }
        .roll-glutes { 
          animation: rollGlutesFB 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Foam Roller - under glute */}
      <ellipse cx="55" cy="62" rx="12" ry="6" fill={accentColor} opacity="0.85" />
      
      {/* Motion arrows - back and forth (up/down in this view) */}
      <MotionArrow x1={75} y1={55} x2={75} y2={45} />
      <MotionArrow x1={75} y1={75} x2={75} y2={85} />
      
      {/* Body on roller - leaning to one side with figure-4 (animated) */}
      <g className={isActive ? "roll-glutes" : ""}>
        {/* Head - tilted/leaning toward crossed leg side */}
        <circle cx="48" cy="22" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Torso - leaning back slightly, tilted toward target glute */}
        <line x1="48" y1="30" x2="52" y2="50" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Arms behind for support */}
        <line x1="52" y1="40" x2="28" y2="52" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="28" cy="52" r="2.5" fill={primaryColor} />
        <line x1="52" y1="40" x2="78" y2="48" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="78" cy="48" r="2.5" fill={primaryColor} />
        
        {/* Hips on roller - glute highlighted */}
        <ellipse cx="55" cy="56" rx="10" ry="5" stroke={accentColor} strokeWidth="2" fill="none" opacity="0.5" />
        
        {/* Base leg - bent with foot flat on floor */}
        <path d="M52 55 L42 72 L38 88" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="38" cy="88" r="3" fill={primaryColor} />
        
        {/* Crossed leg - figure-4 position (ankle on opposite knee) */}
        <path d="M58 56 L72 52 L78 60" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Ankle crossing over knee */}
        <circle cx="42" cy="72" r="3" stroke={accentColor} strokeWidth="2" fill="none" />
        {/* Crossed foot resting on knee */}
        <circle cx="78" cy="60" r="2.5" fill={accentColor} />
        
        {/* Figure-4 connection line - ankle to knee */}
        <line x1="72" y1="56" x2="44" y2="72" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" opacity="0.6" />
      </g>
    </svg>
  );
}

// Soleus Stretch - bent knee calf stretch (knee bends FORWARD/INWARD toward wall)
function SoleusStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes soleusPush {
          0%, 15% { transform: translateX(0); }
          40%, 60% { transform: translateX(-3px); }
          85%, 100% { transform: translateX(0); }
        }
        .soleus-push { 
          animation: soleusPush 3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
      
      {/* Wall */}
      <rect x="10" y="12" width="5" height="76" fill="hsl(var(--muted))" rx="2" />
      {/* Floor */}
      <line x1="8" y1="92" x2="92" y2="92" stroke="hsl(var(--border))" strokeWidth="1.5" />
      
      {/* Ghost showing deeper position */}
      <g opacity="0.2" transform="translate(-3, 0)">
        <circle cx="32" cy="24" r="7" stroke={primaryColor} strokeWidth="2.5" fill="none" />
        <line x1="32" y1="31" x2="38" y2="52" stroke={primaryColor} strokeWidth="3" />
      </g>
      
      {/* Motion arrow showing lean forward */}
      <MotionArrow x1={38} y1={38} x2={25} y2={38} />
      
      {/* Body leaning into wall (animated) */}
      <g className={isActive ? "soleus-push" : ""}>
        {/* Head - forward position */}
        <circle cx="32" cy="24" r="8" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Torso - straight line, leaning forward */}
        <line x1="32" y1="32" x2="40" y2="52" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* Arms on wall - shoulder height */}
        <line x1="32" y1="38" x2="15" y2="30" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="35" y1="44" x2="15" y2="40" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="15" cy="30" r="2.5" fill={primaryColor} />
        <circle cx="15" cy="40" r="2.5" fill={primaryColor} />
      </g>
      
      {/* Hip alignment indicator */}
      <ellipse cx="42" cy="52" rx="8" ry="3" stroke={accentColor} strokeWidth="1" fill="none" opacity="0.4" />
      
      {/* Front leg - bent at knee, forward position */}
      <path d="M42 52 L32 70 L35 90" stroke={backLimbColor} strokeWidth={backLimbWidth} strokeLinecap="round" fill="none" opacity={backLimbOpacity} />
      <circle cx="35" cy="90" r="3" fill={backLimbColor} opacity={backLimbOpacity} />
      {/* Front knee indicator */}
      <circle cx="32" cy="70" r="2.5" stroke={backLimbColor} strokeWidth="1" fill="none" opacity="0.4" />
      
      {/* Back leg - KEY: knee bent INWARD/FORWARD (toward wall) for soleus */}
      {/* Upper leg - straight from hip to bent knee */}
      <line x1="42" y1="52" x2="52" y2="75" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
      {/* Lower leg to heel - angled forward from bent knee to ground */}
      <line x1="52" y1="75" x2="68" y2="90" stroke={frontLimbColor} strokeWidth={frontLimbWidth} strokeLinecap="round" />
      {/* Heel on ground - essential for soleus */}
      <circle cx="68" cy="90" r="4" fill={frontLimbColor} />
      {/* BENT knee highlight - pointing inward */}
      <circle cx="52" cy="75" r="5" stroke={frontLimbColor} strokeWidth="2" fill="none" opacity="0.7" />
      {/* Arrow showing knee bends inward */}
      <MotionArrow x1={62} y1={68} x2={54} y2={73} />
    </svg>
  );
}

// Foam Roll VMO - inner quad just above knee
function FoamRollVMO({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes rollVMO {
          0%, 15% { transform: translateX(-4px) rotate(-3deg); }
          40%, 60% { transform: translateX(4px) rotate(3deg); }
          85%, 100% { transform: translateX(-4px) rotate(-3deg); }
        }
        .roll-vmo { 
          animation: rollVMO 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 55px 55px;
        }
      `}</style>
      
      {/* Foam Roller - positioned for inner thigh near knee */}
      <ellipse cx="55" cy="55" rx="14" ry="7" fill={accentColor} opacity="0.85" />
      
      {/* Motion arrows */}
      <MotionArrow x1={30} y1={42} x2={22} y2={38} />
      <MotionArrow x1={80} y1={42} x2={88} y2={38} />
      
      {/* VMO target indicator */}
      <circle cx="55" cy="48" r="6" stroke={accentColor} strokeWidth="1.5" strokeDasharray="2 2" fill="none" opacity="0.5" />
      
      {/* Body face down with leg rotated out (animated) */}
      <g className={isActive ? "roll-vmo" : ""}>
        {/* Head turned to side */}
        <circle cx="22" cy="38" r="7" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Arms for support */}
        <line x1="24" y1="44" x2="18" y2="58" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="44" x2="35" y2="58" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="18" cy="58" r="2.5" fill={primaryColor} />
        <circle cx="35" cy="58" r="2.5" fill={primaryColor} />
        {/* Torso face down */}
        <line x1="24" y1="44" x2="48" y2="48" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Leg rotated outward - inner thigh (VMO) on roller */}
        <path d="M48 48 L52 52 L68 48" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Lower leg bent up slightly to target VMO area */}
        <line x1="68" y1="48" x2="82" y2="42" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="82" cy="42" r="2.5" fill={accentColor} />
        {/* Other leg resting to side */}
        <path d="M48 48 L52 62 L58 78" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// Generic Stretch - breathing motion
function GenericStretch({ className, isActive }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <style>{`
        @keyframes genericBreathe {
          0%, 15% { transform: scale(1); }
          40%, 60% { transform: scale(1.05); }
          85%, 100% { transform: scale(1); }
        }
        .generic-breathe { 
          animation: genericBreathe 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 50px 50px;
        }
      `}</style>
      
      <g className={isActive ? "generic-breathe" : ""}>
        {/* Head */}
        <circle cx="50" cy="22" r="10" stroke={primaryColor} strokeWidth="3" fill="none" />
        {/* Body */}
        <line x1="50" y1="32" x2="50" y2="58" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        {/* Arms raised */}
        <line x1="50" y1="42" x2="28" y2="35" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="42" x2="72" y2="35" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="35" r="2.5" fill={accentColor} />
        <circle cx="72" cy="35" r="2.5" fill={accentColor} />
        {/* Legs */}
        <line x1="50" y1="58" x2="35" y2="85" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="58" x2="65" y2="85" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

import { AlertTriangle } from 'lucide-react';

interface InjuryWarningBannerProps {
  warnings: string[];
}

export function InjuryWarningBanner({ warnings }: InjuryWarningBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mb-4 animate-fade-up">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          {warnings.map((warning, index) => (
            <p key={index} className="text-xs text-warning">
              {warning}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

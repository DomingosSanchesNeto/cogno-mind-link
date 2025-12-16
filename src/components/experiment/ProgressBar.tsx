import { useExperiment } from '@/contexts/ExperimentContext';
import { cn } from '@/lib/utils';

const stepLabels = ['Consentimento', 'Dados', 'Intro AUT', 'AUT', 'Intro FIQ', 'FIQ', 'Intro Dilemas', 'Dilemas', 'Conclusão'];

export function ProgressBar() {
  const { currentStep, totalSteps } = useExperiment();
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">Etapa {currentStep} de {totalSteps}</span>
        <span className="text-sm font-medium text-primary">{stepLabels[currentStep - 1]}</span>
      </div>
      <div className="relative h-2 bg-progress-track rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-progress-fill rounded-full transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>
    </div>
  );
}

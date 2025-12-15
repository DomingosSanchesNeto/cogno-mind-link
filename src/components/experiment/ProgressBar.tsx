import { useExperiment } from '@/contexts/ExperimentContext';
import { cn } from '@/lib/utils';

const stepLabels = [
  'Consentimento',
  'Dados',
  'Usos Alternativos',
  'Interpretação Visual',
  'Dilemas',
  'Conclusão',
];

export function ProgressBar() {
  const { currentStep, totalSteps } = useExperiment();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">
          Etapa {currentStep} de {totalSteps}
        </span>
        <span className="text-sm font-medium text-primary">
          {stepLabels[currentStep - 1]}
        </span>
      </div>
      
      <div className="relative h-2 bg-progress-track rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-progress-fill rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="hidden sm:flex justify-between mt-3">
        {stepLabels.map((label, index) => (
          <span
            key={label}
            className={cn(
              'text-xs transition-colors duration-300',
              index + 1 <= currentStep
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

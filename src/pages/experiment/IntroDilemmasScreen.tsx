import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Button } from '@/components/ui/button';
import { useExperiment } from '@/contexts/ExperimentContext';
import { Scale, ArrowRight } from 'lucide-react';

export default function IntroDilemmasScreen() {
  const navigate = useNavigate();
  const { recordScreenStart, recordScreenEnd, setCurrentStep } = useExperiment();

  useEffect(() => {
    recordScreenStart('intro_dilemmas');
    setCurrentStep(7);
  }, []);

  const handleStart = () => {
    recordScreenEnd('intro_dilemmas');
    navigate('/experimento/dilemas');
  };

  return (
    <ExperimentLayout>
      <div className="card-academic text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Scale className="h-10 w-10 text-primary" />
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl text-foreground mb-4">
          Tarefa 3: Dilemas Éticos
        </h2>

        <div className="max-w-xl mx-auto">
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Esta etapa avalia <strong>tomada de decisão e justificativa</strong> em 
            cenários hipotéticos envolvendo inteligência artificial.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-medium text-foreground mb-3">Instruções:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Leia cada cenário com atenção.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Selecione seu nível de concordância na escala (1-5).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Explique brevemente o motivo da sua escolha.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Sua justificativa é fundamental para a análise.
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStart}
            size="lg"
            className="h-14 px-10 text-lg font-medium"
          >
            Iniciar Tarefa
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </ExperimentLayout>
  );
}

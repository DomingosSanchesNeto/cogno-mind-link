import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useExperiment } from '@/contexts/ExperimentContext';
import { Scale, ArrowRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DilemmasScreen() {
  const navigate = useNavigate();
  const { dilemmas, addDilemmaResponse, recordScreenStart, recordScreenEnd, setCurrentStep, isLoading } = useExperiment();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responseValue, setResponseValue] = useState<'yes' | 'no' | null>(null);
  const [justification, setJustification] = useState('');
  const [startTime, setStartTime] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    recordScreenStart('dilemmas');
    setCurrentStep(8);
  }, []);

  useEffect(() => {
    setStartTime(new Date().toISOString());
    setResponseValue(null);
    setJustification('');
  }, [currentIndex]);

  if (isLoading) {
    return (
      <ExperimentLayout>
        <div className="card-academic flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando tarefa...</p>
          </div>
        </div>
      </ExperimentLayout>
    );
  }

  if (!dilemmas || dilemmas.length === 0) {
    return (
      <ExperimentLayout>
        <div className="card-academic flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Nenhum dilema configurado para esta tarefa.</p>
            <Button onClick={() => { recordScreenEnd('dilemmas'); navigate('/experimento/agradecimento'); }}>
              Finalizar experimento
            </Button>
          </div>
        </div>
      </ExperimentLayout>
    );
  }

  const currentDilemma = dilemmas[currentIndex];
  const isLastDilemma = currentIndex === dilemmas.length - 1;

  const handleNext = () => {
    if (!responseValue) return;

    const now = new Date();
    const startDate = new Date(startTime);
    const durationSeconds = Math.round((now.getTime() - startDate.getTime()) / 1000);

    addDilemmaResponse({
      dilemmaId: currentDilemma.id,
      responseValue,
      justification,
      startedAt: startTime,
      submittedAt: now.toISOString(),
      durationSeconds,
    });

    if (isLastDilemma) {
      recordScreenEnd('dilemmas');
      navigate('/experimento/agradecimento');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const canProceed = responseValue !== null && justification.trim().length >= 20;

  return (
    <ExperimentLayout>
      <div className="card-academic">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Scale className="h-4 w-4" />
              <span>Tarefa 3: Dilemas Éticos</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl text-foreground">
              Dilema {currentIndex + 1} de {dilemmas.length}
            </h2>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 sm:p-6 mb-6">
          <p className="text-base sm:text-lg text-foreground leading-relaxed">
            {currentDilemma.dilemmaText}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Você concorda com esta afirmação?
            </label>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => setResponseValue('yes')}
                className={cn(
                  'flex items-center gap-2 px-8 py-4 rounded-lg border-2 transition-all font-medium text-lg',
                  responseValue === 'yes'
                    ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'border-border hover:border-green-500/50 hover:bg-green-500/5'
                )}
              >
                <Check className="h-5 w-5" />
                Sim
              </button>
              <button
                type="button"
                onClick={() => setResponseValue('no')}
                className={cn(
                  'flex items-center gap-2 px-8 py-4 rounded-lg border-2 transition-all font-medium text-lg',
                  responseValue === 'no'
                    ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
                    : 'border-border hover:border-red-500/50 hover:bg-red-500/5'
                )}
              >
                <X className="h-5 w-5" />
                Não
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Justifique sua resposta: <span className="text-destructive">*</span>
            </label>
            <Textarea
              ref={textareaRef}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explique os motivos da sua escolha..."
              className="min-h-[120px] resize-none text-base"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 20 caracteres. Sua justificativa é fundamental para a análise.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="h-12 px-6 text-base font-medium"
          >
            {isLastDilemma ? 'Finalizar' : 'Próximo Dilema'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </ExperimentLayout>
  );
}

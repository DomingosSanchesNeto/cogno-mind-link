import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { LikertScale } from '@/components/experiment/LikertScale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useExperiment } from '@/contexts/ExperimentContext';
import { Scale, ArrowRight } from 'lucide-react';

export default function DilemmasScreen() {
  const navigate = useNavigate();
  const { dilemmas, addDilemmaResponse, recordScreenStart, recordScreenEnd, setCurrentStep } = useExperiment();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likertValue, setLikertValue] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [justification, setJustification] = useState('');
  const [startTime, setStartTime] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentDilemma = dilemmas[currentIndex];
  const isLastDilemma = currentIndex === dilemmas.length - 1;

  useEffect(() => {
    recordScreenStart('dilemmas');
    setCurrentStep(8);
  }, []);

  useEffect(() => {
    setStartTime(new Date().toISOString());
    setLikertValue(null);
    setJustification('');
  }, [currentIndex]);

  const handleNext = () => {
    if (!likertValue) return;

    const now = new Date();
    const startDate = new Date(startTime);
    const durationSeconds = Math.round((now.getTime() - startDate.getTime()) / 1000);

    addDilemmaResponse({
      dilemmaId: currentDilemma.id,
      likertValue,
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

  const canProceed = likertValue !== null && justification.trim().length >= 20;

  if (!currentDilemma) {
    return (
      <ExperimentLayout>
        <div className="card-academic text-center">
          <p>Carregando dilemas...</p>
        </div>
      </ExperimentLayout>
    );
  }

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
              Qual o seu grau de concordância com esta afirmação?
            </label>
            <LikertScale value={likertValue} onChange={setLikertValue} />
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

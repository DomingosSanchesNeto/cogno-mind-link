import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Timer } from '@/components/experiment/Timer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useExperiment } from '@/contexts/ExperimentContext';
import { Lightbulb, ArrowRight } from 'lucide-react';

export default function AUTScreen() {
  const navigate = useNavigate();
  const { autStimuli, addAUTResponse, recordScreenStart, recordScreenEnd, setCurrentStep } = useExperiment();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [startTime, setStartTime] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentStimulus = autStimuli[currentIndex];
  const isLastStimulus = currentIndex === autStimuli.length - 1;

  useEffect(() => {
    recordScreenStart('aut');
    setCurrentStep(3);
  }, []);

  useEffect(() => {
    setStartTime(new Date().toISOString());
    setResponse('');
    textareaRef.current?.focus();
  }, [currentIndex]);

  const handleNext = () => {
    const now = new Date();
    const startDate = new Date(startTime);
    const durationSeconds = Math.round((now.getTime() - startDate.getTime()) / 1000);

    addAUTResponse({
      stimulusId: currentStimulus.id,
      response,
      startedAt: startTime,
      submittedAt: now.toISOString(),
      durationSeconds,
      displayOrder: currentIndex + 1,
    });

    if (isLastStimulus) {
      recordScreenEnd('aut');
      navigate('/experimento/fiq');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const canProceed = response.trim().length >= 10;

  return (
    <ExperimentLayout>
      <div className="card-academic">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Lightbulb className="h-4 w-4" />
              <span>Tarefa 1: Usos Alternativos</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl text-foreground">
              Objeto {currentIndex + 1} de {autStimuli.length}
            </h2>
          </div>
          <Timer
            key={currentIndex}
            durationSeconds={currentStimulus.suggestedTimeSeconds}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4 sm:p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-3">
            {currentStimulus.instructionText}
          </p>
          <div className="text-center py-6">
            <span className="text-3xl sm:text-4xl font-heading font-bold text-primary">
              {currentStimulus.objectName}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Liste todos os usos alternativos que você consegue pensar:
          </label>
          <Textarea
            ref={textareaRef}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Digite suas ideias aqui, separando cada uso por linha ou vírgula..."
            className="min-h-[200px] resize-none text-base"
          />
          <p className="text-xs text-muted-foreground">
            Seja criativo! Não há respostas certas ou erradas.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="h-12 px-6 text-base font-medium"
          >
            {isLastStimulus ? 'Próxima Tarefa' : 'Próximo Objeto'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </ExperimentLayout>
  );
}

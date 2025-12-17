import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useExperiment } from '@/contexts/ExperimentContext';
import { Eye, ArrowRight } from 'lucide-react';

export default function FIQScreen() {
  const navigate = useNavigate();
  const { fiqStimuli, addFIQResponse, recordScreenStart, recordScreenEnd, setCurrentStep } = useExperiment();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [startTime, setStartTime] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentStimulus = fiqStimuli[currentIndex];
  const isLastStimulus = currentIndex === fiqStimuli.length - 1;

  useEffect(() => {
    recordScreenStart('fiq');
    setCurrentStep(6);
  }, []);

  useEffect(() => {
    setStartTime(new Date().toISOString());
    setResponse('');
    setImageLoaded(false);
  }, [currentIndex]);

  const handleNext = () => {
    const now = new Date();
    const startDate = new Date(startTime);
    const durationSeconds = Math.round((now.getTime() - startDate.getTime()) / 1000);

    addFIQResponse({
      stimulusId: currentStimulus.id,
      versionTag: currentStimulus.versionTag,
      response,
      startedAt: startTime,
      submittedAt: now.toISOString(),
      durationSeconds,
      randomizedOrder: currentIndex + 1,
    });

    if (isLastStimulus) {
      recordScreenEnd('fiq');
      navigate('/experimento/intro-dilemas');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const canProceed = response.trim().length >= 20;

  if (!currentStimulus) {
    return (
      <ExperimentLayout>
        <div className="card-academic text-center">
          <p>Carregando estímulos...</p>
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
              <Eye className="h-4 w-4" />
              <span>Tarefa 2: Interpretação Visual</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl text-foreground">
              Imagem {currentIndex + 1} de {fiqStimuli.length}
            </h2>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="relative aspect-video max-w-2xl mx-auto rounded-lg overflow-hidden bg-muted">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Carregando imagem...</div>
              </div>
            )}
            <img
              src={currentStimulus.imageUrl}
              alt={`Estímulo visual ${currentIndex + 1}`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            {currentStimulus.questionText}
          </label>
          <Textarea
            ref={textareaRef}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Descreva suas interpretações, associações e emoções..."
            className="min-h-[150px] resize-none text-base"
          />
          <p className="text-xs text-muted-foreground">
            Mínimo de 20 caracteres. Expresse livremente suas percepções.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="h-12 px-6 text-base font-medium"
          >
            {isLastStimulus ? 'Próxima Tarefa' : 'Próxima Imagem'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </ExperimentLayout>
  );
}

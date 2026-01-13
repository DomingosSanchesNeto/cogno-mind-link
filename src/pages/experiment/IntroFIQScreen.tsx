import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Button } from '@/components/ui/button';
import { useExperiment } from '@/contexts/ExperimentContext';
import { Eye, ArrowRight } from 'lucide-react';

export default function IntroFIQScreen() {
  const navigate = useNavigate();
  const { recordScreenStart, recordScreenEnd, setCurrentStep } = useExperiment();

  useEffect(() => {
    recordScreenStart('intro_fiq');
    setCurrentStep(5);
  }, []);

  const handleStart = () => {
    recordScreenEnd('intro_fiq');
    navigate('/experimento/fiq');
  };

  return (
    <ExperimentLayout>
      <div className="card-academic text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Eye className="h-10 w-10 text-primary" />
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl text-foreground mb-4">
          Tarefa 2: Interpretação Visual (FIQ)
        </h2>

        <div className="max-w-xl mx-auto">
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Esta etapa avalia <strong>interpretação e geração de significados</strong> diante 
            de estímulos visuais ambíguos.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-medium text-foreground mb-3">Instruções:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Observe cada imagem com atenção.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Descreva o que ela representa para você.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Busque oferecer mais de uma interpretação quando possível.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Não há respostas certas — queremos sua percepção única.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8 text-left">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Importante:</strong> O experimento segue um fluxo sequencial. Após o envio de cada resposta, não será possível retornar para alterar respostas anteriores. Caso o experimento seja interrompido, será necessário reiniciá-lo desde o início.
            </p>
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

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Button } from '@/components/ui/button';
import { useExperiment } from '@/contexts/ExperimentContext';
import { Lightbulb, ArrowRight } from 'lucide-react';

export default function IntroAUTScreen() {
  const navigate = useNavigate();
  const { recordScreenStart, recordScreenEnd, setCurrentStep } = useExperiment();

  useEffect(() => {
    recordScreenStart('intro_aut');
    setCurrentStep(3);
  }, []);

  const handleStart = () => {
    recordScreenEnd('intro_aut');
    navigate('/experimento/aut');
  };

  return (
    <ExperimentLayout>
      <div className="card-academic text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Lightbulb className="h-10 w-10 text-primary" />
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl text-foreground mb-4">
          Tarefa 1: Usos Alternativos (AUT)
        </h2>

        <div className="max-w-xl mx-auto">
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Esta etapa avalia <strong>criatividade e flexibilidade cognitiva</strong> por meio 
            da geração de usos alternativos para objetos comuns.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-medium text-foreground mb-3">Instruções:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Você verá objetos do cotidiano, um por vez.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Escreva o maior número possível de usos alternativos para cada objeto.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Seja criativo! Não existe resposta certa ou errada.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Um timer indicará o tempo sugerido, mas você pode continuar.
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

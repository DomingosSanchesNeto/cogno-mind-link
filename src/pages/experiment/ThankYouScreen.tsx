import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Button } from '@/components/ui/button';
import { useExperiment } from '@/contexts/ExperimentContext';
import { CheckCircle2, Mail, Shield } from 'lucide-react';

export default function ThankYouScreen() {
  const navigate = useNavigate();
  const { updateParticipantStatus, recordScreenStart, setCurrentStep } = useExperiment();

  useEffect(() => {
    recordScreenStart('thank_you');
    setCurrentStep(6);
    updateParticipantStatus('completed');
  }, []);

  const handleFinish = () => {
    navigate('/');
  };

  return (
    <ExperimentLayout showProgress={false} showFooter={false}>
      <div className="card-academic text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl text-foreground mb-4">
          Muito obrigado pela sua participação!
        </h2>

        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Sua contribuição é fundamental para o avanço da pesquisa científica sobre
          cognição humana e inteligência artificial.
        </p>

        <div className="bg-muted/50 rounded-lg p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Seus dados estão seguros</span>
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Todos os dados foram registrados de forma completamente anônima.
            Nenhuma informação pessoal identificável foi coletada durante o experimento.
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Dúvidas ou devolutiva?</span>
          </div>
          <p className="text-sm text-muted-foreground text-left mb-3">
            Se você tiver dúvidas sobre a pesquisa ou desejar receber os resultados
            gerais ao final do estudo, entre em contato:
          </p>
          <a
            href="mailto:pesquisador@universidade.edu.br"
            className="text-primary hover:underline font-medium"
          >
            pesquisador@universidade.edu.br
          </a>
        </div>

        <Button onClick={handleFinish} className="h-12 px-8 text-base font-medium">
          Encerrar
        </Button>
      </div>
    </ExperimentLayout>
  );
}

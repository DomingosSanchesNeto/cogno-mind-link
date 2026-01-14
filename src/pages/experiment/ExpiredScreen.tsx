import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';

export default function ExpiredScreen() {
  const navigate = useNavigate();

  const handleRestart = () => {
    // Clear any stored session data and redirect to start
    navigate('/');
  };

  return (
    <ExperimentLayout showProgress={false}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <Clock className="h-10 w-10 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Sessão Expirada
        </h1>
        
        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
          O tempo máximo para conclusão do experimento foi excedido. 
          Para garantir a consistência dos dados, será necessário reiniciar 
          o experimento desde o início.
        </p>

        <div className="bg-muted/50 rounded-lg p-4 mb-8 max-w-md">
          <p className="text-sm text-muted-foreground">
            <strong>Importante:</strong> O tempo limite é de 60 minutos. 
            Certifique-se de ter tempo disponível antes de iniciar novamente.
          </p>
        </div>

        <Button onClick={handleRestart} size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reiniciar Experimento
        </Button>
      </div>
    </ExperimentLayout>
  );
}

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function DeclinedScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-academic text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
          <XCircle className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="font-heading text-xl sm:text-2xl text-foreground mb-4">
          Participação Encerrada
        </h2>

        <p className="text-muted-foreground mb-6">
          Agradecemos seu interesse. Sua participação não foi registrada, 
          conforme sua escolha de não consentir com os termos da pesquisa.
        </p>

        <p className="text-sm text-muted-foreground mb-8">
          Se você mudar de ideia, você pode iniciar o experimento novamente
          a qualquer momento.
        </p>

        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="h-12 px-8 text-base font-medium"
        >
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}

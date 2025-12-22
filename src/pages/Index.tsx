import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Shield, FileText } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="h-4 w-4" />
            Pesquisa Científica
          </div>
          
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mb-6">
            Explorando os Limites entre<br />
            <span className="text-primary">Inteligência Artificial</span> e<br />
            Cognição Humana
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Uma Abordagem Baseada na Distribuição de Funções através de Dados
          </p>

          <Button
            onClick={() => navigate('/experimento/consentimento')}
            size="lg"
            className="h-14 px-10 text-lg font-medium shadow-elevated hover:shadow-card transition-shadow"
          >
            Iniciar Experimento
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="card-academic text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              20-30 minutos
            </h3>
            <p className="text-sm text-muted-foreground">
              Tempo estimado para completar todas as tarefas do experimento
            </p>
          </div>

          <div className="card-academic text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
              <Shield className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              100% Anônimo
            </h3>
            <p className="text-sm text-muted-foreground">
              Nenhum dado pessoal identificável é coletado durante a pesquisa
            </p>
          </div>

          <div className="card-academic text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
              <FileText className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              3 Tarefas
            </h3>
            <p className="text-sm text-muted-foreground">
              Criatividade, interpretação visual e análise de dilemas éticos
            </p>
          </div>
        </div>

        {/* Research Info */}
        <div className="mt-12 card-academic">
          <h2 className="font-heading text-xl text-foreground mb-4">
            Sobre a Pesquisa
          </h2>
          <p className="text-muted-foreground mb-4">
            Este experimento faz parte de uma pesquisa científica que investiga 
            as diferenças e semelhanças entre processos cognitivos humanos e 
            sistemas de inteligência artificial.
          </p>
          <p className="text-muted-foreground mb-4">
            Você realizará três tarefas que avaliam criatividade, interpretação 
            visual e raciocínio ético. Não há respostas certas ou erradas — 
            queremos conhecer sua forma única de pensar.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Requisito:</strong> É necessário ter 18 anos ou mais para participar.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Pesquisa aprovada pelo Comitê de Ética em Pesquisa • 
            Para dúvidas: gabriel.rego@mackenzie.br
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

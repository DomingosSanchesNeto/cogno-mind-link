import { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';
import { PrivacyFooter } from './PrivacyFooter';

interface ExperimentLayoutProps {
  children: ReactNode;
  showProgress?: boolean;
  showFooter?: boolean;
}

export function ExperimentLayout({
  children,
  showProgress = true,
  showFooter = true,
}: ExperimentLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="experiment-container">
        <header className="text-center mb-8">
          <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl text-foreground leading-tight mb-2">
            Explorando os Limites entre Inteligência Artificial e Cognição Humana
          </h1>
          <p className="text-sm text-muted-foreground">
            Uma Abordagem Baseada na Distribuição de Funções através de Dados
          </p>
        </header>

        {showProgress && <ProgressBar />}

        <main className="slide-up">
          {children}
        </main>

        {showFooter && <PrivacyFooter />}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useExperiment } from '@/contexts/ExperimentContext';
import { FileDown } from 'lucide-react';
import { sanitizeText } from '@/lib/security';

export default function ConsentScreen() {
  const navigate = useNavigate();
  const { 
    tcleConfig,
    initializeParticipant, 
    updateParticipantStatus, 
    setParticipantTcleVersion,
    recordScreenStart, 
    recordScreenEnd, 
    setCurrentStep 
  } = useExperiment();
  
  const [isAdult, setIsAdult] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    initializeParticipant();
    recordScreenStart('consent');
    setCurrentStep(1);
  }, []);

  const handleAgree = () => {
    if (isAdult && hasConsented) {
      setParticipantTcleVersion(tcleConfig.versionTag);
      recordScreenEnd('consent');
      navigate('/experimento/sociodemografico');
    }
  };

  const handleDecline = () => {
    recordScreenEnd('consent');
    updateParticipantStatus('declined');
    navigate('/experimento/encerrado');
  };

  const canProceed = isAdult && hasConsented;

  const renderTcleContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const sanitized = sanitizeText(line);
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-semibold mt-4 mb-2">{sanitized.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{sanitized.replace('### ', '')}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold">{sanitized.replace(/\*\*/g, '')}</p>;
      }
      if (line.match(/^\d+\. /)) {
        return <p key={i} className="ml-4">{sanitized}</p>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4">{sanitized.replace('- ', '')}</li>;
      }
      if (line === '---') {
        return <hr key={i} className="my-4 border-border" />;
      }
      if (line.trim()) {
        return <p key={i}>{sanitized}</p>;
      }
      return null;
    });
  };

  return (
    <ExperimentLayout showProgress={false}>
      <div className="card-academic">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl text-foreground">
              Termo de Consentimento
            </h2>
            <span className="text-xs text-muted-foreground">{tcleConfig.versionTag}</span>
          </div>
          {tcleConfig.fileUrl && (
            <a
              href={tcleConfig.fileUrl}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </a>
          )}
        </div>

        <div className="bg-consent-highlight rounded-lg p-4 sm:p-6 mb-6 max-h-[50vh] overflow-y-auto consent-scroll">
          <div className="consent-text">
            {renderTcleContent(tcleConfig.content)}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={isAdult}
              onCheckedChange={(checked) => setIsAdult(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
              Confirmo que tenho <strong>18 anos ou mais</strong>.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={hasConsented}
              onCheckedChange={(checked) => setHasConsented(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
              Li e <strong>concordo em participar voluntariamente</strong> da pesquisa.
            </span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAgree}
            disabled={!canProceed}
            className="flex-1 h-12 text-base font-medium"
          >
            Concordo e quero participar
          </Button>
          <Button
            variant="outline"
            onClick={handleDecline}
            className="flex-1 h-12 text-base font-medium text-muted-foreground"
          >
            Não concordo
          </Button>
        </div>
      </div>
    </ExperimentLayout>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useExperiment } from '@/contexts/ExperimentContext';
import { FileDown, ExternalLink } from 'lucide-react';

const TCLE_CONTENT = `
## TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)

### Título da Pesquisa
Explorando os Limites entre Inteligência Artificial e Cognição Humana: Uma Abordagem Baseada na Distribuição de Funções através de Dados

### Pesquisador Responsável
[Nome do Pesquisador]
E-mail: pesquisador@universidade.edu.br

### Instituição
[Nome da Universidade/Instituto de Pesquisa]

---

### 1. Natureza da Pesquisa
Você está sendo convidado(a) a participar de uma pesquisa científica que tem como objetivo investigar processos cognitivos humanos em comparação com sistemas de inteligência artificial, através da análise de tarefas de criatividade, interpretação visual e raciocínio ético.

### 2. Participantes da Pesquisa
Podem participar desta pesquisa indivíduos maiores de 18 anos, de qualquer gênero, nacionalidade ou escolaridade.

### 3. Procedimentos
Caso você decida participar, você realizará três tarefas online:

1. **Tarefa de Usos Alternativos (AUT):** Você deverá listar usos criativos para objetos comuns.
2. **Tarefa de Interpretação Visual (FIQ):** Você observará imagens abstratas e descreverá suas interpretações.
3. **Dilemas Éticos:** Você avaliará cenários éticos envolvendo inteligência artificial e justificará suas opiniões.

O tempo estimado de participação é de **20 a 30 minutos**.

### 4. Riscos e Desconfortos
Os riscos associados à participação são mínimos. Algumas questões podem provocar reflexões sobre temas éticos que geram desconforto leve. Você pode interromper sua participação a qualquer momento, sem qualquer prejuízo.

### 5. Benefícios
Não há benefícios diretos ao participante. Entretanto, sua participação contribui para o avanço do conhecimento científico sobre cognição humana e inteligência artificial.

### 6. Confidencialidade e Anonimato
**Todos os dados coletados são anônimos.** Não coletamos nome, e-mail, CPF, telefone, endereço IP ou qualquer informação que possa identificá-lo(a). Os dados serão utilizados exclusivamente para fins acadêmicos e poderão ser publicados em artigos científicos, sempre de forma agregada.

### 7. Direitos do Participante
- Você pode desistir a qualquer momento, sem necessidade de justificativa.
- Em caso de dúvidas ou para solicitar informações sobre os resultados gerais da pesquisa, entre em contato pelo e-mail: pesquisador@universidade.edu.br

### 8. Consentimento
Ao marcar as opções abaixo e clicar em "Concordo e quero participar", você declara que:
- Leu e compreendeu este termo
- Tem 18 anos ou mais
- Concorda em participar voluntariamente desta pesquisa

---

**Data de aprovação do Comitê de Ética:** [Data]
**Número do Parecer:** [Número]
`;

export default function ConsentScreen() {
  const navigate = useNavigate();
  const { initializeParticipant, updateParticipantStatus, recordScreenStart, recordScreenEnd, setCurrentStep } = useExperiment();
  
  const [isAdult, setIsAdult] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    initializeParticipant();
    recordScreenStart('consent');
    setCurrentStep(1);
  }, []);

  const handleAgree = () => {
    if (isAdult && hasConsented) {
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

  return (
    <ExperimentLayout showProgress={false}>
      <div className="card-academic">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl sm:text-2xl text-foreground">
            Termo de Consentimento
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar PDF</span>
          </a>
        </div>

        <div className="bg-consent-highlight rounded-lg p-4 sm:p-6 mb-6 max-h-[50vh] overflow-y-auto consent-scroll">
          <div className="consent-text">
            {TCLE_CONTENT.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i}>{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                return <p key={i} className="ml-4">{line}</p>;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
              }
              if (line === '---') {
                return <hr key={i} className="my-4 border-border" />;
              }
              if (line.trim()) {
                return <p key={i}>{line}</p>;
              }
              return null;
            })}
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

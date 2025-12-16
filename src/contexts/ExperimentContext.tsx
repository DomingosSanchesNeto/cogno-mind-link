import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Participant,
  SociodemographicData,
  AUTStimulus,
  FIQStimulus,
  EthicalDilemma,
  AUTResponse,
  FIQResponse,
  DilemmaResponse,
  ScreenTimestamp,
  TCLEConfig,
} from '@/types/experiment';

const DEFAULT_TCLE = `## TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)

### Título da Pesquisa
Explorando os Limites entre Inteligência Artificial e Cognição Humana

### Pesquisador Responsável
[Nome do Pesquisador] - pesquisador@universidade.edu.br

---

### 1. Natureza da Pesquisa
Você está sendo convidado(a) a participar de uma pesquisa científica que investiga processos cognitivos humanos em comparação com sistemas de inteligência artificial.

### 2. Procedimentos
Você realizará três tarefas online: Usos Alternativos (AUT), Interpretação Visual (FIQ) e Dilemas Éticos. Tempo estimado: 20-30 minutos.

### 3. Confidencialidade
**Todos os dados são anônimos.** Não coletamos nome, e-mail, CPF, telefone ou IP.

### 4. Consentimento
Ao marcar as opções abaixo, você declara que leu este termo, tem 18+ anos e concorda em participar.`;

const defaultTcle: TCLEConfig = { id: '1', content: DEFAULT_TCLE, versionTag: 'TCLE_v1.0', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

const mockAUTStimuli: AUTStimulus[] = [
  { id: '1', objectName: 'Tijolo', objectImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', instructionText: 'Liste todos os usos alternativos que você consegue imaginar para um tijolo comum.', suggestedTimeSeconds: 180, displayOrder: 1, versionTag: 'AUT_v1.0', isActive: true },
  { id: '2', objectName: 'Clipe de Papel', objectImageUrl: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=400', instructionText: 'Liste todos os usos alternativos que você consegue imaginar para um clipe de papel.', suggestedTimeSeconds: 180, displayOrder: 2, versionTag: 'AUT_v1.0', isActive: true },
];

const mockFIQStimuli: FIQStimulus[] = [
  { id: '1', title: 'Padrão Abstrato 1', imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600', questionText: 'O que você vê nesta imagem? Descreva suas interpretações.', displayOrder: 1, versionTag: 'FIQ_v1.0', isActive: true },
  { id: '2', title: 'Padrão Abstrato 2', imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600', questionText: 'Que emoções esta imagem evoca em você?', displayOrder: 2, versionTag: 'FIQ_v1.0', isActive: true },
];

const mockDilemmas: EthicalDilemma[] = [
  { id: '1', dilemmaText: 'Uma IA deveria ter permissão para tomar decisões médicas críticas sem supervisão humana, se estatisticamente ela tiver uma taxa de acerto maior que médicos humanos.', likertScale: '1-5', displayOrder: 1, versionTag: 'DILEMMA_v1.0', isActive: true },
  { id: '2', dilemmaText: 'Empresas deveriam ser obrigadas a revelar quando um conteúdo foi gerado por inteligência artificial.', likertScale: '1-5', displayOrder: 2, versionTag: 'DILEMMA_v1.0', isActive: true },
];

interface ExperimentContextType {
  tcleConfig: TCLEConfig; setTcleConfig: (c: TCLEConfig) => void;
  participant: Participant | null; initializeParticipant: () => void; updateParticipantStatus: (s: Participant['status']) => void; setParticipantTcleVersion: (v: string) => void;
  sociodemographic: SociodemographicData | null; setSociodemographic: (d: SociodemographicData) => void;
  autStimuli: AUTStimulus[]; setAutStimuli: React.Dispatch<React.SetStateAction<AUTStimulus[]>>;
  fiqStimuli: FIQStimulus[]; setFiqStimuli: React.Dispatch<React.SetStateAction<FIQStimulus[]>>;
  dilemmas: EthicalDilemma[]; setDilemmas: React.Dispatch<React.SetStateAction<EthicalDilemma[]>>;
  autResponses: AUTResponse[]; fiqResponses: FIQResponse[]; dilemmaResponses: DilemmaResponse[];
  addAUTResponse: (r: Omit<AUTResponse, 'participantId'>) => void;
  addFIQResponse: (r: Omit<FIQResponse, 'participantId'>) => void;
  addDilemmaResponse: (r: Omit<DilemmaResponse, 'participantId'>) => void;
  screenTimestamps: ScreenTimestamp[]; recordScreenStart: (s: string) => void; recordScreenEnd: (s: string) => void;
  currentStep: number; setCurrentStep: (s: number) => void; totalSteps: number;
}

const ExperimentContext = createContext<ExperimentContextType | null>(null);

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [tcleConfig, setTcleConfig] = useState<TCLEConfig>(defaultTcle);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [sociodemographic, setSociodemographicState] = useState<SociodemographicData | null>(null);
  const [autStimuliState, setAutStimuli] = useState<AUTStimulus[]>(mockAUTStimuli);
  const [fiqStimuliState, setFiqStimuli] = useState<FIQStimulus[]>(mockFIQStimuli);
  const [dilemmasState, setDilemmas] = useState<EthicalDilemma[]>(mockDilemmas);
  const [autResponses, setAutResponses] = useState<AUTResponse[]>([]);
  const [fiqResponses, setFiqResponses] = useState<FIQResponse[]>([]);
  const [dilemmaResponses, setDilemmaResponses] = useState<DilemmaResponse[]>([]);
  const [screenTimestamps, setScreenTimestamps] = useState<ScreenTimestamp[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [randomizedFIQ, setRandomizedFIQ] = useState<FIQStimulus[]>([]);
  const totalSteps = 9;

  const initializeParticipant = useCallback(() => {
    setParticipant({ id: uuidv4(), status: 'in_progress', startedAt: new Date().toISOString(), deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop', userAgent: navigator.userAgent, screenResolution: `${window.screen.width}x${window.screen.height}`, currentStep: 1 });
    setRandomizedFIQ([...fiqStimuliState.filter(s => s.isActive)].sort(() => Math.random() - 0.5));
  }, [fiqStimuliState]);

  const updateParticipantStatus = useCallback((status: Participant['status']) => { setParticipant(p => p ? { ...p, status, completedAt: status !== 'in_progress' ? new Date().toISOString() : undefined } : null); }, []);
  const setParticipantTcleVersion = useCallback((v: string) => { setParticipant(p => p ? { ...p, tcleVersionTag: v } : null); }, []);
  const setSociodemographic = useCallback((d: SociodemographicData) => { setSociodemographicState(d); }, []);
  const addAUTResponse = useCallback((r: Omit<AUTResponse, 'participantId'>) => { if (participant) setAutResponses(p => [...p, { ...r, participantId: participant.id }]); }, [participant]);
  const addFIQResponse = useCallback((r: Omit<FIQResponse, 'participantId'>) => { if (participant) setFiqResponses(p => [...p, { ...r, participantId: participant.id }]); }, [participant]);
  const addDilemmaResponse = useCallback((r: Omit<DilemmaResponse, 'participantId'>) => { if (participant) setDilemmaResponses(p => [...p, { ...r, participantId: participant.id }]); }, [participant]);
  const recordScreenStart = useCallback((screenName: string) => { if (participant) setScreenTimestamps(p => [...p, { participantId: participant.id, screenName, startedAt: new Date().toISOString() }]); }, [participant]);
  const recordScreenEnd = useCallback((screenName: string) => { setScreenTimestamps(p => { const i = p.findIndex(t => t.screenName === screenName && !t.submittedAt); if (i === -1) return p; const u = [...p]; u[i] = { ...u[i], submittedAt: new Date().toISOString(), durationSeconds: Math.round((Date.now() - new Date(u[i].startedAt).getTime()) / 1000) }; return u; }); }, []);

  return (
    <ExperimentContext.Provider value={{ tcleConfig, setTcleConfig, participant, initializeParticipant, updateParticipantStatus, setParticipantTcleVersion, sociodemographic, setSociodemographic, autStimuli: autStimuliState.filter(s => s.isActive), setAutStimuli, fiqStimuli: randomizedFIQ, setFiqStimuli, dilemmas: dilemmasState.filter(s => s.isActive), setDilemmas, autResponses, fiqResponses, dilemmaResponses, addAUTResponse, addFIQResponse, addDilemmaResponse, screenTimestamps, recordScreenStart, recordScreenEnd, currentStep, setCurrentStep, totalSteps }}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() { const c = useContext(ExperimentContext); if (!c) throw new Error('useExperiment must be used within ExperimentProvider'); return c; }

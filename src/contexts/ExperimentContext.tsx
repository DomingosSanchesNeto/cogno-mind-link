import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useExperimentPersistence } from '@/hooks/useExperimentPersistence';
import { SESSION_TIMEOUT_MS } from '@/types/experiment';
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
[Nome do Pesquisador] - gabriel.rego@mackenzie.br

---

### 1. Natureza da Pesquisa
Você está sendo convidado(a) a participar de uma pesquisa científica que investiga processos cognitivos humanos em comparação com sistemas de inteligência artificial.

### 2. Procedimentos
Você realizará três tarefas online: Usos Alternativos (AUT), Interpretação Visual (FIQ) e Dilemas Éticos. Tempo estimado: 20-30 minutos.

### 3. Confidencialidade
**Todos os dados são anônimos.** Não coletamos nome, e-mail, CPF, telefone ou IP.

### 4. Consentimento
Ao marcar as opções abaixo, você declara que leu este termo, tem 18+ anos e concorda em participar.`;

const defaultTcle: TCLEConfig = {
  id: '1',
  content: DEFAULT_TCLE,
  versionTag: 'TCLE_v1.0',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface ExperimentContextType {
  tcleConfig: TCLEConfig;
  setTcleConfig: (c: TCLEConfig) => void;
  participant: Participant | null;
  dbParticipantId: string | null;
  initializeParticipant: () => void;
  updateParticipantStatus: (s: Participant['status']) => void;
  setParticipantTcleVersion: (v: string) => void;
  sociodemographic: SociodemographicData | null;
  setSociodemographic: (d: SociodemographicData) => void;
  autStimuli: AUTStimulus[];
  setAutStimuli: React.Dispatch<React.SetStateAction<AUTStimulus[]>>;
  fiqStimuli: FIQStimulus[];
  setFiqStimuli: React.Dispatch<React.SetStateAction<FIQStimulus[]>>;
  dilemmas: EthicalDilemma[];
  setDilemmas: React.Dispatch<React.SetStateAction<EthicalDilemma[]>>;
  autResponses: AUTResponse[];
  fiqResponses: FIQResponse[];
  dilemmaResponses: DilemmaResponse[];
  addAUTResponse: (r: Omit<AUTResponse, 'participantId'>) => void;
  addFIQResponse: (r: Omit<FIQResponse, 'participantId'>) => void;
  addDilemmaResponse: (r: Omit<DilemmaResponse, 'participantId'>) => void;
  screenTimestamps: ScreenTimestamp[];
  recordScreenStart: (s: string) => void;
  recordScreenEnd: (s: string) => void;
  currentStep: number;
  setCurrentStep: (s: number) => void;
  totalSteps: number;
  isLoading: boolean;
  isSessionExpired: boolean;
  checkSessionExpiration: () => boolean;
}

const ExperimentContext = createContext<ExperimentContextType | null>(null);

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [tcleConfig, setTcleConfig] = useState<TCLEConfig>(defaultTcle);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [dbParticipantId, setDbParticipantId] = useState<string | null>(null);
  const [sociodemographic, setSociodemographicState] = useState<SociodemographicData | null>(null);
  const [autStimuliState, setAutStimuli] = useState<AUTStimulus[]>([]);
  const [fiqStimuliState, setFiqStimuli] = useState<FIQStimulus[]>([]);
  const [dilemmasState, setDilemmas] = useState<EthicalDilemma[]>([]);
  const [autResponses, setAutResponses] = useState<AUTResponse[]>([]);
  const [fiqResponses, setFiqResponses] = useState<FIQResponse[]>([]);
  const [dilemmaResponses, setDilemmaResponses] = useState<DilemmaResponse[]>([]);
  const [screenTimestamps, setScreenTimestamps] = useState<ScreenTimestamp[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [randomizedFIQ, setRandomizedFIQ] = useState<FIQStimulus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const totalSteps = 9;

  // Persistence hook
  const persistence = useExperimentPersistence();

  // Track screen start times for duration calculation
  const screenStartTimes = useRef<Record<string, string>>({});

  // Check if session has expired (60 minutes)
  const checkSessionExpiration = useCallback(() => {
    if (!participant?.startedAt) return false;
    
    const startTime = new Date(participant.startedAt).getTime();
    const now = Date.now();
    const elapsed = now - startTime;
    
    if (elapsed >= SESSION_TIMEOUT_MS) {
      setIsSessionExpired(true);
      return true;
    }
    return false;
  }, [participant?.startedAt]);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load active TCLE
        const { data: tcleData } = await supabase
          .from('tcle_config')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (tcleData) {
          setTcleConfig({
            id: tcleData.id,
            content: tcleData.content,
            versionTag: tcleData.version_tag,
            fileUrl: tcleData.file_url || undefined,
            isActive: tcleData.is_active,
            createdAt: tcleData.created_at,
            updatedAt: tcleData.updated_at,
          });
        }

        // Load active AUT stimuli
        const { data: autData } = await supabase
          .from('aut_stimuli')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (autData) {
          setAutStimuli(
            autData.map((s) => ({
              id: s.id,
              objectName: s.object_name,
              objectImageUrl: s.image_url || undefined,
              instructionText: s.instruction_text || undefined,
              suggestedTimeSeconds: s.suggested_time_seconds || 180,
              displayOrder: s.display_order,
              versionTag: s.version_tag || undefined,
              isActive: s.is_active,
            }))
          );
        }

        // Load active FIQ stimuli
        const { data: fiqData } = await supabase
          .from('fiq_stimuli')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (fiqData) {
          const mapped = fiqData.map((s) => ({
            id: s.id,
            title: s.title,
            imageUrl: s.image_url,
            questionText: s.question_text,
            displayOrder: s.display_order,
            versionTag: s.version_tag || undefined,
            isActive: s.is_active,
          }));
          setFiqStimuli(mapped);
          setRandomizedFIQ([...mapped].sort(() => Math.random() - 0.5));
        }

        // Load active dilemmas
        const { data: dilemmaData } = await supabase
          .from('ethical_dilemmas')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (dilemmaData) {
          setDilemmas(
            dilemmaData.map((d) => ({
              id: d.id,
              dilemmaText: d.dilemma_text,
              displayOrder: d.display_order,
              versionTag: d.version_tag || undefined,
              isActive: d.is_active,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading experiment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const initializeParticipant = useCallback(async () => {
    const newParticipant: Participant = {
      id: uuidv4(),
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      currentStep: 1,
      tcleVersionTag: tcleConfig.versionTag,
    };

    setParticipant(newParticipant);
    setRandomizedFIQ([...fiqStimuliState.filter((s) => s.isActive)].sort(() => Math.random() - 0.5));

    // Persist to database
    try {
      const { dbId, error } = await persistence.createParticipant(newParticipant);
      if (error) {
        console.error('Error creating participant:', error);
      } else if (dbId) {
        setDbParticipantId(dbId);
        console.log('Participant created with DB ID:', dbId);
      }
    } catch (error) {
      console.error('Error persisting participant:', error);
    }
  }, [fiqStimuliState, tcleConfig.versionTag, persistence]);

  const updateParticipantStatus = useCallback(async (status: Participant['status']) => {
    const completedAt = status !== 'in_progress' ? new Date().toISOString() : undefined;
    
    setParticipant((p) =>
      p ? { ...p, status, completedAt } : null
    );

    // Persist status update via secure edge function
    if (participant?.id && dbParticipantId) {
      try {
        const { error } = await persistence.updateParticipantStatus(
          participant.id, 
          status, 
          completedAt,
          dbParticipantId
        );
        if (error) {
          console.error('Error updating participant status:', error);
        }
      } catch (error) {
        console.error('Error persisting participant status:', error);
      }
    }
  }, [participant?.id, dbParticipantId, persistence]);

  const setParticipantTcleVersion = useCallback((v: string) => {
    setParticipant((p) => (p ? { ...p, tcleVersionTag: v } : null));
  }, []);

  const setSociodemographic = useCallback(async (d: SociodemographicData) => {
    setSociodemographicState(d);

    // Persist to database
    if (dbParticipantId) {
      try {
        const { error } = await persistence.saveSociodemographic(dbParticipantId, d);
        if (error) {
          console.error('Error saving sociodemographic data:', error);
        } else {
          console.log('Sociodemographic data saved');
        }
      } catch (error) {
        console.error('Error persisting sociodemographic:', error);
      }
    }
  }, [dbParticipantId, persistence]);

  const addAUTResponse = useCallback(
    async (r: Omit<AUTResponse, 'participantId'>) => {
      if (!participant) return;
      
      const response = { ...r, participantId: participant.id };
      setAutResponses((p) => [...p, response]);

      // Persist to database
      if (dbParticipantId) {
        try {
          const { error } = await persistence.saveAUTResponse(dbParticipantId, response);
          if (error) {
            console.error('Error saving AUT response:', error);
          } else {
            console.log('AUT response saved');
          }
        } catch (error) {
          console.error('Error persisting AUT response:', error);
        }
      }
    },
    [participant, dbParticipantId, persistence]
  );

  const addFIQResponse = useCallback(
    async (r: Omit<FIQResponse, 'participantId'>) => {
      if (!participant) return;
      
      const response = { ...r, participantId: participant.id };
      setFiqResponses((p) => [...p, response]);

      // Persist to database
      if (dbParticipantId) {
        try {
          const { error } = await persistence.saveFIQResponse(dbParticipantId, response);
          if (error) {
            console.error('Error saving FIQ response:', error);
          } else {
            console.log('FIQ response saved');
          }
        } catch (error) {
          console.error('Error persisting FIQ response:', error);
        }
      }
    },
    [participant, dbParticipantId, persistence]
  );

  const addDilemmaResponse = useCallback(
    async (r: Omit<DilemmaResponse, 'participantId'>) => {
      if (!participant) return;
      
      const response = { ...r, participantId: participant.id };
      setDilemmaResponses((p) => [...p, response]);

      // Persist to database
      if (dbParticipantId) {
        try {
          const { error } = await persistence.saveDilemmaResponse(dbParticipantId, response);
          if (error) {
            console.error('Error saving dilemma response:', error);
          } else {
            console.log('Dilemma response saved');
          }
        } catch (error) {
          console.error('Error persisting dilemma response:', error);
        }
      }
    },
    [participant, dbParticipantId, persistence]
  );

  const recordScreenStart = useCallback(
    (screenName: string) => {
      if (!participant) return;
      
      const startedAt = new Date().toISOString();
      screenStartTimes.current[screenName] = startedAt;
      
      setScreenTimestamps((p) => [
        ...p,
        { participantId: participant.id, screenName, startedAt },
      ]);
    },
    [participant]
  );

  const recordScreenEnd = useCallback(
    async (screenName: string) => {
      const startedAt = screenStartTimes.current[screenName];
      if (!startedAt) return;

      const submittedAt = new Date().toISOString();
      const durationSeconds = Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000);

      setScreenTimestamps((p) => {
        const i = p.findIndex((t) => t.screenName === screenName && !t.submittedAt);
        if (i === -1) return p;
        const u = [...p];
        u[i] = { ...u[i], submittedAt, durationSeconds };
        return u;
      });

      // Persist to database
      if (dbParticipantId && participant) {
        try {
          const { error } = await persistence.saveScreenTimestamp(dbParticipantId, {
            participantId: participant.id,
            screenName,
            startedAt,
            submittedAt,
            durationSeconds,
          });
          if (error) {
            console.error('Error saving screen timestamp:', error);
          }
        } catch (error) {
          console.error('Error persisting screen timestamp:', error);
        }
      }

      delete screenStartTimes.current[screenName];
    },
    [dbParticipantId, participant, persistence]
  );

  return (
    <ExperimentContext.Provider
      value={{
        tcleConfig,
        setTcleConfig,
        participant,
        dbParticipantId,
        initializeParticipant,
        updateParticipantStatus,
        setParticipantTcleVersion,
        sociodemographic,
        setSociodemographic,
        autStimuli: autStimuliState.filter((s) => s.isActive),
        setAutStimuli,
        fiqStimuli: randomizedFIQ,
        setFiqStimuli,
        dilemmas: dilemmasState.filter((s) => s.isActive),
        setDilemmas,
        autResponses,
        fiqResponses,
        dilemmaResponses,
        addAUTResponse,
        addFIQResponse,
        addDilemmaResponse,
        screenTimestamps,
        recordScreenStart,
        recordScreenEnd,
        currentStep,
        setCurrentStep,
        totalSteps,
        isLoading,
        isSessionExpired,
        checkSessionExpiration,
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within ExperimentProvider');
  }
  return context;
}

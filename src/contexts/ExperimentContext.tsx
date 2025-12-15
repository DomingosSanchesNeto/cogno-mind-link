import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
} from '@/types/experiment';

// Mock data for initial development
const mockAUTStimuli: AUTStimulus[] = [
  {
    id: '1',
    objectName: 'Tijolo',
    instructionText: 'Liste todos os usos alternativos que você consegue imaginar para um tijolo comum.',
    suggestedTimeSeconds: 180,
    displayOrder: 1,
    versionTag: 'AUT_v1.0',
    isActive: true,
  },
  {
    id: '2',
    objectName: 'Clipe de Papel',
    instructionText: 'Liste todos os usos alternativos que você consegue imaginar para um clipe de papel.',
    suggestedTimeSeconds: 180,
    displayOrder: 2,
    versionTag: 'AUT_v1.0',
    isActive: true,
  },
];

const mockFIQStimuli: FIQStimulus[] = [
  {
    id: '1',
    title: 'Padrão Abstrato 1',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600',
    questionText: 'O que você vê nesta imagem? Descreva suas interpretações e associações.',
    displayOrder: 1,
    versionTag: 'FIQ_v1.0',
    isActive: true,
  },
  {
    id: '2',
    title: 'Padrão Abstrato 2',
    imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600',
    questionText: 'Que emoções ou pensamentos esta imagem evoca em você?',
    displayOrder: 2,
    versionTag: 'FIQ_v1.0',
    isActive: true,
  },
];

const mockDilemmas: EthicalDilemma[] = [
  {
    id: '1',
    dilemmaText: 'Uma inteligência artificial deveria ter permissão para tomar decisões médicas críticas sem supervisão humana, se estatisticamente ela tiver uma taxa de acerto maior que médicos humanos.',
    likertScale: '1-5',
    displayOrder: 1,
    versionTag: 'DILEMMA_v1.0',
    isActive: true,
  },
  {
    id: '2',
    dilemmaText: 'Empresas deveriam ser obrigadas a revelar quando um conteúdo (texto, imagem ou vídeo) foi gerado por inteligência artificial.',
    likertScale: '1-5',
    displayOrder: 2,
    versionTag: 'DILEMMA_v1.0',
    isActive: true,
  },
];

interface ExperimentContextType {
  // Participant
  participant: Participant | null;
  initializeParticipant: () => void;
  updateParticipantStatus: (status: Participant['status']) => void;
  
  // Sociodemographic
  sociodemographic: SociodemographicData | null;
  setSociodemographic: (data: SociodemographicData) => void;
  
  // Stimuli
  autStimuli: AUTStimulus[];
  fiqStimuli: FIQStimulus[];
  dilemmas: EthicalDilemma[];
  
  // Responses
  autResponses: AUTResponse[];
  fiqResponses: FIQResponse[];
  dilemmaResponses: DilemmaResponse[];
  
  addAUTResponse: (response: Omit<AUTResponse, 'participantId'>) => void;
  addFIQResponse: (response: Omit<FIQResponse, 'participantId'>) => void;
  addDilemmaResponse: (response: Omit<DilemmaResponse, 'participantId'>) => void;
  
  // Timestamps
  screenTimestamps: ScreenTimestamp[];
  recordScreenStart: (screenName: string) => void;
  recordScreenEnd: (screenName: string) => void;
  
  // Navigation
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const ExperimentContext = createContext<ExperimentContextType | null>(null);

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [sociodemographic, setSociodemographicState] = useState<SociodemographicData | null>(null);
  const [autResponses, setAutResponses] = useState<AUTResponse[]>([]);
  const [fiqResponses, setFiqResponses] = useState<FIQResponse[]>([]);
  const [dilemmaResponses, setDilemmaResponses] = useState<DilemmaResponse[]>([]);
  const [screenTimestamps, setScreenTimestamps] = useState<ScreenTimestamp[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Randomize FIQ stimuli order per participant
  const [randomizedFIQ, setRandomizedFIQ] = useState<FIQStimulus[]>([]);
  
  const totalSteps = 6;

  const getDeviceType = (): 'mobile' | 'desktop' => {
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  };

  const initializeParticipant = useCallback(() => {
    const newParticipant: Participant = {
      id: uuidv4(),
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      deviceType: getDeviceType(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      currentStep: 1,
    };
    setParticipant(newParticipant);
    
    // Randomize FIQ stimuli
    const shuffled = [...mockFIQStimuli.filter(s => s.isActive)]
      .sort(() => Math.random() - 0.5);
    setRandomizedFIQ(shuffled);
  }, []);

  const updateParticipantStatus = useCallback((status: Participant['status']) => {
    setParticipant(prev => prev ? {
      ...prev,
      status,
      completedAt: status === 'completed' || status === 'declined' 
        ? new Date().toISOString() 
        : undefined,
    } : null);
  }, []);

  const setSociodemographic = useCallback((data: SociodemographicData) => {
    setSociodemographicState(data);
  }, []);

  const addAUTResponse = useCallback((response: Omit<AUTResponse, 'participantId'>) => {
    if (!participant) return;
    setAutResponses(prev => [...prev, { ...response, participantId: participant.id }]);
  }, [participant]);

  const addFIQResponse = useCallback((response: Omit<FIQResponse, 'participantId'>) => {
    if (!participant) return;
    setFiqResponses(prev => [...prev, { ...response, participantId: participant.id }]);
  }, [participant]);

  const addDilemmaResponse = useCallback((response: Omit<DilemmaResponse, 'participantId'>) => {
    if (!participant) return;
    setDilemmaResponses(prev => [...prev, { ...response, participantId: participant.id }]);
  }, [participant]);

  const recordScreenStart = useCallback((screenName: string) => {
    if (!participant) return;
    setScreenTimestamps(prev => [...prev, {
      participantId: participant.id,
      screenName,
      startedAt: new Date().toISOString(),
    }]);
  }, [participant]);

  const recordScreenEnd = useCallback((screenName: string) => {
    setScreenTimestamps(prev => {
      const idx = prev.findIndex(
        ts => ts.screenName === screenName && !ts.submittedAt
      );
      if (idx === -1) return prev;
      
      const updated = [...prev];
      const startTime = new Date(updated[idx].startedAt).getTime();
      const endTime = Date.now();
      
      updated[idx] = {
        ...updated[idx],
        submittedAt: new Date().toISOString(),
        durationSeconds: Math.round((endTime - startTime) / 1000),
      };
      
      return updated;
    });
  }, []);

  return (
    <ExperimentContext.Provider
      value={{
        participant,
        initializeParticipant,
        updateParticipantStatus,
        sociodemographic,
        setSociodemographic,
        autStimuli: mockAUTStimuli.filter(s => s.isActive),
        fiqStimuli: randomizedFIQ,
        dilemmas: mockDilemmas.filter(s => s.isActive),
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
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within an ExperimentProvider');
  }
  return context;
}

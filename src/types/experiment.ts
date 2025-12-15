export interface Participant {
  id: string;
  status: 'in_progress' | 'completed' | 'declined';
  startedAt: string;
  completedAt?: string;
  deviceType: 'mobile' | 'desktop';
  userAgent: string;
  screenResolution: string;
  currentStep: number;
}

export interface SociodemographicData {
  age: number;
  sex: 'female' | 'male' | 'prefer_not_to_say';
  education: 'high_school' | 'undergraduate_incomplete' | 'undergraduate_complete' | 'postgraduate';
  profession: string;
  socioeconomicLevel: 'A' | 'B' | 'C' | 'DE';
  aiExperience: boolean;
}

export interface AUTStimulus {
  id: string;
  objectName: string;
  instructionText: string;
  suggestedTimeSeconds: number;
  displayOrder: number;
  versionTag?: string;
  isActive: boolean;
}

export interface FIQStimulus {
  id: string;
  title: string;
  imageUrl: string;
  questionText: string;
  displayOrder: number;
  versionTag?: string;
  isActive: boolean;
}

export interface EthicalDilemma {
  id: string;
  dilemmaText: string;
  likertScale: '1-5';
  displayOrder: number;
  versionTag?: string;
  isActive: boolean;
}

export interface AUTResponse {
  participantId: string;
  stimulusId: string;
  response: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  displayOrder: number;
}

export interface FIQResponse {
  participantId: string;
  stimulusId: string;
  versionTag?: string;
  response: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  randomizedOrder: number;
}

export interface DilemmaResponse {
  participantId: string;
  dilemmaId: string;
  likertValue: 1 | 2 | 3 | 4 | 5;
  justification: string;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
}

export interface ScreenTimestamp {
  participantId: string;
  screenName: string;
  startedAt: string;
  submittedAt?: string;
  durationSeconds?: number;
}

export interface ExperimentStats {
  total: number;
  inProgress: number;
  completed: number;
  declined: number;
}

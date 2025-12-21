import { supabase } from '@/integrations/supabase/client';
import type { 
  Participant, 
  SociodemographicData, 
  AUTResponse, 
  FIQResponse, 
  DilemmaResponse,
  ScreenTimestamp 
} from '@/types/experiment';

export function useExperimentPersistence() {
  // Create participant in database
  const createParticipant = async (participant: Participant) => {
    const { data, error } = await supabase
      .from('participants')
      .insert({
        participant_id: participant.id,
        tcle_version_tag: participant.tcleVersionTag,
        consent_given: true,
        status: participant.status,
        device_type: participant.deviceType,
        user_agent: participant.userAgent,
        screen_resolution: participant.screenResolution,
        started_at: participant.startedAt,
      })
      .select('id')
      .single();
    
    return { data, error, dbId: data?.id };
  };

  // Update participant status
  const updateParticipantStatus = async (participantId: string, status: string, completedAt?: string) => {
    const { error } = await supabase
      .from('participants')
      .update({ 
        status, 
        completed_at: completedAt 
      })
      .eq('participant_id', participantId);
    
    return { error };
  };

  // Save sociodemographic data
  const saveSociodemographic = async (dbParticipantId: string, data: SociodemographicData) => {
    const { error } = await supabase
      .from('sociodemographic_data')
      .insert({
        participant_id: dbParticipantId,
        age: data.age,
        sex: data.sex,
        education_level: data.education,
        profession: data.profession,
        socioeconomic_class: data.socioeconomicLevel,
        ai_experience: data.aiExperience,
      });
    
    return { error };
  };

  // Save AUT response
  const saveAUTResponse = async (dbParticipantId: string, response: AUTResponse) => {
    const { error } = await supabase
      .from('aut_responses')
      .insert({
        participant_id: dbParticipantId,
        stimulus_id: response.stimulusId,
        object_name: response.objectName,
        object_image_url: response.objectImageUrl,
        version_tag: response.versionTag,
        response_text: response.response,
        started_at: response.startedAt,
        submitted_at: response.submittedAt,
        duration_seconds: response.durationSeconds,
      });
    
    return { error };
  };

  // Save FIQ response
  const saveFIQResponse = async (dbParticipantId: string, response: FIQResponse) => {
    const { error } = await supabase
      .from('fiq_responses')
      .insert({
        participant_id: dbParticipantId,
        stimulus_id: response.stimulusId,
        presentation_order: response.randomizedOrder,
        version_tag: response.versionTag,
        response_text: response.response,
        started_at: response.startedAt,
        submitted_at: response.submittedAt,
        duration_seconds: response.durationSeconds,
      });
    
    return { error };
  };

  // Save dilemma response
  const saveDilemmaResponse = async (dbParticipantId: string, response: DilemmaResponse) => {
    const { error } = await supabase
      .from('dilemma_responses')
      .insert({
        participant_id: dbParticipantId,
        dilemma_id: response.dilemmaId,
        response_value: response.responseValue,
        justification: response.justification,
        started_at: response.startedAt,
        submitted_at: response.submittedAt,
        duration_seconds: response.durationSeconds,
      });
    
    return { error };
  };

  // Save screen timestamp
  const saveScreenTimestamp = async (dbParticipantId: string, timestamp: ScreenTimestamp) => {
    const { error } = await supabase
      .from('screen_timestamps')
      .insert({
        participant_id: dbParticipantId,
        screen_name: timestamp.screenName,
        started_at: timestamp.startedAt,
        submitted_at: timestamp.submittedAt,
        duration_seconds: timestamp.durationSeconds,
      });
    
    return { error };
  };

  // Get participant DB ID from UUID
  const getParticipantDbId = async (participantUuid: string) => {
    const { data, error } = await supabase
      .from('participants')
      .select('id')
      .eq('participant_id', participantUuid)
      .single();
    
    return { dbId: data?.id, error };
  };

  return {
    createParticipant,
    updateParticipantStatus,
    saveSociodemographic,
    saveAUTResponse,
    saveFIQResponse,
    saveDilemmaResponse,
    saveScreenTimestamp,
    getParticipantDbId,
  };
}

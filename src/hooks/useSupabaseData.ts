import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AUTStimulus, FIQStimulus, EthicalDilemma, TCLEConfig } from '@/types/experiment';

// Helper to upload file to storage
export async function uploadToStorage(file: File, path: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;
  
  const { error } = await supabase.storage
    .from('experiment-files')
    .upload(filePath, file);
  
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('experiment-files')
    .getPublicUrl(filePath);
  
  return publicUrl;
}

// TCLE Hook
export function useTCLE() {
  const [tcle, setTcle] = useState<TCLEConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveTCLE = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tcle_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setTcle({
        id: data.id,
        content: data.content,
        fileUrl: data.file_url || undefined,
        versionTag: data.version_tag,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    }
    setLoading(false);
    return data;
  }, []);

  const saveTCLE = async (config: Omit<TCLEConfig, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    // First deactivate all existing TCLEs
    if (config.isActive) {
      await supabase
        .from('tcle_config')
        .update({ is_active: false })
        .eq('is_active', true);
    }

    if (config.id) {
      const { error } = await supabase
        .from('tcle_config')
        .update({
          content: config.content,
          file_url: config.fileUrl,
          version_tag: config.versionTag,
          is_active: config.isActive,
        })
        .eq('id', config.id);
      return { error };
    } else {
      const { error } = await supabase
        .from('tcle_config')
        .insert({
          content: config.content,
          file_url: config.fileUrl,
          version_tag: config.versionTag,
          is_active: config.isActive,
        });
      return { error };
    }
  };

  useEffect(() => { fetchActiveTCLE(); }, [fetchActiveTCLE]);

  return { tcle, loading, fetchActiveTCLE, saveTCLE };
}

// AUT Stimuli Hook
export function useAUTStimuli() {
  const [stimuli, setStimuli] = useState<AUTStimulus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStimuli = useCallback(async (onlyActive = false) => {
    setLoading(true);
    let query = supabase.from('aut_stimuli').select('*').order('display_order');
    if (onlyActive) query = query.eq('is_active', true);
    
    const { data, error } = await query;
    
    if (data) {
      setStimuli(data.map(s => ({
        id: s.id,
        objectName: s.object_name,
        objectImageUrl: s.image_url || undefined,
        instructionText: s.instruction_text || '',
        suggestedTimeSeconds: s.suggested_time_seconds || 180,
        displayOrder: s.display_order,
        versionTag: s.version_tag || undefined,
        isActive: s.is_active,
      })));
    }
    setLoading(false);
    return { data, error };
  }, []);

  const saveStimulus = async (stimulus: Partial<AUTStimulus> & { objectName: string }) => {
    const payload = {
      object_name: stimulus.objectName,
      instruction_text: stimulus.instructionText,
      image_url: stimulus.objectImageUrl,
      suggested_time_seconds: stimulus.suggestedTimeSeconds || 180,
      display_order: stimulus.displayOrder || 0,
      version_tag: stimulus.versionTag,
      is_active: stimulus.isActive ?? true,
    };

    if (stimulus.id) {
      return supabase.from('aut_stimuli').update(payload).eq('id', stimulus.id);
    }
    return supabase.from('aut_stimuli').insert(payload);
  };

  const deleteStimulus = async (id: string) => {
    return supabase.from('aut_stimuli').delete().eq('id', id);
  };

  useEffect(() => { fetchStimuli(); }, [fetchStimuli]);

  return { stimuli, loading, fetchStimuli, saveStimulus, deleteStimulus };
}

// FIQ Stimuli Hook
export function useFIQStimuli() {
  const [stimuli, setStimuli] = useState<FIQStimulus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStimuli = useCallback(async (onlyActive = false) => {
    setLoading(true);
    let query = supabase.from('fiq_stimuli').select('*').order('display_order');
    if (onlyActive) query = query.eq('is_active', true);
    
    const { data, error } = await query;
    
    if (data) {
      setStimuli(data.map(s => ({
        id: s.id,
        title: s.title,
        imageUrl: s.image_url,
        questionText: s.question_text,
        displayOrder: s.display_order,
        versionTag: s.version_tag || undefined,
        isActive: s.is_active,
      })));
    }
    setLoading(false);
    return { data, error };
  }, []);

  const saveStimulus = async (stimulus: Partial<FIQStimulus> & { title: string; imageUrl: string; questionText: string }) => {
    const payload = {
      title: stimulus.title,
      image_url: stimulus.imageUrl,
      question_text: stimulus.questionText,
      display_order: stimulus.displayOrder || 0,
      version_tag: stimulus.versionTag,
      is_active: stimulus.isActive ?? true,
    };

    if (stimulus.id) {
      return supabase.from('fiq_stimuli').update(payload).eq('id', stimulus.id);
    }
    return supabase.from('fiq_stimuli').insert(payload);
  };

  const deleteStimulus = async (id: string) => {
    return supabase.from('fiq_stimuli').delete().eq('id', id);
  };

  useEffect(() => { fetchStimuli(); }, [fetchStimuli]);

  return { stimuli, loading, fetchStimuli, saveStimulus, deleteStimulus };
}

// Ethical Dilemmas Hook
export function useEthicalDilemmas() {
  const [dilemmas, setDilemmas] = useState<EthicalDilemma[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDilemmas = useCallback(async (onlyActive = false) => {
    setLoading(true);
    let query = supabase.from('ethical_dilemmas').select('*').order('display_order');
    if (onlyActive) query = query.eq('is_active', true);
    
    const { data, error } = await query;
    
    if (data) {
      setDilemmas(data.map(d => ({
        id: d.id,
        dilemmaText: d.dilemma_text,
        likertScale: '1-5' as const,
        displayOrder: d.display_order,
        versionTag: d.version_tag || undefined,
        isActive: d.is_active,
      })));
    }
    setLoading(false);
    return { data, error };
  }, []);

  const saveDilemma = async (dilemma: Partial<EthicalDilemma> & { dilemmaText: string }) => {
    const payload = {
      dilemma_text: dilemma.dilemmaText,
      likert_scale_type: 5,
      display_order: dilemma.displayOrder || 0,
      version_tag: dilemma.versionTag,
      is_active: dilemma.isActive ?? true,
    };

    if (dilemma.id) {
      return supabase.from('ethical_dilemmas').update(payload).eq('id', dilemma.id);
    }
    return supabase.from('ethical_dilemmas').insert(payload);
  };

  const deleteDilemma = async (id: string) => {
    return supabase.from('ethical_dilemmas').delete().eq('id', id);
  };

  useEffect(() => { fetchDilemmas(); }, [fetchDilemmas]);

  return { dilemmas, loading, fetchDilemmas, saveDilemma, deleteDilemma };
}

// Dashboard Stats Hook
export function useDashboardStats() {
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, declined: 0 });
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; status: string; timestamp: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    
    // Use service role via edge function would be needed for production
    // For now, we'll need an edge function to fetch this data securely
    // This is a placeholder that shows the structure
    
    setStats({ total: 0, completed: 0, inProgress: 0, declined: 0 });
    setRecentActivity([]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, recentActivity, loading, fetchStats };
}

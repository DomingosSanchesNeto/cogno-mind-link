import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { callAdminApi } from './useAdminAuth';
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
  const [allTcles, setAllTcles] = useState<TCLEConfig[]>([]);
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

  const fetchAllTCLEs = useCallback(async () => {
    try {
      const result = await callAdminApi('tcle-list');
      if (result.data) {
        setAllTcles(result.data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          content: d.content as string,
          fileUrl: (d.file_url as string) || undefined,
          versionTag: d.version_tag as string,
          isActive: d.is_active as boolean,
          createdAt: d.created_at as string,
          updatedAt: d.updated_at as string,
        })));
      }
    } catch (error) {
      console.error('Error fetching all TCLEs:', error);
    }
  }, []);

  const saveTCLE = async (config: Omit<TCLEConfig, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    try {
      await callAdminApi('tcle-save', {
        id: config.id,
        data: {
          content: config.content,
          file_url: config.fileUrl,
          version_tag: config.versionTag,
          is_active: config.isActive,
        }
      });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  useEffect(() => { fetchActiveTCLE(); }, [fetchActiveTCLE]);

  return { tcle, allTcles, loading, fetchActiveTCLE, fetchAllTCLEs, saveTCLE };
}

// AUT Stimuli Hook
export function useAUTStimuli() {
  const [stimuli, setStimuli] = useState<AUTStimulus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStimuli = useCallback(async (onlyActive = false) => {
    setLoading(true);
    
    if (onlyActive) {
      // Public read for active stimuli
      const { data, error } = await supabase
        .from('aut_stimuli')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
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
    } else {
      // Admin read via edge function
      try {
        const result = await callAdminApi('aut-list');
        if (result.data) {
          setStimuli(result.data.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            objectName: s.object_name as string,
            objectImageUrl: (s.image_url as string) || undefined,
            instructionText: (s.instruction_text as string) || '',
            suggestedTimeSeconds: (s.suggested_time_seconds as number) || 180,
            displayOrder: s.display_order as number,
            versionTag: (s.version_tag as string) || undefined,
            isActive: s.is_active as boolean,
          })));
        }
        setLoading(false);
        return { data: result.data, error: null };
      } catch (error) {
        setLoading(false);
        return { data: null, error };
      }
    }
  }, []);

  const saveStimulus = async (stimulus: Partial<AUTStimulus> & { objectName: string }) => {
    try {
      await callAdminApi('aut-save', {
        id: stimulus.id,
        data: {
          object_name: stimulus.objectName,
          instruction_text: stimulus.instructionText,
          image_url: stimulus.objectImageUrl,
          suggested_time_seconds: stimulus.suggestedTimeSeconds || 180,
          display_order: stimulus.displayOrder || 0,
          version_tag: stimulus.versionTag,
          is_active: stimulus.isActive ?? true,
        }
      });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const deleteStimulus = async (id: string) => {
    try {
      await callAdminApi('aut-delete', { id });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  // Don't auto-fetch - let components decide based on auth state
  return { stimuli, loading, fetchStimuli, saveStimulus, deleteStimulus };
}

// FIQ Stimuli Hook
export function useFIQStimuli() {
  const [stimuli, setStimuli] = useState<FIQStimulus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStimuli = useCallback(async (onlyActive = false) => {
    setLoading(true);
    
    if (onlyActive) {
      const { data, error } = await supabase
        .from('fiq_stimuli')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
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
    } else {
      try {
        const result = await callAdminApi('fiq-list');
        if (result.data) {
          setStimuli(result.data.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            title: s.title as string,
            imageUrl: s.image_url as string,
            questionText: s.question_text as string,
            displayOrder: s.display_order as number,
            versionTag: (s.version_tag as string) || undefined,
            isActive: s.is_active as boolean,
          })));
        }
        setLoading(false);
        return { data: result.data, error: null };
      } catch (error) {
        setLoading(false);
        return { data: null, error };
      }
    }
  }, []);

  const saveStimulus = async (stimulus: Partial<FIQStimulus> & { title: string; imageUrl: string; questionText: string }) => {
    try {
      await callAdminApi('fiq-save', {
        id: stimulus.id,
        data: {
          title: stimulus.title,
          image_url: stimulus.imageUrl,
          question_text: stimulus.questionText,
          display_order: stimulus.displayOrder || 0,
          version_tag: stimulus.versionTag,
          is_active: stimulus.isActive ?? true,
        }
      });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const deleteStimulus = async (id: string) => {
    try {
      await callAdminApi('fiq-delete', { id });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  // Don't auto-fetch - let components decide based on auth state
  return { stimuli, loading, fetchStimuli, saveStimulus, deleteStimulus };
}

// Ethical Dilemmas Hook
export function useEthicalDilemmas() {
  const [dilemmas, setDilemmas] = useState<EthicalDilemma[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDilemmas = useCallback(async (onlyActive = false) => {
    setLoading(true);
    
    if (onlyActive) {
      const { data, error } = await supabase
        .from('ethical_dilemmas')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
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
    } else {
      try {
        const result = await callAdminApi('dilemmas-list');
        if (result.data) {
          setDilemmas(result.data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            dilemmaText: d.dilemma_text as string,
            likertScale: '1-5' as const,
            displayOrder: d.display_order as number,
            versionTag: (d.version_tag as string) || undefined,
            isActive: d.is_active as boolean,
          })));
        }
        setLoading(false);
        return { data: result.data, error: null };
      } catch (error) {
        setLoading(false);
        return { data: null, error };
      }
    }
  }, []);

  const saveDilemma = async (dilemma: Partial<EthicalDilemma> & { dilemmaText: string }) => {
    try {
      await callAdminApi('dilemmas-save', {
        id: dilemma.id,
        data: {
          dilemma_text: dilemma.dilemmaText,
          likert_scale_type: 5,
          display_order: dilemma.displayOrder || 0,
          version_tag: dilemma.versionTag,
          is_active: dilemma.isActive ?? true,
        }
      });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const deleteDilemma = async (id: string) => {
    try {
      await callAdminApi('dilemmas-delete', { id });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  // Don't auto-fetch - let components decide based on auth state
  return { dilemmas, loading, fetchDilemmas, saveDilemma, deleteDilemma };
}

// Dashboard Stats Hook
export function useDashboardStats() {
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, declined: 0 });
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; status: string; timestamp: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setStats({ total: 0, completed: 0, inProgress: 0, declined: 0 });
    setRecentActivity([]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, recentActivity, loading, fetchStats };
}

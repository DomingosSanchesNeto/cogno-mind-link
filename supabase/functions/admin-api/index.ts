import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, password, format, selectedData, data, id } = await req.json();

    // Admin password from environment variable (no fallback)
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============ STATS ============
    if (action === 'stats') {
      const { data: participants, error } = await supabase
        .from('participants')
        .select('id, status, started_at');

      if (error) throw error;

      const stats = {
        total: participants?.length || 0,
        completed: participants?.filter(p => p.status === 'completed').length || 0,
        inProgress: participants?.filter(p => p.status === 'in_progress').length || 0,
        declined: participants?.filter(p => p.status === 'declined').length || 0,
      };

      const { data: recentData } = await supabase
        .from('participants')
        .select('id, status, started_at')
        .order('started_at', { ascending: false })
        .limit(10);

      const recentActivity = recentData?.map(p => ({
        id: p.id,
        status: p.status,
        timestamp: p.started_at,
      })) || [];

      return new Response(
        JSON.stringify({ stats, recentActivity }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============ EXPORT ============
    if (action === 'export') {
      const exportData: Record<string, unknown[]> = {};

      if (selectedData?.participants) {
        const { data } = await supabase.from('participants').select('*');
        exportData.participants = data || [];
      }

      if (selectedData?.sociodemographic) {
        const { data } = await supabase.from('sociodemographic_data').select('*');
        exportData.sociodemographic = data || [];
      }

      if (selectedData?.autResponses) {
        const { data } = await supabase.from('aut_responses').select('*');
        exportData.autResponses = data || [];
      }

      if (selectedData?.fiqResponses) {
        const { data } = await supabase.from('fiq_responses').select('*');
        exportData.fiqResponses = data || [];
      }

      if (selectedData?.dilemmaResponses) {
        const { data } = await supabase.from('dilemma_responses').select('*');
        exportData.dilemmaResponses = data || [];
      }

      if (selectedData?.timestamps) {
        const { data } = await supabase.from('screen_timestamps').select('*');
        exportData.timestamps = data || [];
      }

      if (format === 'csv') {
        const csvSections: string[] = [];
        
        for (const [key, rows] of Object.entries(exportData)) {
          if (rows.length > 0) {
            const headers = Object.keys(rows[0] as Record<string, unknown>);
            const csvRows = rows.map(row => 
              headers.map(h => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(',')
            );
            csvSections.push(`# ${key}\n${headers.join(',')}\n${csvRows.join('\n')}`);
          }
        }

        return new Response(
          csvSections.join('\n\n'),
          { headers: { ...corsHeaders, 'Content-Type': 'text/csv' } }
        );
      }

      return new Response(
        JSON.stringify(exportData, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============ TCLE CRUD ============
    if (action === 'tcle-list') {
      const { data, error } = await supabase
        .from('tcle_config')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'tcle-save') {
      // Deactivate all if this one is active
      if (data.is_active) {
        await supabase.from('tcle_config').update({ is_active: false }).eq('is_active', true);
      }

      let result;
      if (id) {
        result = await supabase.from('tcle_config')
          .update({
            content: data.content,
            file_url: data.file_url,
            version_tag: data.version_tag,
            is_active: data.is_active,
          })
          .eq('id', id)
          .select()
          .single();
      } else {
        result = await supabase.from('tcle_config')
          .insert({
            content: data.content,
            file_url: data.file_url,
            version_tag: data.version_tag,
            is_active: data.is_active,
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return new Response(JSON.stringify({ data: result.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============ AUT STIMULI CRUD ============
    if (action === 'aut-list') {
      const { data, error } = await supabase
        .from('aut_stimuli')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'aut-save') {
      const payload = {
        object_name: data.object_name,
        instruction_text: data.instruction_text,
        image_url: data.image_url,
        suggested_time_seconds: data.suggested_time_seconds || 180,
        display_order: data.display_order || 0,
        version_tag: data.version_tag,
        is_active: data.is_active ?? true,
      };

      let result;
      if (id) {
        result = await supabase.from('aut_stimuli').update(payload).eq('id', id).select().single();
      } else {
        result = await supabase.from('aut_stimuli').insert(payload).select().single();
      }

      if (result.error) throw result.error;
      return new Response(JSON.stringify({ data: result.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'aut-delete') {
      const { error } = await supabase.from('aut_stimuli').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============ FIQ STIMULI CRUD ============
    if (action === 'fiq-list') {
      const { data, error } = await supabase
        .from('fiq_stimuli')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'fiq-save') {
      const payload = {
        title: data.title,
        image_url: data.image_url,
        question_text: data.question_text,
        display_order: data.display_order || 0,
        version_tag: data.version_tag,
        is_active: data.is_active ?? true,
      };

      let result;
      if (id) {
        result = await supabase.from('fiq_stimuli').update(payload).eq('id', id).select().single();
      } else {
        result = await supabase.from('fiq_stimuli').insert(payload).select().single();
      }

      if (result.error) throw result.error;
      return new Response(JSON.stringify({ data: result.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'fiq-delete') {
      const { error } = await supabase.from('fiq_stimuli').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============ DILEMMAS CRUD ============
    if (action === 'dilemmas-list') {
      const { data, error } = await supabase
        .from('ethical_dilemmas')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'dilemmas-save') {
      const payload = {
        dilemma_text: data.dilemma_text,
        likert_scale_type: data.likert_scale_type || 5,
        display_order: data.display_order || 0,
        version_tag: data.version_tag,
        is_active: data.is_active ?? true,
      };

      let result;
      if (id) {
        result = await supabase.from('ethical_dilemmas').update(payload).eq('id', id).select().single();
      } else {
        result = await supabase.from('ethical_dilemmas').insert(payload).select().single();
      }

      if (result.error) throw result.error;
      return new Response(JSON.stringify({ data: result.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'dilemmas-delete') {
      const { error } = await supabase.from('ethical_dilemmas').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

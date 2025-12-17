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

    const { action, password, format, selectedData } = await req.json();

    // Simple admin password check (in production, use proper auth)
    const adminPassword = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
    if (password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'stats') {
      // Get participant stats
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

      // Get recent activity
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
        // Convert to CSV format
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

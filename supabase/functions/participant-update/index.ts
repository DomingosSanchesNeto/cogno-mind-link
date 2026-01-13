import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { participantId, dbParticipantId, status, completedAt } = body;

    // Validate required fields
    if (!participantId || !dbParticipantId) {
      console.log('Missing required fields:', { participantId, dbParticipantId });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: participantId and dbParticipantId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate status value
    const validStatuses = ['in_progress', 'completed', 'declined'];
    if (!status || !validStatuses.includes(status)) {
      console.log('Invalid status:', status);
      return new Response(
        JSON.stringify({ error: 'Invalid status. Must be one of: in_progress, completed, declined' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the participant exists AND matches the provided participantId
    // This prevents unauthorized updates - client must know both dbParticipantId AND participantId
    const { data: existingParticipant, error: fetchError } = await supabase
      .from('participants')
      .select('id, participant_id, status')
      .eq('id', dbParticipantId)
      .eq('participant_id', participantId)
      .single();

    if (fetchError || !existingParticipant) {
      console.log('Participant not found or ID mismatch:', { dbParticipantId, participantId, fetchError });
      return new Response(
        JSON.stringify({ error: 'Participant not found or ID mismatch' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent modifying already completed/declined participants
    if (existingParticipant.status !== 'in_progress' && status === 'in_progress') {
      console.log('Cannot revert status to in_progress:', existingParticipant.status);
      return new Response(
        JSON.stringify({ error: 'Cannot revert participant status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the participant status using service role (bypasses RLS)
    const updateData: { status: string; completed_at?: string } = { status };
    if (completedAt && (status === 'completed' || status === 'declined')) {
      updateData.completed_at = completedAt;
    }

    const { error: updateError } = await supabase
      .from('participants')
      .update(updateData)
      .eq('id', dbParticipantId)
      .eq('participant_id', participantId);

    if (updateError) {
      console.error('Error updating participant:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update participant status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Participant status updated:', { dbParticipantId, status });
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Participant update error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

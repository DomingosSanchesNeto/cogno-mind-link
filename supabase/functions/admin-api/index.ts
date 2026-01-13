import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// JWT configuration
const JWT_EXPIRATION_HOURS = 2;

// Generate a crypto key from the admin password for JWT signing
async function getJwtKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Create a JWT token
async function createJwt(secret: string): Promise<string> {
  const key = await getJwtKey(secret);
  const jwt = await create(
    { alg: "HS256", typ: "JWT" },
    { 
      admin: true,
      exp: getNumericDate(JWT_EXPIRATION_HOURS * 60 * 60), // 2 hours from now
      iat: getNumericDate(0)
    },
    key
  );
  return jwt;
}

// Verify a JWT token
async function verifyJwt(token: string, secret: string): Promise<boolean> {
  try {
    const key = await getJwtKey(secret);
    const payload = await verify(token, key);
    return payload.admin === true;
  } catch (error) {
    console.log('JWT verification failed:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { action, password, token, format, selectedData, data, id } = body;

    // Admin password from environment variable
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============ LOGIN - returns JWT token ============
    if (action === 'login') {
      if (password !== adminPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate JWT token
      const jwtToken = await createJwt(adminPassword);
      console.log('Admin login successful, JWT generated');
      
      return new Response(
        JSON.stringify({ success: true, token: jwtToken }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============ ALL OTHER ACTIONS - require valid JWT ============
    // Validate JWT token - no password fallback for security
    let isAuthenticated = false;
    
    if (token) {
      isAuthenticated = await verifyJwt(token, adminPassword);
    }

    if (!isAuthenticated) {
      console.log('Authentication failed: Invalid or missing JWT token');
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

    // ============ FILE UPLOAD ============
    if (action === 'upload') {
      const { fileData, fileName, fileType, fileSize, path: uploadPath } = body;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(fileType)) {
        return new Response(
          JSON.stringify({ error: 'Tipo de arquivo não permitido. Use: JPEG, PNG, GIF, WebP, PDF ou Word.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (fileSize > maxSize) {
        return new Response(
          JSON.stringify({ error: 'Arquivo muito grande. Tamanho máximo: 10MB.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate path
      const allowedPaths = ['tcle', 'aut-stimuli', 'fiq-stimuli'];
      if (!allowedPaths.includes(uploadPath)) {
        return new Response(
          JSON.stringify({ error: 'Caminho de upload inválido.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Decode base64 file data
        const base64Data = fileData.split(',')[1] || fileData;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Generate unique filename
        const fileExt = fileName.split('.').pop();
        const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${uploadPath}/${uniqueFileName}`;

        // Upload using service role (bypasses RLS)
        const { error: uploadError } = await supabase.storage
          .from('experiment-files')
          .upload(filePath, bytes, {
            contentType: fileType,
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return new Response(
            JSON.stringify({ error: 'Falha ao fazer upload do arquivo.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('experiment-files')
          .getPublicUrl(filePath);

        console.log('File uploaded successfully:', filePath);
        return new Response(
          JSON.stringify({ url: publicUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (uploadError) {
        console.error('Upload processing error:', uploadError);
        return new Response(
          JSON.stringify({ error: 'Erro ao processar arquivo.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse({ error: 'Missing Supabase function secrets' }, 500)
    }

    const authHeader = req.headers.get('Authorization') ?? ''
    const accessToken = authHeader.replace('Bearer ', '').trim()
    if (!accessToken) {
      return jsonResponse({ error: 'Missing Authorization bearer token' }, 401)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: requesterData, error: requesterError } = await userClient.auth.getUser(accessToken)
    if (requesterError || !requesterData?.user) {
      return jsonResponse({ error: 'Invalid session' }, 401)
    }

    const requesterRole = requesterData.user.user_metadata?.role ?? requesterData.user.app_metadata?.role
    if (requesterRole !== 'admin') {
      return jsonResponse({ error: 'Only admin users can delete accounts' }, 403)
    }

    const body = await req.json().catch(() => ({}))
    const email = String(body.email ?? '').trim().toLowerCase()
    const userId = String(body.userId ?? '').trim()

    if (!email && !userId) {
      return jsonResponse({ error: 'Missing email or userId' }, 400)
    }

    let targetUserId = userId

    if (!targetUserId) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (error) {
        return jsonResponse({ error: error.message }, 500)
      }

      const target = data.users.find((user) => String(user.email ?? '').toLowerCase() === email)
      if (!target) {
        return jsonResponse({ deleted: false, notFound: true, message: 'User not found in Supabase Auth' }, 200)
      }

      targetUserId = target.id
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId)
    if (deleteError) {
      return jsonResponse({ error: deleteError.message }, 500)
    }

    return jsonResponse({ deleted: true, userId: targetUserId }, 200)
  } catch (error) {
    return jsonResponse({ error: error?.message ?? 'Unexpected delete-user error' }, 500)
  }
})

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

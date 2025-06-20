/**
 * ping/index.ts – Health check Edge Function
 * Simple ping endpoint to verify Supabase Edge Functions are working
 * 
 * @supabase Edge Function
 * @method GET
 * @auth none required
 */

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Ping function initialized!")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const data = {
      ok: true,
      message: 'Writing Assistant API is online',
      timestamp: new Date().toISOString(),
      method: req.method,
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        } 
      },
    )
  } catch (error) {
    console.error('Ping function error:', error)
    
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        } 
      },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/ping'

*/

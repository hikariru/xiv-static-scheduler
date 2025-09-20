import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ulid } from 'https://deno.land/x/ulid@v0.3.0/mod.ts'
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Generate ULID token (lowercase)
function generateUrlToken(): string {
  return ulid().toLowerCase()
}

// Calculate next Tuesday to Monday period
function getNextWeekDates(): { startDate: string; endDate: string } {
  const now = new Date()
  
  // Find next Tuesday (0 = Sunday, 1 = Monday, 2 = Tuesday, etc.)
  const dayOfWeek = now.getDay()
  let daysUntilTuesday: number
  
  if (dayOfWeek === 0) { // Sunday
    daysUntilTuesday = 2
  } else if (dayOfWeek === 1) { // Monday  
    daysUntilTuesday = 1
  } else if (dayOfWeek === 2) { // Tuesday - get next Tuesday
    daysUntilTuesday = 7
  } else { // Wednesday to Saturday
    daysUntilTuesday = 9 - dayOfWeek // (7 - dayOfWeek + 2)
  }
  
  const startDate = new Date(now)
  startDate.setDate(now.getDate() + daysUntilTuesday)
  
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6) // Tuesday to Monday (6 days later)
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Generate new week data
    const { startDate, endDate } = getNextWeekDates()
    const urlToken = generateUrlToken()

    console.log(`Creating week: ${startDate} to ${endDate} with token: ${urlToken}`)

    // Insert new week into database
    const { data: newWeek, error: dbError } = await supabase
      .from('weeks')
      .insert({
        start_date: startDate,
        end_date: endDate,
        url_token: urlToken,
        is_active: true
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database Error: ${dbError.message}`)
    }

    // Send Discord notification
    const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL')
    
    if (discordWebhookUrl) {
      const discordMessage = {
        content: `📅 **新しい週間スケジュールが作成されました！**\n\n` +
                `📆 期間: ${startDate} (火) 〜 ${endDate} (月)\n` +
                `🔗 URL: https://your-domain.com/schedule/${urlToken}/[participant_id]\n\n` +
                `皆さん、予定を入力してください！`
      }

      const webhookResponse = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordMessage),
      })

      if (!webhookResponse.ok) {
        console.error(`Discord notification failed: ${webhookResponse.statusText}`)
      } else {
        console.log('Discord notification sent successfully')
      }
    } else {
      console.warn('DISCORD_WEBHOOK_URL not set, skipping notification')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        week: newWeek,
        message: `Week created: ${startDate} to ${endDate}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

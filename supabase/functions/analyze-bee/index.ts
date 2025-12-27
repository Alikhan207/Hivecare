import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  imageBase64: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { imageBase64 }: AnalyzeRequest = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Analyzing bee image...');

    const systemPrompt = `You are HiveCare's AI bee identification system, specialized in identifying Indian honey bee species, particularly Apis dorsata (Giant Rock Bee).

Your task is to analyze the image and provide:
1. Species identification with confidence percentage
2. Behavior assessment (calm, agitated, or shimmering)
3. Safety recommendations
4. Conservation insights

SPECIES IDENTIFICATION CRITERIA:
- Apis dorsata (Rock Bee): Large size (17-20mm), open single-comb nests on cliffs/buildings, broad yellow abdominal bands
- Apis cerana (Indian Hive Bee): Medium size (10-11mm), cavity nesting, darker coloration
- Apis florea (Dwarf Bee): Small size (7-8mm), small exposed combs in shrubs
- Apis mellifera (European Bee): Medium size, usually in managed hives/boxes

BEHAVIOR INDICATORS:
- Calm: Bees moving slowly, no defensive patterns
- Agitated: Rapid movement, guard bees visible
- Shimmering: Visible wave pattern across colony (defensive display unique to Apis dorsata)

IMPORTANT: Always provide safety-first recommendations. If you detect Apis dorsata or shimmering behavior, emphasize maintaining safe distance (minimum 20 feet/6 meters).

Respond in JSON format:
{
  "species": "apis_dorsata" | "apis_cerana" | "apis_florea" | "apis_mellifera" | "unknown",
  "speciesName": "Human readable species name",
  "confidence": 0-100,
  "behavior": "calm" | "agitated" | "shimmering" | "unknown",
  "behaviorDescription": "Description of observed behavior",
  "safetyLevel": "safe" | "caution" | "danger",
  "safetyMessage": "Safety recommendation for the user",
  "proximityWarning": true/false,
  "recommendedDistance": "Distance in meters",
  "conservationNote": "Brief conservation insight about this species",
  "explainability": "Why you identified this species (features observed)"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'Analyze this image for bee species identification and behavior assessment. Provide your analysis in the specified JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    console.log('AI Response received:', content);

    // Parse the JSON from the AI response
    let analysis;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      analysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a default response if parsing fails
      analysis = {
        species: 'unknown',
        speciesName: 'Unable to identify',
        confidence: 0,
        behavior: 'unknown',
        behaviorDescription: 'Unable to assess behavior from this image.',
        safetyLevel: 'caution',
        safetyMessage: 'Exercise caution around any bee colony. Maintain a safe distance.',
        proximityWarning: true,
        recommendedDistance: '6 meters',
        conservationNote: 'All bees are important pollinators. Consider ethical relocation over extermination.',
        explainability: 'Image analysis was inconclusive.'
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-bee function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

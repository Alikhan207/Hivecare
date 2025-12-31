import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  imageBase64: string;
  hasHiveOverview?: boolean;
  hasBeeCloseup?: boolean;
  hasWideAngle?: boolean;
  location?: { lat: number; lng: number } | null;
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

    const { imageBase64, hasHiveOverview, hasBeeCloseup, hasWideAngle, location }: AnalyzeRequest = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Analyzing bee image, base64 length:', imageBase64.length);
    console.log('Context - hasHiveOverview:', hasHiveOverview, 'hasBeeCloseup:', hasBeeCloseup, 'hasWideAngle:', hasWideAngle);
    if (location) {
      console.log('Location provided:', location);
    }

    const systemPrompt = `You are HiveCare's expert AI bee identification system, specialized in identifying Indian honey bee species with focus on Apis dorsata (Rock Bee / Giant Rock Bee).

YOUR PRIMARY TASK: Determine if the image shows a ROCK BEE (Apis dorsata) or something else.

## SPECIES IDENTIFICATION CRITERIA

**Apis dorsata (Rock Bee) - PRIMARY TARGET**
- Size: LARGE (17-20mm body length) - largest of Indian honey bees
- Nesting: Single OPEN comb, never in cavities, always exposed
- Location: HIGH ELEVATIONS - building facades (3+ floors), water towers, bridges, tall trees, rock overhangs
- Color: Distinct yellow-brown bands with darker stripes, golden-amber appearance
- Behavior: Can show "shimmering" wave defense, generally defensive if disturbed

**Apis cerana (Indian Hive Bee)**
- Size: MEDIUM (10-11mm) - noticeably smaller than Rock Bee
- Nesting: Multiple combs INSIDE cavities (tree hollows, wall cavities, hive boxes)
- Color: Darker, less prominent banding

**Apis florea (Dwarf Bee)**
- Size: SMALL (7-8mm) - smallest Indian honey bee
- Nesting: Small single comb in LOW bushes/shrubs (under 3 meters height)
- Color: Reddish-brown

**Apis mellifera (European/Western Bee)**
- Size: MEDIUM (12-15mm)
- Nesting: Usually in managed wooden hive boxes
- Color: Variable, often golden-yellow stripes

## IF NOT A BEE
If the image does NOT show bees, identify what the object IS:
- Examples: wasp, hornet, fly, ant, bird, building, tree, random object, etc.
- Be specific in identification

## CONFIDENCE SCORING BREAKDOWN
Provide separate scores (0-100) for:
- sizeMatch: How well does observed size match Rock Bee (17-20mm)?
- colorPattern: Does it show the characteristic yellow-brown banding?
- nestingStyle: Is it an open single comb (high = Rock Bee indicator)?
- altitudeIndicator: Is location elevated (high building, tall tree, cliff)?

## BEHAVIOR ASSESSMENT
- calm: Bees moving slowly, normal activity
- agitated: Rapid movement, guard bees visible, buzzing intensifies
- shimmering: Mexican wave pattern across colony surface (Rock Bee defense)
- unknown: Cannot determine from image

## SAFETY LEVELS
- safe: Small colony, calm bees, low elevation (3+ meters safe distance okay)
- caution: Medium colony, some activity, moderate elevation (maintain 6+ meters)
- danger: Large colony, agitated/shimmering, high elevation, near human activity (stay 10+ meters, do not disturb)

## RESPONSE FORMAT (JSON)
{
  "isRockBee": true/false,
  "species": "apis_dorsata" | "apis_cerana" | "apis_florea" | "apis_mellifera" | "other_bee" | "not_a_bee" | "unknown",
  "speciesName": "Human readable full name (e.g., 'Giant Rock Bee (Apis dorsata)')",
  "identifiedObject": "If not a bee, what is the object? Otherwise null",
  "confidence": 0-100 (overall confidence),
  "confidenceBreakdown": {
    "sizeMatch": 0-100,
    "colorPattern": 0-100,
    "nestingStyle": 0-100,
    "altitudeIndicator": 0-100
  },
  "explainabilityDetails": [
    "Reason 1 for this identification",
    "Reason 2...",
    "Reason 3..."
  ],
  "behavior": "calm" | "agitated" | "shimmering" | "unknown",
  "behaviorDescription": "Detailed description of observed behavior",
  "safetyLevel": "safe" | "caution" | "danger",
  "safetyMessage": "Clear safety advice for the user",
  "proximityWarning": true/false,
  "recommendedDistance": "Distance in meters",
  "conservationNote": "Brief conservation insight - Rock Bees produce 80% of wild honey in India, consider ethical relocation over extermination"
}

IMPORTANT: 
- If you cannot clearly identify bees in the image, set isRockBee to false and species to "unknown" or "not_a_bee"
- Always prioritize human safety in your recommendations
- Be specific in explainability - cite visual features you observed
- Rock Bees are PROTECTED - always recommend ethical relocation, never extermination`;

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
                text: `Analyze this image for Rock Bee (Apis dorsata) identification. 

Image context:
- This is ${hasBeeCloseup ? 'a close-up of bees' : hasHiveOverview ? 'an overview of a hive/colony' : hasWideAngle ? 'a wide angle showing location/altitude' : 'a general capture'}
${location ? `- GPS coordinates: ${location.lat}, ${location.lng}` : '- No GPS data available'}

Provide your complete analysis in the specified JSON format. Be thorough in your explainability details - explain WHY you made this identification based on visual features you can observe.`
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
        max_tokens: 2048,
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
    
    console.log('AI Response received, length:', content?.length);

    // Parse the JSON from the AI response
    let analysis;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      analysis = JSON.parse(jsonStr.trim());
      console.log('Successfully parsed AI response');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', content);
      // Return a default response if parsing fails
      analysis = {
        isRockBee: false,
        species: 'unknown',
        speciesName: 'Unable to Identify',
        identifiedObject: 'Could not analyze image content',
        confidence: 0,
        confidenceBreakdown: {
          sizeMatch: 0,
          colorPattern: 0,
          nestingStyle: 0,
          altitudeIndicator: 0
        },
        explainabilityDetails: [
          'Image analysis was inconclusive',
          'Please try capturing a clearer image',
          'Ensure good lighting and focus on the bees'
        ],
        behavior: 'unknown',
        behaviorDescription: 'Unable to assess behavior from this image.',
        safetyLevel: 'caution',
        safetyMessage: 'Exercise caution around any bee colony. Maintain a safe distance of at least 6 meters.',
        proximityWarning: true,
        recommendedDistance: '6 meters',
        conservationNote: 'All bees are important pollinators. If you need removal, consider ethical relocation services rather than extermination.'
      };
    }

    // Ensure all required fields exist with defaults
    analysis = {
      isRockBee: analysis.isRockBee ?? false,
      species: analysis.species ?? 'unknown',
      speciesName: analysis.speciesName ?? 'Unknown Species',
      identifiedObject: analysis.identifiedObject ?? null,
      confidence: analysis.confidence ?? 0,
      confidenceBreakdown: analysis.confidenceBreakdown ?? null,
      explainabilityDetails: analysis.explainabilityDetails ?? [],
      behavior: analysis.behavior ?? 'unknown',
      behaviorDescription: analysis.behaviorDescription ?? 'Unable to assess behavior.',
      safetyLevel: analysis.safetyLevel ?? 'caution',
      safetyMessage: analysis.safetyMessage ?? 'Maintain safe distance from any bee colony.',
      proximityWarning: analysis.proximityWarning ?? true,
      recommendedDistance: analysis.recommendedDistance ?? '6 meters',
      conservationNote: analysis.conservationNote ?? 'Bees are essential pollinators. Consider ethical relocation.',
      explainability: analysis.explainabilityDetails?.join('. ') || analysis.explainability || 'Analysis complete.'
    };

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

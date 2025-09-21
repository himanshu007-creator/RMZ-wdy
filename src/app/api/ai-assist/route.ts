import { NextRequest, NextResponse } from 'next/server';
import { AIContentRequest, AIContentResponse, validateAIRequest, generateFallbackContent, getVendorPrompt } from '@/lib/ai-service';

/**
 * OpenRouter API configuration
 */
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Default model to use for content generation
 */
const DEFAULT_MODEL = 'anthropic/claude-3-haiku';

/**
 * Generates contract content using OpenRouter API
 * @param request - AI content generation request
 * @returns Promise resolving to generated content
 */
async function generateWithOpenRouter(request: AIContentRequest): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const vendorPrompt = getVendorPrompt(request.vendorType);
  
  const systemPrompt = `You are a professional contract writer specializing in wedding and event services. Create a comprehensive, legally-appropriate contract using the exact details provided below.

${vendorPrompt}

IMPORTANT: Use these EXACT details in the contract (do not use placeholders):
- Vendor Business Name: ${request.vendorName}
- Client Name: ${request.clientName}
- Event Date: ${new Date(request.eventDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}
- Event Venue: ${request.eventVenue}
- Service Package: ${request.servicePackage}
- Total Amount: ${request.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}

Requirements:
1. Use the EXACT names, dates, venues, and amounts provided above
2. Create a professional contract title that reflects the service type
3. Include comprehensive terms and conditions appropriate for the service
4. Add payment terms with a typical 50% deposit structure
5. Include cancellation, rescheduling, and force majeure clauses
6. Add liability and insurance considerations
7. Include service-specific details based on the package description
8. Make it legally sound and professional
9. Format it clearly with proper sections and headings
10. Do NOT include signature lines or signature sections at the end

Generate a complete, ready-to-use contract that incorporates all these specific details without any placeholder text or signature sections.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Wedding Vendor Contract Builder'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Generate a professional ${request.vendorType} contract for the wedding/event services described above. Make sure to use all the exact details provided and create comprehensive terms appropriate for this type of service.`
        }
      ],
      max_tokens: 3000,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format from OpenRouter API');
  }

  return data.choices[0].message.content;
}

/**
 * POST /api/ai-assist
 * Generates AI-powered contract content based on vendor type and contract details
 */
export async function POST(request: NextRequest): Promise<NextResponse<AIContentResponse>> {
  try {
    const body: Partial<AIContentRequest> = await request.json();
    
    // Validate request data
    const validation = validateAIRequest(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      }, { status: 400 });
    }

    const aiRequest = body as AIContentRequest;

    try {
      // Attempt to generate content with OpenRouter
      const content = await generateWithOpenRouter(aiRequest);
      
      return NextResponse.json({
        success: true,
        content,
        isFallback: false
      });
    } catch (aiError) {
      console.error('OpenRouter API failed, using fallback:', aiError);
      
      // Use fallback content if AI fails
      const fallbackContent = generateFallbackContent(aiRequest);
      
      return NextResponse.json({
        success: true,
        content: fallbackContent,
        isFallback: true
      });
    }
  } catch (error) {
    console.error('AI assist API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate contract content'
    }, { status: 500 });
  }
}

/**
 * GET /api/ai-assist
 * Returns API status and configuration info
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: {
      status: 'AI Assist API is running',
      hasApiKey: !!OPENROUTER_API_KEY,
      model: DEFAULT_MODEL
    }
  });
}
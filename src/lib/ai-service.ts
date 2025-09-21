import { User } from "@/types";

/**
 * AI content generation request interface
 */
export interface AIContentRequest {
  /** Type of vendor requesting content */
  vendorType: User["vendorType"];
  /** Client name for personalization */
  clientName: string;
  /** Event date for contract */
  eventDate: string;
  /** Event venue for contract */
  eventVenue: string;
  /** Service package description */
  servicePackage: string;
  /** Contract amount */
  amount: number;
  /** Vendor name for personalization */
  vendorName: string;
}

/**
 * AI content generation response interface
 */
export interface AIContentResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Generated contract content */
  content?: string;
  /** Error message if unsuccessful */
  error?: string;
  /** Whether this is fallback content */
  isFallback?: boolean;
}

/**
 * Vendor-specific prompts for AI content generation
 */
const VENDOR_PROMPTS = {
  photographer: `As a professional wedding/event photographer, create a comprehensive contract that covers:

CORE SERVICES:
- Photography coverage for weddings, engagements, receptions, or other events
- Digital image capture and professional editing
- Various photography styles (candid, posed, artistic, documentary)
- Coverage duration and specific event moments

DELIVERABLES:
- High-resolution digital images
- Online gallery access
- Print release and usage rights
- Delivery timeline (typically 4-8 weeks)
- Number of edited images included

BUSINESS TERMS:
- Equipment backup and contingency plans
- Second photographer availability if needed
- Travel considerations for destination events
- Weather contingencies for outdoor events
- Copyright retention and client usage rights
- Social media and portfolio usage permissions

PROFESSIONAL STANDARDS:
- Dress code and professional conduct
- Coordination with other vendors
- Shot list and special requests accommodation
- Post-processing and editing standards`,

  caterer: `As a professional wedding/event caterer, create a comprehensive contract that covers:

CORE SERVICES:
- Catering for weddings, receptions, corporate events, or private parties
- Menu planning and food preparation
- Service styles (plated, buffet, family-style, cocktail reception)
- Staffing for service, setup, and cleanup

MENU & SERVICE:
- Detailed menu descriptions and options
- Guest count requirements and final headcount deadlines
- Dietary restrictions and special accommodations
- Bar service and beverage packages if applicable
- Cake cutting and dessert service

BUSINESS TERMS:
- Kitchen facilities and equipment requirements
- Venue coordination and setup logistics
- Food safety certifications and health permits
- Liability insurance and alcohol service considerations
- Gratuity and service charge policies
- Linen, tableware, and equipment rental coordination

LOGISTICS:
- Delivery, setup, and breakdown timelines
- Vendor meal provisions
- Weather contingencies for outdoor events
- Parking and access requirements`,

  florist: `As a professional wedding/event florist, create a comprehensive contract that covers:

CORE SERVICES:
- Floral design for weddings, events, or special occasions
- Bridal bouquets, boutonnieres, and personal flowers
- Ceremony decorations and altar arrangements
- Reception centerpieces and ambient floral design

DESIGN & DELIVERY:
- Specific flower types, colors, and design styles
- Seasonal availability and substitution policies
- Delivery, setup, and breakdown services
- Venue coordination and installation requirements
- Preservation services for bridal bouquet if offered

BUSINESS TERMS:
- Design consultation and approval process
- Weather considerations for outdoor events
- Flower care instructions and longevity expectations
- Rental items (vases, stands, arches) if applicable
- Cleanup and removal of floral materials

LOGISTICS:
- Access requirements for venue setup
- Coordination with other vendors
- Timeline for delivery and installation
- Emergency contact information for event day
- Photography coordination for optimal presentation`,
} as const;

/**
 * Generates AI-powered contract content using OpenRouter API
 * @param request - AI content generation request
 * @returns Promise resolving to AI content response
 */
export async function generateAIContent(
  request: AIContentRequest
): Promise<AIContentResponse> {
  try {
    const response = await fetch("/api/ai-assist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AIContentResponse = await response.json();
    return result;
  } catch (error) {
    console.error("AI content generation failed:", error);

    // Return fallback content on error
    return {
      success: true,
      content: generateFallbackContent(request),
      isFallback: true,
    };
  }
}

/**
 * Generates fallback contract content using templates when AI is unavailable
 * @param request - AI content generation request
 * @returns Personalized contract content based on templates
 */
export function generateFallbackContent(request: AIContentRequest): string {
  const eventDate = new Date(request.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const amount = request.amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const depositAmount = (request.amount * 0.5).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const balanceAmount = (request.amount * 0.5).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  // Generate service-specific contract based on vendor type
  switch (request.vendorType) {
    case "photographer":
      return generatePhotographyContract(
        request,
        eventDate,
        amount,
        depositAmount,
        balanceAmount
      );
    case "caterer":
      return generateCateringContract(
        request,
        eventDate,
        amount,
        depositAmount,
        balanceAmount
      );
    case "florist":
      return generateFloralContract(
        request,
        eventDate,
        amount,
        depositAmount,
        balanceAmount
      );
    default:
      return generateGenericContract(
        request,
        eventDate,
        amount,
        depositAmount,
        balanceAmount
      );
  }
}

/**
 * Generates photography contract template
 */
function generatePhotographyContract(
  request: AIContentRequest,
  eventDate: string,
  amount: string,
  depositAmount: string,
  balanceAmount: string
): string {
  return `WEDDING PHOTOGRAPHY CONTRACT

This Wedding Photography Contract ("Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between ${
    request.vendorName
  } ("Photographer") and ${request.clientName} ("Client").

PHOTOGRAPHY SERVICES
Photographer agrees to provide professional photography services for Client's wedding event on ${eventDate} at ${
    request.eventVenue
  } ("Event"). Photographer will capture a comprehensive set of digital images documenting the wedding ceremony, reception, and other key moments as mutually agreed upon.

PACKAGE DETAILS
The photography package includes:
${request.servicePackage}

PAYMENT TERMS
The total fee for the photography services is ${amount}. A non-refundable retainer of 50% of the total (${depositAmount}) is due upon signing this Agreement. The remaining balance of ${balanceAmount} is due 30 days prior to the Event date.

CANCELLATION & RESCHEDULING
If Client needs to cancel or reschedule the Event, written notice must be provided to Photographer at least 90 days in advance. In the event of a cancellation, the retainer is non-refundable. Rescheduling is subject to Photographer's availability, and any date changes within 90 days of the Event may incur additional fees.

IMAGE DELIVERY
Photographer will deliver the final edited images to Client within 4-6 weeks following the Event. Images will be provided in high-resolution digital format via online gallery and USB drive.

COPYRIGHT & USAGE RIGHTS
Photographer retains the copyright to all images captured during the Event. Client is granted a non-exclusive license to use the delivered images for personal, non-commercial purposes, including printing, sharing on social media, and making digital copies. Any commercial use of the images requires written permission from Photographer.

BACKUP & CONTINGENCY
Photographer will bring backup camera equipment to the Event and will have contingency plans in place to ensure continuous coverage in the event of equipment failure or other unforeseen circumstances.

PROFESSIONAL CONDUCT
Photographer agrees to conduct themselves in a professional manner throughout the Event and to work collaboratively with Client and any other vendors or event staff. Client agrees to provide Photographer with reasonable access and cooperation to facilitate the photography services.

This Wedding Photography Contract constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter herein.`;
}

/**
 * Generates catering contract template
 */
function generateCateringContract(
  request: AIContentRequest,
  eventDate: string,
  amount: string,
  depositAmount: string,
  balanceAmount: string
): string {
  return `WEDDING CATERING CONTRACT

This Wedding Catering Contract ("Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between ${
    request.vendorName
  } ("Caterer") and ${request.clientName} ("Client").

CATERING SERVICES
Caterer agrees to provide professional catering services for Client's wedding event on ${eventDate} at ${
    request.eventVenue
  } ("Event"). Caterer will provide food preparation, service, and cleanup as specified in this agreement.

PACKAGE DETAILS
The catering package includes:
${request.servicePackage}

PAYMENT TERMS
The total fee for the catering services is ${amount}. A non-refundable deposit of 50% of the total (${depositAmount}) is due upon signing this Agreement. The remaining balance of ${balanceAmount} is due 14 days prior to the Event date.

GUEST COUNT & FINAL DETAILS
Client must provide final guest count and any dietary restrictions no later than 7 days prior to the Event. Any increase in guest count after this deadline may result in additional charges.

CANCELLATION & RESCHEDULING
If Client needs to cancel or reschedule the Event, written notice must be provided to Caterer at least 30 days in advance. In the event of a cancellation, the deposit is non-refundable. Rescheduling is subject to Caterer's availability.

SERVICE & SETUP
Caterer will arrive at the venue at the agreed-upon time for setup and food preparation. Service staff will be provided as part of the package. Cleanup of catering areas and removal of catering equipment is included in the service.

VENUE REQUIREMENTS
Client is responsible for ensuring the venue has adequate kitchen facilities, electrical power, and water access as required for the catering service. Any additional equipment rental costs will be discussed in advance.

LIABILITY & INSURANCE
Caterer maintains appropriate liability insurance and food service permits. Client agrees to hold Caterer harmless from any claims arising from the consumption of food and beverages served at the Event.

This Wedding Catering Contract constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter herein.`;
}

/**
 * Generates floral contract template
 */
function generateFloralContract(
  request: AIContentRequest,
  eventDate: string,
  amount: string,
  depositAmount: string,
  balanceAmount: string
): string {
  return `WEDDING FLORAL CONTRACT

This Wedding Floral Contract ("Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between ${
    request.vendorName
  } ("Florist") and ${request.clientName} ("Client").

FLORAL SERVICES
Florist agrees to provide professional floral design and delivery services for Client's wedding event on ${eventDate} at ${
    request.eventVenue
  } ("Event"). Services include design, preparation, delivery, and setup of floral arrangements as specified.

PACKAGE DETAILS
The floral package includes:
${request.servicePackage}

PAYMENT TERMS
The total fee for the floral services is ${amount}. A non-refundable deposit of 50% of the total (${depositAmount}) is due upon signing this Agreement. The remaining balance of ${balanceAmount} is due 14 days prior to the Event date.

DESIGN CONSULTATION
Florist will work with Client to finalize floral designs, color schemes, and specific flower selections. Any changes to the original design after final approval may result in additional charges.

DELIVERY & SETUP
Florist will deliver and set up all floral arrangements at the venue on the day of the Event. Setup time will be coordinated with the venue and other vendors. Florist will also handle breakdown and removal of rental items if applicable.

FLOWER AVAILABILITY
Florist will make every effort to provide the specific flowers requested. However, due to seasonal availability and market conditions, substitutions of similar flowers may be necessary. Client will be notified of any major substitutions in advance.

CARE & LONGEVITY
Fresh flowers are perishable and their longevity depends on environmental conditions. Florist cannot guarantee the condition of flowers beyond the Event day, especially in extreme weather conditions.

CANCELLATION & CHANGES
If Client needs to cancel or make significant changes to the floral order, written notice must be provided at least 14 days in advance. Cancellations within 14 days of the Event may result in partial or full forfeiture of the deposit.

This Wedding Floral Contract constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter herein.`;
}

/**
 * Generates generic contract template for other services
 */
function generateGenericContract(
  request: AIContentRequest,
  eventDate: string,
  amount: string,
  depositAmount: string,
  balanceAmount: string
): string {
  return `WEDDING VENDOR SERVICE CONTRACT

This Service Contract ("Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between ${
    request.vendorName
  } ("Vendor") and ${request.clientName} ("Client").

SERVICES PROVIDED
Vendor agrees to provide professional services for Client's wedding event on ${eventDate} at ${
    request.eventVenue
  } ("Event").

PACKAGE DETAILS
The service package includes:
${request.servicePackage}

PAYMENT TERMS
The total fee for the services is ${amount}. A deposit of 50% of the total (${depositAmount}) is due upon signing this Agreement. The remaining balance of ${balanceAmount} is due 30 days prior to the Event date.

CANCELLATION POLICY
If Client needs to cancel the Event, written notice must be provided to Vendor at least 30 days in advance. Cancellation fees may apply based on the timing of the cancellation notice.

PROFESSIONAL CONDUCT
Vendor agrees to provide services in a professional manner and to coordinate appropriately with other vendors and venue staff. Client agrees to provide reasonable access and cooperation to facilitate the services.

FORCE MAJEURE
Neither party shall be liable for any failure to perform due to circumstances beyond their reasonable control, including but not limited to acts of God, natural disasters, or government restrictions.

This Service Contract constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter herein.`;
}

/**
 * Gets the vendor-specific prompt for AI content generation
 * @param vendorType - Type of vendor
 * @returns Vendor-specific prompt string
 */
export function getVendorPrompt(vendorType: User["vendorType"]): string {
  return VENDOR_PROMPTS[vendorType];
}

/**
 * Validates AI content request data
 * @param request - AI content generation request
 * @returns Validation result with any errors
 */
export function validateAIRequest(request: Partial<AIContentRequest>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.vendorType) {
    errors.push("Vendor type is required");
  }

  if (!request.clientName?.trim()) {
    errors.push("Client name is required");
  }

  if (!request.eventDate) {
    errors.push("Event date is required");
  }

  if (!request.eventVenue?.trim()) {
    errors.push("Event venue is required");
  }

  if (!request.servicePackage?.trim()) {
    errors.push("Service package is required");
  }

  if (!request.amount || request.amount <= 0) {
    errors.push("Valid amount is required");
  }

  if (!request.vendorName?.trim()) {
    errors.push("Vendor name is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

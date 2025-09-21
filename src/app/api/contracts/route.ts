import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { validateNewContract } from '@/lib/validation';
import { Contract, ApiResponse, ValidationErrorResponse } from '@/types';

/**
 * GET /api/contracts
 * Retrieves all contracts for the authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Contract[]>>> {
  try {
    // Get user from session cookie
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const vendorId = session.id;

    // Fetch contracts for the vendor
    const contracts = await DataService.getContractsByVendor(vendorId);

    return NextResponse.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contracts
 * Creates a new contract for the authenticated user
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }> | ValidationErrorResponse>> {
  try {
    // Get user from session cookie
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const vendorId = session.id;

    // Parse request body
    const body = await request.json();
    const { clientName, eventDate, eventVenue, servicePackage, amount, content } = body;

    // Validate contract data
    const validation = validateNewContract({
      clientName,
      eventDate,
      eventVenue,
      servicePackage,
      amount,
      content
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          data: validation.errors 
        },
        { status: 400 }
      );
    }

    // Create contract
    const contractId = await DataService.createContract({
      vendorId,
      clientName,
      eventDate,
      eventVenue,
      servicePackage,
      amount: parseFloat(amount),
      content,
      status: 'draft'
    });

    return NextResponse.json({
      success: true,
      data: { id: contractId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}
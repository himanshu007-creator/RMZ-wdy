import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { validateContractData } from '@/lib/validation';
import { Contract, ApiResponse, ValidationErrorResponse } from '@/types';

/**
 * GET /api/contracts/[id]
 * Retrieves a specific contract by ID for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Contract>>> {
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
    const contractId = params.id;

    // Fetch contract
    const contract = await DataService.getContract(contractId);

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Verify contract belongs to the authenticated vendor
    if (contract.vendorId !== vendorId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contract
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/contracts/[id]
 * Updates a specific contract for the authenticated user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<void> | ValidationErrorResponse>> {
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
    const contractId = params.id;

    // Fetch existing contract to verify ownership and status
    const existingContract = await DataService.getContract(contractId);

    if (!existingContract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Verify contract belongs to the authenticated vendor
    if (existingContract.vendorId !== vendorId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Prevent editing signed contracts
    if (existingContract.status === 'signed') {
      return NextResponse.json(
        { success: false, error: 'Cannot edit signed contracts' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { clientName, eventDate, eventVenue, servicePackage, amount, content } = body;

    // Validate contract data (only validate provided fields)
    const updateData: Partial<Contract> = {};
    if (clientName !== undefined) updateData.clientName = clientName;
    if (eventDate !== undefined) updateData.eventDate = eventDate;
    if (eventVenue !== undefined) updateData.eventVenue = eventVenue;
    if (servicePackage !== undefined) updateData.servicePackage = servicePackage;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (content !== undefined) updateData.content = content;

    const validation = validateContractData(updateData);

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

    // Update contract
    await DataService.updateContract(contractId, updateData);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contracts/[id]
 * Deletes a specific contract for the authenticated user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<void>>> {
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
    const contractId = params.id;

    // Fetch existing contract to verify ownership
    const existingContract = await DataService.getContract(contractId);

    if (!existingContract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Verify contract belongs to the authenticated vendor
    if (existingContract.vendorId !== vendorId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Soft delete the contract
    await DataService.deleteContract(contractId);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
}
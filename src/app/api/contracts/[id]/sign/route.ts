import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { SignatureData, ApiResponse } from '@/types';

/**
 * POST /api/contracts/[id]/sign
 * Signs a contract with digital signature for the authenticated user
 */
export async function POST(
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

    // Check if contract is already signed
    if (existingContract.status === 'signed') {
      return NextResponse.json(
        { success: false, error: 'Contract is already signed' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, data } = body;

    // Validate signature data
    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature data' },
        { status: 400 }
      );
    }

    if (!['drawn', 'typed'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature type' },
        { status: 400 }
      );
    }

    // Create signature data
    const signatureData: SignatureData = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    // Save signature and update contract status
    await DataService.saveSignature(contractId, signatureData);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error signing contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign contract' },
      { status: 500 }
    );
  }
}
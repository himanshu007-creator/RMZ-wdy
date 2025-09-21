'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { MainLayout } from '@/components/layout/main-layout';
import { ContractEditForm } from '@/components/contracts/contract-edit-form';
import { useContractStore } from '@/stores/contract-store';
import { LoadingState } from '@/components/ui/loading-state';
import { Contract } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Edit Contract page - edit an existing draft contract
 */
function EditContractContent() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;
  const { contracts, fetchContracts, isLoading } = useContractStore();
  
  const [contract, setContract] = React.useState<Contract | null>(null);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  React.useEffect(() => {
    const loadContract = async () => {
      try {
        await fetchContracts();
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadContract();
  }, [fetchContracts]);

  React.useEffect(() => {
    if (contracts.length > 0) {
      const foundContract = contracts.find(c => c.id === contractId);
      setContract(foundContract || null);
    }
  }, [contracts, contractId]);

  // Redirect signed contracts to view page
  React.useEffect(() => {
    if (contract && contract.status === 'signed') {
      router.replace(`/contracts/${contractId}`);
    }
  }, [contract, router, contractId]);

  const handleFormSubmit = async (updatedContractId: string) => {
    await fetchContracts();
    router.push(`/contracts/${updatedContractId}`);
  };

  const handleFormCancel = () => {
    router.push(`/contracts/${contractId}`);
  };

  const handleSigningComplete = () => {
    router.push(`/contracts/${contractId}`);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isInitialLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <LoadingState size="lg" message="Loading contract..." />
        </div>
      </MainLayout>
    );
  }

  // Contract not found
  if (!contract) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Contract Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The contract you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button onClick={handleBackToDashboard}>
            Back to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Contract is signed - show redirecting message
  if (contract && contract.status === 'signed') {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <LoadingState size="lg" message="Redirecting to contract view..." />
        </div>
      </MainLayout>
    );
  }

  // Contract is deleted - cannot be edited
  if (contract.status === 'deleted') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Cannot Edit Deleted Contract</h2>
          <p className="text-muted-foreground mb-6">
            This contract has been deleted and cannot be modified.
          </p>
          <Button onClick={handleBackToDashboard}>
            Back to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Contract is draft - can be edited
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Contract</h1>
          <p className="text-muted-foreground">
            Update the contract details for {contract.clientName}
          </p>
        </div>

        <ContractEditForm
          contract={contract}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          onSigningComplete={handleSigningComplete}
        />
      </div>
    </MainLayout>
  );
}

export default function EditContractPage() {
  return (
    <AuthGuard>
      <EditContractContent />
    </AuthGuard>
  );
}
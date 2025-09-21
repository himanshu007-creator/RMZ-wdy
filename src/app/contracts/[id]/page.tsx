'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { MainLayout } from '@/components/layout/main-layout';
import { ContractViewer } from '@/components/contracts';
import { useContractStore } from '@/stores/contract-store';
import { LoadingState } from '@/components/ui/loading-state';
import { Contract } from '@/types';

/**
 * Contract View page - view a specific contract
 */
function ContractViewContent() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;
  const { contracts, fetchContracts, isLoading } = useContractStore();
  
  const [contract, setContract] = React.useState<Contract | null>(null);

  React.useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  React.useEffect(() => {
    if (contracts.length > 0) {
      const foundContract = contracts.find(c => c.id === contractId);
      setContract(foundContract || null);
    }
  }, [contracts, contractId]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleEdit = () => {
    // Only allow editing of draft contracts
    if (contract && contract.status === 'draft') {
      router.push(`/contracts/${contractId}/edit`);
    }
  };

  const handleSign = () => {
    router.push(`/contracts/${contractId}/sign`);
  };

  if (isLoading || !contract) {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <LoadingState size="lg" message="Loading contract..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ContractViewer
        contract={contract}
        onBack={handleBack}
        onEdit={handleEdit}
        onSign={handleSign}
      />
    </MainLayout>
  );
}

export default function ContractViewPage() {
  return (
    <AuthGuard>
      <ContractViewContent />
    </AuthGuard>
  );
}
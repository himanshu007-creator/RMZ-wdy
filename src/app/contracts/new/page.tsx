"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { ContractForm } from "@/components/contracts";
import { useContractStore } from "@/stores/contract-store";

/**
 * New Contract page - create a new contract
 */
function NewContractContent() {
  const router = useRouter();
  const { fetchContracts } = useContractStore();

  const handleFormSubmit = async (contractId: string) => {
    await fetchContracts();
    router.push(`/contracts/${contractId}`);
  };

  const handleFormCancel = () => {
    router.push("/dashboard");
  };

  return (
    <MainLayout>
      <ContractForm
        contract={null}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </MainLayout>
  );
}

export default function NewContractPage() {
  return (
    <AuthGuard>
      <NewContractContent />
    </AuthGuard>
  );
}

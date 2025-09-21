"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  MapPin,
  Eye,
  Edit,
  Download,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { useContractStore } from "@/stores/contract-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ContractStatusIndicator } from "@/components/ui/status-indicator";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { downloadContractPDF } from "@/lib/pdf-utils";
import { motion, AnimatePresence } from "framer-motion";
import { Contract } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Dashboard page component - shows statistics and contract list
 * Features sidebar navigation and main content area
 */
function DashboardContent() {
  const router = useRouter();
  const {
    contracts,
    fetchContracts,
    deleteContract,
    isLoading,
    statusFilter,
    searchQuery,
    setStatusFilter,
    setSearchQuery,
    getFilteredContracts,
  } = useContractStore();

  const [contractToDelete, setContractToDelete] =
    React.useState<Contract | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const filteredContracts = getFilteredContracts();

  // Calculate statistics
  const totalContracts = contracts.length;
  const signedContracts = contracts.filter((c) => c.status === "signed").length;
  const draftContracts = contracts.filter((c) => c.status === "draft").length;
  const totalValue = contracts
    .filter((c) => c.status === "signed")
    .reduce((sum, c) => sum + c.amount, 0);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "signed", label: "Signed" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewContract = (contract: Contract) => {
    router.push(`/contracts/${contract.id}`);
  };

  const handleEditContract = (contract: Contract) => {
    // Only allow editing of draft contracts
    if (contract.status === "draft") {
      console.log(
        "Navigating to edit page for contract:",
        contract.id,
        "Status:",
        contract.status
      );
      router.push(`/contracts/${contract.id}/edit`);
    } else {
      console.log("Cannot edit contract with status:", contract.status);
    }
  };

  const handleDeleteContract = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteContract(contractToDelete.id);
      if (success) {
        setIsDeleteDialogOpen(false);
        setContractToDelete(null);
        // Optionally show a success message
      }
    } catch (error) {
      console.error("Failed to delete contract:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setContractToDelete(null);
  };

  const handleDownloadPDF = async (contract: Contract, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadContractPDF(contract);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Stats skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-lg p-6 space-y-2 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            ))}
          </div>

          {/* Contracts skeleton */}
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-4 space-y-2 animate-pulse"
                >
                  <div className="h-5 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-48" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border rounded-lg p-6"
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Total Contracts
              </p>
            </div>
            <p className="text-2xl font-bold">{totalContracts}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border rounded-lg p-6"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-muted-foreground">
                Signed
              </p>
            </div>
            <p className="text-2xl font-bold">{signedContracts}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border rounded-lg p-6"
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <p className="text-sm font-medium text-muted-foreground">Draft</p>
            </div>
            <p className="text-2xl font-bold">{draftContracts}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border rounded-lg p-6"
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-muted-foreground">
                Total Value
              </p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </motion.div>
        </div>

        {/* Contracts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Contracts</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(value as "all" | "draft" | "signed")
              }
              className="w-full sm:w-48"
            />
          </div>

          {/* Contract List */}
          <AnimatePresence>
            {filteredContracts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No contracts found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first contract"}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredContracts.map((contract, index) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group border rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewContract(contract)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {contract.clientName}
                        </h3>
                        <div className="mt-1">
                          <ContractStatusIndicator
                            status={contract.status}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewContract(contract);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {contract.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditContract(contract);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDownloadPDF(contract, e)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContract(contract);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(contract.eventDate)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{contract.eventVenue}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium text-foreground">
                          {formatCurrency(contract.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium">Package:</span>{" "}
                      {contract.servicePackage}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          contract={contractToDelete}
          loading={isDeleting}
        />
      </div>
    </MainLayout>
  );
}

/**
 * Dashboard page wrapped with authentication guard
 */
export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  MapPin, 
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { Contract } from '@/types';
import { useContractStore } from '@/stores/contract-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ContractStatusIndicator } from '@/components/ui/status-indicator';
import { downloadContractPDF } from '@/lib/pdf-utils';
import { cn } from '@/lib/utils';

/**
 * Props for the ContractList component
 */
export interface ContractListProps {
  /** Function called when creating a new contract */
  onCreateContract: () => void;
  /** Function called when viewing a contract */
  onViewContract: (contract: Contract) => void;
  /** Function called when editing a contract */
  onEditContract: (contract: Contract) => void;
  /** Function called when deleting a contract */
  onDeleteContract: (contract: Contract) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Redesigned contract list component with clean, minimal design
 * Features responsive design, filtering, search, and smooth animations
 */
export const ContractList: React.FC<ContractListProps> = ({
  onCreateContract,
  onViewContract,
  onEditContract,
  onDeleteContract,
  className
}) => {
  const {
    isLoading,
    error,
    statusFilter,
    searchQuery,
    setStatusFilter,
    setSearchQuery,
    getFilteredContracts,
    clearError
  } = useContractStore();

  const contracts = getFilteredContracts();

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'signed', label: 'Signed' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDownloadPDF = async (contract: Contract, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadContractPDF(contract);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48 animate-pulse" />
            <div className="h-4 bg-muted rounded w-64 animate-pulse" />
          </div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse" />
        </div>

        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-muted rounded flex-1 animate-pulse" />
          <div className="h-10 bg-muted rounded w-48 animate-pulse" />
        </div>

        {/* List skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-20" />
                </div>
                <div className="h-8 bg-muted rounded w-16" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground">
            Manage your wedding vendor contracts
          </p>
        </div>
        
        <Button onClick={onCreateContract} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          New Contract
        </Button>
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
          onChange={(value) => setStatusFilter(value as 'all' | 'draft' | 'signed')}
          className="w-full sm:w-48"
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg"
        >
          <p className="text-destructive text-sm">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="mt-2 h-auto p-0 text-destructive hover:text-destructive"
          >
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Contract List */}
      <AnimatePresence>
        {contracts.length === 0 ? (
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
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first contract'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={onCreateContract}>
                <Plus className="w-4 h-4 mr-2" />
                Create Contract
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract, index) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="group border rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => onViewContract(contract)}
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
                        onViewContract(contract);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {contract.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditContract(contract);
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
                        onDeleteContract(contract);
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
                    <span className="font-medium text-foreground">{formatCurrency(contract.amount)}</span>
                  </div>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium">Package:</span> {contract.servicePackage}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
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
  Trash2
} from 'lucide-react';
import { Contract } from '@/types';
import { useContractStore } from '@/stores/contract-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ContractStatusIndicator } from '@/components/ui/status-indicator';
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
 * Contract list component with filtering, search, and animations
 * Features responsive design, mobile-first layout, and Framer Motion animations
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
    { value: 'all', label: 'All Contracts' },
    { value: 'draft', label: 'Draft' },
    { value: 'signed', label: 'Signed' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600">Manage your wedding vendor contracts</p>
        </div>
        
        <Button
          onClick={onCreateContract}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          New Contract
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as 'all' | 'draft' | 'signed')}
            placeholder="Filter by status"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-800">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Contract List */}
      {!isLoading && (
        <AnimatePresence>
          {contracts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No contracts found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first contract'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={onCreateContract} leftIcon={<Plus className="w-4 h-4" />}>
                  Create Contract
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {contracts.map((contract, index) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Contract Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {contract.clientName}
                          </h3>
                          <div className="mt-1">
                            <ContractStatusIndicator 
                              status={contract.status}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
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
                          <span>{formatCurrency(contract.amount)}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Package:</span> {contract.servicePackage}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewContract(contract)}
                        leftIcon={<Eye className="w-4 h-4" />}
                        className="flex-1 sm:flex-none"
                      >
                        <span className="block sm:hidden">View</span>
                        <span className="hidden sm:block">View</span>
                      </Button>

                      {contract.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditContract(contract)}
                          leftIcon={<Edit className="w-4 h-4" />}
                          className="flex-1 sm:flex-none"
                        >
                          <span className="block sm:hidden">Edit</span>
                          <span className="hidden sm:block">Edit</span>
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteContract(contract)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <span className="block sm:hidden">Delete</span>
                        <span className="hidden sm:block">Delete</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
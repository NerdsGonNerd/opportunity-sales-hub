import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Edit, Filter, Plus } from 'lucide-react';
import { mockOpportunities, mockStages, mockSources, mockTypes, mockProbabilities } from '@/data/mockData';
import { OpportunityFilters } from '@/components/OpportunityFilters';
import { OpportunityTable } from '@/components/OpportunityTable';
import { ColumnCustomizer } from '@/components/ColumnCustomizer';
import { BulkEditDialog } from '@/components/BulkEditDialog';
import { ChartJsBarChart } from '@/components/ChartJsBarChart';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface Opportunity {
  id: number;
  customerId: string;
  customerName: string;
  customerState: string;
  contactName: string;
  description: string;
  estimateRevenue: number | null;
  stageId: number;
  phaseId: number;
  typeId: number;
  probabilityOfClosingId: number | null;
  sourceId: number;
  isUrgent: boolean;
  estimateDeliveryMonth: number;
  estimateDeliveryYear: number;
  estimateCloseMonth: number;
  estimateCloseYear: number;
  enterDate: string;
  changeDate: string;
  divisionId: string;
  productGroups: Array<{
    products: Array<{
      isPrimary: boolean;
      serialNumber: string | null;
      baseModelId: string | null;
      description: string | null;
    }>;
  }>;
}

export interface Stage {
  id: number;
  name: string;
  phaseName: string;
}

export interface FilterConfig {
  field: string;
  operator: string;
  value: string;
}

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>({ field: 'stage', direction: 'asc' });
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'id', 'customerName', 'description', 'estimateRevenue', 'stage', 'type', 'isUrgent', 'estimateClose'
  ]);
  const [stageFilter, setStageFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showClosedOpportunities, setShowClosedOpportunities] = useState(false);

  // Terminal stage names (closed opportunities)
  const terminalStages = ['Won', 'Lost', 'No Deal', 'No Lead'];

  // Define helper functions using useCallback to ensure stable references
  const getProductData = useCallback((opportunity: Opportunity) => {
    const primaryProduct = opportunity.productGroups
      .flatMap(group => group.products)
      .find(product => product.isPrimary);
    
    return {
      serialNumber: primaryProduct?.serialNumber || '',
      baseModel: primaryProduct?.baseModelId || '',
      model: primaryProduct?.description || ''
    };
  }, []);

  const getFieldValue = useCallback((opportunity: Opportunity, field: string) => {
    const productData = getProductData(opportunity);
    
    switch (field) {
      case 'stage':
        const stage = mockStages.find(s => s.id === opportunity.stageId);
        return stage ? stage.id.toString() : ''; // Return ID as string for sorting
      case 'type':
        return mockTypes.find(t => t.id === opportunity.typeId)?.name || '';
      case 'probability':
        return mockProbabilities.find(p => p.id === opportunity.probabilityOfClosingId)?.name || '';
      case 'source':
        return mockSources.find(s => s.id === opportunity.sourceId)?.name || '';
      case 'serialNumber':
        return productData.serialNumber;
      case 'baseModel':
        return productData.baseModel;
      case 'model':
        return productData.model;
      case 'estimateDelivery':
        return `${opportunity.estimateDeliveryMonth}/${opportunity.estimateDeliveryYear}`;
      case 'estimateClose':
        return `${opportunity.estimateCloseMonth}/${opportunity.estimateCloseYear}`;
      default:
        return opportunity[field as keyof Opportunity] || '';
    }
  }, [getProductData]);

  // Filter opportunities by closed state first
  const baseFilteredOpportunities = useMemo(() => {
    if (showClosedOpportunities) {
      return opportunities;
    }
    
    return opportunities.filter(opp => {
      const stage = mockStages.find(s => s.id === opp.stageId);
      return stage && !terminalStages.includes(stage.name);
    });
  }, [opportunities, showClosedOpportunities, terminalStages]);

  // Calculate stage counts for bar chart from base filtered opportunities
  const stageData = useMemo(() => {
    console.log('Calculating stage data from opportunities:', baseFilteredOpportunities.length);
    
    const stageCounts = mockStages.map(stage => {
      const count = baseFilteredOpportunities.filter(opp => opp.stageId === stage.id).length;
      console.log(`Stage ${stage.name} (ID: ${stage.id}): ${count} opportunities`);
      return {
        id: stage.id,
        name: stage.name,
        count: count
      };
    });
    
    // Filter out stages with zero opportunities and sort by ID
    const filteredStages = stageCounts
      .filter(stage => stage.count > 0)
      .sort((a, b) => a.id - b.id);
    
    console.log('Final stage data (filtered and sorted by ID):', filteredStages);
    return filteredStages;
  }, [baseFilteredOpportunities]);

  // Apply filters and sorting to base filtered opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = [...baseFilteredOpportunities];

    // Apply stage filter from chart
    if (stageFilter) {
      filtered = filtered.filter(opp => opp.stageId === stageFilter);
    }

    // Apply custom filters
    filters.forEach(filter => {
      filtered = filtered.filter(opp => {
        const value = getFieldValue(opp, filter.field);
        const filterValue = filter.value.toLowerCase();
        
        switch (filter.operator) {
          case 'contains':
            return String(value).toLowerCase().includes(filterValue);
          case 'equals':
            return String(value).toLowerCase() === filterValue;
          case 'greater':
            return Number(value) > Number(filter.value);
          case 'less':
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = getFieldValue(a, sortConfig.field);
        const bValue = getFieldValue(b, sortConfig.field);
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [baseFilteredOpportunities, filters, sortConfig, stageFilter, getFieldValue]);

  // Calculate pagination
  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredOpportunities.length / pageSize);
  const paginatedOpportunities = useMemo(() => {
    if (pageSize === -1) return filteredOpportunities;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOpportunities.slice(startIndex, startIndex + pageSize);
  }, [filteredOpportunities, currentPage, pageSize]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, stageFilter, showClosedOpportunities]);

  const handleSort = (field: string) => {
    setSortConfig(current => {
      if (current?.field === field) {
        return current.direction === 'asc' 
          ? { field, direction: 'desc' }
          : null;
      }
      return { field, direction: 'asc' };
    });
  };

  const handleStageClick = (stageId: number) => {
    setStageFilter(current => current === stageId ? null : stageId);
  };

  const handleBulkEdit = (field: string, value: string) => {
    setOpportunities(current => 
      current.map(opp => 
        selectedIds.includes(opp.id) 
          ? { ...opp, [field]: value }
          : opp
      )
    );
    setSelectedIds([]);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(current => 
      current.includes(id) 
        ? current.filter(selectedId => selectedId !== id)
        : [...current, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(current => 
      current.length === paginatedOpportunities.length 
        ? []
        : paginatedOpportunities.map(opp => opp.id)
    );
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = newPageSize === 'all' ? -1 : parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="text-sm font-medium">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sales Opportunities</h1>
        </div>

        {/* Stage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunities by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartJsBarChart 
              data={stageData}
              onBarClick={handleStageClick}
            />
            {stageFilter && (
              <div className="mt-4">
                <Badge variant="secondary" className="mr-2">
                  Filtered by: {mockStages.find(s => s.id === stageFilter)?.name}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setStageFilter(null)}
                >
                  Clear Filter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <OpportunityFilters 
          filters={filters}
          onUpdateFilters={setFilters}
          showClosedOpportunities={showClosedOpportunities}
          onToggleClosedOpportunities={setShowClosedOpportunities}
        />

        {/* Table Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <ColumnCustomizer 
              visibleColumns={visibleColumns}
              onUpdateColumns={setVisibleColumns}
            />
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode(!editMode)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
            </Button>
            {selectedIds.length > 0 && (
              <BulkEditDialog
                selectedCount={selectedIds.length}
                onBulkEdit={handleBulkEdit}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Label>Page size:</Label>
            <Select value={pageSize === -1 ? 'all' : pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <OpportunityTable
              opportunities={paginatedOpportunities}
              visibleColumns={visibleColumns}
              selectedIds={selectedIds}
              editMode={editMode}
              sortConfig={sortConfig}
              onSort={handleSort}
              onToggleSelection={toggleSelection}
              onSelectAll={selectAll}
              onUpdateOpportunity={(id, updates) => {
                setOpportunities(current => 
                  current.map(opp => 
                    opp.id === id ? { ...opp, ...updates } : opp
                  )
                );
              }}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {pageSize !== -1 && totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Status Bar */}
        <div className="text-sm text-gray-500 text-center">
          Showing {pageSize === -1 ? filteredOpportunities.length : Math.min(pageSize, filteredOpportunities.length - (currentPage - 1) * pageSize)} of {filteredOpportunities.length} opportunities
          {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
        </div>
      </div>
    </div>
  );
};

export default Opportunities;

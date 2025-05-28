
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown, ChevronUp, Edit, Filter, Plus } from 'lucide-react';
import { mockOpportunities, mockStages, mockSources, mockTypes, mockProbabilities } from '@/data/mockData';
import { OpportunityFilters } from '@/components/OpportunityFilters';
import { OpportunityTable } from '@/components/OpportunityTable';
import { ColumnCustomizer } from '@/components/ColumnCustomizer';
import { BulkEditDialog } from '@/components/BulkEditDialog';

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
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'id', 'customerName', 'description', 'estimateRevenue', 'stage', 'type', 'isUrgent', 'estimateDelivery'
  ]);
  const [stageFilter, setStageFilter] = useState<number | null>(null);

  // Get primary product data for each opportunity
  const getProductData = (opportunity: Opportunity) => {
    const primaryProduct = opportunity.productGroups
      .flatMap(group => group.products)
      .find(product => product.isPrimary);
    
    return {
      serialNumber: primaryProduct?.serialNumber || '',
      baseModel: primaryProduct?.baseModelId || '',
      model: primaryProduct?.description || ''
    };
  };

  // Calculate stage counts for bar chart
  const stageData = useMemo(() => {
    const stageCounts = mockStages.map(stage => ({
      id: stage.id,
      name: stage.name,
      count: opportunities.filter(opp => opp.stageId === stage.id).length
    }));
    return stageCounts;
  }, [opportunities]);

  // Apply filters and sorting
  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];

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
  }, [opportunities, filters, sortConfig, stageFilter]);

  const getFieldValue = (opportunity: Opportunity, field: string) => {
    const productData = getProductData(opportunity);
    
    switch (field) {
      case 'stage':
        return mockStages.find(s => s.id === opportunity.stageId)?.name || '';
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
      default:
        return opportunity[field as keyof Opportunity] || '';
    }
  };

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
      current.length === filteredOpportunities.length 
        ? []
        : filteredOpportunities.map(opp => opp.id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sales Opportunities</h1>
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
        </div>

        {/* Stage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunities by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6"
                    className="cursor-pointer"
                    onClick={(data) => handleStageClick(data.id)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
        />

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <OpportunityTable
              opportunities={filteredOpportunities}
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

        {/* Status Bar */}
        <div className="text-sm text-gray-500 text-center">
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
          {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
        </div>
      </div>
    </div>
  );
};

export default Opportunities;

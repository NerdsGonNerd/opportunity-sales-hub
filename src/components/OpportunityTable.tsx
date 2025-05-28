

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { mockStages, mockTypes, mockProbabilities, mockSources } from '@/data/mockData';
import { Opportunity } from '@/pages/Opportunities';
import { MonthYearSelector } from './MonthYearSelector';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  visibleColumns: string[];
  selectedIds: number[];
  editMode: boolean;
  sortConfig: { field: string; direction: 'asc' | 'desc' } | null;
  onSort: (field: string) => void;
  onToggleSelection: (id: number) => void;
  onSelectAll: () => void;
  onUpdateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
}

const columnDefinitions = {
  id: { label: 'ID', sortable: true },
  customerName: { label: 'Customer', sortable: true },
  contactName: { label: 'Contact', sortable: true },
  description: { label: 'Description', sortable: false },
  estimateRevenue: { label: 'Revenue', sortable: true },
  stage: { label: 'Stage', sortable: true },
  type: { label: 'Type', sortable: true },
  probability: { label: 'Probability', sortable: true },
  source: { label: 'Source', sortable: true },
  isUrgent: { label: 'Urgent', sortable: true },
  estimateClose: { label: 'Est. Close', sortable: true },
  estimateDelivery: { label: 'Est. Delivery', sortable: true },
  serialNumber: { label: 'Serial #', sortable: true },
  baseModel: { label: 'Base Model', sortable: true },
  model: { label: 'Model', sortable: true },
  customerState: { label: 'State', sortable: true },
  divisionId: { label: 'Division', sortable: true }
};

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  opportunities,
  visibleColumns,
  selectedIds,
  editMode,
  sortConfig,
  onSort,
  onToggleSelection,
  onSelectAll,
  onUpdateOpportunity
}) => {
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

  const getCellValue = (opportunity: Opportunity, column: string) => {
    const productData = getProductData(opportunity);
    
    switch (column) {
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
      case 'estimateClose':
        return `${opportunity.estimateCloseMonth}/${opportunity.estimateCloseYear}`;
      case 'estimateRevenue':
        return opportunity.estimateRevenue ? `$${Math.round(opportunity.estimateRevenue).toLocaleString()}` : '';
      case 'isUrgent':
        return opportunity.isUrgent;
      default:
        return opportunity[column as keyof Opportunity] || '';
    }
  };

  const renderEditableCell = (opportunity: Opportunity, column: string) => {
    const value = getCellValue(opportunity, column);

    if (column === 'isUrgent') {
      return (
        <Checkbox
          checked={opportunity.isUrgent}
          onCheckedChange={(checked) => 
            onUpdateOpportunity(opportunity.id, { isUrgent: !!checked })
          }
        />
      );
    }

    if (column === 'estimateClose') {
      return (
        <MonthYearSelector
          month={opportunity.estimateCloseMonth}
          year={opportunity.estimateCloseYear}
          onMonthChange={(month) => 
            onUpdateOpportunity(opportunity.id, { estimateCloseMonth: month })
          }
          onYearChange={(year) => 
            onUpdateOpportunity(opportunity.id, { estimateCloseYear: year })
          }
          className="min-w-32"
        />
      );
    }

    if (column === 'estimateDelivery') {
      return (
        <MonthYearSelector
          month={opportunity.estimateDeliveryMonth}
          year={opportunity.estimateDeliveryYear}
          onMonthChange={(month) => 
            onUpdateOpportunity(opportunity.id, { estimateDeliveryMonth: month })
          }
          onYearChange={(year) => 
            onUpdateOpportunity(opportunity.id, { estimateDeliveryYear: year })
          }
          className="min-w-32"
        />
      );
    }

    if (column === 'stage') {
      return (
        <Select
          value={opportunity.stageId.toString()}
          onValueChange={(value) => 
            onUpdateOpportunity(opportunity.id, { stageId: parseInt(value) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockStages.map(stage => (
              <SelectItem key={stage.id} value={stage.id.toString()}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (column === 'type') {
      return (
        <Select
          value={opportunity.typeId.toString()}
          onValueChange={(value) => 
            onUpdateOpportunity(opportunity.id, { typeId: parseInt(value) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockTypes.map(type => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (column === 'estimateRevenue') {
      return (
        <Input
          type="number"
          value={opportunity.estimateRevenue || ''}
          onChange={(e) => 
            onUpdateOpportunity(opportunity.id, { 
              estimateRevenue: e.target.value ? parseFloat(e.target.value) : null 
            })
          }
          className="w-full"
        />
      );
    }

    if (['customerName', 'contactName', 'description', 'customerState'].includes(column)) {
      return (
        <Input
          value={String(value)}
          onChange={(e) => 
            onUpdateOpportunity(opportunity.id, { [column]: e.target.value })
          }
          className="w-full"
        />
      );
    }

    return <span className="text-gray-500">{String(value)}</span>;
  };

  const renderCell = (opportunity: Opportunity, column: string) => {
    if (editMode) {
      return renderEditableCell(opportunity, column);
    }

    const value = getCellValue(opportunity, column);

    if (column === 'isUrgent') {
      return opportunity.isUrgent ? (
        <Badge variant="destructive">Urgent</Badge>
      ) : (
        <Badge variant="secondary">Normal</Badge>
      );
    }

    if (column === 'stage') {
      const stage = mockStages.find(s => s.id === opportunity.stageId);
      const colors = {
        'Lead': 'bg-blue-100 text-blue-800',
        'Outstanding': 'bg-yellow-100 text-yellow-800',
        'Development': 'bg-purple-100 text-purple-800',
        'Proposal': 'bg-orange-100 text-orange-800',
        'Won': 'bg-green-100 text-green-800',
        'Lost': 'bg-red-100 text-red-800',
        'No Deal': 'bg-gray-100 text-gray-800',
        'No Lead': 'bg-gray-100 text-gray-800'
      };
      return stage ? (
        <Badge className={colors[stage.name as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
          {stage.name}
        </Badge>
      ) : null;
    }

    return String(value);
  };

  const getSortIcon = (column: string) => {
    if (!columnDefinitions[column as keyof typeof columnDefinitions]?.sortable) return null;
    
    if (sortConfig?.field === column) {
      return sortConfig.direction === 'asc' ? 
        <ChevronUp className="w-4 h-4" /> : 
        <ChevronDown className="w-4 h-4" />;
    }
    return <ChevronDown className="w-4 h-4 opacity-30" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === opportunities.length && opportunities.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            {visibleColumns.map(column => (
              <TableHead 
                key={column}
                className={`${columnDefinitions[column as keyof typeof columnDefinitions]?.sortable ? 'cursor-pointer select-none' : ''} ${column === 'estimateRevenue' ? 'text-right' : ''}`}
                onClick={() => {
                  if (columnDefinitions[column as keyof typeof columnDefinitions]?.sortable) {
                    onSort(column);
                  }
                }}
              >
                <div className={`flex items-center space-x-1 ${column === 'estimateRevenue' ? 'justify-end' : ''}`}>
                  <span>{columnDefinitions[column as keyof typeof columnDefinitions]?.label || column}</span>
                  {getSortIcon(column)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map(opportunity => (
            <TableRow 
              key={opportunity.id}
              className={selectedIds.includes(opportunity.id) ? 'bg-blue-50' : ''}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(opportunity.id)}
                  onCheckedChange={() => onToggleSelection(opportunity.id)}
                />
              </TableCell>
              {visibleColumns.map(column => (
                <TableCell key={column} className={`min-w-0 ${column === 'estimateRevenue' ? 'text-right' : ''}`}>
                  {renderCell(opportunity, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


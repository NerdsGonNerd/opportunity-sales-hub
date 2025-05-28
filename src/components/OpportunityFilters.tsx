
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter } from 'lucide-react';
import { FilterConfig } from '@/pages/Opportunities';

interface OpportunityFiltersProps {
  filters: FilterConfig[];
  onUpdateFilters: (filters: FilterConfig[]) => void;
}

const availableFields = [
  { value: 'customerName', label: 'Customer Name' },
  { value: 'contactName', label: 'Contact Name' },
  { value: 'description', label: 'Description' },
  { value: 'estimateRevenue', label: 'Revenue' },
  { value: 'stage', label: 'Stage' },
  { value: 'type', label: 'Type' },
  { value: 'probability', label: 'Probability' },
  { value: 'source', label: 'Source' },
  { value: 'isUrgent', label: 'Urgent' },
  { value: 'customerState', label: 'State' },
  { value: 'divisionId', label: 'Division' },
  { value: 'serialNumber', label: 'Serial Number' },
  { value: 'baseModel', label: 'Base Model' },
  { value: 'model', label: 'Model' }
];

const operators = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'greater', label: 'Greater Than' },
  { value: 'less', label: 'Less Than' }
];

export const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  filters,
  onUpdateFilters
}) => {
  const [newFilter, setNewFilter] = useState<FilterConfig>({
    field: '',
    operator: 'contains',
    value: ''
  });

  const addFilter = () => {
    if (newFilter.field && newFilter.value) {
      onUpdateFilters([...filters, newFilter]);
      setNewFilter({ field: '', operator: 'contains', value: '' });
    }
  };

  const removeFilter = (index: number) => {
    onUpdateFilters(filters.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    onUpdateFilters([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Filters:</span>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFilter(index)}>
                  {availableFields.find(f => f.value === filter.field)?.label} {filter.operator} "{filter.value}" ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add New Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Select
            value={newFilter.field}
            onValueChange={(value) => setNewFilter(prev => ({ ...prev, field: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map(field => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={newFilter.operator}
            onValueChange={(value) => setNewFilter(prev => ({ ...prev, operator: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operators.map(op => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter value"
            value={newFilter.value}
            onChange={(e) => setNewFilter(prev => ({ ...prev, value: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && addFilter()}
          />

          <Button onClick={addFilter} disabled={!newFilter.field || !newFilter.value}>
            <Plus className="w-4 h-4 mr-2" />
            Add Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

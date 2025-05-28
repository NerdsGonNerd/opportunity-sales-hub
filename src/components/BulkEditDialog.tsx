
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { mockStages, mockTypes, mockProbabilities } from '@/data/mockData';

interface BulkEditDialogProps {
  selectedCount: number;
  onBulkEdit: (field: string, value: string) => void;
}

const editableFields = [
  { value: 'stageId', label: 'Stage', type: 'select', options: mockStages },
  { value: 'typeId', label: 'Type', type: 'select', options: mockTypes },
  { value: 'probabilityOfClosingId', label: 'Probability', type: 'select', options: mockProbabilities },
  { value: 'isUrgent', label: 'Urgent Status', type: 'select', options: [
    { id: true, name: 'Urgent' },
    { id: false, name: 'Normal' }
  ]},
  { value: 'estimateRevenue', label: 'Revenue', type: 'number' },
  { value: 'customerState', label: 'State', type: 'text' },
  { value: 'divisionId', label: 'Division', type: 'text' }
];

export const BulkEditDialog: React.FC<BulkEditDialogProps> = ({
  selectedCount,
  onBulkEdit
}) => {
  const [selectedField, setSelectedField] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleBulkEdit = () => {
    if (!selectedField || !selectedValue) {
      toast({
        title: "Error",
        description: "Please select a field and value to update.",
        variant: "destructive"
      });
      return;
    }

    onBulkEdit(selectedField, selectedValue);
    setIsOpen(false);
    setSelectedField('');
    setSelectedValue('');
    
    toast({
      title: "Bulk Edit Complete",
      description: `Updated ${selectedCount} opportunities successfully.`,
    });
  };

  const selectedFieldConfig = editableFields.find(f => f.value === selectedField);

  const renderValueInput = () => {
    if (!selectedFieldConfig) return null;

    if (selectedFieldConfig.type === 'select') {
      return (
        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {selectedFieldConfig.options?.map(option => (
              <SelectItem key={option.id} value={option.id.toString()}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={selectedFieldConfig.type}
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.target.value)}
        placeholder="Enter value"
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          Bulk Edit {selectedCount} Record{selectedCount !== 1 ? 's' : ''}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Bulk Edit {selectedCount} Opportunity Record{selectedCount !== 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Select a field and the new value to apply to all {selectedCount} selected opportunities.
          </div>

          <div className="space-y-2">
            <Label htmlFor="field">Field to Update</Label>
            <Select value={selectedField} onValueChange={(value) => {
              setSelectedField(value);
              setSelectedValue('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select field to update" />
              </SelectTrigger>
              <SelectContent>
                {editableFields.map(field => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedField && (
            <div className="space-y-2">
              <Label htmlFor="value">New Value</Label>
              {renderValueInput()}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit}>
              Update {selectedCount} Record{selectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

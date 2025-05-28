
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface ColumnCustomizerProps {
  visibleColumns: string[];
  onUpdateColumns: (columns: string[]) => void;
}

const allColumns = [
  { id: 'id', label: 'ID' },
  { id: 'customerName', label: 'Customer Name' },
  { id: 'contactName', label: 'Contact Name' },
  { id: 'description', label: 'Description' },
  { id: 'estimateRevenue', label: 'Revenue' },
  { id: 'stage', label: 'Stage' },
  { id: 'type', label: 'Type' },
  { id: 'probability', label: 'Probability' },
  { id: 'source', label: 'Source' },
  { id: 'isUrgent', label: 'Urgent' },
  { id: 'estimateDelivery', label: 'Est. Delivery' },
  { id: 'serialNumber', label: 'Serial Number' },
  { id: 'baseModel', label: 'Base Model' },
  { id: 'model', label: 'Model' },
  { id: 'customerState', label: 'State' },
  { id: 'divisionId', label: 'Division' }
];

export const ColumnCustomizer: React.FC<ColumnCustomizerProps> = ({
  visibleColumns,
  onUpdateColumns
}) => {
  const [tempColumns, setTempColumns] = useState(visibleColumns);
  const [isOpen, setIsOpen] = useState(false);

  const handleColumnToggle = (columnId: string) => {
    setTempColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const saveView = () => {
    onUpdateColumns(tempColumns);
    setIsOpen(false);
    toast({
      title: "View Saved",
      description: "Your column preferences have been saved.",
    });
  };

  const resetToDefault = () => {
    const defaultColumns = ['id', 'customerName', 'description', 'estimateRevenue', 'stage', 'type', 'isUrgent', 'estimateDelivery'];
    setTempColumns(defaultColumns);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setTempColumns(visibleColumns)}>
          Customize Columns
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Table Columns</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Select which columns to display in the table. Your preferences will be saved as your personal view.
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allColumns.map(column => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  checked={tempColumns.includes(column.id)}
                  onCheckedChange={() => handleColumnToggle(column.id)}
                />
                <Label 
                  htmlFor={column.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={resetToDefault}>
              Reset to Default
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveView}>
                Save View
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// components/files/file-search-filter.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Filter, X, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface FileSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  fileType: string;
  onFileTypeChange: (type: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  sizeRange: [number, number];
  onSizeRangeChange: (range: [number, number]) => void;
  onReset: () => void;
}

const fileTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'image', label: 'Images' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'document', label: 'Documents' },
  { value: 'spreadsheet', label: 'Spreadsheets' },
  { value: 'archive', label: 'Archives' }
];

const sizeRanges = [
  { label: 'All Sizes', value: [0, 100 * 1024 * 1024] },
  { label: 'Small (< 1MB)', value: [0, 1024 * 1024] },
  { label: 'Medium (1-10MB)', value: [1024 * 1024, 10 * 1024 * 1024] },
  { label: 'Large (> 10MB)', value: [10 * 1024 * 1024, 100 * 1024 * 1024] }
];

export function FileSearchFilter({
  searchQuery,
  onSearchChange,
  fileType,
  onFileTypeChange,
  dateRange,
  onDateRangeChange,
  sizeRange,
  onSizeRangeChange,
  onReset
}: FileSearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { theme } = useTheme();

  const hasActiveFilters = fileType !== 'all' || 
    dateRange.from || 
    dateRange.to || 
    sizeRange[0] > 0 || 
    sizeRange[1] < 100 * 1024 * 1024;

  const handleSizeRangeChange = (range: [number, number]) => {
    onSizeRangeChange(range);
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Button */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">File Type</label>
            <Select value={fileType} onValueChange={onFileTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fileTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  }}
                  onSelect={(range) => onDateRangeChange({
                    from: range?.from,
                    to: range?.to
                  })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Size Range</label>
            <Select 
              value={sizeRange.join('-')} 
              onValueChange={(value) => {
                const [min, max] = value.split('-').map(Number);
                handleSizeRangeChange([min, max]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizeRanges.map(range => (
                  <SelectItem 
                    key={range.label} 
                    value={range.value.join('-')}
                  >
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              {formatSize(sizeRange[0])} - {formatSize(sizeRange[1])}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onReset();
                setIsFilterOpen(false);
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {fileType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {fileTypes.find(t => t.value === fileType)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFileTypeChange('all')} />
            </Badge>
          )}
          {(dateRange.from || dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {dateRange.from && format(dateRange.from, 'MMM dd')}
              {dateRange.to && ` - ${format(dateRange.to, 'MMM dd')}`}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onDateRangeChange({ from: undefined, to: undefined })} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface HealthFiltersProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: string) => void;
  onServiceFilter: (service: string) => void;
}

export function HealthFilters({ onSearch, onStatusFilter, onServiceFilter }: HealthFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search alerts and services..."
          className="pl-9"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Select onValueChange={onStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="up">Up</SelectItem>
          <SelectItem value="degraded">Degraded</SelectItem>
          <SelectItem value="down">Down</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={onServiceFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          <SelectItem value="database">Database</SelectItem>
          <SelectItem value="redis">Redis</SelectItem>
          <SelectItem value="memory">Memory</SelectItem>
          <SelectItem value="disk">Disk</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
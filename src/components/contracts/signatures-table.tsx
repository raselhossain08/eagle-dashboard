'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Shield, Download, Loader2 } from 'lucide-react';
import { Signature } from '@/lib/types/contracts';
import { format } from 'date-fns';
import Link from 'next/link';

interface SignaturesTableProps {
  data: Signature[];
  onViewEvidence?: (signatureId: string) => void;
  onValidate?: (signatureId: string) => void;
  onExport?: (signatureId: string) => void;
  isLoading?: boolean;
  search?: string;
  onSearchChange?: (search: string) => void;
}

export function SignaturesTable({
  data,
  onViewEvidence,
  onValidate,
  onExport,
  isLoading,
  search = '',
  onSearchChange
}: SignaturesTableProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  const getSignatureTypeLabel = (type: string) => {
    switch (type) {
      case 'drawn': return 'Hand Drawn';
      case 'typed': return 'Typed Name';
      case 'uploaded': return 'Uploaded Image';
      default: return type;
    }
  };

  const getSignatureTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      drawn: 'default',
      typed: 'secondary',
      uploaded: 'outline'
    };
    return (
      <Badge variant={variants[type] || 'outline'}>
        {getSignatureTypeLabel(type)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading signatures...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search signatures..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 w-[300px]"
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Signer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Signed Date</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No signatures found
              </TableCell>
            </TableRow>
          ) : (
            data.map((signature) => (
              <TableRow key={signature.id}>
                <TableCell className="font-medium">{signature.fullName}</TableCell>
                <TableCell>{signature.email}</TableCell>
                <TableCell>{signature.company || '-'}</TableCell>
                <TableCell>{getSignatureTypeBadge(signature.signatureType)}</TableCell>
                <TableCell>
                  {signature.signedAt ? format(new Date(signature.signedAt), 'MMM dd, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {signature.ipAddress}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="sm" title="View Evidence">
                      <Link href={`/dashboard/contracts/signatures/${signature.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {onValidate && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onValidate(signature.id)}
                        title="Validate"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                    )}
                    {onExport && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onExport(signature.id)}
                        title="Export"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Download } from 'lucide-react';

const mockSignatures = [
  {
    id: '1',
    contractId: 'CNT-001',
    signerName: 'John Doe',
    signerEmail: 'john@example.com',
    status: 'completed',
    signedAt: '2024-01-15',
    ipAddress: '192.168.1.1'
  },
  {
    id: '2',
    contractId: 'CNT-002',
    signerName: 'Jane Smith',
    signerEmail: 'jane@example.com',
    status: 'pending',
    signedAt: null,
    ipAddress: null
  }
];

export function SignaturesTable() {
  const [search, setSearch] = useState('');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: 'default',
      pending: 'secondary',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Digital Signatures</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search signatures..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-[250px]"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Signer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signed Date</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSignatures.map((signature) => (
              <TableRow key={signature.id}>
                <TableCell className="font-medium">{signature.contractId}</TableCell>
                <TableCell>{signature.signerName}</TableCell>
                <TableCell>{signature.signerEmail}</TableCell>
                <TableCell>{getStatusBadge(signature.status)}</TableCell>
                <TableCell>{signature.signedAt || '-'}</TableCell>
                <TableCell>{signature.ipAddress || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
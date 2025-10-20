// components/discounts/bulk-code-generator.tsx
'use client';

import { useState } from 'react';
import { CreateDiscountDto } from '@/types/discounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Copy, X } from 'lucide-react';

interface BulkCodeGeneratorProps {
  template: CreateDiscountDto;
  onGenerate: (count: number, prefix?: string) => Promise<void>;
  onPreview: (count: number, prefix?: string) => string[];
  maxCount?: number;
  isLoading?: boolean;
}

export function BulkCodeGenerator({
  template,
  onGenerate,
  onPreview,
  maxCount = 1000,
  isLoading = false
}: BulkCodeGeneratorProps) {
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const handlePreview = () => {
    const codes = onPreview(count, prefix);
    setGeneratedCodes(codes);
  };

  const handleGenerate = async () => {
    await onGenerate(count, prefix);
    handlePreview();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
  };

  const downloadCSV = () => {
    const csvContent = generatedCodes.map(code => `"${code}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discount-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Generate Codes</CardTitle>
          <CardDescription>
            Create multiple discount codes with the same settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="count">Number of Codes</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max={maxCount}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Maximum {maxCount} codes per batch
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefix">Code Prefix (Optional)</Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              placeholder="SUMMER"
            />
            <p className="text-sm text-muted-foreground">
              Codes will be: {prefix || 'CODE'}_XXXXX
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handlePreview} variant="outline">
              Preview Codes
            </Button>
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Codes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Codes</CardTitle>
          <CardDescription>
            {generatedCodes.length} codes ready for use
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedCodes.length > 0 ? (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </Button>
                <Button onClick={downloadCSV} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                  {generatedCodes.map((code, index) => (
                    <Badge key={index} variant="secondary" className="justify-between">
                      {code}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setGeneratedCodes(prev => prev.filter((_, i) => i !== index))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No codes generated yet. Click "Preview Codes" to see samples.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
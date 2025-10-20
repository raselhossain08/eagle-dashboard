'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChangesVisualizationProps {
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  changes?: Record<string, any>;
  mode: 'diff' | 'side-by-side' | 'unified';
}

export function ChangesVisualization({ 
  beforeState, 
  afterState, 
  changes, 
  mode = 'side-by-side' 
}: ChangesVisualizationProps) {
  const [activeTab, setActiveTab] = useState(mode);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderJson = (data: Record<string, any>, title: string, isBefore = false) => (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(JSON.stringify(data, null, 2), title)}
        >
          {copiedField === title ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  const renderDiff = () => {
    if (!beforeState || !afterState) return null;

    const allKeys = new Set([
      ...Object.keys(beforeState),
      ...Object.keys(afterState)
    ]);

    return (
      <div className="space-y-2">
        {Array.from(allKeys).map((key) => {
          const beforeValue = beforeState[key];
          const afterValue = afterState[key];
          const hasChanged = JSON.stringify(beforeValue) !== JSON.stringify(afterValue);

          return (
            <div key={key} className="flex items-start space-x-4 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {key}
                  </code>
                  {hasChanged && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      Modified
                    </Badge>
                  )}
                </div>
                
                {hasChanged ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Before:</span>
                      <pre className="text-sm bg-red-50 border border-red-200 rounded p-2 mt-1">
                        {JSON.stringify(beforeValue, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">After:</span>
                      <pre className="text-sm bg-green-50 border border-green-200 rounded p-2 mt-1">
                        {JSON.stringify(afterValue, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-muted-foreground">Value:</span>
                    <pre className="text-sm bg-muted rounded p-2 mt-1">
                      {JSON.stringify(beforeValue, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSideBySide = () => (
    <div className="flex gap-4">
      {beforeState && renderJson(beforeState, 'Before State', true)}
      {afterState && renderJson(afterState, 'After State')}
    </div>
  );

  const renderChangesOnly = () => {
    if (!changes) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Changed Fields</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(changes, null, 2), 'changes')}
          >
            {copiedField === 'changes' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto max-h-96">
          {JSON.stringify(changes, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
          <TabsTrigger value="diff">Field Diff</TabsTrigger>
          <TabsTrigger value="unified">Changes Only</TabsTrigger>
        </TabsList>
        
        <TabsContent value="side-by-side">
          {renderSideBySide()}
        </TabsContent>
        
        <TabsContent value="diff">
          {renderDiff()}
        </TabsContent>
        
        <TabsContent value="unified">
          {renderChangesOnly()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
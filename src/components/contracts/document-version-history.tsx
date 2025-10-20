import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Contract, User } from '@/lib/types/contracts'
import { History, Eye, GitCompare } from 'lucide-react'
import { format } from 'date-fns'

interface DocumentVersionHistoryProps {
  contract: Contract
  versions: Array<{
    version: string
    createdAt: Date
    changes: string[]
    createdBy: User
  }>
  onViewVersion: (version: string) => void
  onCompareVersions: (v1: string, v2: string) => void
}

export function DocumentVersionHistory({
  contract,
  versions,
  onViewVersion,
  onCompareVersions
}: DocumentVersionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History
        </CardTitle>
        <CardDescription>
          Track changes and revisions to this contract
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div key={version.version} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-foreground">
                    v{version.version}
                  </span>
                </div>
                {index < versions.length - 1 && (
                  <div className="w-0.5 h-8 bg-border mt-2" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Version {version.version}</h4>
                    <p className="text-sm text-muted-foreground">
                      By {version.createdBy.name} • {format(version.createdAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Badge variant="success">Current</Badge>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewVersion(version.version)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCompareVersions(versions[0].version, version.version)}
                      >
                        <GitCompare className="h-4 w-4 mr-2" />
                        Compare
                      </Button>
                    )}
                  </div>
                </div>
                
                {version.changes.length > 0 && (
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {version.changes.map((change, changeIndex) => (
                      <li key={changeIndex} className="flex items-start">
                        <span className="mr-2">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
          
          {versions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No version history available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
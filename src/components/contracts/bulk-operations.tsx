import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Contract } from '@/lib/types/contracts'
import { Send, Archive, Download, Filter, CheckSquare, Square } from 'lucide-react'

interface BulkOperationsProps {
  contracts: Contract[]
  selectedContracts: string[]
  onSelectionChange: (contractIds: string[]) => void
  onBulkSend: (contractIds: string[]) => Promise<void>
  onBulkArchive: (contractIds: string[]) => Promise<void>
  onBulkDownload: (contractIds: string[]) => Promise<void>
}

export function BulkOperations({
  contracts,
  selectedContracts,
  onSelectionChange,
  onBulkSend,
  onBulkArchive,
  onBulkDownload
}: BulkOperationsProps) {
  const [showBulkDialog, setShowBulkDialog] = useState<'send' | 'archive' | null>(null)

  const selectAll = () => {
    if (selectedContracts.length === contracts.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(contracts.map(c => c.id))
    }
  }

  const handleBulkAction = async () => {
    if (!showBulkDialog) return

    try {
      switch (showBulkDialog) {
        case 'send':
          await onBulkSend(selectedContracts)
          break
        case 'archive':
          await onBulkArchive(selectedContracts)
          break
      }
      setShowBulkDialog(null)
      onSelectionChange([])
    } catch (error) {
      console.error('Bulk operation failed:', error)
    }
  }

  const handleBulkDownload = async () => {
    try {
      await onBulkDownload(selectedContracts)
      onSelectionChange([])
    } catch (error) {
      console.error('Bulk download failed:', error)
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="h-8 w-8 p-0"
          >
            {selectedContracts.length === contracts.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedContracts.length} of {contracts.length} selected
          </span>
        </div>

        {selectedContracts.length > 0 && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowBulkDialog('send')}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBulkDialog('archive')}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Bulk Action Dialogs */}
      <Dialog open={!!showBulkDialog} onOpenChange={() => setShowBulkDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showBulkDialog === 'send' && 'Send Contracts'}
              {showBulkDialog === 'archive' && 'Archive Contracts'}
            </DialogTitle>
            <DialogDescription>
              {showBulkDialog === 'send' && 
                `Are you sure you want to send ${selectedContracts.length} contracts?`}
              {showBulkDialog === 'archive' && 
                `Are you sure you want to archive ${selectedContracts.length} contracts?`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-60 overflow-y-auto">
            {contracts
              .filter(c => selectedContracts.includes(c.id))
              .map(contract => (
                <div key={contract.id} className="flex items-center space-x-2 py-2">
                  <Checkbox checked={true} />
                  <span className="text-sm">{contract.title}</span>
                </div>
              ))
            }
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDialog(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkAction}>
              {showBulkDialog === 'send' ? 'Send Contracts' : 'Archive Contracts'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TemplateVariable } from '@/lib/types/contracts'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface TemplateVariablesManagerProps {
  variables: TemplateVariable[]
  onVariablesChange: (variables: TemplateVariable[]) => void
  readOnly?: boolean
}

const variableTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'select', label: 'Select' },
]

export function TemplateVariablesManager({
  variables,
  onVariablesChange,
  readOnly = false
}: TemplateVariablesManagerProps) {
  const addVariable = () => {
    const newVariable: TemplateVariable = {
      name: `variable_${variables.length + 1}`,
      type: 'text',
      required: false,
      description: ''
    }
    onVariablesChange([...variables, newVariable])
  }

  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    const updated = [...variables]
    updated[index] = { ...updated[index], ...updates }
    onVariablesChange(updated)
  }

  const removeVariable = (index: number) => {
    const updated = variables.filter((_, i) => i !== index)
    onVariablesChange(updated)
  }

  const addOption = (index: number, option: string) => {
    const variable = variables[index]
    if (variable.type === 'select') {
      const options = [...(variable.options || []), option]
      updateVariable(index, { options })
    }
  }

  const removeOption = (index: number, optionIndex: number) => {
    const variable = variables[index]
    if (variable.type === 'select' && variable.options) {
      const options = variable.options.filter((_, i) => i !== optionIndex)
      updateVariable(index, { options })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Template Variables</h3>
          <p className="text-sm text-muted-foreground">
            Define variables that will be filled when creating contracts from this template
          </p>
        </div>
        {!readOnly && (
          <Button onClick={addVariable} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Variable
          </Button>
        )}
      </div>

      {variables.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No variables defined</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add variables to make your template dynamic
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Default Value</TableHead>
                <TableHead>Description</TableHead>
                {!readOnly && <TableHead className="w-12">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((variable, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variable.name}
                      onChange={(e) => updateVariable(index, { name: e.target.value })}
                      placeholder="Variable name"
                      disabled={readOnly}
                      className="font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={variable.type}
                      onValueChange={(value: TemplateVariable['type']) => 
                        updateVariable(index, { type: value, options: value === 'select' ? [] : undefined })
                      }
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {variableTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={variable.required}
                      onCheckedChange={(checked) => updateVariable(index, { required: checked })}
                      disabled={readOnly}
                    />
                  </TableCell>
                  <TableCell>
                    {variable.type === 'boolean' ? (
                      <Select
                        value={variable.defaultValue?.toString()}
                        onValueChange={(value) => updateVariable(index, { defaultValue: value === 'true' })}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : variable.type === 'select' ? (
                      <Select
                        value={variable.defaultValue}
                        onValueChange={(value) => updateVariable(index, { defaultValue: value })}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select default" />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.options?.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={variable.type === 'number' ? 'number' : 'text'}
                        value={variable.defaultValue || ''}
                        onChange={(e) => updateVariable(index, { defaultValue: e.target.value })}
                        placeholder="Default value"
                        disabled={readOnly}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={variable.description || ''}
                      onChange={(e) => updateVariable(index, { description: e.target.value })}
                      placeholder="Variable description"
                      disabled={readOnly}
                      className="resize-none"
                    />
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariable(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Options management for select variables */}
      {variables.some(v => v.type === 'select') && (
        <div className="space-y-4">
          <h4 className="font-medium">Select Options</h4>
          {variables.map((variable, index) => {
            if (variable.type !== 'select') return null
            
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{variable.name} Options</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const option = prompt('Enter new option:')
                      if (option) addOption(index, option)
                    }}
                    disabled={readOnly}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variable.options?.map((option, optionIndex) => (
                    <Badge key={optionIndex} variant="secondary" className="flex items-center gap-1">
                      {option}
                      {!readOnly && (
                        <button
                          onClick={() => removeOption(index, optionIndex)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
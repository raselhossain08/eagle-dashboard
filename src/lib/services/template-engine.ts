import { TemplateVariable, ValidationResult } from '@/lib/types/contracts'

export class TemplateEngine {
  /**
   * Render template with variables
   */
  renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template

    // Replace all variable placeholders
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      const regex = new RegExp(this.escapeRegExp(placeholder), 'g')
      rendered = rendered.replace(regex, value?.toString() || '')
    })

    // Remove any unmatched variables
    rendered = rendered.replace(/{{(\w+)}}/g, '')

    return rendered
  }

  /**
   * Validate template syntax and variables
   */
  validateTemplateSyntax(template: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for basic syntax issues
    if (!template.trim()) {
      errors.push('Template content is empty')
    }

    if (template.length > 100000) {
      warnings.push('Template is very large and may impact performance')
    }

    // Check for unclosed HTML tags (basic check)
    const htmlTags = template.match(/<(\w+)[^>]*>/g) || []
    const closingTags = template.match(/<\/\w+>/g) || []
    
    if (htmlTags.length !== closingTags.length) {
      warnings.push('Possible unclosed HTML tags detected')
    }

    // Check for potentially dangerous patterns
    if (template.includes('javascript:') || template.includes('onclick=')) {
      warnings.push('Template contains potentially unsafe JavaScript')
    }

    return {
      isValid: errors.length === 0,
      message: errors.length === 0 ? 'Template is valid' : `Template validation failed with ${errors.length} errors`,
      errors,
      timestamp: new Date()
    }
  }

  /**
   * Extract all variables from template
   */
  extractVariables(template: string): string[] {
    const variableRegex = /{{(\w+)}}/g
    const matches = template.matchAll(variableRegex)
    const variables = new Set<string>()
    
    for (const match of matches) {
      variables.add(match[1])
    }
    
    return Array.from(variables)
  }

  /**
   * Generate template variables with types
   */
  extractVariablesWithTypes(template: string): TemplateVariable[] {
    const variableNames = this.extractVariables(template)
    
    return variableNames.map(name => ({
      name,
      type: this.inferVariableType(name),
      required: this.isVariableRequired(template, name),
      defaultValue: '',
      description: `Variable: ${name}`
    }))
  }

  /**
   * Preview template with sample data
   */
  previewTemplate(template: string, variables: Record<string, any> = {}): string {
    // Generate sample data for missing variables
    const allVariables = this.extractVariables(template)
    const sampleData: Record<string, any> = { ...variables }

    allVariables.forEach(variable => {
      if (!(variable in sampleData)) {
        sampleData[variable] = this.generateSampleValue(variable)
      }
    })

    return this.renderTemplate(template, sampleData)
  }

  /**
   * Infer variable type based on name patterns
   */
  private inferVariableType(variableName: string): TemplateVariable['type'] {
    const name = variableName.toLowerCase()

    if (name.includes('date') || name.includes('time')) return 'date'
    if (name.includes('amount') || name.includes('price') || name.includes('total')) return 'number'
    if (name.includes('agree') || name.includes('accept') || name.includes('confirm')) return 'boolean'
    if (name.includes('type') || name.includes('category') || name.includes('status')) return 'select'
    
    return 'text'
  }

  /**
   * Check if variable is required (appears multiple times or in critical positions)
   */
  private isVariableRequired(template: string, variableName: string): boolean {
    const placeholder = `{{${variableName}}}`
    const count = (template.match(new RegExp(this.escapeRegExp(placeholder), 'g')) || []).length
    return count > 1 || variableName.includes('name') || variableName.includes('email')
  }

  /**
   * Generate sample value for variable preview
   */
  private generateSampleValue(variableName: string): any {
    const type = this.inferVariableType(variableName)
    
    switch (type) {
      case 'date':
        return new Date().toLocaleDateString()
      case 'number':
        return '100.00'
      case 'boolean':
        return true
      case 'select':
        return 'Sample Option'
      default:
        return `[${variableName}]`
    }
  }

  /**
   * Escape regex special characters
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

export const templateEngine = new TemplateEngine()
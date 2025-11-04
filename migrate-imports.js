#!/usr/bin/env node

/**
 * Migration Script for Eagle Dashboard Folder Structure
 * 
 * This script helps migrate import statements from the old structure to the new one.
 * Run this script to automatically update import paths across your codebase.
 */

const fs = require('fs');
const path = require('path');

// Import mapping rules
const importMappings = {
  // Services
  "from '@/lib/services/auth.service'": "from '@/services/auth'",
  "from '@/lib/services/analytics.service'": "from '@/services/analytics'",
  "from '@/lib/services/contract.service'": "from '@/services/contracts'",
  "from '@/lib/services/subscription.service'": "from '@/services/subscriptions'",
  "from '@/lib/services/paymentMethod.service'": "from '@/services/payments'",
  "from '@/lib/services/plan.service'": "from '@/services/plans'",
  "from '@/lib/services/role.service'": "from '@/services/admin'",
  "from '@/lib/services/user.service'": "from '@/services/admin'",
  "from '@/lib/services/webhook-service'": "from '@/services/integrations'",
  
  // Components
  "from '@/components/dashboard-header'": "from '@/components/layout'",
  "from '@/components/dashboard-sidebar'": "from '@/components/layout'",
  "from '@/components/theme-provider'": "from '@/components/providers'",
  "from '@/context/auth-context'": "from '@/components/providers'",
  "from '@/context/analytics-context'": "from '@/components/providers'",
  
  // Hooks
  "from '@/hooks/use-permissions'": "from '@/hooks'",
  "from '@/hooks/use-roles'": "from '@/hooks'",
  "from '@/hooks/use-toast'": "from '@/hooks'",
  "from '@/hooks/use-connection-status'": "from '@/hooks'",
  "from '@/hooks/use-protected-route'": "from '@/hooks'",
  
  // Utils
  "from '@/lib/utils'": "from '@/utils'",
  
  // Types
  "from '@/types/auth'": "from '@/types'",
};

// Component name mappings for barrel exports
const componentMappings = {
  "AuthProvider": "AuthProvider",
  "AnalyticsProvider": "AnalyticsProvider", 
  "ThemeProvider": "ThemeProvider",
  "DashboardHeader": "DashboardHeader",
  "DashboardSidebar": "DashboardSidebar",
};

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Update import paths
    Object.entries(importMappings).forEach(([oldPattern, newPattern]) => {
      const regex = new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldPattern)) {
        content = content.replace(regex, newPattern);
        hasChanges = true;
      }
    });
    
    // Consolidate multiple imports from the same source
    content = consolidateImports(content);
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function consolidateImports(content) {
  // This is a simple version - you might want to use a proper AST parser for production
  const lines = content.split('\n');
  const importGroups = {};
  const nonImportLines = [];
  
  lines.forEach(line => {
    const importMatch = line.match(/^import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];?$/);
    if (importMatch) {
      const imports = importMatch[1].split(',').map(s => s.trim());
      const source = importMatch[2];
      
      if (!importGroups[source]) {
        importGroups[source] = [];
      }
      importGroups[source].push(...imports);
    } else {
      nonImportLines.push(line);
    }
  });
  
  // Rebuild content with consolidated imports
  const consolidatedImports = Object.entries(importGroups).map(([source, imports]) => {
    const uniqueImports = [...new Set(imports)];
    return `import { ${uniqueImports.join(', ')} } from '${source}';`;
  });
  
  return [...consolidatedImports, '', ...nonImportLines].join('\n');
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath, callback);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      callback(filePath);
    }
  });
}

// Main execution
function main() {
  console.log('🚀 Starting Eagle Dashboard import migration...\n');
  
  const projectRoot = process.cwd();
  const appDir = path.join(projectRoot, 'app');
  const srcDir = path.join(projectRoot, 'src');
  
  let fileCount = 0;
  
  // Update files in app directory
  if (fs.existsSync(appDir)) {
    console.log('📁 Processing app directory...');
    walkDirectory(appDir, (filePath) => {
      updateImportsInFile(filePath);
      fileCount++;
    });
  }
  
  // Update files in src directory  
  if (fs.existsSync(srcDir)) {
    console.log('📁 Processing src directory...');
    walkDirectory(srcDir, (filePath) => {
      updateImportsInFile(filePath);
      fileCount++;
    });
  }
  
  console.log(`\n✨ Migration completed! Processed ${fileCount} files.`);
  console.log('\n🔄 Next steps:');
  console.log('1. Run your linter to check for any remaining issues');
  console.log('2. Test your application to ensure everything works');
  console.log('3. Remove old directories once migration is verified');
}

if (require.main === module) {
  main();
}

module.exports = { updateImportsInFile, walkDirectory, consolidateImports };
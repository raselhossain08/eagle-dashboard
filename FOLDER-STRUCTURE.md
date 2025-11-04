# Eagle Dashboard - Improved Folder Structure

## 📁 New Folder Organization

This document outlines the improved folder structure designed for better code organization, maintainability, and developer experience.

## 🎯 Key Improvements

1. **Feature-based organization** - Related functionality grouped together
2. **Clean imports** - Barrel exports for simplified import paths  
3. **Next.js 13+ conventions** - Route groups and proper layouts
4. **TypeScript support** - Enhanced path mapping in tsconfig.json
5. **Better separation of concerns** - Clear boundaries between UI, business logic, and utilities

## 📂 Directory Structure

```
eagle-dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group for authentication
│   │   ├── layout.tsx            # Auth-specific layout
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify/
│   ├── (dashboard)/              # Route group for dashboard
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Dashboard home
│   │   ├── analytics/
│   │   ├── contracts/
│   │   ├── subscriptions/
│   │   ├── plans/
│   │   ├── payments/
│   │   ├── admin/
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── analytics/
│   │   ├── contracts/
│   │   └── subscriptions/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css
├── src/                          # Source code directory
│   ├── components/               # Feature-organized components
│   │   ├── ui/                   # Reusable UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── [other-ui-components]
│   │   ├── layout/               # Layout components
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   └── index.ts
│   │   ├── auth/                 # Authentication components
│   │   │   ├── with-auth.tsx
│   │   │   ├── token-manager.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/            # Dashboard-specific components
│   │   │   ├── analytics/
│   │   │   ├── contracts/
│   │   │   ├── subscriptions/
│   │   │   ├── payments/
│   │   │   ├── plans/
│   │   │   └── index.ts
│   │   ├── providers/            # Context providers
│   │   │   ├── auth-provider.tsx
│   │   │   ├── analytics-provider.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── index.ts
│   │   ├── shared/               # Shared business components
│   │   │   ├── error-boundary.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── lib/                      # Core utilities and configurations
│       ├── services/             # API service layer (feature-organized)
│       │   ├── auth/
│       │   │   ├── auth.service.ts
│       │   │   └── index.ts
│       │   ├── analytics/
│       │   │   ├── analytics.service.ts
│       │   │   └── index.ts
│       │   ├── contracts/
│       │   │   ├── contract.service.ts
│       │   │   ├── contract-legacy.service.ts
│       │   │   └── index.ts
│       │   ├── subscriptions/
│       │   │   ├── subscription.service.ts
│       │   │   ├── subscriber-profile.service.ts
│       │   │   └── index.ts
│       │   ├── payments/
│       │   │   ├── payment-method.service.ts
│       │   │   ├── transaction.service.ts
│       │   │   ├── invoice.service.ts
│       │   │   └── index.ts
│       │   ├── plans/
│       │   │   ├── plan.service.ts
│       │   │   ├── discount.service.ts
│       │   │   └── index.ts
│       │   ├── admin/
│       │   │   ├── role.service.ts
│       │   │   ├── user.service.ts
│       │   │   ├── audit-log.service.ts
│       │   │   ├── system-settings.service.ts
│       │   │   └── index.ts
│       │   ├── integrations/
│       │   │   ├── webhook.service.ts
│       │   │   └── index.ts
│       │   ├── shared/
│       │   │   ├── api.service.ts
│       │   │   ├── api-client.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── hooks/                # Custom React hooks
│       │   ├── use-auth.ts
│       │   ├── use-permissions.ts
│       │   ├── use-roles.ts
│       │   ├── use-connection-status.ts
│       │   ├── use-toast.ts
│       │   └── index.ts
│       ├── utils/                # Utility functions
│       │   ├── index.ts          # Main utilities (cn, formatters, etc.)
│       │   └── [additional-utils]
│       ├── types/                # TypeScript type definitions
│       │   ├── auth.ts
│       │   ├── api.ts
│       │   ├── dashboard.ts
│       │   └── index.ts
│       ├── config/               # Configuration files
│       │   ├── analytics.config.ts
│       │   ├── database.ts
│       │   ├── api.ts
│       │   └── index.ts
│       ├── validations/          # Validation schemas (Zod)
│       │   ├── auth.ts
│       │   ├── contracts.ts
│       │   ├── role.ts
│       │   └── index.ts
│       └── index.ts
├── public/                       # Static assets
├── docs/                         # Documentation
└── [config files]               # Root configuration files
```

## 🔄 Import Examples

### Before (Old Structure)
```typescript
import { AuthService } from '../../lib/services/auth.service';
import { DashboardHeader } from '../../components/dashboard-header';
import { usePermissions } from '../../hooks/use-permissions';
import { Button } from '../ui/button';
```

### After (New Structure)
```typescript
import { AuthService } from '@/services/auth';
import { DashboardHeader } from '@/components/layout';
import { usePermissions } from '@/hooks';
import { Button } from '@/components/ui/button';
```

## 📝 Path Mapping

The `tsconfig.json` has been updated with convenient path mappings:

```json
{
  "paths": {
    "@/*": ["./*"],
    "@/components/*": ["./src/components/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/hooks/*": ["./src/lib/hooks/*"],
    "@/utils/*": ["./src/lib/utils/*"],
    "@/types/*": ["./src/lib/types/*"],
    "@/services/*": ["./src/lib/services/*"],
    "@/config/*": ["./src/lib/config/*"],
    "@/validations/*": ["./src/lib/validations/*"]
  }
}
```

## 🔧 Route Groups

### Auth Routes `(auth)`
- Grouped authentication-related pages
- Dedicated auth layout without dashboard sidebar
- Clean URLs: `/login`, `/register`, etc.

### Dashboard Routes `(dashboard)`  
- All dashboard functionality grouped
- Shared dashboard layout with sidebar
- Clean URLs: `/analytics`, `/contracts`, etc.

## 💡 Best Practices

1. **Use barrel exports** - Import from index files when possible
2. **Feature-based organization** - Keep related files together
3. **Consistent naming** - Use kebab-case for files, PascalCase for components
4. **Clear separation** - UI components separate from business logic
5. **Type safety** - Centralized type definitions

## 🚀 Benefits

1. **Easier navigation** - Logical grouping makes finding files intuitive
2. **Better maintainability** - Related code stays together
3. **Cleaner imports** - Shorter, more readable import statements
4. **Scalability** - Structure supports adding new features easily
5. **Team collaboration** - Clear conventions for where to put code

## 📋 Migration Checklist

- [x] Create new `src/` directory structure
- [x] Organize services by feature domain
- [x] Group components by functionality
- [x] Setup route groups in `app/` directory
- [x] Create barrel exports (index.ts files)
- [x] Update tsconfig.json path mapping
- [ ] Update all import statements
- [ ] Test build and functionality
- [ ] Update documentation

## 🔄 Next Steps

1. **Update imports** - Gradually update import statements across the codebase
2. **Remove old directories** - Once migration is complete, remove original directories
3. **Team training** - Ensure all team members understand the new structure
4. **CI/CD updates** - Update build scripts if needed

---

This improved structure follows Next.js 13+ best practices and modern React development patterns for a more maintainable and scalable codebase.
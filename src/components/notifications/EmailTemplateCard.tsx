'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Copy, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { Template } from '@/types/notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmailTemplateCardProps {
  template: Template;
  onDuplicate?: (template: Template) => void;
}

export default function EmailTemplateCard({ template, onDuplicate }: EmailTemplateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {template.subject}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/notifications/templates/${template.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/notifications/templates/${template.id}/preview`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(template)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {template.variables.slice(0, 3).map((variable, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {variable}
              </Badge>
            ))}
            {template.variables.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.variables.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Used {template.usageCount} times</span>
            <span>Updated {formatDate(template.updatedAt)}</span>
          </div>
          
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/dashboard/notifications/templates/${template.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href={`/dashboard/notifications/templates/${template.id}/preview`}>
                <Mail className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
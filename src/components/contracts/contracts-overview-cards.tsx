import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ContractMetrics, DateRange } from '@/lib/types/contracts'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  XCircle
} from 'lucide-react'

interface ContractsOverviewCardsProps {
  data: ContractMetrics
  dateRange: DateRange
  isLoading?: boolean
}

export function ContractsOverviewCards({ data, dateRange, isLoading }: ContractsOverviewCardsProps) {
  const cards = [
    {
      title: "Total Contracts",
      value: data.totalContracts,
      description: "All contracts",
      icon: FileText,
      trend: "+12%",
      color: "blue"
    },
    {
      title: "Draft Contracts",
      value: data.draftContracts,
      description: "In progress",
      icon: Clock,
      trend: "+5%",
      color: "yellow"
    },
    {
      title: "Sent Contracts",
      value: data.sentContracts,
      description: "Awaiting signature",
      icon: FileText,
      trend: "+8%",
      color: "blue"
    },
    {
      title: "Signed Contracts",
      value: data.signedContracts,
      description: "Completed",
      icon: CheckCircle,
      trend: "+15%",
      color: "green"
    },
    {
      title: "Expired Contracts",
      value: data.expiredContracts,
      description: "Not signed in time",
      icon: XCircle,
      trend: "-3%",
      color: "red"
    },
    {
      title: "Signature Rate",
      value: `${data.signatureRate}%`,
      description: "Success rate",
      icon: TrendingUp,
      trend: "+2%",
      color: "green"
    }
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 text-${card.color}-500`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
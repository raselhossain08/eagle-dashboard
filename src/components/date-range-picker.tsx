'use client'

import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/store/dashboard-store'

export function DateRangePicker() {
  const { dateRange, setDateRange } = useDashboardStore()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.startDate ? (
            dateRange.endDate ? (
              <>
                {format(dateRange.startDate, "LLL dd, y")} -{" "}
                {format(dateRange.endDate, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.startDate, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.startDate}
          selected={{
            from: dateRange.startDate,
            to: dateRange.endDate,
          }}
          onSelect={(range) => {
            if (range?.from && range.to) {
              setDateRange({
                startDate: range.from,
                endDate: range.to,
              })
              setIsOpen(false)
            }
          }}
          numberOfMonths={2}
        />
        <div className="flex items-center justify-between p-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDateRange({
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(),
              })
              setIsOpen(false)
            }}
          >
            Last 7 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDateRange({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate: new Date(),
              })
              setIsOpen(false)
            }}
          >
            Last 30 days
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
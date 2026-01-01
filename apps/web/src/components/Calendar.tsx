import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker } from "react-day-picker"
import { cn } from "../lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Custom caption component with inline navigation: < Month Year >
function CustomCaption({ calendarMonth }: { calendarMonth: { date: Date } }) {
    const { goToMonth } = useDayPicker()
    const date = calendarMonth.date

    const handlePrevMonth = () => {
        const prevMonth = new Date(date)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        goToMonth(prevMonth)
    }

    const handleNextMonth = () => {
        const nextMonth = new Date(date)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        goToMonth(nextMonth)
    }

    const monthLabel = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    })

    return (
        <div className="flex items-center justify-between w-full px-1 pt-1 pb-2">
            <button
                type="button"
                onClick={handlePrevMonth}
                className="h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-900">{monthLabel}</span>
            <button
                type="button"
                onClick={handleNextMonth}
                className="h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    )
}

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-2 sm:space-y-0",
                month: "space-y-3",
                caption: "hidden",
                caption_label: "hidden",
                nav: "hidden",
                nav_button: "hidden",
                nav_button_previous: "hidden",
                nav_button_next: "hidden",
                // v9 keys
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday: "text-gray-500 rounded-md w-8 font-normal text-[0.75rem]",
                week: "flex w-full mt-1",
                day: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day_button: cn(
                    "h-8 w-8 p-0 font-semibold aria-selected:opacity-100 aria-selected:text-white hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center bg-transparent border-none text-black cursor-pointer"
                ),
                range_end: "day-range-end",
                selected: "!bg-black !text-white rounded-md",
                today: "bg-gray-100 text-gray-900",
                outside: "text-gray-400 opacity-50",
                disabled: "!text-gray-300 !opacity-10 !pointer-events-none !font-normal",
                range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900 rounded-none",
                hidden: "invisible",
                // v8 keys (kept for safety if mix versions or styles)
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                    "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day_selected:
                    "bg-black text-white rounded-md",
                day_today: "bg-gray-100 text-gray-900",
                day_outside: "text-gray-400 opacity-50",
                day_disabled: "text-gray-400 opacity-50",
                day_range_middle:
                    "aria-selected:bg-gray-100 aria-selected:text-gray-900 rounded-none",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                MonthCaption: CustomCaption,
                Chevron: ({ orientation }) => {
                    const Icon = orientation === "left" ? ChevronLeft : ChevronRight
                    return <Icon className="h-4 w-4" />
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { cn } from "../lib/utils"
import { Calendar } from "./Calendar"

interface DateRangePickerProps {
    className?: string
    date?: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    disabled?: boolean
}

export function DateRangePicker({
    className,
    date,
    setDate,
    disabled = false
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className={cn("relative grid gap-2", className)} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "w-full justify-start text-left font-normal flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-[#fdfdfd] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-colors shadow-sm text-[15px]",
                    !date && "text-gray-500",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                {date?.from ? (
                    date.to ? (
                        <>
                            {format(date.from, "MMMM dd, yyyy")} -{" "}
                            {format(date.to, "MMMM dd, yyyy")}
                        </>
                    ) : (
                        format(date.from, "MMMM dd, yyyy")
                    )
                ) : (
                    <span className="text-gray-400">Pick a date range</span>
                )}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 p-0 bg-white border border-gray-200 rounded-lg shadow-xl animate-fade-in-up">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        disabled={{ before: new Date() }} // Disable past dates
                    />
                </div>
            )}
        </div>
    )
}

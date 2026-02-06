import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, setMonth, setYear } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarWidget({ selectedDate, onDateSelect, getMoodForDate, getMoodColor, currentMonth: externalCurrentMonth, onMonthChange }) {
  const [internalMonth, setInternalMonth] = useState(() => {
    return externalCurrentMonth || selectedDate || new Date();
  });
  const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);

  // Use external month if provided, otherwise use internal
  const currentMonth = externalCurrentMonth || internalMonth;
  const setCurrentMonth = onMonthChange || setInternalMonth;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (onDateSelect) {
      onDateSelect(today);
    }
  };

  const handleMonthChange = (monthIndex) => {
    setCurrentMonth(setMonth(currentMonth, parseInt(monthIndex)));
    setIsMonthYearPickerOpen(false);
  };

  const handleYearChange = (year) => {
    setCurrentMonth(setYear(currentMonth, parseInt(year)));
    setIsMonthYearPickerOpen(false);
  };

  const handleDateClick = (date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={isMonthYearPickerOpen} onOpenChange={setIsMonthYearPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto px-3 py-1.5 font-semibold hover:bg-accent transition-colors"
                >
                  {format(currentMonth, 'MMMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Month
                    </label>
                    <Select
                      value={currentMonthIndex.toString()}
                      onValueChange={handleMonthChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month">
                          {MONTHS[currentMonthIndex]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Year
                    </label>
                    <Select
                      value={currentYear.toString()}
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year">
                          {currentYear}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 px-3"
          >
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {WEEKDAYS.map((day, index) => (
              <div key={index} className="h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              const mood = getMoodForDate ? getMoodForDate(date) : null;
              const colorClass = mood && getMoodColor ? getMoodColor(mood) : '';

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    'relative h-10 w-full rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-accent hover:scale-105',
                    !isCurrentMonth && 'text-muted-foreground/40',
                    isSelected && 'ring-2 ring-primary ring-offset-1',
                    isTodayDate && !isSelected && 'ring-2 ring-primary/50',
                    mood && colorClass && `${colorClass} text-white hover:opacity-90`,
                    !mood && isCurrentMonth && 'bg-card hover:bg-accent',
                    !mood && !isCurrentMonth && 'bg-transparent'
                  )}
                >
                  {format(date, 'd')}
                  {mood && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


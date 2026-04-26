import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';

export default function DragDropCalendar({ items, onDragStart, onDragOver, onDrop, renderItem, itemDateField = 'scheduled_date' }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedItem, setDraggedItem] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped = {};
    items.forEach(item => {
      const dateStr = format(new Date(item[itemDateField]), 'yyyy-MM-dd');
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(item);
    });
    return grouped;
  }, [items, itemDateField]);

  const handleDragStart = (e, item, day) => {
    setDraggedItem(item);
    if (onDragStart) onDragStart(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (onDragOver) onDragOver(e);
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    if (draggedItem && onDrop) {
      onDrop(draggedItem, day);
    }
    setDraggedItem(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 bg-muted/30 p-2 rounded-lg">
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayItems = itemsByDate[dateStr] || [];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dateStr}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                className={`
                  min-h-24 p-1 rounded border-2 transition-colors
                  ${isCurrentMonth ? 'bg-card' : 'bg-muted/20'}
                  ${isToday ? 'border-primary/50 bg-primary/5' : 'border-transparent'}
                  ${draggedItem ? 'border-dashed border-primary/50' : ''}
                  hover:border-primary/30
                `}
              >
                <div className={`text-xs font-semibold mb-1 ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5 overflow-y-auto max-h-20">
                  {dayItems.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, day)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      {renderItem(item)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
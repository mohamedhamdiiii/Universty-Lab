import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { EquipmentService } from '../../services/equipment.service';
import { CalendarEvent } from '../../models/search.model';
import { Equipment } from '../../models/reservation.model';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  selectedMonth = this.currentDate.getMonth() + 1; // 1-12
  selectedYear = this.currentDate.getFullYear();

  calendarDays: CalendarDay[] = [];
  events: CalendarEvent[] = [];
  equipmentList: Equipment[] = [];
  selectedEquipmentId?: number;

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  loading = false;
  selectedDayEvents: { day: Date; events: CalendarEvent[] } | null = null;

  constructor(
    private searchService: SearchService,
    private equipmentService: EquipmentService
  ) {}

  ngOnInit(): void {
    this.loadEquipment();
    this.loadCalendarEvents();
  }

  loadEquipment(): void {
    this.equipmentService.getAllEquipment().subscribe({
      next: (list) => {
        this.equipmentList = list;
      },
      error: (err) => console.error('Failed to load equipment list:', err)
    });
  }

  loadCalendarEvents(): void {
    this.loading = true;
    this.searchService
      .getCalendarEvents(this.selectedMonth, this.selectedYear, this.selectedEquipmentId)
      .subscribe({
        next: (events) => {
          this.events = events;
          this.buildCalendarGrid();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load calendar events:', err);
          this.buildCalendarGrid();
          this.loading = false;
        }
      });
  }

  buildCalendarGrid(): void {
    const year = this.selectedYear;
    const month = this.selectedMonth - 1; // 0-11 for JS Date

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    const todayStr = new Date().toISOString().split('T')[0];

    const days: CalendarDay[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: d.toISOString().split('T')[0] === todayStr,
        events: this.getEventsForDate(d)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: d.toISOString().split('T')[0] === todayStr,
        events: this.getEventsForDate(d)
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: d.toISOString().split('T')[0] === todayStr,
        events: this.getEventsForDate(d)
      });
    }

    this.calendarDays = days;
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    // Format YYYY-MM-DD using local year/month/date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return this.events.filter(e => {
      // An event covers dateStr if start <= dateStr and end >= dateStr
      return e.start <= dateStr && e.end >= dateStr;
    });
  }

  prevMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.selectedDayEvents = null;
    this.loadCalendarEvents();
  }

  nextMonth(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.selectedDayEvents = null;
    this.loadCalendarEvents();
  }

  goToToday(): void {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();
    this.selectedDayEvents = null;
    this.loadCalendarEvents();
  }

  onEquipmentFilterChange(equipmentIdStr: string): void {
    this.selectedEquipmentId = equipmentIdStr ? parseInt(equipmentIdStr, 10) : undefined;
    this.loadCalendarEvents();
  }

  openDayDetails(day: CalendarDay): void {
    if (day.events.length > 0) {
      this.selectedDayEvents = {
        day: day.date,
        events: day.events
      };
    } else {
      this.selectedDayEvents = null;
    }
  }

  closeDetails(): void {
    this.selectedDayEvents = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'event-approved';
      case 'pending': return 'event-pending';
      case 'rejected': return 'event-rejected';
      default: return 'event-default';
    }
  }
}

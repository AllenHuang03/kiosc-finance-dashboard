// src/utils/SimpleDateAdapter.js

/**
 * A simple date adapter for MUI DatePicker that doesn't depend on date-fns
 * This is useful when you don't want to install date-fns or other date libraries
 */
class SimpleDateAdapter {
    constructor() {
      this.locale = 'en-US';
    }
    
    // Required methods for MUI DatePicker
    date(value) {
      if (value === null) return null;
      return new Date(value);
    }
    
    toJsDate(value) {
      return value;
    }
    
    parse(value, format) {
      if (!value) return null;
      return new Date(value);
    }
    
    format(date, formatKey) {
      if (!date) return '';
      return date.toLocaleDateString(this.locale);
    }
    
    isValid(value) {
      return value instanceof Date && !isNaN(value);
    }
    
    isEqual(date1, date2) {
      if (date1 === null && date2 === null) return true;
      if (date1 === null || date2 === null) return false;
      return date1.getTime() === date2.getTime();
    }
    
    isBefore(date1, date2) {
      return date1 < date2;
    }
    
    isAfter(date1, date2) {
      return date1 > date2;
    }
    
    isWithinRange(date, [start, end]) {
      return date >= start && date <= end;
    }
    
    startOfDay(date) {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    }
    
    endOfDay(date) {
      const newDate = new Date(date);
      newDate.setHours(23, 59, 59, 999);
      return newDate;
    }
    
    addDays(date, amount) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + amount);
      return newDate;
    }
    
    getYear(date) {
      return date.getFullYear();
    }
    
    getMonth(date) {
      return date.getMonth();
    }
    
    getDate(date) {
      return date.getDate();
    }
    
    getDaysInMonth(date) {
      const month = date.getMonth();
      const year = date.getFullYear();
      return new Date(year, month + 1, 0).getDate();
    }
    
    getWeekdays() {
      return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    }
    
    getWeekArray(date) {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const firstDayOfWeek = 0; // Sunday
    
      const daysInMonth = this.getDaysInMonth(date);
      
      let dayCounter = 1;
      const weeks = [];
      let week = [];
      
      // Fill in the days before the first day of the month
      const firstDay = firstDayOfMonth.getDay();
      for (let i = 0; i < firstDay; i++) {
        week.push(null);
      }
      
      // Fill in all the days of the month
      while (dayCounter <= daysInMonth) {
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
        
        week.push(new Date(date.getFullYear(), date.getMonth(), dayCounter));
        dayCounter++;
      }
      
      // Fill in the days after the last day of the month
      while (week.length < 7) {
        week.push(null);
      }
      
      weeks.push(week);
      
      return weeks;
    }
    
    getMonthArray(date) {
      const year = date.getFullYear();
      return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    }
    
    getYearRange(start, end) {
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      
      return Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => new Date(startYear + i, 0, 1)
      );
    }
    
    // Months
    getMonthText(date) {
      return date.toLocaleString(this.locale, { month: 'long' });
    }
    
    getMonths() {
      return [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
    }
    
    // Year
    getYearText(date) {
      return date.getFullYear().toString();
    }
  }
  
  export default SimpleDateAdapter;
/* eslint-disable @typescript-eslint/no-this-alias */
/**
 * Date Picker Interactive Script
 * Features: Calendar navigation, date selection, range selection, keyboard navigation,
 *           month/year views, time picker, and accessibility support
 */
(function() {
  'use strict';

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  let activeDatepicker = null;

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  function formatDate(date, format = 'medium') {
    if (!date) return '';
    const d = new Date(date);
    if (format === 'short') {
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }
    return `${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function formatDateRange(start, end) {
    if (!start && !end) return '';
    if (start && !end) return formatDate(start);
    if (!start && end) return formatDate(end);
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  function formatDateTime(date, hours, minutes, period) {
    if (!date) return '';
    const dateStr = formatDate(date);
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    return `${dateStr} ${h}:${m} ${period}`;
  }

  function isSameDay(d1, d2) {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function isDateInRange(date, start, end) {
    if (!date || !start || !end) return false;
    const d = new Date(date).setHours(0, 0, 0, 0);
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(0, 0, 0, 0);
    return d > s && d < e;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  // ========================================
  // BASIC DATE PICKER CLASS
  // ========================================

  class DatePicker {
    constructor(element) {
      this.element = element;
      this.trigger = element.querySelector('.datepicker-trigger');
      this.popup = element.querySelector('.datepicker-popup');
      this.grid = element.querySelector('.calendar-grid');
      this.monthYearGrid = element.querySelector('.month-year-grid');
      this.titleBtns = element.querySelectorAll('.calendar-title-btn');

      this.selectedDate = null;
      this.viewDate = new Date();
      this.viewMode = 'days'; // 'days', 'months', 'years'
      this.today = new Date();

      this.init();
    }

    init() {
      this.renderCalendar();
      this.bindEvents();
    }

    bindEvents() {
      // Toggle popup
      this.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // Navigation buttons
      this.element.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleAction(btn.dataset.action);
        });
      });

      // Grid click delegation
      if (this.grid) {
        this.grid.addEventListener('click', (e) => {
          const day = e.target.closest('.calendar-day');
          if (day && !day.classList.contains('disabled')) {
            this.selectDate(day);
          }
        });
      }

      // Month/year grid click delegation
      if (this.monthYearGrid) {
        this.monthYearGrid.addEventListener('click', (e) => {
          const item = e.target.closest('.month-year-item');
          if (item) {
            this.handleMonthYearSelect(item);
          }
        });
      }

      // Keyboard navigation
      this.element.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    toggle() {
      if (this.element.classList.contains('open')) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      // Close any other open datepicker
      if (activeDatepicker && activeDatepicker !== this) {
        activeDatepicker.close();
      }

      this.element.classList.add('open');
      this.trigger.setAttribute('aria-expanded', 'true');
      activeDatepicker = this;

      // Reset view to current selection or today
      if (this.selectedDate) {
        this.viewDate = new Date(this.selectedDate);
      } else {
        this.viewDate = new Date();
      }
      this.viewMode = 'days';
      this.element.classList.remove('view-months', 'view-years');
      this.renderCalendar();

      // Focus first day
      requestAnimationFrame(() => {
        const focusTarget = this.grid.querySelector('.calendar-day.selected') ||
                          this.grid.querySelector('.calendar-day.today') ||
                          this.grid.querySelector('.calendar-day:not(.disabled):not(.other-month)');
        if (focusTarget) focusTarget.focus();
      });
    }

    close() {
      this.element.classList.remove('open', 'view-months', 'view-years');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.viewMode = 'days';
      if (activeDatepicker === this) {
        activeDatepicker = null;
      }
      this.trigger.focus();
    }

    handleAction(action) {
      switch (action) {
        case 'prev-month':
          if (this.viewMode === 'years') {
            this.viewDate.setFullYear(this.viewDate.getFullYear() - 12);
          } else {
            this.viewDate.setMonth(this.viewDate.getMonth() - 1);
          }
          this.renderCalendar();
          break;
        case 'next-month':
          if (this.viewMode === 'years') {
            this.viewDate.setFullYear(this.viewDate.getFullYear() + 12);
          } else {
            this.viewDate.setMonth(this.viewDate.getMonth() + 1);
          }
          this.renderCalendar();
          break;
        case 'show-months':
          this.viewMode = 'months';
          this.element.classList.add('view-months');
          this.element.classList.remove('view-years');
          this.renderMonthYearGrid();
          break;
        case 'show-years':
          this.viewMode = 'years';
          this.element.classList.add('view-years');
          this.element.classList.remove('view-months');
          this.renderMonthYearGrid();
          break;
      }
    }

    handleMonthYearSelect(item) {
      const value = parseInt(item.dataset.value, 10);

      if (this.viewMode === 'months') {
        this.viewDate.setMonth(value);
        this.viewMode = 'days';
        this.element.classList.remove('view-months');
        this.renderCalendar();
      } else if (this.viewMode === 'years') {
        this.viewDate.setFullYear(value);
        this.viewMode = 'months';
        this.element.classList.remove('view-years');
        this.element.classList.add('view-months');
        this.renderMonthYearGrid();
      }
    }

    selectDate(dayEl) {
      const date = new Date(parseInt(dayEl.dataset.timestamp, 10));
      this.selectedDate = date;
      this.updateTriggerText();
      this.element.classList.add('has-value');
      this.close();

      // Dispatch custom event
      this.element.dispatchEvent(new CustomEvent('datepicker:select', {
        detail: { date: this.selectedDate, formatted: formatDate(this.selectedDate) }
      }));
    }

    updateTriggerText() {
      const valueEl = this.trigger.querySelector('.datepicker-value');
      if (valueEl) {
        if (this.selectedDate) {
          valueEl.textContent = formatDate(this.selectedDate);
          valueEl.classList.remove('placeholder');
        } else {
          valueEl.textContent = 'Select a date';
          valueEl.classList.add('placeholder');
        }
      }
    }

    renderCalendar() {
      this.renderHeader();
      this.renderDays();
    }

    renderHeader() {
      const month = MONTH_NAMES[this.viewDate.getMonth()];
      const year = this.viewDate.getFullYear();

      if (this.titleBtns.length >= 2) {
        this.titleBtns[0].textContent = month;
        this.titleBtns[1].textContent = year;
      } else if (this.titleBtns.length === 1) {
        this.titleBtns[0].textContent = `${month} ${year}`;
      }

      // Also update any span-based titles
      const titleText = this.element.querySelector('.calendar-title-text');
      if (titleText) {
        titleText.textContent = `${month} ${year}`;
      }
    }

    renderDays() {
      if (!this.grid) return;

      const year = this.viewDate.getFullYear();
      const month = this.viewDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      const daysInPrevMonth = getDaysInMonth(year, month - 1);

      let html = '';

      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(year, month - 1, day);
        html += this.createDayButton(day, date, 'other-month');
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        let classes = '';

        if (isSameDay(date, this.today)) {
          classes += ' today';
        }
        if (isSameDay(date, this.selectedDate)) {
          classes += ' selected';
        }

        html += this.createDayButton(day, date, classes);
      }

      // Next month days (fill remaining cells)
      const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
      const remainingCells = totalCells - (firstDay + daysInMonth);
      for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        html += this.createDayButton(day, date, 'other-month');
      }

      this.grid.innerHTML = html;
    }

    createDayButton(day, date, extraClasses = '') {
      const timestamp = date.getTime();
      return `<button class="calendar-day${extraClasses ? ' ' + extraClasses : ''}"
                      data-timestamp="${timestamp}"
                      tabindex="-1"
                      role="gridcell"
                      aria-label="${formatDate(date)}"
                      aria-selected="${extraClasses.includes('selected')}">${day}</button>`;
    }

    renderMonthYearGrid() {
      if (!this.monthYearGrid) return;

      let html = '';
      const currentMonth = this.today.getMonth();
      const currentYear = this.today.getFullYear();
      const selectedMonth = this.selectedDate ? this.selectedDate.getMonth() : -1;
      const selectedYear = this.selectedDate ? this.selectedDate.getFullYear() : -1;

      if (this.viewMode === 'months') {
        for (let i = 0; i < 12; i++) {
          let classes = '';
          if (i === currentMonth && this.viewDate.getFullYear() === currentYear) {
            classes += ' current';
          }
          if (i === selectedMonth && this.viewDate.getFullYear() === selectedYear) {
            classes += ' selected';
          }
          html += `<button class="month-year-item${classes}" data-value="${i}" tabindex="-1">${MONTH_NAMES_SHORT[i]}</button>`;
        }
      } else if (this.viewMode === 'years') {
        const startYear = Math.floor(this.viewDate.getFullYear() / 12) * 12;
        for (let i = 0; i < 12; i++) {
          const year = startYear + i;
          let classes = '';
          if (year === currentYear) {
            classes += ' current';
          }
          if (year === selectedYear) {
            classes += ' selected';
          }
          html += `<button class="month-year-item${classes}" data-value="${year}" tabindex="-1">${year}</button>`;
        }

        // Update header for year range
        const titleText = this.element.querySelector('.calendar-title-text') || this.titleBtns[0];
        if (titleText) {
          titleText.textContent = `${startYear} - ${startYear + 11}`;
        }
      }

      this.monthYearGrid.innerHTML = html;
    }

    handleKeydown(e) {
      if (!this.element.classList.contains('open')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.open();
        }
        return;
      }

      const focusedDay = this.grid.querySelector('.calendar-day:focus');
      if (!focusedDay) return;

      const days = Array.from(this.grid.querySelectorAll('.calendar-day:not(.disabled)'));
      const currentIndex = days.indexOf(focusedDay);

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            days[currentIndex - 1].focus();
          } else {
            // Go to previous month
            this.handleAction('prev-month');
            requestAnimationFrame(() => {
              const newDays = Array.from(this.grid.querySelectorAll('.calendar-day:not(.disabled):not(.other-month)'));
              if (newDays.length) newDays[newDays.length - 1].focus();
            });
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < days.length - 1) {
            days[currentIndex + 1].focus();
          } else {
            // Go to next month
            this.handleAction('next-month');
            requestAnimationFrame(() => {
              const newDays = Array.from(this.grid.querySelectorAll('.calendar-day:not(.disabled):not(.other-month)'));
              if (newDays.length) newDays[0].focus();
            });
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex >= 7) {
            days[currentIndex - 7].focus();
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < days.length - 7) {
            days[currentIndex + 7].focus();
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!focusedDay.classList.contains('disabled')) {
            this.selectDate(focusedDay);
          }
          break;

        case 'Escape':
          e.preventDefault();
          this.close();
          break;

        case 'Home':
          e.preventDefault();
          const firstInMonth = this.grid.querySelector('.calendar-day:not(.other-month):not(.disabled)');
          if (firstInMonth) firstInMonth.focus();
          break;

        case 'End':
          e.preventDefault();
          const allInMonth = this.grid.querySelectorAll('.calendar-day:not(.other-month):not(.disabled)');
          if (allInMonth.length) allInMonth[allInMonth.length - 1].focus();
          break;
      }
    }
  }

  // ========================================
  // DATE RANGE PICKER CLASS
  // ========================================

  class DateRangePicker {
    constructor(element) {
      this.element = element;
      this.trigger = element.querySelector('.datepicker-trigger');
      this.popup = element.querySelector('.datepicker-popup');
      this.startCalendar = element.querySelector('[data-calendar="start"]');
      this.endCalendar = element.querySelector('[data-calendar="end"]');
      this.clearBtn = element.querySelector('.datepicker-clear');

      this.startDate = null;
      this.endDate = null;
      this.tempStartDate = null;
      this.tempEndDate = null;
      this.hoverDate = null;
      this.selecting = 'start'; // 'start' or 'end'

      this.startViewDate = new Date();
      this.endViewDate = new Date();
      this.endViewDate.setMonth(this.endViewDate.getMonth() + 1);

      this.today = new Date();

      this.init();
    }

    init() {
      this.renderCalendars();
      this.bindEvents();
    }

    bindEvents() {
      // Toggle popup
      this.trigger.addEventListener('click', (e) => {
        if (e.target.closest('.datepicker-clear')) return;
        e.stopPropagation();
        this.toggle();
      });

      // Clear button
      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.clearSelection();
        });
      }

      // Navigation buttons
      this.element.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleAction(btn.dataset.action, btn.closest('.range-calendar'));
        });
      });

      // Calendar clicks
      [this.startCalendar, this.endCalendar].forEach(cal => {
        if (!cal) return;
        const grid = cal.querySelector('.calendar-grid');
        if (grid) {
          grid.addEventListener('click', (e) => {
            const day = e.target.closest('.calendar-day');
            if (day && !day.classList.contains('disabled')) {
              this.handleDayClick(day);
            }
          });

          grid.addEventListener('mouseover', (e) => {
            const day = e.target.closest('.calendar-day');
            if (day && !day.classList.contains('disabled')) {
              this.handleDayHover(day);
            }
          });

          grid.addEventListener('mouseleave', () => {
            this.hoverDate = null;
            this.renderCalendars();
          });
        }
      });

      // Preset buttons
      this.element.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.applyPreset(btn.dataset.preset);
        });
      });

      // Footer buttons
      this.element.querySelector('[data-action="cancel"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cancel();
      });

      this.element.querySelector('[data-action="apply"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.apply();
      });

      // Keyboard
      this.element.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    toggle() {
      if (this.element.classList.contains('open')) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      if (activeDatepicker && activeDatepicker !== this) {
        activeDatepicker.close();
      }

      this.element.classList.add('open');
      this.trigger.setAttribute('aria-expanded', 'true');
      activeDatepicker = this;

      // Copy current selection to temp
      this.tempStartDate = this.startDate ? new Date(this.startDate) : null;
      this.tempEndDate = this.endDate ? new Date(this.endDate) : null;
      this.selecting = 'start';

      // Set view dates
      if (this.tempStartDate) {
        this.startViewDate = new Date(this.tempStartDate);
        this.endViewDate = new Date(this.tempStartDate);
        this.endViewDate.setMonth(this.endViewDate.getMonth() + 1);
      } else {
        this.startViewDate = new Date();
        this.endViewDate = new Date();
        this.endViewDate.setMonth(this.endViewDate.getMonth() + 1);
      }

      this.renderCalendars();
    }

    close() {
      this.element.classList.remove('open');
      this.trigger.setAttribute('aria-expanded', 'false');
      if (activeDatepicker === this) {
        activeDatepicker = null;
      }
      this.trigger.focus();
    }

    handleAction(action, calendar) {
      switch (action) {
        case 'prev-month':
          this.startViewDate.setMonth(this.startViewDate.getMonth() - 1);
          this.endViewDate.setMonth(this.endViewDate.getMonth() - 1);
          this.renderCalendars();
          break;
        case 'next-month':
          this.startViewDate.setMonth(this.startViewDate.getMonth() + 1);
          this.endViewDate.setMonth(this.endViewDate.getMonth() + 1);
          this.renderCalendars();
          break;
      }
    }

    handleDayClick(dayEl) {
      const date = new Date(parseInt(dayEl.dataset.timestamp, 10));

      if (this.selecting === 'start' || (this.tempStartDate && this.tempEndDate)) {
        // Starting new selection
        this.tempStartDate = date;
        this.tempEndDate = null;
        this.selecting = 'end';
      } else {
        // Completing selection
        if (date < this.tempStartDate) {
          // Clicked before start, swap
          this.tempEndDate = this.tempStartDate;
          this.tempStartDate = date;
        } else {
          this.tempEndDate = date;
        }
        this.selecting = 'start';
      }

      this.renderCalendars();
    }

    handleDayHover(dayEl) {
      if (this.selecting === 'end' && this.tempStartDate) {
        this.hoverDate = new Date(parseInt(dayEl.dataset.timestamp, 10));
        this.renderCalendars();
      }
    }

    applyPreset(preset) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (preset) {
        case 'today':
          this.tempStartDate = new Date(today);
          this.tempEndDate = new Date(today);
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          this.tempStartDate = yesterday;
          this.tempEndDate = yesterday;
          break;
        case 'last7':
          const last7 = new Date(today);
          last7.setDate(last7.getDate() - 6);
          this.tempStartDate = last7;
          this.tempEndDate = new Date(today);
          break;
        case 'last30':
          const last30 = new Date(today);
          last30.setDate(last30.getDate() - 29);
          this.tempStartDate = last30;
          this.tempEndDate = new Date(today);
          break;
        case 'thisMonth':
          this.tempStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
          this.tempEndDate = new Date(today);
          break;
        case 'lastMonth':
          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          this.tempStartDate = lastMonthStart;
          this.tempEndDate = lastMonthEnd;
          break;
      }

      this.selecting = 'start';

      // Update view dates to show selection
      if (this.tempStartDate) {
        this.startViewDate = new Date(this.tempStartDate);
        this.endViewDate = new Date(this.tempStartDate);
        this.endViewDate.setMonth(this.endViewDate.getMonth() + 1);
      }

      this.renderCalendars();

      // Update preset button active state
      this.element.querySelectorAll('[data-preset]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === preset);
      });
    }

    apply() {
      this.startDate = this.tempStartDate;
      this.endDate = this.tempEndDate;
      this.updateTriggerText();
      this.element.classList.toggle('has-value', !!(this.startDate || this.endDate));
      this.close();

      this.element.dispatchEvent(new CustomEvent('datepicker:select', {
        detail: {
          startDate: this.startDate,
          endDate: this.endDate,
          formatted: formatDateRange(this.startDate, this.endDate)
        }
      }));
    }

    cancel() {
      this.tempStartDate = this.startDate;
      this.tempEndDate = this.endDate;
      this.close();
    }

    clearSelection() {
      this.startDate = null;
      this.endDate = null;
      this.tempStartDate = null;
      this.tempEndDate = null;
      this.updateTriggerText();
      this.element.classList.remove('has-value');

      this.element.dispatchEvent(new CustomEvent('datepicker:clear'));
    }

    updateTriggerText() {
      const valueEl = this.trigger.querySelector('.datepicker-value');
      if (valueEl) {
        const text = formatDateRange(this.startDate, this.endDate);
        if (text) {
          valueEl.textContent = text;
          valueEl.classList.remove('placeholder');
        } else {
          valueEl.textContent = 'Select date range';
          valueEl.classList.add('placeholder');
        }
      }
    }

    renderCalendars() {
      this.renderCalendar(this.startCalendar, this.startViewDate);
      this.renderCalendar(this.endCalendar, this.endViewDate);
    }

    renderCalendar(calendar, viewDate) {
      if (!calendar) return;

      const titleText = calendar.querySelector('.calendar-title-text');
      if (titleText) {
        titleText.textContent = `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
      }

      const grid = calendar.querySelector('.calendar-grid');
      if (!grid) return;

      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      const daysInPrevMonth = getDaysInMonth(year, month - 1);

      let html = '';

      // Determine effective end date for highlighting
      const effectiveEnd = this.tempEndDate || this.hoverDate;

      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(year, month - 1, day);
        html += this.createDayButton(day, date, 'other-month', effectiveEnd);
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        html += this.createDayButton(day, date, '', effectiveEnd);
      }

      // Next month days
      const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
      const remainingCells = totalCells - (firstDay + daysInMonth);
      for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        html += this.createDayButton(day, date, 'other-month', effectiveEnd);
      }

      grid.innerHTML = html;
    }

    createDayButton(day, date, extraClasses, effectiveEnd) {
      const timestamp = date.getTime();
      let classes = extraClasses;

      if (isSameDay(date, this.today)) {
        classes += ' today';
      }

      // Range highlighting
      if (this.tempStartDate && effectiveEnd) {
        const start = this.tempStartDate < effectiveEnd ? this.tempStartDate : effectiveEnd;
        const end = this.tempStartDate < effectiveEnd ? effectiveEnd : this.tempStartDate;

        if (isSameDay(date, start)) {
          classes += ' range-start selected';
        } else if (isSameDay(date, end)) {
          classes += ' range-end selected';
        } else if (isDateInRange(date, start, end)) {
          classes += ' in-range';
        }
      } else if (isSameDay(date, this.tempStartDate)) {
        classes += ' selected range-start range-end';
      }

      return `<button class="calendar-day${classes ? ' ' + classes.trim() : ''}"
                      data-timestamp="${timestamp}"
                      tabindex="-1"
                      role="gridcell"
                      aria-label="${formatDate(date)}">${day}</button>`;
    }

    handleKeydown(e) {
      if (e.key === 'Escape' && this.element.classList.contains('open')) {
        e.preventDefault();
        this.cancel();
      }
    }
  }

  // ========================================
  // DATE TIME PICKER CLASS
  // ========================================

  class DateTimePicker extends DatePicker {
    constructor(element) {
      super(element);
      this.hours = 12;
      this.minutes = 0;
      this.period = 'AM';

      this.hoursInput = element.querySelector('[data-time="hours"]');
      this.minutesInput = element.querySelector('[data-time="minutes"]');
      this.periodBtns = element.querySelectorAll('[data-period]');

      this.initTime();
    }

    initTime() {
      if (this.hoursInput) {
        this.hoursInput.addEventListener('input', (e) => {
          let val = parseInt(e.target.value, 10) || 0;
          if (val > 12) val = 12;
          if (val < 1) val = 1;
          this.hours = val;
          e.target.value = val.toString().padStart(2, '0');
          this.updateTriggerText();
        });

        this.hoursInput.addEventListener('blur', (e) => {
          e.target.value = this.hours.toString().padStart(2, '0');
        });
      }

      if (this.minutesInput) {
        this.minutesInput.addEventListener('input', (e) => {
          let val = parseInt(e.target.value, 10) || 0;
          if (val > 59) val = 59;
          if (val < 0) val = 0;
          this.minutes = val;
          e.target.value = val.toString().padStart(2, '0');
          this.updateTriggerText();
        });

        this.minutesInput.addEventListener('blur', (e) => {
          e.target.value = this.minutes.toString().padStart(2, '0');
        });
      }

      this.periodBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.period = btn.dataset.period;
          this.periodBtns.forEach(b => b.classList.toggle('active', b === btn));
          this.updateTriggerText();
        });
      });
    }

    selectDate(dayEl) {
      const date = new Date(parseInt(dayEl.dataset.timestamp, 10));
      this.selectedDate = date;
      this.updateTriggerText();
      this.element.classList.add('has-value');
      this.renderCalendar();

      // Don't close - let user adjust time
      this.element.dispatchEvent(new CustomEvent('datepicker:select', {
        detail: {
          date: this.selectedDate,
          hours: this.hours,
          minutes: this.minutes,
          period: this.period,
          formatted: formatDateTime(this.selectedDate, this.hours, this.minutes, this.period)
        }
      }));
    }

    updateTriggerText() {
      const valueEl = this.trigger.querySelector('.datepicker-value');
      if (valueEl) {
        if (this.selectedDate) {
          valueEl.textContent = formatDateTime(this.selectedDate, this.hours, this.minutes, this.period);
          valueEl.classList.remove('placeholder');
        } else {
          valueEl.textContent = 'Select date & time';
          valueEl.classList.add('placeholder');
        }
      }
    }
  }

  // ========================================
  // INLINE CALENDAR CLASS
  // ========================================

  class InlineCalendar {
    constructor(element) {
      this.element = element;
      this.container = element.querySelector('.calendar-container');
      this.grid = element.querySelector('.calendar-grid');
      this.monthYearGrid = element.querySelector('.month-year-grid');
      this.titleBtns = element.querySelectorAll('.calendar-title-btn');

      this.selectedDate = null;
      this.viewDate = new Date();
      this.viewMode = 'days';
      this.today = new Date();

      this.init();
    }

    init() {
      this.renderCalendar();
      this.bindEvents();
    }

    bindEvents() {
      // Navigation buttons
      this.element.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleAction(btn.dataset.action);
        });
      });

      // Grid click delegation
      if (this.grid) {
        this.grid.addEventListener('click', (e) => {
          const day = e.target.closest('.calendar-day');
          if (day && !day.classList.contains('disabled')) {
            this.selectDate(day);
          }
        });
      }

      // Month/year grid
      if (this.monthYearGrid) {
        this.monthYearGrid.addEventListener('click', (e) => {
          const item = e.target.closest('.month-year-item');
          if (item) {
            this.handleMonthYearSelect(item);
          }
        });
      }

      // Keyboard navigation
      this.element.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    handleAction(action) {
      switch (action) {
        case 'prev-month':
          if (this.viewMode === 'years') {
            this.viewDate.setFullYear(this.viewDate.getFullYear() - 12);
          } else {
            this.viewDate.setMonth(this.viewDate.getMonth() - 1);
          }
          this.renderCalendar();
          break;
        case 'next-month':
          if (this.viewMode === 'years') {
            this.viewDate.setFullYear(this.viewDate.getFullYear() + 12);
          } else {
            this.viewDate.setMonth(this.viewDate.getMonth() + 1);
          }
          this.renderCalendar();
          break;
        case 'show-months':
          this.viewMode = 'months';
          this.element.classList.add('view-months');
          this.element.classList.remove('view-years');
          this.renderMonthYearGrid();
          break;
        case 'show-years':
          this.viewMode = 'years';
          this.element.classList.add('view-years');
          this.element.classList.remove('view-months');
          this.renderMonthYearGrid();
          break;
      }
    }

    handleMonthYearSelect(item) {
      const value = parseInt(item.dataset.value, 10);

      if (this.viewMode === 'months') {
        this.viewDate.setMonth(value);
        this.viewMode = 'days';
        this.element.classList.remove('view-months');
        this.renderCalendar();
      } else if (this.viewMode === 'years') {
        this.viewDate.setFullYear(value);
        this.viewMode = 'months';
        this.element.classList.remove('view-years');
        this.element.classList.add('view-months');
        this.renderMonthYearGrid();
      }
    }

    selectDate(dayEl) {
      const date = new Date(parseInt(dayEl.dataset.timestamp, 10));
      this.selectedDate = date;
      this.renderCalendar();

      this.element.dispatchEvent(new CustomEvent('datepicker:select', {
        detail: { date: this.selectedDate, formatted: formatDate(this.selectedDate) }
      }));
    }

    renderCalendar() {
      this.renderHeader();
      this.renderDays();
    }

    renderHeader() {
      const month = MONTH_NAMES[this.viewDate.getMonth()];
      const year = this.viewDate.getFullYear();

      if (this.titleBtns.length >= 2) {
        this.titleBtns[0].textContent = month;
        this.titleBtns[1].textContent = year;
      }
    }

    renderDays() {
      if (!this.grid) return;

      const year = this.viewDate.getFullYear();
      const month = this.viewDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      const daysInPrevMonth = getDaysInMonth(year, month - 1);

      let html = '';

      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(year, month - 1, day);
        html += this.createDayButton(day, date, 'other-month');
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        let classes = '';

        if (isSameDay(date, this.today)) {
          classes += ' today';
        }
        if (isSameDay(date, this.selectedDate)) {
          classes += ' selected';
        }

        html += this.createDayButton(day, date, classes);
      }

      // Next month days
      const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
      const remainingCells = totalCells - (firstDay + daysInMonth);
      for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        html += this.createDayButton(day, date, 'other-month');
      }

      this.grid.innerHTML = html;
    }

    createDayButton(day, date, extraClasses = '') {
      const timestamp = date.getTime();
      return `<button class="calendar-day${extraClasses ? ' ' + extraClasses : ''}"
                      data-timestamp="${timestamp}"
                      tabindex="0"
                      role="gridcell"
                      aria-label="${formatDate(date)}"
                      aria-selected="${extraClasses.includes('selected')}">${day}</button>`;
    }

    renderMonthYearGrid() {
      if (!this.monthYearGrid) return;

      let html = '';
      const currentMonth = this.today.getMonth();
      const currentYear = this.today.getFullYear();
      const selectedMonth = this.selectedDate ? this.selectedDate.getMonth() : -1;
      const selectedYear = this.selectedDate ? this.selectedDate.getFullYear() : -1;

      if (this.viewMode === 'months') {
        for (let i = 0; i < 12; i++) {
          let classes = '';
          if (i === currentMonth && this.viewDate.getFullYear() === currentYear) {
            classes += ' current';
          }
          if (i === selectedMonth && this.viewDate.getFullYear() === selectedYear) {
            classes += ' selected';
          }
          html += `<button class="month-year-item${classes}" data-value="${i}" tabindex="0">${MONTH_NAMES_SHORT[i]}</button>`;
        }
      } else if (this.viewMode === 'years') {
        const startYear = Math.floor(this.viewDate.getFullYear() / 12) * 12;
        for (let i = 0; i < 12; i++) {
          const year = startYear + i;
          let classes = '';
          if (year === currentYear) {
            classes += ' current';
          }
          if (year === selectedYear) {
            classes += ' selected';
          }
          html += `<button class="month-year-item${classes}" data-value="${year}" tabindex="0">${year}</button>`;
        }

        // Update header
        if (this.titleBtns[0]) {
          this.titleBtns[0].textContent = `${startYear} - ${startYear + 11}`;
        }
      }

      this.monthYearGrid.innerHTML = html;
    }

    handleKeydown(e) {
      const focusedDay = this.grid.querySelector('.calendar-day:focus');
      if (!focusedDay) return;

      const days = Array.from(this.grid.querySelectorAll('.calendar-day:not(.disabled)'));
      const currentIndex = days.indexOf(focusedDay);

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            days[currentIndex - 1].focus();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < days.length - 1) {
            days[currentIndex + 1].focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex >= 7) {
            days[currentIndex - 7].focus();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < days.length - 7) {
            days[currentIndex + 7].focus();
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!focusedDay.classList.contains('disabled')) {
            this.selectDate(focusedDay);
          }
          break;
      }
    }
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  function initDatePickers() {
    // Basic date pickers
    document.querySelectorAll('.datepicker:not(.datepicker-range):not(.datepicker-datetime)').forEach(el => {
      if (!el.classList.contains('datepicker-disabled')) {
        new DatePicker(el);
      }
    });

    // Date range pickers
    document.querySelectorAll('.datepicker-range').forEach(el => {
      new DateRangePicker(el);
    });

    // Date time pickers
    document.querySelectorAll('.datepicker-datetime').forEach(el => {
      new DateTimePicker(el);
    });

    // Inline calendars
    document.querySelectorAll('.datepicker-inline').forEach(el => {
      new InlineCalendar(el);
    });
  }

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (activeDatepicker && !activeDatepicker.element.contains(e.target)) {
      activeDatepicker.close();
    }
  });

  // Close on Escape (global)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeDatepicker) {
      activeDatepicker.close();
    }
  });

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDatePickers);
  } else {
    initDatePickers();
  }

  // Expose for external use
  window.DatePicker = DatePicker;
  window.DateRangePicker = DateRangePicker;
  window.DateTimePicker = DateTimePicker;
  window.InlineCalendar = InlineCalendar;
})();

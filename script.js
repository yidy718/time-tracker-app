class TimeTracker {
    constructor() {
        this.isClocked = false;
        this.isOnLunch = false;
        this.clockInTime = null;
        this.lunchStartTime = null;
        this.sessionInterval = null;
        this.currentTimeInterval = null;
        this.totalLunchTime = 0;
        
        this.elements = {
            currentTime: document.getElementById('current-time'),
            status: document.getElementById('status'),
            sessionTime: document.getElementById('session-time'),
            clockInBtn: document.getElementById('clock-in-btn'),
            clockOutBtn: document.getElementById('clock-out-btn'),
            lunchBtn: document.getElementById('lunch-btn'),
            dailyTotal: document.getElementById('daily-total'),
            weeklyTotal: document.getElementById('weekly-total'),
            sessionHistory: document.getElementById('session-history'),
            weekDisplay: document.getElementById('week-display'),
            exportCsvBtn: document.getElementById('export-csv-btn'),
            exportJsonBtn: document.getElementById('export-json-btn')
        };
        
        this.init();
    }
    
    init() {
        this.loadState();
        this.updateCurrentTime();
        this.updateDisplay();
        this.bindEvents();
        this.startCurrentTimeUpdate();
    }
    
    bindEvents() {
        this.elements.clockInBtn.addEventListener('click', () => this.clockIn());
        this.elements.clockOutBtn.addEventListener('click', () => this.clockOut());
        this.elements.lunchBtn.addEventListener('click', () => this.toggleLunch());
        this.elements.exportCsvBtn.addEventListener('click', () => this.exportCSV());
        this.elements.exportJsonBtn.addEventListener('click', () => this.exportJSON());
    }
    
    startCurrentTimeUpdate() {
        this.currentTimeInterval = setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.elements.currentTime.textContent = timeString;
    }
    
    clockIn() {
        this.isClocked = true;
        this.clockInTime = new Date();
        this.totalLunchTime = 0;
        
        this.elements.status.textContent = 'Clocked In';
        this.elements.status.classList.add('clocked-in');
        this.elements.clockInBtn.disabled = true;
        this.elements.clockOutBtn.disabled = false;
        this.elements.lunchBtn.disabled = false;
        this.elements.lunchBtn.textContent = 'Start Lunch';
        
        this.startSessionTimer();
        this.saveState();
    }
    
    clockOut() {
        if (!this.isClocked || !this.clockInTime) return;
        
        if (this.isOnLunch) {
            this.endLunch();
        }
        
        const clockOutTime = new Date();
        const duration = clockOutTime - this.clockInTime;
        
        this.saveSession(this.clockInTime, clockOutTime, duration, this.totalLunchTime);
        
        this.isClocked = false;
        this.clockInTime = null;
        this.totalLunchTime = 0;
        
        this.elements.status.textContent = 'Clocked Out';
        this.elements.status.classList.remove('clocked-in', 'on-lunch');
        this.elements.clockInBtn.disabled = false;
        this.elements.clockOutBtn.disabled = true;
        this.elements.lunchBtn.disabled = true;
        this.elements.sessionTime.textContent = '00:00:00';
        
        this.stopSessionTimer();
        this.updateDisplay();
        this.saveState();
    }
    
    startSessionTimer() {
        this.sessionInterval = setInterval(() => {
            if (this.clockInTime) {
                const elapsed = new Date() - this.clockInTime - this.totalLunchTime;
                this.elements.sessionTime.textContent = this.formatDuration(elapsed);
            }
        }, 1000);
    }
    
    stopSessionTimer() {
        if (this.sessionInterval) {
            clearInterval(this.sessionInterval);
            this.sessionInterval = null;
        }
    }
    
    toggleLunch() {
        if (this.isOnLunch) {
            this.endLunch();
        } else {
            this.startLunch();
        }
    }
    
    startLunch() {
        if (!this.isClocked) return;
        
        this.isOnLunch = true;
        this.lunchStartTime = new Date();
        
        this.elements.status.textContent = 'On Lunch Break';
        this.elements.status.classList.remove('clocked-in');
        this.elements.status.classList.add('on-lunch');
        this.elements.lunchBtn.textContent = 'End Lunch';
        this.elements.clockOutBtn.disabled = true;
        
        this.saveState();
    }
    
    endLunch() {
        if (!this.isOnLunch || !this.lunchStartTime) return;
        
        const lunchDuration = new Date() - this.lunchStartTime;
        this.totalLunchTime += lunchDuration;
        
        this.isOnLunch = false;
        this.lunchStartTime = null;
        
        this.elements.status.textContent = 'Clocked In';
        this.elements.status.classList.remove('on-lunch');
        this.elements.status.classList.add('clocked-in');
        this.elements.lunchBtn.textContent = 'Start Lunch';
        this.elements.clockOutBtn.disabled = false;
        
        this.saveState();
    }
    
    saveSession(clockIn, clockOut, duration, lunchTime = 0) {
        const sessions = this.getSessions();
        const session = {
            id: Date.now(),
            clockIn: clockIn.toISOString(),
            clockOut: clockOut.toISOString(),
            duration: duration,
            lunchTime: lunchTime,
            workTime: duration - lunchTime,
            date: clockIn.toDateString()
        };
        
        sessions.push(session);
        localStorage.setItem('timeSessions', JSON.stringify(sessions));
    }
    
    getSessions() {
        const stored = localStorage.getItem('timeSessions');
        return stored ? JSON.parse(stored) : [];
    }
    
    updateDisplay() {
        this.updateDailyTotal();
        this.updateWeeklyTotal();
        this.updateSessionHistory();
        this.updateWeekView();
    }
    
    updateDailyTotal() {
        const today = new Date().toDateString();
        const sessions = this.getSessions();
        const todaySessions = sessions.filter(session => session.date === today);
        const totalWorkTime = todaySessions.reduce((sum, session) => {
            const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
            return sum + workTime;
        }, 0);
        
        this.elements.dailyTotal.textContent = this.formatDuration(totalWorkTime);
    }
    
    updateWeeklyTotal() {
        const currentWeek = this.getCurrentWeek();
        const sessions = this.getSessions();
        const weekSessions = sessions.filter(session => {
            const sessionDate = new Date(session.clockIn);
            return sessionDate >= currentWeek.start && sessionDate <= currentWeek.end;
        });
        const totalWorkTime = weekSessions.reduce((sum, session) => {
            const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
            return sum + workTime;
        }, 0);
        
        this.elements.weeklyTotal.textContent = this.formatDuration(totalWorkTime);
    }
    
    getCurrentWeek() {
        const now = new Date();
        const day = now.getDay();
        const diff = day === 0 ? -6 : 1 - day; // Monday as first day
        
        const start = new Date(now);
        start.setDate(now.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        
        return { start, end };
    }
    
    updateSessionHistory() {
        const sessions = this.getSessions();
        const recentSessions = sessions.slice(-10).reverse();
        
        this.elements.sessionHistory.innerHTML = '';
        
        recentSessions.forEach(session => {
            const div = document.createElement('div');
            div.className = 'session-item';
            
            const clockIn = new Date(session.clockIn);
            const clockOut = new Date(session.clockOut);
            
            const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
            const lunchDisplay = session.lunchTime ? ` (${this.formatDuration(session.lunchTime)} lunch)` : '';
            
            div.innerHTML = `
                <div class="session-date">
                    ${clockIn.toLocaleDateString()} ${clockIn.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'})} - 
                    ${clockOut.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'})}
                </div>
                <div class="session-duration">${this.formatDuration(workTime)}${lunchDisplay}</div>
            `;
            
            this.elements.sessionHistory.appendChild(div);
        });
    }
    
    updateWeekView() {
        const currentWeek = this.getCurrentWeek();
        const sessions = this.getSessions();
        const today = new Date().toDateString();
        
        this.elements.weekDisplay.innerHTML = '';
        
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeek.start);
            date.setDate(currentWeek.start.getDate() + i);
            
            const dayString = date.toDateString();
            const daySessions = sessions.filter(session => session.date === dayString);
            const dayTotal = daySessions.reduce((sum, session) => {
                const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
                return sum + workTime;
            }, 0);
            
            const div = document.createElement('div');
            div.className = 'day-item';
            if (dayString === today) {
                div.classList.add('today');
            }
            
            div.innerHTML = `
                <div class="day-name">${dayNames[i]}</div>
                <div class="day-date">${date.getDate()}</div>
                <div class="day-hours">${this.formatDuration(dayTotal, true)}</div>
            `;
            
            this.elements.weekDisplay.appendChild(div);
        }
    }
    
    formatDuration(ms, short = false) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        
        if (short) {
            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    saveState() {
        const state = {
            isClocked: this.isClocked,
            isOnLunch: this.isOnLunch,
            clockInTime: this.clockInTime ? this.clockInTime.toISOString() : null,
            lunchStartTime: this.lunchStartTime ? this.lunchStartTime.toISOString() : null,
            totalLunchTime: this.totalLunchTime
        };
        localStorage.setItem('timeTrackerState', JSON.stringify(state));
    }
    
    loadState() {
        const stored = localStorage.getItem('timeTrackerState');
        if (stored) {
            const state = JSON.parse(stored);
            this.isClocked = state.isClocked || false;
            this.isOnLunch = state.isOnLunch || false;
            this.clockInTime = state.clockInTime ? new Date(state.clockInTime) : null;
            this.lunchStartTime = state.lunchStartTime ? new Date(state.lunchStartTime) : null;
            this.totalLunchTime = state.totalLunchTime || 0;
            
            if (this.isClocked && this.clockInTime) {
                this.elements.clockInBtn.disabled = true;
                this.elements.lunchBtn.disabled = false;
                
                if (this.isOnLunch) {
                    this.elements.status.textContent = 'On Lunch Break';
                    this.elements.status.classList.add('on-lunch');
                    this.elements.lunchBtn.textContent = 'End Lunch';
                    this.elements.clockOutBtn.disabled = true;
                } else {
                    this.elements.status.textContent = 'Clocked In';
                    this.elements.status.classList.add('clocked-in');
                    this.elements.lunchBtn.textContent = 'Start Lunch';
                    this.elements.clockOutBtn.disabled = false;
                }
                
                this.startSessionTimer();
            }
        }
    }
    
    exportCSV() {
        const sessions = this.getSessions();
        if (sessions.length === 0) {
            alert('No data to export');
            return;
        }
        
        const headers = ['Date', 'Clock In', 'Clock Out', 'Total Time', 'Lunch Time', 'Work Time'];
        const csvContent = [
            headers.join(','),
            ...sessions.map(session => {
                const clockIn = new Date(session.clockIn);
                const clockOut = new Date(session.clockOut);
                const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
                
                return [
                    `"${clockIn.toLocaleDateString()}"`,
                    `"${clockIn.toLocaleTimeString()}"`,
                    `"${clockOut.toLocaleTimeString()}"`,
                    `"${this.formatDuration(session.duration)}"`,
                    `"${this.formatDuration(session.lunchTime || 0)}"`,
                    `"${this.formatDuration(workTime)}"`
                ].join(',');
            })
        ].join('\n');
        
        this.downloadFile(csvContent, 'time-tracker-data.csv', 'text/csv');
    }
    
    exportJSON() {
        const sessions = this.getSessions();
        if (sessions.length === 0) {
            alert('No data to export');
            return;
        }
        
        const exportData = {
            exportDate: new Date().toISOString(),
            totalSessions: sessions.length,
            sessions: sessions.map(session => ({
                ...session,
                workTime: session.workTime || (session.duration - (session.lunchTime || 0)),
                formattedClockIn: new Date(session.clockIn).toLocaleString(),
                formattedClockOut: new Date(session.clockOut).toLocaleString(),
                formattedDuration: this.formatDuration(session.duration),
                formattedLunchTime: this.formatDuration(session.lunchTime || 0),
                formattedWorkTime: this.formatDuration(session.workTime || (session.duration - (session.lunchTime || 0)))
            }))
        };
        
        const jsonContent = JSON.stringify(exportData, null, 2);
        this.downloadFile(jsonContent, 'time-tracker-data.json', 'application/json');
    }
    
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TimeTracker();
});
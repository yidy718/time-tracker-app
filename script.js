class TimeTracker {
    constructor() {
        this.isClocked = false;
        this.isOnLunch = false;
        this.clockInTime = null;
        this.lunchStartTime = null;
        this.sessionInterval = null;
        this.currentTimeInterval = null;
        this.totalLunchTime = 0;
        this.currentWorker = null;
        this.currentLocation = null;
        
        this.elements = {
            // Pages
            setupPage: document.getElementById('setup-page'),
            mainPage: document.getElementById('main-page'),
            
            // Setup page elements
            setupWorkerName: document.getElementById('setup-worker-name'),
            setupWorkLocation: document.getElementById('setup-work-location'),
            startWorkBtn: document.getElementById('start-work-btn'),
            workerList: document.getElementById('worker-list'),
            locationList: document.getElementById('location-list'),
            
            // Main page elements
            currentTime: document.getElementById('current-time'),
            currentDay: document.getElementById('current-day'),
            status: document.getElementById('status'),
            sessionTime: document.getElementById('session-time'),
            clockInBtn: document.getElementById('clock-in-btn'),
            clockOutBtn: document.getElementById('clock-out-btn'),
            lunchBtn: document.getElementById('lunch-btn'),
            dailyTotal: document.getElementById('daily-total'),
            weeklyTotal: document.getElementById('weekly-total'),
            sessionHistory: document.getElementById('session-history'),
            weekDisplay: document.getElementById('week-display'),
            workerDisplay: document.getElementById('worker-display'),
            locationDisplay: document.getElementById('location-display'),
            backToSetup: document.getElementById('back-to-setup'),
            
            // Menu elements
            menuBtn: document.getElementById('menu-btn'),
            menuDropdown: document.getElementById('menu-dropdown'),
            exportCsvMenu: document.getElementById('export-csv-menu'),
            exportJsonMenu: document.getElementById('export-json-menu'),
            shareEmailMenu: document.getElementById('share-email-menu'),
            shareMenu: document.getElementById('share-menu')
        };
        
        this.init();
    }
    
    init() {
        this.loadWorkerLocations();
        this.updateCurrentTime();
        this.updateCurrentDay();
        this.updateDisplay();
        this.bindEvents();
        this.startCurrentTimeUpdate();
        this.checkInitialState();
    }
    
    checkInitialState() {
        // Check if user is already clocked in
        const stored = localStorage.getItem('timeTrackerState');
        if (stored) {
            const state = JSON.parse(stored);
            if (state.isClocked && state.currentWorker && state.currentLocation) {
                // Go directly to main page if already working
                this.currentWorker = state.currentWorker;
                this.currentLocation = state.currentLocation;
                this.showMainPage();
                this.loadState();
                return;
            }
        }
        
        // Show setup page by default
        this.showSetupPage();
    }
    
    bindEvents() {
        // Setup page events
        this.elements.startWorkBtn.addEventListener('click', () => this.handleStartWork());
        this.elements.setupWorkerName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleStartWork();
        });
        this.elements.setupWorkLocation.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleStartWork();
        });
        
        // Main page events
        this.elements.clockInBtn.addEventListener('click', () => this.clockIn());
        this.elements.clockOutBtn.addEventListener('click', () => this.clockOut());
        this.elements.lunchBtn.addEventListener('click', () => this.toggleLunch());
        this.elements.backToSetup.addEventListener('click', () => this.handleBackToSetup());
        
        // Menu events
        this.elements.menuBtn.addEventListener('click', () => this.toggleMenu());
        this.elements.exportCsvMenu.addEventListener('click', () => { this.exportCSV(); this.closeMenu(); });
        this.elements.exportJsonMenu.addEventListener('click', () => { this.exportJSON(); this.closeMenu(); });
        this.elements.shareEmailMenu.addEventListener('click', () => { this.shareEmail(); this.closeMenu(); });
        this.elements.shareMenu.addEventListener('click', () => { this.shareNative(); this.closeMenu(); });
        
        // Global events
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }
    
    showSetupPage() {
        this.elements.setupPage.classList.remove('hidden');
        this.elements.mainPage.classList.add('hidden');
        
        // Pre-fill with current worker info if available
        if (this.currentWorker) {
            this.elements.setupWorkerName.value = this.currentWorker;
        }
        if (this.currentLocation) {
            this.elements.setupWorkLocation.value = this.currentLocation;
        }
    }
    
    showMainPage() {
        this.elements.setupPage.classList.add('hidden');
        this.elements.mainPage.classList.remove('hidden');
        this.updateWorkerDisplay();
    }
    
    handleStartWork() {
        const workerName = this.elements.setupWorkerName.value.trim();
        const workLocation = this.elements.setupWorkLocation.value.trim();
        
        if (!workerName) {
            this.elements.setupWorkerName.focus();
            this.elements.setupWorkerName.style.borderColor = '#dc3545';
            setTimeout(() => {
                this.elements.setupWorkerName.style.borderColor = '';
            }, 2000);
            return;
        }
        
        if (!workLocation) {
            this.elements.setupWorkLocation.focus();
            this.elements.setupWorkLocation.style.borderColor = '#dc3545';
            setTimeout(() => {
                this.elements.setupWorkLocation.style.borderColor = '';
            }, 2000);
            return;
        }
        
        this.currentWorker = workerName;
        this.currentLocation = workLocation;
        this.saveWorkerLocation(workerName, workLocation);
        this.showMainPage();
    }
    
    handleBackToSetup() {
        if (this.isClocked) {
            if (confirm('You are currently clocked in. Going back will clock you out. Continue?')) {
                this.clockOut();
            } else {
                return;
            }
        }
        this.showSetupPage();
    }
    
    startCurrentTimeUpdate() {
        this.currentTimeInterval = setInterval(() => {
            this.updateCurrentTime();
            this.updateCurrentDay();
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
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = timeString;
        }
    }
    
    updateCurrentDay() {
        const now = new Date();
        const dayString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        if (this.elements.currentDay) {
            this.elements.currentDay.textContent = dayString;
        }
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
        
        this.saveSession(this.clockInTime, clockOutTime, duration, this.totalLunchTime, this.currentWorker, this.currentLocation);
        
        this.isClocked = false;
        this.clockInTime = null;
        this.totalLunchTime = 0;
        
        this.elements.status.textContent = 'Ready to Clock In';
        this.elements.status.classList.remove('clocked-in', 'on-lunch');
        this.elements.clockInBtn.disabled = false;
        this.elements.clockOutBtn.disabled = true;
        this.elements.lunchBtn.disabled = true;
        this.elements.sessionTime.textContent = '00:00:00';
        
        this.stopSessionTimer();
        this.updateDisplay();
        this.saveState();
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
    
    updateWorkerDisplay() {
        if (this.currentWorker && this.currentLocation) {
            this.elements.workerDisplay.textContent = this.currentWorker;
            this.elements.locationDisplay.textContent = this.currentLocation;
        }
    }
    
    // Data Management Methods
    saveSession(clockIn, clockOut, duration, lunchTime = 0, worker = '', location = '') {
        const sessions = this.getSessions();
        const session = {
            id: Date.now(),
            clockIn: clockIn.toISOString(),
            clockOut: clockOut.toISOString(),
            duration: duration,
            lunchTime: lunchTime,
            workTime: duration - lunchTime,
            date: clockIn.toDateString(),
            worker: worker,
            location: location
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
        
        if (this.elements.dailyTotal) {
            this.elements.dailyTotal.textContent = this.formatDuration(totalWorkTime);
        }
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
        
        if (this.elements.weeklyTotal) {
            this.elements.weeklyTotal.textContent = this.formatDuration(totalWorkTime);
        }
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
        if (!this.elements.sessionHistory) return;
        
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
            const workerInfo = session.worker ? `${session.worker}` : 'Unknown Worker';
            const locationInfo = session.location ? ` @ ${session.location}` : '';
            
            div.innerHTML = `
                <div class="session-date">
                    ${clockIn.toLocaleDateString()} ${clockIn.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'})} - 
                    ${clockOut.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'})}
                </div>
                <div class="session-worker">${workerInfo}${locationInfo}</div>
                <div class="session-duration">${this.formatDuration(workTime)}${lunchDisplay}</div>
            `;
            
            this.elements.sessionHistory.appendChild(div);
        });
    }
    
    updateWeekView() {
        if (!this.elements.weekDisplay) return;
        
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
            totalLunchTime: this.totalLunchTime,
            currentWorker: this.currentWorker,
            currentLocation: this.currentLocation
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
            this.currentWorker = state.currentWorker || null;
            this.currentLocation = state.currentLocation || null;
            
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
                
                this.updateWorkerDisplay();
                this.startSessionTimer();
            }
        }
    }
    
    loadWorkerLocations() {
        const workers = this.getWorkers();
        const locations = this.getLocations();
        
        workers.forEach(worker => {
            const option = document.createElement('option');
            option.value = worker;
            this.elements.workerList.appendChild(option);
        });
        
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            this.elements.locationList.appendChild(option);
        });
    }
    
    saveWorkerLocation(worker, location) {
        const workers = this.getWorkers();
        const locations = this.getLocations();
        
        if (!workers.includes(worker)) {
            workers.push(worker);
            localStorage.setItem('workers', JSON.stringify(workers));
            
            const option = document.createElement('option');
            option.value = worker;
            this.elements.workerList.appendChild(option);
        }
        
        if (!locations.includes(location)) {
            locations.push(location);
            localStorage.setItem('locations', JSON.stringify(locations));
            
            const option = document.createElement('option');
            option.value = location;
            this.elements.locationList.appendChild(option);
        }
    }
    
    getWorkers() {
        const stored = localStorage.getItem('workers');
        return stored ? JSON.parse(stored) : [];
    }
    
    getLocations() {
        const stored = localStorage.getItem('locations');
        return stored ? JSON.parse(stored) : [];
    }
    
    // Menu and Export Methods
    toggleMenu() {
        this.elements.menuDropdown.classList.toggle('hidden');
    }
    
    closeMenu() {
        this.elements.menuDropdown.classList.add('hidden');
    }
    
    handleOutsideClick(e) {
        if (this.elements.menuBtn && this.elements.menuDropdown && 
            !this.elements.menuBtn.contains(e.target) && !this.elements.menuDropdown.contains(e.target)) {
            this.closeMenu();
        }
    }
    
    exportCSV() {
        const sessions = this.getSessions();
        if (sessions.length === 0) {
            alert('No data to export');
            return;
        }
        
        const headers = ['Date', 'Worker', 'Location', 'Clock In', 'Clock Out', 'Total Time', 'Lunch Time', 'Work Time'];
        const csvContent = [
            headers.join(','),
            ...sessions.map(session => {
                const clockIn = new Date(session.clockIn);
                const clockOut = new Date(session.clockOut);
                const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
                
                return [
                    `"${clockIn.toLocaleDateString()}"`,
                    `"${session.worker || 'Unknown'}"`,
                    `"${session.location || 'Unknown'}"`,
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
    
    shareEmail() {
        const sessions = this.getSessions();
        if (sessions.length === 0) {
            alert('No data to share');
            return;
        }
        
        const reportData = this.generateEmailReport(sessions);
        const subject = encodeURIComponent('Time Tracker Report');
        const body = encodeURIComponent(reportData);
        
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
    
    shareNative() {
        if (!navigator.share) {
            this.shareEmail();
            return;
        }
        
        const sessions = this.getSessions();
        if (sessions.length === 0) {
            alert('No data to share');
            return;
        }
        
        const reportData = this.generateEmailReport(sessions);
        
        navigator.share({
            title: 'Time Tracker Report',
            text: reportData
        }).catch(() => {
            this.shareEmail();
        });
    }
    
    generateEmailReport(sessions) {
        const today = new Date();
        const currentWeek = this.getCurrentWeek();
        
        const todaySessions = sessions.filter(session => session.date === today.toDateString());
        const weekSessions = sessions.filter(session => {
            const sessionDate = new Date(session.clockIn);
            return sessionDate >= currentWeek.start && sessionDate <= currentWeek.end;
        });
        
        const todayTotal = todaySessions.reduce((sum, session) => {
            const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
            return sum + workTime;
        }, 0);
        
        const weekTotal = weekSessions.reduce((sum, session) => {
            const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
            return sum + workTime;
        }, 0);
        
        let report = `TIME TRACKER REPORT\n`;
        report += `Generated: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}\n\n`;
        
        report += `📊 SUMMARY\n`;
        report += `Today's Work Time: ${this.formatDuration(todayTotal)}\n`;
        report += `This Week's Total: ${this.formatDuration(weekTotal)}\n`;
        report += `Week: ${currentWeek.start.toLocaleDateString()} - ${currentWeek.end.toLocaleDateString()}\n\n`;
        
        report += this.generateWeeklyBreakdown(sessions, currentWeek);
        
        if (todaySessions.length > 0) {
            report += `📅 TODAY'S SESSIONS\n`;
            todaySessions.forEach(session => {
                const clockIn = new Date(session.clockIn);
                const clockOut = new Date(session.clockOut);
                const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
                const worker = session.worker || 'Unknown';
                const location = session.location || 'Unknown';
                
                report += `${worker} @ ${location}\n`;
                report += `${clockIn.toLocaleTimeString()} - ${clockOut.toLocaleTimeString()}\n`;
                report += `Work Time: ${this.formatDuration(workTime)}`;
                if (session.lunchTime) {
                    report += ` (${this.formatDuration(session.lunchTime)} lunch)`;
                }
                report += `\n\n`;
            });
        }
        
        return report;
    }
    
    generateWeeklyBreakdown(sessions, currentWeek) {
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let breakdown = `📅 WEEKLY BREAKDOWN (Monday Start)\n`;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeek.start);
            date.setDate(currentWeek.start.getDate() + i);
            const dayString = date.toDateString();
            
            const daySessions = sessions.filter(session => session.date === dayString);
            const dayTotal = daySessions.reduce((sum, session) => {
                const workTime = session.workTime || (session.duration - (session.lunchTime || 0));
                return sum + workTime;
            }, 0);
            
            breakdown += `${dayNames[i]} ${date.getDate()}/${date.getMonth() + 1}: ${this.formatDuration(dayTotal)}`;
            
            if (daySessions.length > 0) {
                breakdown += ` (${daySessions.length} session${daySessions.length > 1 ? 's' : ''})`;
                
                const workers = [...new Set(daySessions.map(s => s.worker || 'Unknown'))];
                if (workers.length > 0) {
                    breakdown += ` - ${workers.join(', ')}`;
                }
            }
            breakdown += `\n`;
        }
        
        return breakdown + `\n`;
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
/* ========================================
   DASHBOARD PAGE
   ======================================== */
const DashboardPage = (() => {

    function render() {
        const vehicles = DataStore.getVehicles();
        const drivers = DataStore.getDrivers();
        const trips = DataStore.getTrips();

        const availableVehicles = vehicles.filter(v => v.status === 'available').length;
        const activeDrivers = drivers.filter(d => d.status === 'active' || d.status === 'on-trip').length;
        const completedTrips = trips.filter(t => t.status === 'completed').length;
        const totalRevenue = trips.filter(t => t.status === 'completed').reduce((s, t) => s + (t.fare || 0), 0);
        const pendingTrips = trips.filter(t => t.status === 'pending').length;
        const inProgressTrips = trips.filter(t => t.status === 'in-progress').length;

        return `
        <div class="page-header">
            <h2>Dashboard</h2>
            <p>Overview of your fleet operations</p>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Total Vehicles</span>
                    <div class="stat-card-icon blue">🚗</div>
                </div>
                <div class="stat-card-value">${vehicles.length}</div>
                <div class="stat-card-change positive">${availableVehicles} available</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Active Drivers</span>
                    <div class="stat-card-icon green">👤</div>
                </div>
                <div class="stat-card-value">${activeDrivers}</div>
                <div class="stat-card-change positive">${drivers.length} total drivers</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Trips Today</span>
                    <div class="stat-card-icon cyan">📍</div>
                </div>
                <div class="stat-card-value">${inProgressTrips + pendingTrips}</div>
                <div class="stat-card-change">${inProgressTrips} in progress, ${pendingTrips} pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Revenue</span>
                    <div class="stat-card-icon yellow">💰</div>
                </div>
                <div class="stat-card-value">₹${totalRevenue.toLocaleString()}</div>
                <div class="stat-card-change positive">${completedTrips} trips completed</div>
            </div>
        </div>

        <!-- Charts & Recent -->
        <div class="grid-2">
            <!-- Fleet Status Chart -->
            <div class="chart-card">
                <h3>Fleet Status</h3>
                <div id="fleetStatusChart" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
                    ${renderFleetDonut(vehicles)}
                </div>
            </div>

            <!-- Recent Trips -->
            <div class="chart-card">
                <h3>Recent Trips</h3>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${trips.slice(0, 5).map(t => `
                        <div class="alert-item">
                            <div class="alert-icon" style="background:var(--info-bg); color:var(--info);">📍</div>
                            <div class="alert-content">
                                <h4>${t.passenger} — ${t.pickup} → ${t.dropoff}</h4>
                                <p>₹${t.fare} · ${t.distance} km · <span class="badge badge-${t.status}">${t.status}</span></p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Vehicle Utilization & Driver Performance -->
        <div class="grid-2" style="margin-top:20px;">
            <div class="chart-card">
                <h3>Vehicle Utilization</h3>
                ${renderVehicleUtilBars(vehicles)}
            </div>
            <div class="chart-card">
                <h3>Top Drivers</h3>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    ${drivers.sort((a, b) => b.rating - a.rating).slice(0, 5).map((d, i) => `
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="color:var(--text-muted); font-size:0.8rem; width:20px;">#${i + 1}</span>
                            <div class="detail-avatar">${d.name.split(' ').map(n => n[0]).join('')}</div>
                            <div class="detail-info" style="flex:1;">
                                <strong>${d.name}</strong>
                                <span>${d.trips} trips</span>
                            </div>
                            <div class="rating">${'★'.repeat(Math.round(d.rating))}${'☆'.repeat(5 - Math.round(d.rating))}</div>
                            <span style="font-weight:700; font-size:0.9rem;">${d.rating}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `;
    }

    function renderFleetDonut(vehicles) {
        const statuses = [
            { key: 'available', label: 'Available', color: '#10b981' },
            { key: 'in-use', label: 'In Use', color: '#6366f1' },
            { key: 'maintenance', label: 'Maintenance', color: '#f59e0b' },
            { key: 'retired', label: 'Retired', color: '#ef4444' },
        ];

        const total = vehicles.length || 1;
        let cumulativePercent = 0;
        const segments = [];

        statuses.forEach(s => {
            const count = vehicles.filter(v => v.status === s.key).length;
            const percent = (count / total) * 100;
            if (count > 0) {
                segments.push({ ...s, count, percent, offset: cumulativePercent });
                cumulativePercent += percent;
            }
        });

        const radius = 60;
        const circumference = 2 * Math.PI * radius;

        let svgSegments = '';
        segments.forEach(seg => {
            const dashArray = (seg.percent / 100) * circumference;
            const dashOffset = -(seg.offset / 100) * circumference;
            svgSegments += `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="16"
                stroke-dasharray="${dashArray} ${circumference - dashArray}" stroke-dashoffset="${dashOffset}"
                style="transition: stroke-dasharray 1s ease;"/>`;
        });

        const legend = segments.map(s => `
            <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:10px;height:10px;border-radius:50%;background:${s.color};"></div>
                <span style="font-size:0.82rem; color:var(--text-secondary);">${s.label}</span>
                <span style="font-weight:700; font-size:0.85rem; margin-left:auto;">${s.count}</span>
            </div>
        `).join('');

        return `
            <svg width="160" height="160" viewBox="0 0 160 160" style="flex-shrink:0;">
                <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--bg-input)" stroke-width="16"/>
                ${svgSegments}
                <text x="80" y="76" text-anchor="middle" fill="var(--text-primary)" font-size="22" font-weight="800">${total}</text>
                <text x="80" y="94" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-weight="500">TOTAL</text>
            </svg>
            <div style="display:flex; flex-direction:column; gap:8px; flex:1;">
                ${legend}
            </div>
        `;
    }

    function renderVehicleUtilBars(vehicles) {
        const statuses = [
            { key: 'available', label: 'Available', cls: 'green' },
            { key: 'in-use', label: 'In Use', cls: '' },
            { key: 'maintenance', label: 'Maintenance', cls: 'yellow' },
            { key: 'retired', label: 'Retired', cls: 'red' },
        ];
        const total = vehicles.length || 1;
        return statuses.map(s => {
            const count = vehicles.filter(v => v.status === s.key).length;
            const pct = Math.round((count / total) * 100);
            return `
                <div class="metric-bar">
                    <span class="metric-bar-label">${s.label}</span>
                    <div class="metric-bar-track"><div class="metric-bar-fill ${s.cls}" style="width:${pct}%"></div></div>
                    <span class="metric-bar-value">${pct}%</span>
                </div>
            `;
        }).join('');
    }

    return { render };
})();

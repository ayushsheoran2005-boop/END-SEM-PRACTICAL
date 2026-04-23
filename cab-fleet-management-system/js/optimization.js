/* ========================================
   FLEET OPTIMIZATION PAGE
   ======================================== */
const OptimizationPage = (() => {

    function render() {
        const vehicles = DataStore.getVehicles();
        const drivers = DataStore.getDrivers();
        const trips = DataStore.getTrips();

        const totalVehicles = vehicles.length || 1;
        const activeVehicles = vehicles.filter(v => v.status === 'available' || v.status === 'in-use').length;
        const utilization = Math.round((activeVehicles / totalVehicles) * 100);
        const totalDistance = trips.reduce((s, t) => s + (t.distance || 0), 0);
        const totalRevenue = trips.filter(t => t.status === 'completed').reduce((s, t) => s + (t.fare || 0), 0);
        const avgFarePerKm = totalDistance > 0 ? (totalRevenue / totalDistance).toFixed(1) : 0;
        const completedTrips = trips.filter(t => t.status === 'completed');
        const avgTripDistance = completedTrips.length > 0 ? (completedTrips.reduce((s, t) => s + t.distance, 0) / completedTrips.length).toFixed(1) : 0;

        // Fuel distribution
        const fuelTypes = {};
        vehicles.forEach(v => { fuelTypes[v.fuel] = (fuelTypes[v.fuel] || 0) + 1; });

        // Vehicle type distribution
        const vehicleTypes = {};
        vehicles.forEach(v => { vehicleTypes[v.type] = (vehicleTypes[v.type] || 0) + 1; });

        return `
        <div class="page-header">
            <h2>Fleet Optimization</h2>
            <p>Analyze and optimize your fleet performance</p>
        </div>

        <!-- KPI Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Fleet Utilization</span>
                    <div class="stat-card-icon blue">📊</div>
                </div>
                <div class="stat-card-value">${utilization}%</div>
                <div class="stat-card-change ${utilization >= 70 ? 'positive' : 'negative'}">${utilization >= 70 ? 'Healthy' : 'Needs improvement'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Avg Fare / km</span>
                    <div class="stat-card-icon green">💹</div>
                </div>
                <div class="stat-card-value">₹${avgFarePerKm}</div>
                <div class="stat-card-change positive">Per kilometer</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Total Distance</span>
                    <div class="stat-card-icon cyan">🛣️</div>
                </div>
                <div class="stat-card-value">${totalDistance.toFixed(0)} km</div>
                <div class="stat-card-change">Across all trips</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Avg Trip Dist.</span>
                    <div class="stat-card-icon yellow">📏</div>
                </div>
                <div class="stat-card-value">${avgTripDistance} km</div>
                <div class="stat-card-change">Per completed trip</div>
            </div>
        </div>

        <div class="grid-2">
            <!-- Utilization Breakdown -->
            <div class="chart-card">
                <h3>Vehicle Status Breakdown</h3>
                <div style="margin-top:16px;">
                    ${renderStatusBars(vehicles)}
                </div>
            </div>

            <!-- Driver Efficiency -->
            <div class="chart-card">
                <h3>Driver Efficiency Score</h3>
                <div style="margin-top:16px;">
                    ${renderDriverEfficiency(drivers, trips)}
                </div>
            </div>
        </div>

        <div class="grid-2" style="margin-top:20px;">
            <!-- Fuel Mix -->
            <div class="chart-card">
                <h3>Fuel Type Distribution</h3>
                <div style="display:flex; gap:20px; align-items:center; margin-top:16px; flex-wrap:wrap;">
                    ${renderPieChart(fuelTypes, ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#ef4444'])}
                </div>
            </div>

            <!-- Vehicle Type Mix -->
            <div class="chart-card">
                <h3>Vehicle Type Distribution</h3>
                <div style="display:flex; gap:20px; align-items:center; margin-top:16px; flex-wrap:wrap;">
                    ${renderPieChart(vehicleTypes, ['#818cf8', '#34d399', '#22d3ee', '#fbbf24', '#fb7185'])}
                </div>
            </div>
        </div>

        <!-- Recommendations -->
        <div class="chart-card" style="margin-top:20px;">
            <h3>📋 Optimization Recommendations</h3>
            <div style="margin-top:16px; display:flex; flex-direction:column; gap:12px;">
                ${renderRecommendations(vehicles, drivers, trips)}
            </div>
        </div>
        `;
    }

    function renderStatusBars(vehicles) {
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
                    <span class="metric-bar-label">${s.label} (${count})</span>
                    <div class="metric-bar-track"><div class="metric-bar-fill ${s.cls}" style="width:${pct}%"></div></div>
                    <span class="metric-bar-value">${pct}%</span>
                </div>
            `;
        }).join('');
    }

    function renderDriverEfficiency(drivers, trips) {
        return drivers.sort((a, b) => b.rating - a.rating).slice(0, 5).map(d => {
            const driverTrips = trips.filter(t => t.driverId === d.id && t.status === 'completed');
            const revenue = driverTrips.reduce((s, t) => s + (t.fare || 0), 0);
            const effScore = Math.min(100, Math.round((d.rating / 5) * 60 + (d.trips / 5)));
            const cls = effScore >= 80 ? 'green' : effScore >= 50 ? 'yellow' : 'red';
            return `
                <div class="metric-bar">
                    <span class="metric-bar-label">${d.name.split(' ')[0]}</span>
                    <div class="metric-bar-track"><div class="metric-bar-fill ${cls}" style="width:${effScore}%"></div></div>
                    <span class="metric-bar-value">${effScore}%</span>
                </div>
            `;
        }).join('');
    }

    function renderPieChart(data, colors) {
        const entries = Object.entries(data);
        const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
        const radius = 55;
        const circumference = 2 * Math.PI * radius;
        let offset = 0;

        let segments = '';
        entries.forEach(([key, value], i) => {
            const pct = (value / total) * 100;
            const dash = (pct / 100) * circumference;
            segments += `<circle cx="70" cy="70" r="${radius}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="14"
                stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-(offset / 100) * circumference}"
                style="transition: all 1s ease;"/>`;
            offset += pct;
        });

        const legend = entries.map(([key, value], i) => `
            <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:10px;height:10px;border-radius:3px;background:${colors[i % colors.length]};flex-shrink:0;"></div>
                <span style="font-size:0.82rem; color:var(--text-secondary); flex:1;">${key}</span>
                <span style="font-weight:700; font-size:0.85rem;">${value}</span>
            </div>
        `).join('');

        return `
            <svg width="140" height="140" viewBox="0 0 140 140" style="flex-shrink:0;">
                <circle cx="70" cy="70" r="${radius}" fill="none" stroke="var(--bg-input)" stroke-width="14"/>
                ${segments}
            </svg>
            <div style="display:flex; flex-direction:column; gap:8px; flex:1; min-width:120px;">
                ${legend}
            </div>
        `;
    }

    function renderRecommendations(vehicles, drivers, trips) {
        const recs = [];
        const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance');
        const retiredVehicles = vehicles.filter(v => v.status === 'retired');
        const offDutyDrivers = drivers.filter(d => d.status === 'off-duty');
        const pendingTrips = trips.filter(t => t.status === 'pending');
        const unassignedTrips = trips.filter(t => !t.driverId && t.status === 'pending');

        if (maintenanceVehicles.length > 0) {
            recs.push({ icon: '🔧', color: 'var(--warning-bg)', title: `${maintenanceVehicles.length} vehicle(s) in maintenance`, desc: 'Schedule repairs to restore fleet capacity. Vehicles: ' + maintenanceVehicles.map(v => v.id).join(', ') });
        }
        if (retiredVehicles.length > 0) {
            recs.push({ icon: '🚫', color: 'var(--danger-bg)', title: `${retiredVehicles.length} retired vehicle(s)`, desc: 'Consider replacing retired vehicles to maintain fleet size.' });
        }
        if (unassignedTrips.length > 0) {
            recs.push({ icon: '⚠️', color: 'var(--warning-bg)', title: `${unassignedTrips.length} unassigned trip(s)`, desc: 'Assign drivers and vehicles to pending trips for timely service.' });
        }
        if (offDutyDrivers.length > vehicles.filter(v => v.status === 'available').length) {
            recs.push({ icon: '👥', color: 'var(--info-bg)', title: 'Driver surplus detected', desc: 'Consider optimizing driver schedules — more off-duty drivers than available vehicles.' });
        }

        const lowRatedDrivers = drivers.filter(d => d.rating > 0 && d.rating < 4.0);
        if (lowRatedDrivers.length > 0) {
            recs.push({ icon: '⭐', color: 'var(--warning-bg)', title: `${lowRatedDrivers.length} driver(s) with low ratings`, desc: 'Provide training or reviews for drivers with ratings below 4.0.' });
        }

        // Always add a positive one
        const highPerformers = drivers.filter(d => d.rating >= 4.8);
        if (highPerformers.length > 0) {
            recs.push({ icon: '🏆', color: 'var(--success-bg)', title: `${highPerformers.length} top-performing driver(s)`, desc: 'Recognize and reward: ' + highPerformers.map(d => d.name).join(', ') });
        }

        if (recs.length === 0) {
            recs.push({ icon: '✅', color: 'var(--success-bg)', title: 'Fleet is operating optimally', desc: 'No critical issues detected. Keep up the good work!' });
        }

        return recs.map(r => `
            <div class="alert-item">
                <div class="alert-icon" style="background:${r.color};">${r.icon}</div>
                <div class="alert-content">
                    <h4>${r.title}</h4>
                    <p>${r.desc}</p>
                </div>
            </div>
        `).join('');
    }

    return { render };
})();

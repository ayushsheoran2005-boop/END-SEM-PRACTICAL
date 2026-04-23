/* ========================================
   FLEET CONTROL PAGE
   ======================================== */
const ControlPage = (() => {

    let simulationInterval = null;
    let vehicleDots = [];

    function render() {
        const vehicles = DataStore.getVehicles();
        const drivers = DataStore.getDrivers();
        const trips = DataStore.getTrips();

        const activeVehicles = vehicles.filter(v => v.status === 'available' || v.status === 'in-use');
        const onTripDrivers = drivers.filter(d => d.status === 'on-trip');
        const inProgressTrips = trips.filter(t => t.status === 'in-progress');

        // Generate alerts
        const alerts = generateAlerts(vehicles, drivers, trips);

        return `
        <div class="page-header">
            <div class="page-header-row">
                <div>
                    <h2>Fleet Control</h2>
                    <p>Real-time fleet monitoring and control</p>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-success btn-sm" onclick="ControlPage.startSimulation()">
                        ▶ Start Live
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="ControlPage.stopSimulation()">
                        ⏹ Stop
                    </button>
                </div>
            </div>
        </div>

        <!-- Status Strip -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Online Vehicles</span>
                    <div class="stat-card-icon green">🟢</div>
                </div>
                <div class="stat-card-value">${activeVehicles.length}</div>
                <div class="stat-card-change positive">of ${vehicles.length} total</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Active Trips</span>
                    <div class="stat-card-icon cyan">🚕</div>
                </div>
                <div class="stat-card-value">${inProgressTrips.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Drivers On-Trip</span>
                    <div class="stat-card-icon blue">👤</div>
                </div>
                <div class="stat-card-value">${onTripDrivers.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Alerts</span>
                    <div class="stat-card-icon ${alerts.length > 0 ? 'red' : 'green'}">${alerts.length > 0 ? '⚠️' : '✅'}</div>
                </div>
                <div class="stat-card-value">${alerts.length}</div>
                <div class="stat-card-change ${alerts.length > 0 ? 'negative' : 'positive'}">${alerts.length > 0 ? 'Needs attention' : 'All clear'}</div>
            </div>
        </div>

        <!-- Map + Vehicle List -->
        <div class="control-grid">
            <div class="live-map">
                <h3>🗺️ Live Fleet Map <span style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">(Simulated)</span></h3>
                <div class="map-placeholder" id="liveMap">
                    ${renderMapGrid()}
                    ${renderMapDots(activeVehicles)}
                    <div style="position:absolute; bottom:12px; left:12px; display:flex; gap:12px; font-size:0.7rem; color:var(--text-muted);">
                        <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--success);margin-right:4px;"></span>Active</span>
                        <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--warning);margin-right:4px;"></span>Idle</span>
                        <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--accent-primary);margin-right:4px;"></span>En Route</span>
                    </div>
                </div>
            </div>

            <!-- Vehicle Status List -->
            <div class="chart-card" style="max-height:440px; overflow-y:auto;">
                <h3>Vehicle Status Monitor</h3>
                <div style="display:flex; flex-direction:column; gap:8px; margin-top:16px;" id="vehicleMonitor">
                    ${renderVehicleMonitor(vehicles, drivers)}
                </div>
            </div>
        </div>

        <!-- Alerts & Activity -->
        <div class="grid-2" style="margin-top:20px;">
            <div class="chart-card">
                <h3>⚠️ Active Alerts</h3>
                <div style="margin-top:12px;" id="alertsList">
                    ${alerts.length > 0 ? alerts.map(a => `
                        <div class="alert-item">
                            <div class="alert-icon" style="background:${a.bg}; color:${a.color};">${a.icon}</div>
                            <div class="alert-content">
                                <h4>${a.title}</h4>
                                <p>${a.desc}</p>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state" style="padding:30px;">
                            <div class="empty-state-icon">✅</div>
                            <h3>No active alerts</h3>
                            <p>All systems operating normally</p>
                        </div>
                    `}
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="chart-card">
                <h3>📋 Recent Activity Log</h3>
                <div style="margin-top:12px; display:flex; flex-direction:column; gap:6px;" id="activityLog">
                    ${renderActivityLog(trips, drivers)}
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="chart-card" style="margin-top:20px;">
            <h3>⚡ Quick Actions</h3>
            <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:16px;">
                <button class="btn btn-primary btn-sm" onclick="TripsPage.openAddModal()">📍 New Trip</button>
                <button class="btn btn-secondary btn-sm" onclick="VehiclesPage.openAddModal()">🚗 Add Vehicle</button>
                <button class="btn btn-secondary btn-sm" onclick="DriversPage.openAddModal()">👤 Add Driver</button>
                <button class="btn btn-success btn-sm" onclick="App.navigateTo('optimization')">📊 View Analytics</button>
                <button class="btn btn-danger btn-sm" onclick="ControlPage.resetData()">🔄 Reset Demo Data</button>
            </div>
        </div>
        `;
    }

    function renderMapGrid() {
        let lines = '';
        for (let i = 1; i <= 6; i++) {
            const y = (i / 7) * 100;
            lines += `<div class="map-grid-line h" style="top:${y}%"></div>`;
        }
        for (let i = 1; i <= 8; i++) {
            const x = (i / 9) * 100;
            lines += `<div class="map-grid-line v" style="left:${x}%"></div>`;
        }
        return lines;
    }

    function renderMapDots(vehicles) {
        return vehicles.map((v, i) => {
            const x = 10 + Math.random() * 80;
            const y = 10 + Math.random() * 75;
            const cls = v.status === 'in-use' ? 'active' : 'idle';
            return `<div class="map-vehicle-dot ${cls}" data-vehicle="${v.id}" data-label="${v.id}: ${v.make} ${v.model}" style="left:${x}%; top:${y}%;"></div>`;
        }).join('');
    }

    function renderVehicleMonitor(vehicles, drivers) {
        return vehicles.map(v => {
            const driver = drivers.find(d => d.assignedVehicle === v.id);
            const statusColors = {
                'available': 'var(--success)',
                'in-use': '#818cf8',
                'maintenance': 'var(--warning)',
                'retired': 'var(--danger)',
            };
            return `
                <div style="display:flex; align-items:center; gap:12px; padding:10px 12px; background:var(--bg-input); border-radius:var(--radius-sm); border: 1px solid var(--border-color);">
                    <div style="width:10px; height:10px; border-radius:50%; background:${statusColors[v.status] || 'var(--text-muted)'}; flex-shrink:0; box-shadow:0 0 6px ${statusColors[v.status] || 'transparent'};"></div>
                    <div style="flex:1;">
                        <div style="font-size:0.85rem; font-weight:600;">${v.id} — ${v.make} ${v.model}</div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">${driver ? '👤 ' + driver.name : 'No driver assigned'} · ${v.plate}</div>
                    </div>
                    <span class="badge badge-${v.status}" style="font-size:0.7rem;">${v.status.replace('-', ' ')}</span>
                </div>
            `;
        }).join('');
    }

    function renderActivityLog(trips, drivers) {
        const activities = [];
        trips.slice(0, 6).forEach(t => {
            const driver = t.driverId ? drivers.find(d => d.id === t.driverId) : null;
            const icons = { 'completed': '✅', 'in-progress': '🚕', 'pending': '⏳', 'cancelled': '❌' };
            activities.push({
                icon: icons[t.status] || '📋',
                text: `${t.passenger} — ${t.pickup} → ${t.dropoff}`,
                sub: `${driver ? driver.name : 'Unassigned'} · ₹${t.fare} · ${t.date} ${t.time}`,
                status: t.status,
            });
        });

        return activities.map(a => `
            <div style="display:flex; align-items:flex-start; gap:10px; padding:8px 0; border-bottom:1px solid var(--border-color);">
                <span style="font-size:1rem; flex-shrink:0;">${a.icon}</span>
                <div style="flex:1;">
                    <div style="font-size:0.82rem; font-weight:500;">${a.text}</div>
                    <div style="font-size:0.72rem; color:var(--text-muted);">${a.sub}</div>
                </div>
                <span class="badge badge-${a.status}" style="font-size:0.65rem;">${a.status.replace('-', ' ')}</span>
            </div>
        `).join('');
    }

    function generateAlerts(vehicles, drivers, trips) {
        const alerts = [];
        const maintenanceV = vehicles.filter(v => v.status === 'maintenance');
        if (maintenanceV.length > 0) {
            alerts.push({ icon: '🔧', bg: 'var(--warning-bg)', color: 'var(--warning)', title: `${maintenanceV.length} vehicle(s) under maintenance`, desc: maintenanceV.map(v => `${v.id} (${v.make} ${v.model})`).join(', ') });
        }

        const unassigned = trips.filter(t => t.status === 'pending' && !t.driverId);
        if (unassigned.length > 0) {
            alerts.push({ icon: '⚠️', bg: 'var(--danger-bg)', color: 'var(--danger)', title: `${unassigned.length} trip(s) without driver`, desc: 'Assign drivers immediately to avoid delays.' });
        }

        const highMileage = vehicles.filter(v => v.mileage > 80000 && v.status !== 'retired');
        if (highMileage.length > 0) {
            alerts.push({ icon: '🛞', bg: 'var(--warning-bg)', color: 'var(--warning)', title: `${highMileage.length} vehicle(s) with high mileage`, desc: highMileage.map(v => `${v.id}: ${v.mileage.toLocaleString()} km`).join(', ') });
        }

        return alerts;
    }

    function startSimulation() {
        stopSimulation();
        App.toast('Live simulation started', 'success');
        simulationInterval = setInterval(() => {
            const dots = document.querySelectorAll('.map-vehicle-dot');
            dots.forEach(dot => {
                const currentLeft = parseFloat(dot.style.left);
                const currentTop = parseFloat(dot.style.top);
                const newLeft = Math.max(5, Math.min(90, currentLeft + (Math.random() - 0.5) * 6));
                const newTop = Math.max(5, Math.min(85, currentTop + (Math.random() - 0.5) * 6));
                dot.style.left = newLeft + '%';
                dot.style.top = newTop + '%';
            });
        }, 2000);
    }

    function stopSimulation() {
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
            App.toast('Simulation stopped', 'warning');
        }
    }

    function resetData() {
        if (confirm('Reset all data to default? This will clear any changes you have made.')) {
            DataStore.reset();
            App.toast('Data reset to defaults', 'success');
            App.navigateTo('control');
        }
    }

    function cleanup() {
        stopSimulation();
    }

    return { render, startSimulation, stopSimulation, resetData, cleanup };
})();

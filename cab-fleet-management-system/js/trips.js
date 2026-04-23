/* ========================================
   TRIPS PAGE
   ======================================== */
const TripsPage = (() => {

    function render() {
        const trips = DataStore.getTrips();
        return `
        <div class="page-header">
            <div class="page-header-row">
                <div>
                    <h2>Trips</h2>
                    <p>Manage trip bookings and history</p>
                </div>
                <button class="btn btn-primary" onclick="TripsPage.openAddModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Book Trip
                </button>
            </div>
        </div>

        <!-- Trip Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Total Trips</span>
                    <div class="stat-card-icon blue">📋</div>
                </div>
                <div class="stat-card-value">${trips.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">In Progress</span>
                    <div class="stat-card-icon cyan">🚕</div>
                </div>
                <div class="stat-card-value">${trips.filter(t => t.status === 'in-progress').length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Pending</span>
                    <div class="stat-card-icon yellow">⏳</div>
                </div>
                <div class="stat-card-value">${trips.filter(t => t.status === 'pending').length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-label">Total Revenue</span>
                    <div class="stat-card-icon green">💰</div>
                </div>
                <div class="stat-card-value">₹${trips.filter(t => t.status === 'completed').reduce((s, t) => s + (t.fare || 0), 0).toLocaleString()}</div>
            </div>
        </div>

        <div class="table-container">
            <div class="table-header">
                <h3>All Trips</h3>
                <div class="table-actions">
                    <div class="search-input-wrapper">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <input type="text" class="search-input" id="tripSearch" placeholder="Search trips..." oninput="TripsPage.filter()">
                    </div>
                    <select class="form-select" id="tripStatusFilter" onchange="TripsPage.filter()" style="width:150px; padding:8px 32px 8px 12px;">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
            <div class="table-responsive">
                <table class="data-table" id="tripTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Passenger</th>
                            <th>Route</th>
                            <th>Driver</th>
                            <th>Vehicle</th>
                            <th>Fare</th>
                            <th>Distance</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="tripTableBody">
                        ${renderRows(trips)}
                    </tbody>
                </table>
            </div>
            ${trips.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">📍</div>
                    <h3>No trips yet</h3>
                    <p>Book your first trip</p>
                    <button class="btn btn-primary" onclick="TripsPage.openAddModal()">Book Trip</button>
                </div>
            ` : ''}
        </div>
        `;
    }

    function renderRows(trips) {
        const drivers = DataStore.getDrivers();
        const vehicles = DataStore.getVehicles();

        return trips.map(t => {
            const driver = t.driverId ? drivers.find(d => d.id === t.driverId) : null;
            const vehicle = t.vehicleId ? vehicles.find(v => v.id === t.vehicleId) : null;
            return `
            <tr data-id="${t.id}">
                <td><span style="font-weight:600; color:var(--text-accent);">${t.id}</span></td>
                <td style="font-weight:500;">${t.passenger}</td>
                <td>
                    <div style="font-size:0.82rem;">
                        <div style="color:var(--success);">● ${t.pickup}</div>
                        <div style="color:var(--danger);">● ${t.dropoff}</div>
                    </div>
                </td>
                <td>${driver ? `<span style="font-size:0.85rem;">${driver.name}</span>` : '<span style="color:var(--text-muted);">Unassigned</span>'}</td>
                <td>${vehicle ? `<span style="font-size:0.85rem;">${vehicle.make} ${vehicle.model}</span>` : '<span style="color:var(--text-muted);">—</span>'}</td>
                <td style="font-weight:600;">₹${t.fare}</td>
                <td>${t.distance} km</td>
                <td style="font-size:0.82rem; color:var(--text-secondary);">${t.date}<br>${t.time}</td>
                <td><span class="badge badge-${t.status}">${t.status.replace('-', ' ')}</span></td>
                <td>
                    <div class="row-actions">
                        <button class="row-action-btn" onclick="TripsPage.openEditModal('${t.id}')" title="Edit">✏️</button>
                        ${t.status === 'pending' ? `<button class="row-action-btn" onclick="TripsPage.startTrip('${t.id}')" title="Start" style="color:var(--success);">▶</button>` : ''}
                        ${t.status === 'in-progress' ? `<button class="row-action-btn" onclick="TripsPage.completeTrip('${t.id}')" title="Complete" style="color:var(--success);">✓</button>` : ''}
                        <button class="row-action-btn delete" onclick="TripsPage.remove('${t.id}')" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `}).join('');
    }

    function filter() {
        const query = document.getElementById('tripSearch').value.toLowerCase();
        const status = document.getElementById('tripStatusFilter').value;
        let trips = DataStore.getTrips();
        if (status) trips = trips.filter(t => t.status === status);
        if (query) trips = trips.filter(t =>
            `${t.passenger} ${t.pickup} ${t.dropoff} ${t.id}`.toLowerCase().includes(query)
        );
        document.getElementById('tripTableBody').innerHTML = renderRows(trips);
    }

    function openAddModal() {
        App.openModal('Book New Trip', getFormHTML());
    }

    function openEditModal(id) {
        const t = DataStore.getTrips().find(t => t.id === id);
        if (!t) return;
        App.openModal('Edit Trip', getFormHTML(t));
    }

    function getFormHTML(t = null) {
        const drivers = DataStore.getDrivers().filter(d => d.status === 'active');
        const vehicles = DataStore.getVehicles().filter(v => v.status === 'available');

        return `
        <form onsubmit="TripsPage.save(event, '${t ? t.id : ''}')">
            <div class="form-grid">
                <div class="form-group full-width">
                    <label class="form-label">Passenger Name</label>
                    <input class="form-input" name="passenger" value="${t ? t.passenger : ''}" required placeholder="Passenger name">
                </div>
                <div class="form-group">
                    <label class="form-label">Pickup Location</label>
                    <input class="form-input" name="pickup" value="${t ? t.pickup : ''}" required placeholder="Pickup address">
                </div>
                <div class="form-group">
                    <label class="form-label">Drop-off Location</label>
                    <input class="form-input" name="dropoff" value="${t ? t.dropoff : ''}" required placeholder="Drop-off address">
                </div>
                <div class="form-group">
                    <label class="form-label">Assign Driver</label>
                    <select class="form-select" name="driverId">
                        <option value="">Auto Assign</option>
                        ${drivers.map(d => `<option value="${d.id}" ${t && t.driverId === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Assign Vehicle</label>
                    <select class="form-select" name="vehicleId">
                        <option value="">Auto Assign</option>
                        ${vehicles.map(v => `<option value="${v.id}" ${t && t.vehicleId === v.id ? 'selected' : ''}>${v.make} ${v.model} (${v.plate})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Fare (₹)</label>
                    <input class="form-input" name="fare" type="number" value="${t ? t.fare : ''}" required min="0" placeholder="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Distance (km)</label>
                    <input class="form-input" name="distance" type="number" step="0.1" value="${t ? t.distance : ''}" required min="0" placeholder="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input class="form-input" name="date" type="date" value="${t ? t.date : new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Time</label>
                    <input class="form-input" name="time" type="time" value="${t ? t.time : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-select" name="status">
                        <option value="pending" ${t && t.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in-progress" ${t && t.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${t && t.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${t && t.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${t ? 'Update' : 'Book'} Trip</button>
                </div>
            </div>
        </form>
        `;
    }

    function save(e, id) {
        e.preventDefault();
        const form = e.target;
        const data = {
            passenger: form.passenger.value,
            pickup: form.pickup.value,
            dropoff: form.dropoff.value,
            driverId: form.driverId.value || null,
            vehicleId: form.vehicleId.value || null,
            fare: parseInt(form.fare.value),
            distance: parseFloat(form.distance.value),
            date: form.date.value,
            time: form.time.value,
            status: form.status.value,
        };

        if (id) {
            DataStore.updateTrip(id, data);
            App.toast('Trip updated successfully', 'success');
        } else {
            DataStore.addTrip(data);
            App.toast('Trip booked successfully', 'success');
        }
        App.closeModal();
        App.navigateTo('trips');
    }

    function startTrip(id) {
        DataStore.updateTrip(id, { status: 'in-progress' });
        App.toast('Trip started', 'success');
        App.navigateTo('trips');
    }

    function completeTrip(id) {
        DataStore.updateTrip(id, { status: 'completed' });
        App.toast('Trip completed', 'success');
        App.navigateTo('trips');
    }

    function remove(id) {
        if (confirm('Are you sure you want to delete this trip?')) {
            DataStore.deleteTrip(id);
            App.toast('Trip deleted', 'warning');
            App.navigateTo('trips');
        }
    }

    return { render, filter, openAddModal, openEditModal, save, startTrip, completeTrip, remove };
})();

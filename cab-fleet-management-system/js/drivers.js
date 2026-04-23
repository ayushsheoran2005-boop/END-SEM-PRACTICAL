/* ========================================
   DRIVERS PAGE
   ======================================== */
const DriversPage = (() => {

    function render() {
        const drivers = DataStore.getDrivers();
        return `
        <div class="page-header">
            <div class="page-header-row">
                <div>
                    <h2>Drivers</h2>
                    <p>Manage your fleet drivers</p>
                </div>
                <button class="btn btn-primary" onclick="DriversPage.openAddModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Driver
                </button>
            </div>
        </div>

        <div class="table-container">
            <div class="table-header">
                <h3>All Drivers (${drivers.length})</h3>
                <div class="table-actions">
                    <div class="search-input-wrapper">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <input type="text" class="search-input" id="driverSearch" placeholder="Search drivers..." oninput="DriversPage.filter()">
                    </div>
                    <select class="form-select" id="driverStatusFilter" onchange="DriversPage.filter()" style="width:150px; padding:8px 32px 8px 12px;">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="on-trip">On Trip</option>
                        <option value="off-duty">Off Duty</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div class="table-responsive">
                <table class="data-table" id="driverTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Driver</th>
                            <th>Phone</th>
                            <th>License</th>
                            <th>Trips</th>
                            <th>Rating</th>
                            <th>Vehicle</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="driverTableBody">
                        ${renderRows(drivers)}
                    </tbody>
                </table>
            </div>
            ${drivers.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">👤</div>
                    <h3>No drivers yet</h3>
                    <p>Add your first driver to get started</p>
                    <button class="btn btn-primary" onclick="DriversPage.openAddModal()">Add Driver</button>
                </div>
            ` : ''}
        </div>
        `;
    }

    function renderRows(drivers) {
        const vehicles = DataStore.getVehicles();
        return drivers.map(d => {
            const vehicle = d.assignedVehicle ? vehicles.find(v => v.id === d.assignedVehicle) : null;
            return `
            <tr data-id="${d.id}">
                <td><span style="font-weight:600; color:var(--text-accent);">${d.id}</span></td>
                <td>
                    <div class="detail-card">
                        <div class="detail-avatar">${d.name.split(' ').map(n => n[0]).join('')}</div>
                        <div class="detail-info">
                            <strong>${d.name}</strong>
                            <span>Since ${d.joinDate || '—'}</span>
                        </div>
                    </div>
                </td>
                <td>${d.phone}</td>
                <td><code style="background:var(--bg-elevated);padding:3px 8px;border-radius:4px;font-size:0.75rem;">${d.license}</code></td>
                <td style="font-weight:600;">${d.trips}</td>
                <td><div class="rating">${'★'.repeat(Math.round(d.rating))}${'☆'.repeat(5 - Math.round(d.rating))} <span style="color:var(--text-primary);font-weight:700;">${d.rating}</span></div></td>
                <td>${vehicle ? `<span style="font-size:0.82rem;">${vehicle.make} ${vehicle.model}</span>` : '<span style="color:var(--text-muted);">Unassigned</span>'}</td>
                <td><span class="badge badge-${d.status}">${d.status.replace('-', ' ')}</span></td>
                <td>
                    <div class="row-actions">
                        <button class="row-action-btn" onclick="DriversPage.openEditModal('${d.id}')" title="Edit">✏️</button>
                        <button class="row-action-btn delete" onclick="DriversPage.remove('${d.id}')" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `}).join('');
    }

    function filter() {
        const query = document.getElementById('driverSearch').value.toLowerCase();
        const status = document.getElementById('driverStatusFilter').value;
        let drivers = DataStore.getDrivers();
        if (status) drivers = drivers.filter(d => d.status === status);
        if (query) drivers = drivers.filter(d =>
            `${d.name} ${d.id} ${d.phone} ${d.license}`.toLowerCase().includes(query)
        );
        document.getElementById('driverTableBody').innerHTML = renderRows(drivers);
    }

    function openAddModal() {
        App.openModal('Add New Driver', getFormHTML());
    }

    function openEditModal(id) {
        const d = DataStore.getDrivers().find(d => d.id === id);
        if (!d) return;
        App.openModal('Edit Driver', getFormHTML(d));
    }

    function getFormHTML(d = null) {
        const vehicles = DataStore.getVehicles().filter(v => v.status === 'available');
        return `
        <form onsubmit="DriversPage.save(event, '${d ? d.id : ''}')">
            <div class="form-grid">
                <div class="form-group full-width">
                    <label class="form-label">Full Name</label>
                    <input class="form-input" name="name" value="${d ? d.name : ''}" required placeholder="e.g. Rajesh Kumar">
                </div>
                <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input class="form-input" name="phone" value="${d ? d.phone : ''}" required placeholder="9876543210">
                </div>
                <div class="form-group">
                    <label class="form-label">License Number</label>
                    <input class="form-input" name="license" value="${d ? d.license : ''}" required placeholder="KA-DL-XXXX-XXXXXX">
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-select" name="status" required>
                        <option value="active" ${d && d.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="on-trip" ${d && d.status === 'on-trip' ? 'selected' : ''}>On Trip</option>
                        <option value="off-duty" ${d && d.status === 'off-duty' ? 'selected' : ''}>Off Duty</option>
                        <option value="inactive" ${d && d.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Assign Vehicle</label>
                    <select class="form-select" name="assignedVehicle">
                        <option value="">None</option>
                        ${vehicles.map(v => `<option value="${v.id}" ${d && d.assignedVehicle === v.id ? 'selected' : ''}>${v.id} — ${v.make} ${v.model}</option>`).join('')}
                        ${d && d.assignedVehicle && !vehicles.find(v => v.id === d.assignedVehicle) ? (() => {
                            const cv = DataStore.getVehicles().find(v => v.id === d.assignedVehicle);
                            return cv ? `<option value="${cv.id}" selected>${cv.id} — ${cv.make} ${cv.model} (current)</option>` : '';
                        })() : ''}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${d ? 'Update' : 'Add'} Driver</button>
                </div>
            </div>
        </form>
        `;
    }

    function save(e, id) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            phone: form.phone.value,
            license: form.license.value,
            status: form.status.value,
            assignedVehicle: form.assignedVehicle.value || null,
        };

        if (id) {
            DataStore.updateDriver(id, data);
            App.toast('Driver updated successfully', 'success');
        } else {
            data.joinDate = new Date().toISOString().split('T')[0];
            DataStore.addDriver(data);
            App.toast('Driver added successfully', 'success');
        }
        App.closeModal();
        App.navigateTo('drivers');
    }

    function remove(id) {
        if (confirm('Are you sure you want to delete this driver?')) {
            DataStore.deleteDriver(id);
            App.toast('Driver deleted', 'warning');
            App.navigateTo('drivers');
        }
    }

    return { render, filter, openAddModal, openEditModal, save, remove };
})();

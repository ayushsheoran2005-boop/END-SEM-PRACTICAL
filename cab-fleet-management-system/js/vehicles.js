/* ========================================
   VEHICLES PAGE
   ======================================== */
const VehiclesPage = (() => {

    function render() {
        const vehicles = DataStore.getVehicles();
        return `
        <div class="page-header">
            <div class="page-header-row">
                <div>
                    <h2>Vehicles</h2>
                    <p>Manage your fleet vehicles</p>
                </div>
                <button class="btn btn-primary" onclick="VehiclesPage.openAddModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Vehicle
                </button>
            </div>
        </div>

        <div class="table-container">
            <div class="table-header">
                <h3>All Vehicles (${vehicles.length})</h3>
                <div class="table-actions">
                    <div class="search-input-wrapper">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <input type="text" class="search-input" id="vehicleSearch" placeholder="Search vehicles..." oninput="VehiclesPage.filter()">
                    </div>
                    <select class="form-select" id="vehicleStatusFilter" onchange="VehiclesPage.filter()" style="width:150px; padding:8px 32px 8px 12px;">
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="in-use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
                    </select>
                </div>
            </div>
            <div class="table-responsive">
                <table class="data-table" id="vehicleTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehicle</th>
                            <th>Plate</th>
                            <th>Type</th>
                            <th>Fuel</th>
                            <th>Mileage</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="vehicleTableBody">
                        ${renderRows(vehicles)}
                    </tbody>
                </table>
            </div>
            ${vehicles.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">🚗</div>
                    <h3>No vehicles yet</h3>
                    <p>Add your first vehicle to get started</p>
                    <button class="btn btn-primary" onclick="VehiclesPage.openAddModal()">Add Vehicle</button>
                </div>
            ` : ''}
        </div>
        `;
    }

    function renderRows(vehicles) {
        return vehicles.map(v => `
            <tr data-id="${v.id}">
                <td><span style="font-weight:600; color:var(--text-accent);">${v.id}</span></td>
                <td>
                    <div class="detail-card">
                        <div class="detail-avatar" style="border-radius:var(--radius-sm);">${v.make[0]}</div>
                        <div class="detail-info">
                            <strong>${v.make} ${v.model}</strong>
                            <span>${v.year}</span>
                        </div>
                    </div>
                </td>
                <td><code style="background:var(--bg-elevated);padding:3px 8px;border-radius:4px;font-size:0.8rem;">${v.plate}</code></td>
                <td>${v.type}</td>
                <td>${v.fuel}</td>
                <td>${v.mileage ? v.mileage.toLocaleString() + ' km' : '—'}</td>
                <td><span class="badge badge-${v.status}">${v.status.replace('-', ' ')}</span></td>
                <td>
                    <div class="row-actions">
                        <button class="row-action-btn" onclick="VehiclesPage.openEditModal('${v.id}')" title="Edit">✏️</button>
                        <button class="row-action-btn delete" onclick="VehiclesPage.remove('${v.id}')" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function filter() {
        const query = document.getElementById('vehicleSearch').value.toLowerCase();
        const status = document.getElementById('vehicleStatusFilter').value;
        let vehicles = DataStore.getVehicles();
        if (status) vehicles = vehicles.filter(v => v.status === status);
        if (query) vehicles = vehicles.filter(v =>
            `${v.make} ${v.model} ${v.plate} ${v.id} ${v.type} ${v.fuel}`.toLowerCase().includes(query)
        );
        document.getElementById('vehicleTableBody').innerHTML = renderRows(vehicles);
    }

    function openAddModal() {
        App.openModal('Add New Vehicle', getFormHTML());
    }

    function openEditModal(id) {
        const v = DataStore.getVehicles().find(v => v.id === id);
        if (!v) return;
        App.openModal('Edit Vehicle', getFormHTML(v));
    }

    function getFormHTML(v = null) {
        return `
        <form onsubmit="VehiclesPage.save(event, '${v ? v.id : ''}')">
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Make</label>
                    <input class="form-input" name="make" value="${v ? v.make : ''}" required placeholder="e.g. Toyota">
                </div>
                <div class="form-group">
                    <label class="form-label">Model</label>
                    <input class="form-input" name="model" value="${v ? v.model : ''}" required placeholder="e.g. Camry">
                </div>
                <div class="form-group">
                    <label class="form-label">Year</label>
                    <input class="form-input" name="year" type="number" value="${v ? v.year : 2024}" required min="2000" max="2030">
                </div>
                <div class="form-group">
                    <label class="form-label">License Plate</label>
                    <input class="form-input" name="plate" value="${v ? v.plate : ''}" required placeholder="KA-01-XX-0000">
                </div>
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select class="form-select" name="type" required>
                        <option value="Sedan" ${v && v.type === 'Sedan' ? 'selected' : ''}>Sedan</option>
                        <option value="SUV" ${v && v.type === 'SUV' ? 'selected' : ''}>SUV</option>
                        <option value="Hatchback" ${v && v.type === 'Hatchback' ? 'selected' : ''}>Hatchback</option>
                        <option value="MPV" ${v && v.type === 'MPV' ? 'selected' : ''}>MPV</option>
                        <option value="Luxury" ${v && v.type === 'Luxury' ? 'selected' : ''}>Luxury</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Fuel</label>
                    <select class="form-select" name="fuel" required>
                        <option value="Petrol" ${v && v.fuel === 'Petrol' ? 'selected' : ''}>Petrol</option>
                        <option value="Diesel" ${v && v.fuel === 'Diesel' ? 'selected' : ''}>Diesel</option>
                        <option value="Electric" ${v && v.fuel === 'Electric' ? 'selected' : ''}>Electric</option>
                        <option value="CNG" ${v && v.fuel === 'CNG' ? 'selected' : ''}>CNG</option>
                        <option value="Hybrid" ${v && v.fuel === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-select" name="status" required>
                        <option value="available" ${v && v.status === 'available' ? 'selected' : ''}>Available</option>
                        <option value="in-use" ${v && v.status === 'in-use' ? 'selected' : ''}>In Use</option>
                        <option value="maintenance" ${v && v.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="retired" ${v && v.status === 'retired' ? 'selected' : ''}>Retired</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Mileage (km)</label>
                    <input class="form-input" name="mileage" type="number" value="${v ? v.mileage : 0}" min="0">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${v ? 'Update' : 'Add'} Vehicle</button>
                </div>
            </div>
        </form>
        `;
    }

    function save(e, id) {
        e.preventDefault();
        const form = e.target;
        const data = {
            make: form.make.value,
            model: form.model.value,
            year: parseInt(form.year.value),
            plate: form.plate.value,
            type: form.type.value,
            fuel: form.fuel.value,
            status: form.status.value,
            mileage: parseInt(form.mileage.value) || 0,
            lastService: new Date().toISOString().split('T')[0],
        };

        if (id) {
            DataStore.updateVehicle(id, data);
            App.toast('Vehicle updated successfully', 'success');
        } else {
            DataStore.addVehicle(data);
            App.toast('Vehicle added successfully', 'success');
        }
        App.closeModal();
        App.navigateTo('vehicles');
    }

    function remove(id) {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            DataStore.deleteVehicle(id);
            App.toast('Vehicle deleted', 'warning');
            App.navigateTo('vehicles');
        }
    }

    return { render, filter, openAddModal, openEditModal, save, remove };
})();

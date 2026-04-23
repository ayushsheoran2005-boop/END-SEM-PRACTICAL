/* ========================================
   DATA LAYER — localStorage CRUD
   ======================================== */
const DataStore = (() => {
    const KEYS = {
        vehicles: 'cfms_vehicles',
        drivers: 'cfms_drivers',
        trips: 'cfms_trips',
    };

    // ---- Seed Data ----
    const defaultVehicles = [
        { id: 'V001', make: 'Toyota', model: 'Camry', year: 2023, plate: 'KA-01-AB-1234', type: 'Sedan', fuel: 'Petrol', status: 'available', mileage: 12500, lastService: '2026-03-15' },
        { id: 'V002', make: 'Honda', model: 'City', year: 2024, plate: 'KA-01-CD-5678', type: 'Sedan', fuel: 'Petrol', status: 'in-use', mileage: 8300, lastService: '2026-02-20' },
        { id: 'V003', make: 'Hyundai', model: 'Creta', year: 2023, plate: 'KA-02-EF-9012', type: 'SUV', fuel: 'Diesel', status: 'available', mileage: 22100, lastService: '2026-03-01' },
        { id: 'V004', make: 'Maruti', model: 'Swift', year: 2022, plate: 'KA-03-GH-3456', type: 'Hatchback', fuel: 'Petrol', status: 'maintenance', mileage: 45200, lastService: '2026-01-10' },
        { id: 'V005', make: 'Tata', model: 'Nexon EV', year: 2024, plate: 'KA-01-IJ-7890', type: 'SUV', fuel: 'Electric', status: 'available', mileage: 5600, lastService: '2026-03-25' },
        { id: 'V006', make: 'Mahindra', model: 'XUV700', year: 2023, plate: 'KA-04-KL-2345', type: 'SUV', fuel: 'Diesel', status: 'in-use', mileage: 18900, lastService: '2026-02-28' },
        { id: 'V007', make: 'Kia', model: 'Seltos', year: 2024, plate: 'KA-01-MN-6789', type: 'SUV', fuel: 'Petrol', status: 'available', mileage: 3200, lastService: '2026-03-20' },
        { id: 'V008', make: 'Toyota', model: 'Innova', year: 2022, plate: 'KA-05-OP-0123', type: 'MPV', fuel: 'Diesel', status: 'retired', mileage: 98500, lastService: '2025-12-15' },
    ];

    const defaultDrivers = [
        { id: 'D001', name: 'Rajesh Kumar', phone: '9876543210', license: 'KA-DL-2020-001234', status: 'active', rating: 4.8, trips: 342, joinDate: '2022-01-15', assignedVehicle: 'V002' },
        { id: 'D002', name: 'Suresh Babu', phone: '9876543211', license: 'KA-DL-2019-005678', status: 'on-trip', rating: 4.5, trips: 287, joinDate: '2021-06-20', assignedVehicle: 'V006' },
        { id: 'D003', name: 'Amit Singh', phone: '9876543212', license: 'KA-DL-2021-009012', status: 'active', rating: 4.9, trips: 198, joinDate: '2023-03-10', assignedVehicle: null },
        { id: 'D004', name: 'Priya Sharma', phone: '9876543213', license: 'KA-DL-2022-003456', status: 'off-duty', rating: 4.7, trips: 156, joinDate: '2023-08-01', assignedVehicle: null },
        { id: 'D005', name: 'Mohammed Farhan', phone: '9876543214', license: 'KA-DL-2020-007890', status: 'active', rating: 4.6, trips: 410, joinDate: '2021-01-05', assignedVehicle: null },
        { id: 'D006', name: 'Kavitha Nair', phone: '9876543215', license: 'KA-DL-2023-002345', status: 'active', rating: 4.3, trips: 89, joinDate: '2024-02-14', assignedVehicle: null },
    ];

    const defaultTrips = [
        { id: 'T001', passenger: 'Arjun Reddy', pickup: 'MG Road, Bangalore', dropoff: 'Electronic City', driverId: 'D001', vehicleId: 'V002', status: 'completed', fare: 450, distance: 22.5, date: '2026-04-07', time: '09:30' },
        { id: 'T002', passenger: 'Sneha Patil', pickup: 'Koramangala', dropoff: 'Whitefield', driverId: 'D002', vehicleId: 'V006', status: 'in-progress', fare: 380, distance: 18.0, date: '2026-04-08', time: '10:15' },
        { id: 'T003', passenger: 'Vikram Joshi', pickup: 'Indiranagar', dropoff: 'Airport', driverId: 'D003', vehicleId: 'V003', status: 'completed', fare: 720, distance: 35.2, date: '2026-04-07', time: '14:00' },
        { id: 'T004', passenger: 'Anita Das', pickup: 'Jayanagar', dropoff: 'Marathahalli', driverId: 'D005', vehicleId: 'V005', status: 'completed', fare: 310, distance: 15.8, date: '2026-04-06', time: '16:45' },
        { id: 'T005', passenger: 'Rohit Mehta', pickup: 'HSR Layout', dropoff: 'Koramangala', driverId: 'D001', vehicleId: 'V002', status: 'pending', fare: 150, distance: 5.2, date: '2026-04-08', time: '12:00' },
        { id: 'T006', passenger: 'Divya Rao', pickup: 'BTM Layout', dropoff: 'MG Road', driverId: null, vehicleId: null, status: 'pending', fare: 220, distance: 10.1, date: '2026-04-08', time: '13:30' },
    ];

    function getAll(key) {
        const data = localStorage.getItem(KEYS[key]);
        return data ? JSON.parse(data) : null;
    }

    function setAll(key, data) {
        localStorage.setItem(KEYS[key], JSON.stringify(data));
    }

    function init() {
        if (!getAll('vehicles')) setAll('vehicles', defaultVehicles);
        if (!getAll('drivers')) setAll('drivers', defaultDrivers);
        if (!getAll('trips')) setAll('trips', defaultTrips);
    }

    function getVehicles() { return getAll('vehicles') || []; }
    function getDrivers() { return getAll('drivers') || []; }
    function getTrips() { return getAll('trips') || []; }

    function saveVehicles(v) { setAll('vehicles', v); }
    function saveDrivers(d) { setAll('drivers', d); }
    function saveTrips(t) { setAll('trips', t); }

    function addVehicle(v) {
        const vehicles = getVehicles();
        v.id = 'V' + String(vehicles.length + 1).padStart(3, '0');
        vehicles.push(v);
        saveVehicles(vehicles);
        return v;
    }

    function updateVehicle(id, updates) {
        const vehicles = getVehicles();
        const idx = vehicles.findIndex(v => v.id === id);
        if (idx !== -1) { vehicles[idx] = { ...vehicles[idx], ...updates }; saveVehicles(vehicles); }
        return vehicles[idx];
    }

    function deleteVehicle(id) {
        saveVehicles(getVehicles().filter(v => v.id !== id));
    }

    function addDriver(d) {
        const drivers = getDrivers();
        d.id = 'D' + String(drivers.length + 1).padStart(3, '0');
        d.trips = 0;
        d.rating = 0;
        drivers.push(d);
        saveDrivers(drivers);
        return d;
    }

    function updateDriver(id, updates) {
        const drivers = getDrivers();
        const idx = drivers.findIndex(d => d.id === id);
        if (idx !== -1) { drivers[idx] = { ...drivers[idx], ...updates }; saveDrivers(drivers); }
        return drivers[idx];
    }

    function deleteDriver(id) {
        saveDrivers(getDrivers().filter(d => d.id !== id));
    }

    function addTrip(t) {
        const trips = getTrips();
        t.id = 'T' + String(trips.length + 1).padStart(3, '0');
        trips.push(t);
        saveTrips(trips);
        return t;
    }

    function updateTrip(id, updates) {
        const trips = getTrips();
        const idx = trips.findIndex(t => t.id === id);
        if (idx !== -1) { trips[idx] = { ...trips[idx], ...updates }; saveTrips(trips); }
        return trips[idx];
    }

    function deleteTrip(id) {
        saveTrips(getTrips().filter(t => t.id !== id));
    }

    function getNextId(prefix, items) {
        const nums = items.map(i => parseInt(i.id.replace(prefix, '')));
        return prefix + String(Math.max(0, ...nums) + 1).padStart(3, '0');
    }

    init();

    return {
        getVehicles, getDrivers, getTrips,
        saveVehicles, saveDrivers, saveTrips,
        addVehicle, updateVehicle, deleteVehicle,
        addDriver, updateDriver, deleteDriver,
        addTrip, updateTrip, deleteTrip,
        getNextId, init,
        reset() {
            localStorage.removeItem(KEYS.vehicles);
            localStorage.removeItem(KEYS.drivers);
            localStorage.removeItem(KEYS.trips);
            init();
        }
    };
})();

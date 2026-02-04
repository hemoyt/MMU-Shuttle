const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

let currentUser = null;
let token = null;
let socket = null;
let map = null;
let busMarker = null;
let isRegistering = false;
let watchId = null;

// Initialize Map
function initMap() {
    if (map) return;
    map = L.map('map').setView([2.9279, 101.6413], 15); // MMU Cyberjaya
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Auth Toggle
document.getElementById('toggle-auth').addEventListener('click', (e) => {
    e.preventDefault();
    isRegistering = !isRegistering;
    document.getElementById('auth-title').innerText = isRegistering ? 'Register' : 'Login';
    document.getElementById('name-field').classList.toggle('hidden', !isRegistering);
    document.getElementById('role-field').classList.toggle('hidden', !isRegistering);
    document.getElementById('toggle-auth').innerText = isRegistering ? 'Already have an account? Login' : "Don't have an account? Register";
});

// Auth Form Submit
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isRegistering) {
            const name = document.getElementById('name').value;
            const role = document.getElementById('role').value;
            await axios.post(`${API_URL}/register`, { name, email, password, role });
            alert('Registration successful! Please login.');
            document.getElementById('toggle-auth').click();
        } else {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            token = response.data.token;
            currentUser = response.data.user;
            localStorage.setItem('shuttle_token', token);
            localStorage.setItem('shuttle_user', JSON.stringify(currentUser));
            showDashboard();
        }
    } catch (error) {
        alert(error.response?.data?.error || 'Authentication failed');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('shuttle_token');
    localStorage.removeItem('shuttle_user');
    location.reload();
});

// Demo Buttons Logic
document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('email').value = btn.dataset.email;
        document.getElementById('password').value = btn.dataset.pass;
    });
});

// Show Dashboard
async function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    document.getElementById('user-name').innerText = currentUser.name;
    document.getElementById('user-role').innerText = currentUser.role;

    initMap();
    initSocket();
    loadRoutes();
    loadNotifications();

    if (currentUser.role === 'student') {
        document.getElementById('student-controls').classList.remove('hidden');
    } else if (currentUser.role === 'driver') {
        document.getElementById('driver-controls').classList.remove('hidden');
    } else if (currentUser.role === 'admin' || currentUser.role === 'coordinator') {
        document.getElementById('admin-controls').classList.remove('hidden');
        loadAdminStats();
    }
}

// Socket Initialization
function initSocket() {
    if (socket) return;
    socket = io(SOCKET_URL, {
        auth: { token }
    });

    socket.on('location-update', (data) => {
        updateBusMarker(data.lat, data.lng);
    });

    socket.on('new-notification', (note) => {
        showNotification(note.message);
    });
}

function showNotification(msg) {
    const banner = document.getElementById('notification-banner');
    document.getElementById('latest-notification').innerText = msg;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 5000);
}

// Load Notifications (Initial)
async function loadNotifications() {
    try {
        const res = await axios.get(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.length > 0) {
            showNotification(res.data[0].message);
        }
    } catch (e) { console.error(e); }
}

// ... existing map code ...

function updateBusMarker(lat, lng) {
    if (busMarker) {
        busMarker.setLatLng([lat, lng]);
    } else {
        const busIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
            iconSize: [38, 38]
        });
        busMarker = L.marker([lat, lng], { icon: busIcon }).addTo(map);
    }
    map.panTo([lat, lng]);
}

// Load Routes
// Global variable to store routes
let allRoutes = [];

// ... existing code ...

// Load Routes
async function loadRoutes() {
    try {
        const response = await axios.get(`${API_URL}/routes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        allRoutes = response.data; // Store for later
        const routeSelect = document.getElementById('route-select');
        const driverRouteSelect = document.getElementById('driver-route-select');

        // Clear previous
        routeSelect.innerHTML = '<option value="">Select Route</option>';
        driverRouteSelect.innerHTML = '<option value="">Select Route to Start</option>';

        allRoutes.forEach(route => {
            const option = `<option value="${route.id}">${route.name}</option>`;
            routeSelect.innerHTML += option;
            driverRouteSelect.innerHTML += option;
        });

        if (allRoutes.length > 0) {
            displayStops(allRoutes[0].Stops);
            if (socket) socket.emit('join-route', allRoutes[0].id);
        }
    } catch (error) {
        console.error('Error loading routes', error);
    }
}

function displayStops(stops) {
    if (!stops) return;
    const tbody = document.getElementById('stops-table-body');
    tbody.innerHTML = stops.map(stop => `
        <tr>
            <td class="p-2 border-b border-gray-100">${stop.stop_name}</td>
            <td class="p-2 border-b border-gray-100 text-center">${stop.order_index + 1}</td>
        </tr>
    `).join('');
}

// Handle Route Selection
document.getElementById('route-select').addEventListener('change', async (e) => {
    const routeId = e.target.value;
    if (!routeId) return;

    // Find the selected route data
    const selectedRoute = allRoutes.find(r => r.id == routeId);

    // Populate Stops Dropdown
    const stopSelect = document.getElementById('stop-select');
    if (stopSelect) {
        stopSelect.innerHTML = '<option value="">Select Pick Up Point</option>';
        if (selectedRoute && selectedRoute.Stops) {
            selectedRoute.Stops.forEach(stop => {
                stopSelect.innerHTML += `<option value="${stop.stop_name}">${stop.stop_name}</option>`;
            });
        }
    }

    // Load Schedule
    const response = await axios.get(`${API_URL}/schedules/${routeId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const schedules = response.data;
    const scheduleSelect = document.getElementById('schedule-select');
    scheduleSelect.innerHTML = '<option value="">Select Schedule</option>' +
        schedules.map(s => `<option value="${s.id}">${s.departure_time} (${s.bus_number})</option>`).join('');

    // Display stops table
    if (selectedRoute) displayStops(selectedRoute.Stops);

    socket.emit('join-route', routeId);
});

// Booking
document.getElementById('book-btn').addEventListener('click', async () => {
    const scheduleSelect = document.getElementById('schedule-select');
    const stopSelect = document.getElementById('stop-select');
    const scheduleId = scheduleSelect.value;
    const pickupStop = stopSelect ? stopSelect.value : null;

    if (!scheduleId) return showToast('Please select a schedule', 'error');
    if (stopSelect && !pickupStop) return showToast('Please select a pick-up point', 'error');

    try {
        await axios.post(`${API_URL}/bookings`, { schedule_id: scheduleId, pickup_stop: pickupStop }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Show Ticket Modal
        document.getElementById('ticket-name').innerText = currentUser.name;
        if (document.getElementById('ticket-pickup')) document.getElementById('ticket-pickup').innerText = pickupStop || 'N/A';

        try {
            document.getElementById('ticket-route').innerText = document.getElementById('route-select').options[document.getElementById('route-select').selectedIndex].text;
            document.getElementById('ticket-time').innerText = scheduleSelect.options[scheduleSelect.selectedIndex].text;
        } catch (e) { }

        document.getElementById('ticket-modal').classList.remove('hidden');
        showToast('Seat booked successfully!');
        if (currentUser.role === 'admin' || currentUser.role === 'coordinator') loadAdminStats();
    } catch (error) {
        showToast('Booking failed', 'error');
    }
});

// Driver Location Sharing
document.getElementById('start-trip-btn').addEventListener('click', () => {
    const routeId = document.getElementById('driver-route-select').value;
    if (!routeId) return alert('Please select a route');

    if (navigator.geolocation) {
        document.getElementById('trip-status').innerText = 'Sharing location...';
        document.getElementById('start-trip-btn').disabled = true;

        // Mock movement for demo if real GPS is static
        let lat = 2.9279, lng = 101.6413;

        setInterval(() => {
            // Basic random movement simulation
            lat += (Math.random() - 0.5) * 0.001;
            lng += (Math.random() - 0.5) * 0.001;
            socket.emit('update-location', { routeId, lat, lng });
            updateBusMarker(lat, lng);
        }, 3000);
    }
});

// Incident Reporting
document.getElementById('report-incident-btn')?.addEventListener('click', async () => {
    const type = document.getElementById('incident-type').value;
    const description = document.getElementById('incident-desc').value;

    try {
        await axios.post(`${API_URL}/incidents`, { type, description }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Incident reported successfully');
        document.getElementById('incident-desc').value = '';
    } catch (e) { alert('Failed to report incident'); }
});

// Send Notification (Admin/Coord)
document.getElementById('send-notify-btn')?.addEventListener('click', async () => {
    const message = document.getElementById('notify-msg').value;
    const target_role = document.getElementById('notify-target').value;

    try {
        await axios.post(`${API_URL}/notifications`, { message, type: 'alert', target_role }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Notification sent');
        document.getElementById('notify-msg').value = '';
    } catch (e) { alert('Failed to send notification'); }
});

// Admin Stats
async function loadAdminStats() {
    try {
        const response = await axios.get(`${API_URL}/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const stats = response.data;
        const statsDiv = document.getElementById('admin-stats');

        statsDiv.innerHTML = `
            <div class="p-4 bg-blue-50 rounded-lg">
                <p class="text-xs text-blue-600 uppercase font-bold">Total Users</p>
                <p class="text-2xl font-bold text-blue-900">${stats.totalUsers}</p>
            </div>
            <div class="p-4 bg-green-50 rounded-lg">
                <p class="text-xs text-green-600 uppercase font-bold">Bookings</p>
                <p class="text-2xl font-bold text-green-900">${stats.totalBookings}</p>
            </div>
            <div class="p-4 bg-purple-50 rounded-lg">
                <p class="text-xs text-purple-600 uppercase font-bold">Active Routes</p>
                <p class="text-2xl font-bold text-purple-900">${stats.activeRouteCount}</p>
            </div>
            <div class="p-4 bg-red-50 rounded-lg">
                <p class="text-xs text-red-600 uppercase font-bold">Incidents</p>
                <p class="text-2xl font-bold text-red-900">${stats.recentIncidents}</p>
            </div>
        `;
    } catch (e) { console.error('Stats error', e); }
}

// Check for existing session
window.onload = () => {
    const savedToken = localStorage.getItem('shuttle_token');
    const savedUser = localStorage.getItem('shuttle_user');
    if (savedToken && savedUser) {
        token = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
};

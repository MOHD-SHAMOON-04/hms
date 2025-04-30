// Ensure that only wardens can access this page
document.addEventListener('DOMContentLoaded', () => {
  // Initialize data
  initializeData();

  protectRoute(['warden']);

  // Set user name in the UI
  const user = getCurrentUser();
  if (user) {
    $('#user-name').textContent = user.name;
    $('#avatar').src = `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`;
  }

  setTimeout(() => {
    // Initialize dashboard
    initializeDashboard();

    // Add event listeners for navigation
    setupNavigation();

    // Setup user dropdown
    setupUserDropdown();

    // Initialize page-specific content
    loadOverviewPage();
    loadRoomsPage();
    loadStudentsPage();
    loadMaintenancePage();
    loadPaymentsPage();
    loadEventsPage();
  }
    , 250);
});

// Initialize dashboard with statistics
function initializeDashboard() {
  const user = getFromStorage('currentUser');

  // Load rooms count
  const rooms = getFromStorage('rooms') || [];
  $('#total-rooms').textContent = rooms.length;

  // Set hostel name in overview
  $('#hostel-name').textContent = `Hostel ${user.hostelId ? user.hostelId : '007'}`;

  // Load students count
  $('#total-students').textContent = user.numberOfStudents || 0;

  // Load maintenance requests count
  const maintenanceRequests = getFromStorage('maintenanceRequests') || [];
  $('#maintenance-requests').textContent = maintenanceRequests.length;

  // Load upcoming events count
  const events = getFromStorage('events') || [];
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
  $('#upcoming-events').textContent = upcomingEvents.length;
}

// Setup navigation
function setupNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const pages = document.querySelectorAll('.page-content');

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      sidebarItems.forEach(i => i.classList.remove('active'));

      // Add active class to clicked item
      item.classList.add('active');

      // Hide all pages
      pages.forEach(page => page.classList.add('hidden'));

      // Show the selected page
      const pageName = item.getAttribute('data-page');
      $(`#${pageName}-page`).classList.remove('hidden');

      // Update page title
      $('#page-title').textContent = item.querySelector('span').textContent;
    });
  });
}

// Setup user dropdown
function setupUserDropdown() {
  const dropdown = $('.user-dropdown-toggle');
  const menu = $('.user-dropdown-menu');

  dropdown.addEventListener('click', () => {
    menu.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      menu.classList.remove('show');
    }
  });

  $('.logout-btn').addEventListener('click', logout);
}

function loadOverviewPage() {
  loadActivityList();
  loadOccupancyChart();
}

function loadActivityList() {
  const activityList = $('#activity-list');

  const activities = [
    {
      type: 'info',
      message: 'Maintenance request from Room 209 was completed',
      date: new Date()
    },
    {
      type: 'warning',
      message: 'New maintenance request from Room 101',
      date: new Date()
    }
  ];

  // Clear current activities
  activityList.innerHTML = '';

  // Add activities to the list
  activities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
      <div class="activity-icon bg-${activity.type === 'info' ? 'primary' : activity.type}">
        <i class="fas fa-${activity.type === 'info' ? 'info-circle' : activity.type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-message">${activity.message}</div>
        <div class="activity-date">${formatDate(activity.date)}</div>
      </div>
    `;
    activityList.appendChild(activityItem);
  });

  // Add some styling to activity items
  const style = document.createElement('style');
  style.textContent = `
    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: var(--space-8) 0;
      border-bottom: 1px solid var(--color-neutral-200);
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: var(--space-16);
      color: white;
    }
    
    .activity-content {
      flex: 1;
    }
    
    .activity-message {
      font-weight: 500;
      margin-bottom: var(--space-4);
    }
    
    .activity-date {
      font-size: 0.875rem;
      color: var(--color-neutral-500);
    }
  `;
  document.head.appendChild(style);
}

// Load occupancy chart
function loadOccupancyChart() {
  const user = getFromStorage('currentUser');

  const chartContainer = $('#occupancy-chart');

  // Get rooms data
  const rooms = getFromStorage('rooms') || [];

  // Calculate occupancy
  const totalBeds = rooms.reduce((total, room) => total + room.capacity, 0);
  const occupiedBeds = user.numberOfStudents || 0;
  const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

  // Create chart HTML
  chartContainer.innerHTML = `
    <div class="occupancy-stats">
      <div class="occupancy-stat">
        <div class="stat-value">${occupiedBeds}/${totalBeds}</div>
        <div class="stat-label">Beds Occupied</div>
      </div>
      <div class="occupancy-stat">
        <div class="stat-value">${occupancyRate.toFixed(1)}%</div>
        <div class="stat-label">Occupancy Rate</div>
      </div>
    </div>
    <div class="occupancy-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${occupancyRate}%"></div>
      </div>
      <div class="progress-labels">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  `;

  // Add styling for occupancy chart
  const style = document.createElement('style');
  style.textContent = `
    .occupancy-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: var(--space-24);
    }
    
    .occupancy-stat {
      text-align: center;
    }
    
    .occupancy-stat .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-primary);
    }
    
    .occupancy-stat .stat-label {
      font-size: 0.875rem;
      color: var(--color-neutral-600);
    }
    
    .occupancy-progress {
      margin-bottom: var(--space-24);
    }
    
    .progress-bar {
      height: 8px;
      background-color: var(--color-neutral-200);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: var(--space-4);
    }
    
    .progress-fill {
      height: 100%;
      background-color: var(--color-primary);
      border-radius: var(--radius-full);
      transition: width 0.3s ease;
    }
    
    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--color-neutral-600);
    }
  `;
  document.head.appendChild(style);
}

// Load rooms page
function loadRoomsPage() {
  const roomsList = $('#rooms-list');

  // Get rooms data
  const rooms = getFromStorage('rooms') || [];

  // Clear current list
  roomsList.innerHTML = '';

  if (rooms.length === 0) {
    roomsList.innerHTML = `<p class="text-center">No rooms found.</p>`;
  } else {
    // Create rooms grid
    const roomsGrid = document.createElement('div');
    roomsGrid.className = 'rooms-grid';

    // Add rooms to grid
    rooms.forEach(room => {
      const occupancyRate = (room.student_count / room.capacity) * 100;
      const roomCard = document.createElement('div');
      roomCard.className = 'room-card';
      roomCard.innerHTML = `
        <div class="room-header">
          <h3>Room ${room.roomNumber}</h3>
          <span class="badge badge-${occupancyRate === 100 ? 'error' : occupancyRate > 0 ? 'warning' : 'success'}">
            ${occupancyRate === 100 ? 'Full' : occupancyRate > 0 ? 'Partially Occupied' : 'Vacant'}
          </span>
        </div>
        <div class="room-body">
          <div class="room-info">
            <div class="info-item">
              <span class="label">Type:</span>
              <span class="value">Standard</span>
            </div>
            <div class="info-item">
              <span class="label">Floor:</span>
              <span class="value">${room.roomNumber % 100}</span>
            </div>
            <div class="info-item">
              <span class="label">Capacity:</span>
              <span class="value">${room.capacity} beds</span>
            </div>
            <div class="info-item">
              <span class="label">Occupied:</span>
              <span class="value">${room.student_count} beds</span>
            </div>
          </div>
          <div class="room-occupancy">
            <h4>Bed Status</h4>
            <div class="bed-status">
              ${getBedStatus(room)}
            </div>
          </div>
        </div>
        <!-- <div class="room-footer">
          <button class="btn btn-sm btn-outline view-room-btn" data-room-id="${room.id}">
            <i class="fas fa-eye"></i> View Details
          </button> -->
        </div>
      `;
      roomsGrid.appendChild(roomCard);
    });

    roomsList.appendChild(roomsGrid);

    // Add styling for rooms grid
    const style = document.createElement('style');
    style.textContent = `
      .rooms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--space-16);
      }
      
      .room-card {
        background-color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .room-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
      
      .room-header {
        padding: var(--space-16);
        background-color: var(--color-neutral-50);
        border-bottom: 1px solid var(--color-neutral-200);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .room-header h3 {
        margin-bottom: 0;
        font-size: 1.25rem;
      }
      
      .room-body {
        padding: var(--space-16);
      }
      
      .room-info {
        margin-bottom: var(--space-16);
      }
      
      .info-item {
        display: flex;
        margin-bottom: var(--space-4);
      }
      
      .info-item .label {
        font-weight: 500;
        min-width: 80px;
      }
      
      .room-occupancy h4 {
        margin-bottom: var(--space-8);
        font-size: 1rem;
      }
      
      .bed-status {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-8);
      }
      
      .bed-indicator {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
      }
      
      .bed-occupied {
        background-color: var(--color-error-light);
        color: var(--color-error-dark);
      }
      
      .bed-vacant {
        background-color: var(--color-success-light);
        color: var(--color-success-dark);
      }
      
      .room-footer {
        padding: var(--space-16);
        border-top: 1px solid var(--color-neutral-200);
        background-color: var(--color-neutral-50);
        display: flex;
        justify-content: center;
      }
      
      @media (max-width: 768px) {
        .rooms-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Get bed status indicators for a room
function getBedStatus(room) {
  const beds = ['A', 'B', 'C', 'D', 'E', 'F'];
  const occupiedBeds = [];
  let bedStatus = '';
  for (let i = 0; i < room.student_count; i++) {
    const bedLetter = beds[i];
    occupiedBeds.push(bedLetter);
  }
  for (let i = 0; i < room.capacity; i++) {
    const bedLetter = beds[i];
    const isOccupied = occupiedBeds.includes(bedLetter);

    bedStatus += `
      <div class="bed-indicator ${isOccupied ? 'bed-occupied' : 'bed-vacant'}">
        ${bedLetter}
      </div>
    `;
  }

  return bedStatus;
}

// Load students page
function loadStudentsPage() {
  const studentsList = $('#students-list');

  // Get students data
  const students = getFromStorage('students') || [];
  // console.log(students);

  // Clear current list
  studentsList.innerHTML = '';

  if (students.length === 0) {
    studentsList.innerHTML = `<p class="text-center">No students found.</p>`;
  } else {
    // Create table
    const table = document.createElement('table');
    table.className = 'students-table';

    // Add table header
    table.innerHTML = `
      <thead>
        <tr>
          <th>Student Id</th>
          <th>Username</th>
          <th>Room</th>
          <th>Mob No.</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tableBody = table.querySelector('tbody');

    // Add students to table
    students.forEach(student => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.student_id}</td>
        <td>${student.username}</td>
        <td>${student.roomNumber || '0'}</td>
        <td>${student.phone_num || '0'}</td>
      `;
      tableBody.appendChild(row);
    });

    studentsList.appendChild(table);

    // Add styling for students table
    const style = document.createElement('style');
    style.textContent = `
      .students-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      overflow: hidden;
      background-color: #fff;
    }

    .students-table th,
    .students-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .students-table thead {
      background-color: #f9fafb;
      color: #333;
      text-transform: uppercase;
      font-size: 0.875rem;
      letter-spacing: 0.5px;
    }

    .students-table tbody tr:hover {
      background-color: #f1f5f9;
    }

    .students-table tbody tr:last-child td {
      border-bottom: none;
    }
    `;
    document.head.appendChild(style);

  }
}

// Load maintenance page
function loadMaintenancePage() {
  const maintenanceList = $('#maintenance-list');

  // Get maintenance requests
  const requests = getFromStorage('maintenanceRequests') || [];
  const students = getFromStorage('students') || [];

  // Clear current list
  maintenanceList.innerHTML = '';

  if (requests.length === 0) {
    maintenanceList.innerHTML = `<p class="text-center">No maintenance requests found.</p>`;
  } else {
    // Create table
    const table = document.createElement('table');
    table.className = 'maintenance-table';

    // Add table header
    table.innerHTML = `
      <thead>
        <tr>
          <th>Title</th>
          <th>Student Id</th>
          <th>Room No.</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tableBody = table.querySelector('tbody');

    // Add requests to table
    requests.forEach(request => {
      const roomNumber = students.find(student => student.student_id === request.student_id)?.roomNumber || '0';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${request.title}</td>
        <td>${request.student_id}</td>
        <td>${roomNumber}</td>
        <td>${formatDate(request.created_date)}</td>
      `;
      tableBody.appendChild(row);
    });

    maintenanceList.appendChild(table);

    // Add styling for maintenance table
    const style = document.createElement('style');
    style.textContent = `
      .maintenance-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      overflow: hidden;
      background-color: #fff;
    }

    .maintenance-table th,
    .maintenance-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .maintenance-table thead {
      background-color: #f9fafb;
      color: #333;
      text-transform: uppercase;
      font-size: 0.875rem;
      letter-spacing: 0.5px;
    }

    .maintenance-table tbody tr:hover {
      background-color: #f1f5f9;
    }

    .maintenance-table tbody tr:last-child td {
      border-bottom: none;
    }
    `;
    document.head.appendChild(style);
  }
}

// Load payments page
function loadPaymentsPage() {
  const paymentsList = $('#payments-list');

  // Get payments
  const payments = getFromStorage('payments') || [];

  // Sort payments by date (newest first)
  payments.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Clear current list
  paymentsList.innerHTML = '';

  if (payments.length === 0) {
    paymentsList.innerHTML = `<p class="text-center">This feature will be available later on.</p>`;
  } else {
    // Create table
    const table = document.createElement('table');
    table.className = 'payments-table';

    // Add table header
    table.innerHTML = `
      <thead>
        <tr>
          <th>Student</th>
          <th>Amount</th>
          <th>Type</th>
          <th>Date</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tableBody = table.querySelector('tbody');

    // Add payments to table
    payments.forEach(payment => {
      // Get student name
      const users = getFromStorage('users') || [];
      const student = users.find(u => u.id === payment.userId);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student ? student.name : 'Unknown'}</td>
        <td>${formatCurrency(payment.amount)}</td>
        <td>${payment.type}</td>
        <td>${formatDate(payment.date)}</td>
        <td>${formatDate(payment.dueDate)}</td>
        <td>
          <span class="badge badge-${payment.status === 'Paid' ? 'success' : 'warning'}">
            ${payment.status}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline view-payment-btn" data-payment-id="${payment.id}">
            <i class="fas fa-eye"></i>
          </button>
          ${payment.status !== 'Paid' ? `
            <button class="btn btn-sm btn-success mark-paid-btn" data-payment-id="${payment.id}">
              <i class="fas fa-check"></i> Mark Paid
            </button>
          ` : ''}
        </td>
      `;
      tableBody.appendChild(row);
    });

    paymentsList.appendChild(table);

    // Add styling for payments table
    const style = document.createElement('style');
    style.textContent = `
      .payments-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .payments-table th,
      .payments-table td {
        padding: var(--space-12);
        text-align: left;
        border-bottom: 1px solid var(--color-neutral-200);
      }
      
      .payments-table th {
        font-weight: 600;
        background-color: var(--color-neutral-50);
      }
      
      .payments-table tbody tr:hover {
        background-color: var(--color-neutral-100);
      }
      
      .btn-sm {
        padding: var(--space-4) var(--space-8);
        font-size: 0.875rem;
      }
    `;
    document.head.appendChild(style);
  }
}

// Load events page
function loadEventsPage() {
  const eventsList = $('#events-list');

  // Get events
  const events = getFromStorage('events') || [];

  // Sort events by date (soonest first)
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Clear current list
  eventsList.innerHTML = '';

  if (events.length === 0) {
    eventsList.innerHTML = `<p class="text-center">No events found.</p>`;
  } else {
    // Create events grid
    const eventsGrid = document.createElement('div');
    eventsGrid.className = 'events-grid';

    // Add events to grid
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const isPast = eventDate < new Date();

      const eventCard = document.createElement('div');
      eventCard.className = `event-card ${isPast ? 'past-event' : ''}`;
      eventCard.innerHTML = `
        <div class="event-date">
          <div class="event-month">${eventDate.toLocaleString('default', { month: 'short' })}</div>
          <div class="event-day">${eventDate.getDate()}</div>
        </div>
        <div class="event-content">
          <h3 class="event-title">${event.title}</h3>
          <p class="event-description">${event.description}</p>
          <div class="event-details">
            <div class="event-detail">
              <i class="fas fa-clock"></i>
              <span>${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="event-detail">
              <i class="fas fa-map-marker-alt"></i>
              <span>${event.location}</span>
            </div>
          </div>
          <div class="event-actions">
            <!-- <button class="btn btn-sm btn-outline view-attendees-btn" data-event-id="${event.id}">
              <i class="fas fa-users"></i> View Attendees
            </button>
            <button class="btn btn-sm btn-warning edit-event-btn" data-event-id="${event.id}">
              <i class="fas fa-edit"></i> Edit
            </button> -->
          </div>
        </div>
      `;
      eventsGrid.appendChild(eventCard);
    });

    eventsList.appendChild(eventsGrid);

    // Add styling for events grid
    const style = document.createElement('style');
    style.textContent = `
      .events-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--space-16);
      }
      
      .event-card {
        background-color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        overflow: hidden;
        display: flex;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .event-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
      
      .past-event {
        opacity: 0.7;
      }
      
      .event-date {
        width: 80px;
        background-color: var(--color-primary);
        color: white;
        text-align: center;
        padding: var(--space-16) 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .past-event .event-date {
        background-color: var(--color-neutral-500);
      }
      
      .event-month {
        font-size: 0.875rem;
        text-transform: uppercase;
        font-weight: 600;
      }
      
      .event-day {
        font-size: 1.75rem;
        font-weight: 700;
      }
      
      .event-content {
        flex: 1;
        padding: var(--space-16);
      }
      
      .event-title {
        margin-bottom: var(--space-8);
        font-size: 1.1rem;
      }
      
      .event-description {
        color: var(--color-neutral-600);
        font-size: 0.875rem;
        margin-bottom: var(--space-16);
      }
      
      .event-details {
        margin-bottom: var(--space-16);
      }
      
      .event-detail {
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        margin-bottom: var(--space-4);
        color: var(--color-neutral-700);
      }
      
      .event-detail i {
        width: 16px;
        margin-right: var(--space-8);
        color: var(--color-primary);
      }
      
      .event-actions {
        display: flex;
        gap: var(--space-8);
      }
      
      .btn-sm {
        padding: var(--space-4) var(--space-8);
        font-size: 0.875rem;
      }
      
      @media (max-width: 768px) {
        .events-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Setup add event form
  setupAddEventForm();
}

// Setup add event form
function setupAddEventForm() {
  const addEventBtn = $('#add-event-btn');
  const addEventModal = $('#add-event-modal');
  const closeModal = addEventModal.querySelector('.close-modal');
  const addEventForm = $('#add-event-form');

  // Show modal when button is clicked
  addEventBtn.addEventListener('click', () => {
    addEventModal.style.display = 'block';
  });

  // Close modal when X is clicked
  closeModal.addEventListener('click', () => {
    addEventModal.style.display = 'none';
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === addEventModal) {
      addEventModal.style.display = 'none';
    }
  });

  // Submit form
  addEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentUser = getFromStorage('currentUser');

    const title = $('#event-title').value;
    const description = $('#event-description').value;
    const date = $('#event-date').value;
    const location = $('#event-location').value;

    // Create new event
    const newEvent = {
      title,
      description,
      date: new Date(date).toISOString(),
      location,
      hostel_id: currentUser.hostelId,
    };
    // console.log(newEvent);

    // Save to server
    const response = await fetch('http://localhost:3000/api/warden/add-event/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    });
    const data = await response.json();
    // console.log(data);

    if (data.success == false) {
      showNotification(data.message, 'error');
    } else {
      showNotification(`Event "${data.title}" added successfully`, 'success');
      const events = getFromStorage('events') || [];

      // add event without hostel_id
      const eventToPush = {
        event_id: data.event_id,
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location
      }
      events.push(eventToPush);
      saveToStorage('events', events);

      // Update event count on overview page
      const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
      $('#upcoming-events').textContent = upcomingEvents.length;
    }
    // Close modal and reset form
    addEventModal.style.display = 'none';
    addEventForm.reset();

    // Reload events page
    loadEventsPage();
  });
}
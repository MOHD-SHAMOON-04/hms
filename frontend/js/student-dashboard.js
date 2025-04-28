// Student Dashboard JavaScript

// Ensure that only students can access this page
document.addEventListener('DOMContentLoaded', () => {
  protectRoute(['student']);

  // Set user name in the UI
  const user = getCurrentUser();
  if (user) {
    $('#user-name').textContent = user.name;
    $('#avatar').src = `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`;
  }

  // Initialize dashboard
  initializeDashboard();

  // Add event listeners for navigation
  setupNavigation();

  // Setup user dropdown
  setupUserDropdown();

  // Initialize page-specific content
  loadOverviewPage();
  loadRoomPage();
  loadMaintenancePage();
  loadPaymentsPage();
  loadEventsPage();
});

// Initialize dashboard with user data
function initializeDashboard() {
  const user = getCurrentUser();

  // Set room number in overview
  $('#room-number').textContent = `Room ${user.roomNumber}`;
  // Set hostel name in overview
  $('#hostel-name').textContent = `Hostel ${user.hostelId}`;

  // Load maintenance requests count
  const maintenanceRequests = getFromStorage('maintenanceRequests') || [];
  $('#pending-requests').textContent = maintenanceRequests.length;

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

  // Logout button
  $('.logout-btn').addEventListener('click', logout);
}

// Load overview page content
function loadOverviewPage() {
  const activityList = $('#activity-list');
  const user = getCurrentUser();

  // what can we add in place of activites

  // Create some sample activities
  const activities = [
    {
      type: 'info',
      message: 'Welcome to the Hostel Management System!',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    // {
    //   type: 'success',
    //   message: 'Your rent payment was received.',
    //   date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    // },
    {
      type: 'warning',
      message: 'Maintenance request from your room has been received.',
      date: new Date() // Today
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

// Load room page content
function loadRoomPage() {
  const roomDetails = $('#room-details');
  const user = getCurrentUser();

  // Get room data
  const room = getFromStorage('roomDetails') || {};
  // console.log(room);


  if (room) {
    roomDetails.innerHTML = `
      <div class="room-card">
        <div class="room-header">
          <h3>Room ${room.roomNumber}</h3>
          <span class="badge badge-${room.occupiedBeds.length === room.capacity ? 'error' : 'success'}">
            ${room.occupiedBeds.length === room.capacity ? 'Full' : 'Available'}
          </span>
        </div>
        <div class="room-info">
          <div class="room-info-item">
            <span class="label">Floor:</span>
            <span class="value">${room.roomNumber % 100}</span>
          </div>
          <div class="room-info-item">
            <span class="label">Capacity:</span>
            <span class="value">${room.capacity} beds</span>
          </div>
          <div class="room-info-item">
            <span class="label">Your Bed:</span>
            <span class="value">Bed ${user.bedNumber}</span>
          </div>
        </div>
        <div class="room-occupancy">
          <h4>Occupancy</h4>
          <div class="bed-layout">
            ${getBedLayout(room)}
          </div>
        </div>
      </div>
    `;

    // Add some styling for the room card
    const style = document.createElement('style');
    style.textContent = `
      .room-card {
        background-color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        overflow: hidden;
      }
      
      .room-header {
        padding: var(--space-16);
        border-bottom: 1px solid var(--color-neutral-200);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--color-neutral-50);
      }
      
      .room-header h3 {
        margin-bottom: 0;
      }
      
      .room-info {
        padding: var(--space-16);
      }
      
      .room-info-item {
        display: flex;
        margin-bottom: var(--space-8);
      }
      
      .room-info-item:last-child {
        margin-bottom: 0;
      }
      
      .room-info-item .label {
        font-weight: 500;
        min-width: 100px;
      }
      
      .room-occupancy {
        padding: var(--space-16);
        border-top: 1px solid var(--color-neutral-200);
      }
      
      .bed-layout {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-16);
        margin-top: var(--space-16);
      }
      
      .bed {
        width: 100px;
        height: 60px;
        border: 2px solid;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
      
      .bed.occupied {
        border-color: var(--color-error);
        background-color: rgba(234, 84, 85, 0.1);
        color: var(--color-error);
      }
      
      .bed.vacant {
        border-color: var(--color-success);
        background-color: rgba(40, 199, 111, 0.1);
        color: var(--color-success);
      }
      
      .bed.current {
        border-color: var(--color-primary);
        background-color: rgba(0, 85, 255, 0.1);
        color: var(--color-primary);
        border-width: 3px;
      }
    `;
    document.head.appendChild(style);
  } else {
    roomDetails.innerHTML = `<p>No room information available.</p>`;
  }
}

// Helper function to generate bed layout
function getBedLayout(room) {
  const user = getCurrentUser();
  const beds = ['A', 'B', 'C', 'D', 'E', 'F'];

  let bedLayout = '';

  for (let i = 0; i < room.capacity; i++) {
    const bedLetter = beds[i];
    const isOccupied = room.occupiedBeds.includes(bedLetter);
    const isCurrent = user.bedNumber === bedLetter;

    bedLayout += `
      <div class="bed ${isCurrent ? 'current' : isOccupied ? 'occupied' : 'vacant'}">
        Bed ${bedLetter}
      </div>
    `;
  }

  return bedLayout;
}

// Load maintenance page content
function loadMaintenancePage() {
  const maintenanceList = $('#maintenance-list');
  const user = getCurrentUser();

  // Get maintenance requests
  const userRequests = getFromStorage('maintenanceRequests') || [];

  // Clear current list
  maintenanceList.innerHTML = '';

  if (userRequests.length === 0) {
    maintenanceList.innerHTML = `<p class="text-center">No maintenance requests found.</p>`;
  } else {
    // Add requests to the list
    userRequests.forEach(request => {
      const requestItem = document.createElement('div');
      requestItem.className = 'maintenance-item';
      requestItem.innerHTML = `
        <div class="maintenance-header">
          <h3>${request.title}</h3>
          <span class="badge badge-warning">Received</span>
        </div>
        <div class="maintenance-body">
          <p>${request.description}</p>
          <div class="maintenance-meta">
            <span><i class="fas fa-calendar"></i> ${formatDate(request.created_date)}</span>
            <span><i class="fas fa-home"></i> Room ${user.roomNumber}</span>
          </div>
        </div>
      `;
      maintenanceList.appendChild(requestItem);
    });
  }

  // Add styling for maintenance items
  const style = document.createElement('style');
  style.textContent = `
    .maintenance-item {
      background-color: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--space-16);
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .maintenance-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .maintenance-header {
      padding: var(--space-16);
      border-bottom: 1px solid var(--color-neutral-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--color-neutral-50);
    }
    
    .maintenance-header h3 {
      margin-bottom: 0;
      font-size: 1.1rem;
    }
    
    .maintenance-body {
      padding: var(--space-16);
    }
    
    .maintenance-body p {
      margin-bottom: var(--space-16);
    }
    
    .maintenance-meta {
      display: flex;
      font-size: 0.875rem;
      color: var(--color-neutral-600);
    }
    
    .maintenance-meta span {
      margin-right: var(--space-16);
      display: flex;
      align-items: center;
    }
    
    .maintenance-meta i {
      margin-right: var(--space-4);
    }
  `;
  document.head.appendChild(style);

  // Setup maintenance form
  setupMaintenanceForm();
}

// Setup maintenance form
function setupMaintenanceForm() {
  const newMaintenanceBtn = $('#new-maintenance-btn');
  const maintenanceModal = $('#maintenance-modal');
  const closeModal = $('.close-modal');
  const maintenanceForm = $('#maintenance-form');

  // Show modal when button is clicked
  newMaintenanceBtn.addEventListener('click', () => {
    maintenanceModal.style.display = 'block';
  });

  // Close modal when X is clicked
  closeModal.addEventListener('click', () => {
    maintenanceModal.style.display = 'none';
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === maintenanceModal) {
      maintenanceModal.style.display = 'none';
    }
  });

  // Submit form
  // make a POST request from here
  maintenanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = getCurrentUser();
    const title = $('#maintenance-title').value;
    const description = $('#maintenance-description').value;

    // Create new maintenance request
    const newRequest = {
      complaint_id: generateId(),
      student_id: user.studentId,
      title,
      description,
      created_date: new Date().toISOString()
    };
    console.log(newRequest);

    // Send to server
    const response = await fetch('http://localhost:3000/api/student/maintenance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(newRequest),
    });

    const data = await response.json();
    console.log(data);

    // expected response from server
    // {
    //   "complaint_id": "ma1300pfju1pvgg0gtd",
    //   "student_id": 202308223,
    //   "title": "H2O filter not working",
    //   "description": "since today morning..., please help",
    //   "created_date": "2025-04-28T12:55:39.411Z"
    // }

    // Save to storage
    const requests = getFromStorage('maintenanceRequests') || [];
    requests.push(data);
    saveToStorage('maintenanceRequests', requests);

    // Update counter on overview page
    $('#pending-requests').textContent = requests.length;

    // Show notification
    showNotification('Maintenance request submitted successfully!', 'success');

    // Close modal and reset form
    maintenanceModal.style.display = 'none';
    maintenanceForm.reset();

    // Reload maintenance page
    loadMaintenancePage();
  });
}

// Load payments page content
function loadPaymentsPage() {
  const paymentList = $('#payment-list');
  const user = getCurrentUser();

  // Get payments
  const payments = getFromStorage('payments') || [];
  const userPayments = payments.filter(payment => payment.userId === user.id);

  // Sort payments by date (newest first)
  userPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate next payment date (first of next month)
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);
  nextDate.setDate(1);
  $('#next-payment-date').textContent = formatDate(nextDate);

  // Clear current list
  paymentList.innerHTML = '';

  if (userPayments.length === 0) {
    paymentList.innerHTML = `<p class="text-center">This feature will be available soon</p>`;
  } else {
    // Create payment table
    const table = document.createElement('table');
    table.className = 'payment-table';

    // Add table header
    table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Receipt</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tableBody = table.querySelector('tbody');

    // Add payments to table
    userPayments.forEach(payment => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatDate(payment.date)}</td>
        <td>${payment.type}</td>
        <td>${formatCurrency(payment.amount)}</td>
        <td><span class="badge badge-${payment.status === 'Paid' ? 'success' : 'warning'}">${payment.status}</span></td>
        <td>${payment.status === 'Paid' ? `<button class="btn btn-sm btn-outline view-receipt" data-receipt="${payment.receiptNumber}">View Receipt</button>` : '-'}</td>
      `;
      tableBody.appendChild(row);
    });

    paymentList.appendChild(table);

    // Add event listeners for receipt buttons
    const receiptButtons = paymentList.querySelectorAll('.view-receipt');
    receiptButtons.forEach(button => {
      button.addEventListener('click', () => {
        const receiptNumber = button.getAttribute('data-receipt');
        showReceipt(receiptNumber, userPayments);
      });
    });
  }

  // Add styling for payment table
  const style = document.createElement('style');
  style.textContent = `
    .payment-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .payment-table th,
    .payment-table td {
      padding: var(--space-12);
      text-align: left;
      border-bottom: 1px solid var(--color-neutral-200);
    }
    
    .payment-table th {
      font-weight: 600;
      background-color: var(--color-neutral-50);
    }
    
    .payment-table tbody tr:hover {
      background-color: var(--color-neutral-100);
    }
    
    .btn-sm {
      padding: var(--space-4) var(--space-8);
      font-size: 0.875rem;
    }
    
    .receipt-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      overflow: auto;
    }
    
    .receipt-content {
      background-color: white;
      margin: 10% auto;
      padding: var(--space-24);
      width: 90%;
      max-width: 500px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      animation: slideUp 0.3s ease-out;
    }
    
    .receipt-header {
      text-align: center;
      margin-bottom: var(--space-24);
      padding-bottom: var(--space-16);
      border-bottom: 1px solid var(--color-neutral-200);
    }
    
    .receipt-body {
      margin-bottom: var(--space-24);
    }
    
    .receipt-row {
      display: flex;
      margin-bottom: var(--space-8);
    }
    
    .receipt-label {
      font-weight: 500;
      min-width: 150px;
    }
    
    .receipt-footer {
      text-align: center;
      margin-top: var(--space-24);
      padding-top: var(--space-16);
      border-top: 1px solid var(--color-neutral-200);
      color: var(--color-neutral-600);
    }
    
    .print-button {
      display: block;
      margin: var(--space-16) auto;
    }
  `;
  document.head.appendChild(style);
}

// Show receipt modal
function showReceipt(receiptNumber, payments) {
  // Find payment by receipt number
  const payment = payments.find(p => p.receiptNumber === receiptNumber);

  if (!payment) return;

  // Create modal if it doesn't exist
  let receiptModal = document.querySelector('.receipt-modal');

  if (!receiptModal) {
    receiptModal = document.createElement('div');
    receiptModal.className = 'receipt-modal';
    document.body.appendChild(receiptModal);
  }

  // Set modal content
  receiptModal.innerHTML = `
    <div class="receipt-content">
      <div class="receipt-header">
        <h2>Payment Receipt</h2>
        <p>Receipt Number: ${payment.receiptNumber}</p>
      </div>
      <div class="receipt-body">
        <div class="receipt-row">
          <div class="receipt-label">Date:</div>
          <div class="receipt-value">${formatDate(payment.date)}</div>
        </div>
        <div class="receipt-row">
          <div class="receipt-label">Payment Type:</div>
          <div class="receipt-value">${payment.type}</div>
        </div>
        <div class="receipt-row">
          <div class="receipt-label">Amount Paid:</div>
          <div class="receipt-value">${formatCurrency(payment.amount)}</div>
        </div>
        <div class="receipt-row">
          <div class="receipt-label">Status:</div>
          <div class="receipt-value">${payment.status}</div>
        </div>
      </div>
      <button class="btn btn-primary print-button">
        <i class="fas fa-print"></i> Print Receipt
      </button>
      <div class="receipt-footer">
        <p>Thank you for your payment.</p>
        <p>This is an electronic receipt, no signature required.</p>
      </div>
    </div>
  `;

  // Show modal
  receiptModal.style.display = 'block';

  // Close modal when clicking outside
  receiptModal.addEventListener('click', (e) => {
    if (e.target === receiptModal) {
      receiptModal.style.display = 'none';
    }
  });

  // Print button functionality
  const printButton = receiptModal.querySelector('.print-button');
  printButton.addEventListener('click', () => {
    // In a real app, this would open the print dialog
    // For demo purposes, we'll just show a notification
    showNotification('Print functionality would open the print dialog in a real application.', 'info');
  });
}

// CONTINUE FROM HERE ----------------------------------------------

// Load events page content
function loadEventsPage() {
  const eventsList = $('#events-list');

  // Get events
  const events = getFromStorage('events') || [];
  // console.log(events);

  // Sort events by date (soonest first)
  // events.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Filter for upcoming events
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());

  // Clear current list
  eventsList.innerHTML = '';

  if (upcomingEvents.length === 0) {
    eventsList.innerHTML = `<p class="text-center">No upcoming events found.</p>`;
  } else {
    // Create events grid
    const eventsGrid = document.createElement('div');
    eventsGrid.className = 'events-grid';

    // Add events to grid
    upcomingEvents.forEach(event => {
      // const user = getCurrentUser();
      // const isAttending = true;

      const eventItem = document.createElement('div');
      eventItem.className = 'event-card';
      eventItem.innerHTML = `
        <div class="event-date">
          <div class="event-month">${new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
          <div class="event-day">${new Date(event.date).getDate()}</div>
        </div>
        <div class="event-content">
          <h3 class="event-title">${event.title}</h3>
          <p class="event-description">${event.description}</p>
          <div class="event-details">
            <div class="event-detail">
              <i class="fas fa-clock"></i>
              <span>${new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="event-detail">
              <i class="fas fa-map-marker-alt"></i>
              <span>${event.location}</span>
            </div>
          </div>
          
        </div>
      `;
      // <button class="btn ${isAttending ? 'btn-success' : 'btn-primary'} btn-sm attend-btn" data-event-id="${event.event_id}">
      //       ${isAttending ? '<i class="fas fa-check"></i> Attending' : 'Attend Event'}
      // </button>
      eventsGrid.appendChild(eventItem);
    });

    eventsList.appendChild(eventsGrid);

    // Add event listeners for attend buttons
    // const attendButtons = eventsList.querySelectorAll('.attend-btn');
    // attendButtons.forEach(button => {
    //   button.addEventListener('click', () => {
    //     const eventId = button.getAttribute('data-event-id');
    //     toggleEventAttendance(eventId, button);
    //   });
    // });
  }

  // Add styling for events
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

// Toggle event attendance
// function toggleEventAttendance(eventId, button) {
//   const user = getCurrentUser();
//   const events = getFromStorage('events') || [];

//   // Find event
//   const eventIndex = events.findIndex(e => e.id === eventId);

//   if (eventIndex !== -1) {
//     const event = events[eventIndex];

//     // Check if user is already attending
//     const attendeeIndex = event.attendees.indexOf(user.id);

//     if (attendeeIndex === -1) {
//       // User is not attending, add them
//       event.attendees.push(user.id);
//       button.innerHTML = '<i class="fas fa-check"></i> Attending';
//       button.classList.remove('btn-primary');
//       button.classList.add('btn-success');
//       showNotification(`You're now attending ${event.title}!`, 'success');
//     } else {
//       // User is attending, remove them
//       event.attendees.splice(attendeeIndex, 1);
//       button.textContent = 'Attend Event';
//       button.classList.remove('btn-success');
//       button.classList.add('btn-primary');
//       showNotification(`You're no longer attending ${event.title}.`, 'info');
//     }

//     // Save updated events
//     events[eventIndex] = event;
//     saveToStorage('events', events);
//   }
// }
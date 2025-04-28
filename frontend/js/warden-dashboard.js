// Warden Dashboard JavaScript

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

  // Logout button
  $('.logout-btn').addEventListener('click', logout);
}

// Load overview page content
function loadOverviewPage() {
  loadActivityList();
  loadOccupancyChart();
}

// Load activity list
function loadActivityList() {
  const activityList = $('#activity-list');

  // Create some sample activities
  const activities = [
    {
      type: 'info',
      message: 'Maintenance request from Room 209 was completed',
      date: new Date() // Today
    },
    // {
    //   type: 'info',
    //   message: 'New student registered',
    //   date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    // },
    // {
    //   type: 'success',
    //   message: 'Room 101 allocated to John Doe',
    //   date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    // },
    {
      type: 'warning',
      message: 'New maintenance request from Room 101',
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

  // Setup room allocation form
  // setupRoomAllocationForm();
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

// DO THIS LAST ----------------------------------------------------------
// Setup room allocation form
// function setupRoomAllocationForm() {
//   const allocateRoomBtn = $('#allocate-room-btn');
//   const allocateRoomModal = $('#allocate-room-modal');
//   const closeModal = allocateRoomModal.querySelector('.close-modal');
//   const allocateRoomForm = $('#allocate-room-form');
//   const studentSelect = $('#student-select');
//   const roomSelect = $('#room-select');
//   const bedSelect = $('#bed-select');

//   // Show modal when button is clicked
//   allocateRoomBtn.addEventListener('click', () => {
//     // Populate student dropdown
//     // const users = getFromStorage('users') || [];
//     // const students = users.filter(user => user.role === 'student');

//     studentSelect.innerHTML = '<option value="">Select a student</option>';

//     students.forEach(student => {
//       const option = document.createElement('option');
//       option.value = student.id;
//       option.textContent = student.name;
//       studentSelect.appendChild(option);
//     });

//     // Populate room dropdown
//     const rooms = getFromStorage('rooms') || [];

//     roomSelect.innerHTML = '<option value="">Select a room</option>';

//     rooms.forEach(room => {
//       if (room.occupiedBeds.length < room.capacity) {
//         const option = document.createElement('option');
//         option.value = room.id;
//         option.textContent = `Room ${room.number} (${room.type})`;
//         roomSelect.appendChild(option);
//       }
//     });

//     // Show modal
//     allocateRoomModal.style.display = 'block';
//   });

//   // Update beds dropdown when room is selected
//   roomSelect.addEventListener('change', () => {
//     const roomId = roomSelect.value;

//     if (roomId) {
//       const rooms = getFromStorage('rooms') || [];
//       const room = rooms.find(r => r.id === roomId);

//       if (room) {
//         bedSelect.innerHTML = '<option value="">Select a bed</option>';

//         const beds = ['A', 'B', 'C', 'D', 'E', 'F'];

//         for (let i = 0; i < room.capacity; i++) {
//           const bedLetter = beds[i];

//           if (!room.occupiedBeds.includes(bedLetter)) {
//             const option = document.createElement('option');
//             option.value = bedLetter;
//             option.textContent = `Bed ${bedLetter}`;
//             bedSelect.appendChild(option);
//           }
//         }
//       }
//     } else {
//       bedSelect.innerHTML = '<option value="">Select a bed</option>';
//     }
//   });

//   // Close modal when X is clicked
//   closeModal.addEventListener('click', () => {
//     allocateRoomModal.style.display = 'none';
//   });

//   // Close modal when clicking outside
//   window.addEventListener('click', (e) => {
//     if (e.target === allocateRoomModal) {
//       allocateRoomModal.style.display = 'none';
//     }
//   });

//   // Submit form
//   allocateRoomForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const studentId = studentSelect.value;
//     const roomId = roomSelect.value;
//     const bedLetter = bedSelect.value;

//     if (!studentId || !roomId || !bedLetter) {
//       showNotification('Please fill all fields', 'error');
//       return;
//     }

//     // Get data from storage
//     const users = getFromStorage('users') || [];
//     const rooms = getFromStorage('rooms') || [];

//     const studentIndex = users.findIndex(u => u.id === studentId);
//     const roomIndex = rooms.findIndex(r => r.id === roomId);

//     if (studentIndex !== -1 && roomIndex !== -1) {
//       const student = users[studentIndex];
//       const room = rooms[roomIndex];

//       // Update student's room and bed
//       student.roomNumber = room.number;
//       student.bedNumber = bedLetter;

//       // Update room's occupied beds
//       room.occupiedBeds.push(bedLetter);

//       // Save changes
//       users[studentIndex] = student;
//       rooms[roomIndex] = room;

//       saveToStorage('users', users);
//       saveToStorage('rooms', rooms);

//       // Show notification
//       showNotification(`Room ${room.number}, Bed ${bedLetter} allocated to ${student.name}`, 'success');

//       // Close modal and reset form
//       allocateRoomModal.style.display = 'none';
//       allocateRoomForm.reset();

//       // Reload rooms page
//       loadRoomsPage();
//     }
//   });
// }

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
      }
      
      .students-table th,
      .students-table td {
        padding: var(--space-12);
        text-align: left;
        border-bottom: 1px solid var(--color-neutral-200);
      }
      
      .students-table th {
        font-weight: 600;
        background-color: var(--color-neutral-50);
      }
      
      .students-table tbody tr:hover {
        background-color: var(--color-neutral-100);
      }
      
      .students-table td:last-child {
        display: flex;
        gap: var(--space-4);
      }
      
      .btn-sm {
        padding: var(--space-4) var(--space-8);
        font-size: 0.875rem;
      }
    `;
    document.head.appendChild(style);

    // Add event listeners for student buttons
    // const viewButtons = studentsList.querySelectorAll('.view-student-btn');
    // viewButtons.forEach(button => {
    //   button.addEventListener('click', () => {
    //     const studentId = button.getAttribute('data-student-id');
    //     // In a real app, this would show student details
    //     showNotification('Student details view would be shown in a real application.', 'info');
    //   });
    // });

    // const editButtons = studentsList.querySelectorAll('.edit-student-btn');
    // editButtons.forEach(button => {
    //   button.addEventListener('click', () => {
    //     const studentId = button.getAttribute('data-student-id');
    //     // In a real app, this would show edit form
    //     showNotification('Student edit form would be shown in a real application.', 'info');
    //   });
    // });
  }

  // Setup add student form
  // setupAddStudentForm();
}

// Setup add student form
// function setupAddStudentForm() {
//   const addStudentBtn = $('#add-student-btn');
//   const addStudentModal = $('#add-student-modal');
//   const closeModal = addStudentModal.querySelector('.close-modal');
//   const addStudentForm = $('#add-student-form');

//   // Show modal when button is clicked
//   addStudentBtn.addEventListener('click', () => {
//     addStudentModal.style.display = 'block';
//   });

//   // Close modal when X is clicked
//   closeModal.addEventListener('click', () => {
//     addStudentModal.style.display = 'none';
//   });

//   // Close modal when clicking outside
//   window.addEventListener('click', (e) => {
//     if (e.target === addStudentModal) {
//       addStudentModal.style.display = 'none';
//     }
//   });

//   // Submit form
//   addStudentForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const name = $('#student-name').value;
//     const username = $('#student-username').value;
//     const password = $('#student-password').value;

//     // Create new student
//     const newStudent = {
//       id: generateId(),
//       username,
//       password,
//       role: 'student',
//       name,
//     };

//     // Save to storage
//     const users = getFromStorage('users') || [];
//     users.push(newStudent);
//     saveToStorage('users', users);

//     // Update student count on overview page
//     const students = users.filter(user => user.role === 'student');
//     $('#total-students').textContent = students.length;

//     // Show notification
//     showNotification(`Student ${name} added successfully`, 'success');

//     // Close modal and reset form
//     addStudentModal.style.display = 'none';
//     addStudentForm.reset();

//     // Reload students page
//     loadStudentsPage();
//   });
// }

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
      }
      
      .maintenance-table th,
      .maintenance-table td {
        padding: var(--space-12);
        text-align: left;
        border-bottom: 1px solid var(--color-neutral-200);
      }
      
      .maintenance-table th {
        font-weight: 600;
        background-color: var(--color-neutral-50);
      }
      
      .maintenance-table tbody tr:hover {
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

// // View maintenance request details
// function viewMaintenanceRequest(requestId) {
//   const requests = getFromStorage('maintenanceRequests') || [];
//   const request = requests.find(r => r.id === requestId);

//   if (request) {
//     // Get student name
//     const users = getFromStorage('users') || [];
//     const student = users.find(u => u.id === request.userId);

//     // Create modal for viewing details
//     let modal = document.querySelector('.view-request-modal');

//     if (!modal) {
//       modal = document.createElement('div');
//       modal.className = 'modal view-request-modal';
//       document.body.appendChild(modal);
//     }

//     modal.innerHTML = `
//       <div class="modal-content">
//         <div class="modal-header">
//           <h2>Maintenance Request Details</h2>
//           <span class="close-modal">&times;</span>
//         </div>
//         <div class="modal-body">
//           <div class="request-details">
//             <div class="detail-row">
//               <div class="detail-label">Title:</div>
//               <div class="detail-value">${request.title}</div>
//             </div>
//             <div class="detail-row">
//               <div class="detail-label">Description:</div>
//               <div class="detail-value">${request.description}</div>
//             </div>
//             <div class="detail-row">
//               <div class="detail-label">Room:</div>
//               <div class="detail-value">Room ${request.roomNumber}</div>
//             </div>
//             <div class="detail-row">
//               <div class="detail-label">Requested By:</div>
//               <div class="detail-value">${student ? student.name : 'Unknown'}</div>
//             </div>
//             <div class="detail-row">
//               <div class="detail-label">Date:</div>
//               <div class="detail-value">${formatDate(request.createdAt)}</div>
//             </div>
//             <div class="detail-row">
//               <div class="detail-label">Status:</div>
//               <div class="detail-value">
//                 <span class="badge badge-${request.status === 'Completed' ? 'success' :
//         request.status === 'In Progress' ? 'warning' :
//           request.status === 'Rejected' ? 'error' : 'primary'
//       }">${request.status}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;

//     // Show modal
//     modal.style.display = 'block';

//     // Add styling for request details
//     const style = document.createElement('style');
//     style.textContent = `
//       .request-details {
//         padding: var(--space-16);
//       }

//       .detail-row {
//         display: flex;
//         margin-bottom: var(--space-12);
//       }

//       .detail-label {
//         font-weight: 500;
//         min-width: 120px;
//       }
//     `;
//     document.head.appendChild(style);

//     // Close modal when X is clicked
//     const closeBtn = modal.querySelector('.close-modal');
//     closeBtn.addEventListener('click', () => {
//       modal.style.display = 'none';
//     });

//     // Close modal when clicking outside
//     window.addEventListener('click', (e) => {
//       if (e.target === modal) {
//         modal.style.display = 'none';
//       }
//     });
//   }
// }

// // Open update maintenance modal
// function openUpdateMaintenanceModal(requestId) {
//   const updateModal = $('#update-maintenance-modal');
//   const maintenanceIdInput = $('#maintenance-id');
//   const statusSelect = $('#maintenance-status');
//   const notesInput = $('#maintenance-notes');

//   // Get request details
//   const requests = getFromStorage('maintenanceRequests') || [];
//   const request = requests.find(r => r.id === requestId);

//   if (request) {
//     // Set form values
//     maintenanceIdInput.value = requestId;
//     statusSelect.value = request.status;
//     notesInput.value = request.notes || '';

//     // Show modal
//     updateModal.style.display = 'block';

//     // Setup form submission
//     const updateForm = $('#update-maintenance-form');
//     updateForm.onsubmit = function (e) {
//       e.preventDefault();

//       // Update request
//       const requestIndex = requests.findIndex(r => r.id === requestId);

//       if (requestIndex !== -1) {
//         requests[requestIndex].status = statusSelect.value;
//         requests[requestIndex].notes = notesInput.value;
//         requests[requestIndex].updatedAt = new Date().toISOString();

//         // Save to storage
//         saveToStorage('maintenanceRequests', requests);

//         // Show notification
//         showNotification('Maintenance request updated successfully', 'success');

//         // Close modal
//         updateModal.style.display = 'none';

//         // Reload maintenance page
//         loadMaintenancePage();
//       }
//     };
//   }

//   // Close modal when X is clicked
//   const closeBtn = updateModal.querySelector('.close-modal');
//   closeBtn.addEventListener('click', () => {
//     updateModal.style.display = 'none';
//   });

//   // Close modal when clicking outside
//   window.addEventListener('click', (e) => {
//     if (e.target === updateModal) {
//       updateModal.style.display = 'none';
//     }
//   });
// }

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

    // Add event listeners for payment buttons
    // const viewButtons = paymentsList.querySelectorAll('.view-payment-btn');
    // viewButtons.forEach(button => {
    //   button.addEventListener('click', () => {
    //     const paymentId = button.getAttribute('data-payment-id');
    //     // In a real app, this would show payment details
    //     showNotification('Payment details view would be shown in a real application.', 'info');
    //   });
    // });

    // const markPaidButtons = paymentsList.querySelectorAll('.mark-paid-btn');
    // markPaidButtons.forEach(button => {
    //   button.addEventListener('click', () => {
    //     const paymentId = button.getAttribute('data-payment-id');
    //     markPaymentAsPaid(paymentId);
    //   });
    // });
  }

  // Setup add payment form
  // setupAddPaymentForm();
}

// Mark payment as paid
// function markPaymentAsPaid(paymentId) {
//   const payments = getFromStorage('payments') || [];
//   const paymentIndex = payments.findIndex(p => p.id === paymentId);

//   if (paymentIndex !== -1) {
//     // Update payment status
//     payments[paymentIndex].status = 'Paid';
//     payments[paymentIndex].receiptNumber = `REC-${Date.now().toString().substring(6)}`;

//     // Save to storage
//     saveToStorage('payments', payments);

//     // Show notification
//     showNotification('Payment marked as paid successfully', 'success');

//     // Reload payments page
//     loadPaymentsPage();
//   }
// }

// Setup add payment form
// function setupAddPaymentForm() {
//   const addPaymentBtn = $('#add-payment-btn');
//   const addPaymentModal = $('#add-payment-modal');
//   const closeModal = addPaymentModal.querySelector('.close-modal');
//   const addPaymentForm = $('#add-payment-form');
//   const studentSelect = $('#payment-student');

//   // Show modal when button is clicked
//   addPaymentBtn.addEventListener('click', () => {
//     // Populate student dropdown
//     const users = getFromStorage('users') || [];
//     const students = users.filter(user => user.role === 'student');

//     studentSelect.innerHTML = '<option value="">Select a student</option>';

//     students.forEach(student => {
//       const option = document.createElement('option');
//       option.value = student.id;
//       option.textContent = student.name;
//       studentSelect.appendChild(option);
//     });

//     // Show modal
//     addPaymentModal.style.display = 'block';
//   });

//   // Close modal when X is clicked
//   closeModal.addEventListener('click', () => {
//     addPaymentModal.style.display = 'none';
//   });

//   // Close modal when clicking outside
//   window.addEventListener('click', (e) => {
//     if (e.target === addPaymentModal) {
//       addPaymentModal.style.display = 'none';
//     }
//   });

//   // Submit form
//   addPaymentForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const userId = studentSelect.value;
//     const amount = parseFloat($('#payment-amount').value);
//     const type = $('#payment-type').value;
//     const dueDate = $('#payment-due-date').value;

//     // Create new payment
//     const newPayment = {
//       id: generateId(),
//       userId,
//       amount,
//       type,
//       status: 'Pending',
//       date: new Date().toISOString(),
//       dueDate: new Date(dueDate).toISOString(),
//     };

//     // Save to storage
//     const payments = getFromStorage('payments') || [];
//     payments.push(newPayment);
//     saveToStorage('payments', payments);

//     // Show notification
//     showNotification('Payment added successfully', 'success');

//     // Close modal and reset form
//     addPaymentModal.style.display = 'none';
//     addPaymentForm.reset();

//     // Reload payments page
//     loadPaymentsPage();
//   });
// }

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

    // // Add event listeners for event buttons
    // const viewAttendeesButtons = eventsList.querySelectorAll('.view-attendees-btn');
    // viewAttendeesButtons.forEach(button => {
    //   button.addEventListener('click', () => {
    //     const eventId = button.getAttribute('data-event-id');
    //     viewEventAttendees(eventId);
    //   });
    // });

    // const editEventButtons = eventsList.querySelectorAll('.edit-event-btn');
    // editEventButtons.forEach(button => {
    //   button.addEventListener('click', () => {
    //     const eventId = button.getAttribute('data-event-id');
    //     // In a real app, this would show edit form
    //     showNotification('Event edit form would be shown in a real application.', 'info');
    //   });
    // });
  }

  // Setup add event form
  setupAddEventForm();
}

// // View event attendees
// function viewEventAttendees(eventId) {
//   const events = getFromStorage('events') || [];
//   const users = getFromStorage('users') || [];

//   const event = events.find(e => e.id === eventId);

//   if (event) {
//     // Get attendee details
//     const attendees = event.attendees.map(attendeeId => {
//       const user = users.find(u => u.id === attendeeId);
//       return user ? user.name : 'Unknown';
//     });

//     // Create modal for viewing attendees
//     let modal = document.querySelector('.view-attendees-modal');

//     if (!modal) {
//       modal = document.createElement('div');
//       modal.className = 'modal view-attendees-modal';
//       document.body.appendChild(modal);
//     }

//     modal.innerHTML = `
//       <div class="modal-content">
//         <div class="modal-header">
//           <h2>Event Attendees</h2>
//           <span class="close-modal">&times;</span>
//         </div>
//         <div class="modal-body">
//           <h3>${event.title}</h3>
//           <p>${formatDate(event.date)} at ${new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
//           <div class="attendees-list">
//             ${attendees.length > 0 ?
//         attendees.map(name => `<div class="attendee-item"><i class="fas fa-user"></i> ${name}</div>`).join('') :
//         '<p>No attendees yet.</p>'
//       }
//           </div>
//         </div>
//       </div>
//     `;

//     // Show modal
//     modal.style.display = 'block';

//     // Add styling for attendees list
//     const style = document.createElement('style');
//     style.textContent = `
//       .attendees-list {
//         margin-top: var(--space-16);
//       }

//       .attendee-item {
//         padding: var(--space-8) var(--space-16);
//         border-bottom: 1px solid var(--color-neutral-200);
//         display: flex;
//         align-items: center;
//       }

//       .attendee-item:last-child {
//         border-bottom: none;
//       }

//       .attendee-item i {
//         margin-right: var(--space-8);
//         color: var(--color-primary);
//       }
//     `;
//     document.head.appendChild(style);

//     // Close modal when X is clicked
//     const closeBtn = modal.querySelector('.close-modal');
//     closeBtn.addEventListener('click', () => {
//       modal.style.display = 'none';
//     });

//     // Close modal when clicking outside
//     window.addEventListener('click', (e) => {
//       if (e.target === modal) {
//         modal.style.display = 'none';
//       }
//     });
//   }
// }

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
  addEventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = $('#event-title').value;
    const description = $('#event-description').value;
    const date = $('#event-date').value;
    const location = $('#event-location').value;

    // Create new event
    const newEvent = {
      id: generateId(),
      title,
      description,
      date: new Date(date).toISOString(),
      location,
      attendees: [],
    };

    // Save to storage
    const events = getFromStorage('events') || [];
    events.push(newEvent);
    saveToStorage('events', events);

    // Update event count on overview page
    const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
    $('#upcoming-events').textContent = upcomingEvents.length;

    // Show notification
    showNotification(`Event "${title}" added successfully`, 'success');

    // Close modal and reset form
    addEventModal.style.display = 'none';
    addEventForm.reset();

    // Reload events page
    loadEventsPage();
  });
}
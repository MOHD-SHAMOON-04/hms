// DOM helper functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Local storage helper functions
const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getFromStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

const removeFromStorage = (key) => {
  localStorage.removeItem(key);
};

// Format date helper
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format currency helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Show notification
const showNotification = (message, type = 'success', duration = 3000) => {
  // Create notification container if it doesn't exist
  let container = $('.notification-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type} slide-up`;
  notification.textContent = message;

  // Add notification to container
  container.appendChild(notification);

  // Remove notification after duration
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      container.removeChild(notification);
    }, 300);
  }, duration);
};

// Debounce function for performance optimization
const debounce = (func, delay = 300) => {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

function getBedsFromCapacity(capacity) {
  const beds = [];
  for (let i = 0; i < capacity - 1; i++) {
    const bedNumber = String.fromCharCode(65 + i);
    beds.push(bedNumber);
  }
  return beds;
}

const initializeData = async () => {
  const currentUser = getFromStorage('currentUser');
  if (currentUser.role === 'student') {
    const studentId = currentUser.studentId;
    const response = await fetch(`http://localhost:3000/api/student/init/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ student_id: studentId }),
      }
    );
    const data = await response.json();
    // console.log(data);
    if (data.success) {
      showNotification('Data Fetched Successfully', 'success');
      const newUserData = {
        ...currentUser,
        roomNumber: data.roomDetails.roomNumber,
        bedNumber: 'A',
        hostelId: data.roomDetails.hostel_id,
      }
      saveToStorage('currentUser', newUserData);
      const newRoomDetails = {
        ...data.roomDetails,
        occupiedBeds: getBedsFromCapacity(data.roomDetails.capacity),
      };
      saveToStorage('roomDetails', newRoomDetails);
      saveToStorage('maintenanceRequests', data.maintenanceRequests);
      saveToStorage('events', data.events);
    } else {
      showNotification('Failed to Fetch Data', 'error');
    }
  }
  // SEPERATION OF CONCERNS ------------------------------------------------------
  else if (currentUser.role === 'warden') {
    const email = currentUser.email;
    const response = await fetch(`http://localhost:3000/api/warden/init/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ email }),
      }
    );
    const data = await response.json();
    // console.log(data);
    if (data.success) {
      showNotification('Data Fetched Successfully', 'success');
      const numberOfStudents = data.rooms.reduce((total, room) => total + room.student_count, 0);
      const newUserData = {
        ...currentUser,
        numberOfStudents,
        hostelId: data.rooms[0].hostel_id,
      }
      saveToStorage('currentUser', newUserData);
      saveToStorage('rooms', data.rooms);
      saveToStorage('maintenanceRequests', data.maintenanceRequests);
      saveToStorage('events', data.events);
      saveToStorage('students', data.students);
    } else {
      showNotification('Failed to Fetch Data', 'error');
    }
  }
};
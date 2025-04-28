// Utility functions for the Hostel Management System

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
    const bedNumber = String.fromCharCode(65 + i); // A, B, C, ...
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
    console.log(data);
    if (data.success) {
      showNotification('Data Fetched Successfully', 'success');
      const newUserData = {
        ...currentUser,
        roomNumber: data.roomDetails.roomNumber,
        bedNumber: 'A',
        hostelId: data.roomDetails.hostel_id,
      }
      // Save the updated user data to local storage
      saveToStorage('currentUser', newUserData);
      // Save the room details, maintenance requests, and events to local storage
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
  } else if (currentUser.role === 'warden') {
    // Fetch warden-specific data
    // - rooms (for wardens only)
    // - maintenance requests for the warden
    // - events for the warden

    // const studentId = currentUser.studentId;
    // const response = await fetch(`http://localhost:3000/api/student/init/`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${currentUser.token}`,
    //     },
    //     body: JSON.stringify({ student_id: studentId }),
    //   }
    // );
    // const data = await response.json();
    // console.log(data);
    // if (data.success) {
    //   showNotification('Data Fetched Successfully', 'success');
    //   const newUserData = {
    //     ...currentUser,
    //     roomNumber: data.roomDetails.roomNumber,
    //     bedNumber: 'A',
    //     hostelId: data.roomDetails.hostel_id,
    //   }
    //   // Save the updated user data to local storage
    //   saveToStorage('currentUser', newUserData);
    //   // Save the room details, maintenance requests, and events to local storage
    //   const newRoomDetails = {
    //     ...data.roomDetails,
    //     occupiedBeds: getBedsFromCapacity(data.roomDetails.capacity),
    //   };
    //   saveToStorage('roomDetails', newRoomDetails);
    //   saveToStorage('maintenanceRequests', data.maintenanceRequests);
    //   saveToStorage('events', data.events);
    // } else {
    //   showNotification('Failed to Fetch Data', 'error');
    // }
  }



  // example data for students and wardens
  //   const user =
  //     {
  //       studentId: '1' // or NULL,
  //       email: 'admin@mail.com' // or NULL,
  //       role: 'student' // or 'warden',
  //       name: 'John Doe',
  //       roomNumber: '101' // or NULL,
  //       bedNumber: 'A' // or NULL,
  //       token: 'JWT_TOKEN'
  //     }
  // Initialize rooms if they don't exist
  // if (!getFromStorage('rooms')) {
  //   const rooms = [
  //     {
  //       id: '101',
  //       number: '101',
  //       floor: '1',
  //       capacity: 4,
  //       occupiedBeds: ['A'],
  //       type: 'Standard',
  //     },
  //     {
  //       id: '102',
  //       number: '102',
  //       floor: '1',
  //       capacity: 4,
  //       occupiedBeds: [],
  //       type: 'Standard',
  //     },
  //     {
  //       id: '201',
  //       number: '201',
  //       floor: '2',
  //       capacity: 2,
  //       occupiedBeds: [],
  //       type: 'Premium',
  //     },
  //     {
  //       id: '202',
  //       number: '202',
  //       floor: '2',
  //       capacity: 2,
  //       occupiedBeds: [],
  //       type: 'Premium',
  //     },
  //   ];
  //   saveToStorage('rooms', rooms);
  // }

  // Initialize maintenance requests if they don't exist
  // if (!getFromStorage('maintenanceRequests')) {
  //   const maintenanceRequests = [
  //     {
  //       id: '1',
  //       userId: '1',
  //       roomNumber: '101',
  //       title: 'Broken light fixture',
  //       description: 'The ceiling light in room 101 is flickering and sometimes doesn\'t turn on.',
  //       status: 'Received',
  //       createdAt: '2023-05-15T10:30:00',
  //       updatedAt: '2023-05-15T10:30:00',
  //     },
  //   ];
  //   saveToStorage('maintenanceRequests', maintenanceRequests);
  // }

  // Initialize payment records if they don't exist
  // HOLD FOR NOW
  // example payment record:
  //   const payments = 
  //     {
  //       id: '1',
  //       userId: '1',
  //       amount: 500,
  //       type: 'Rent',
  //       status: 'Paid',
  //       date: '2023-05-01T09:00:00',
  //       dueDate: '2023-05-10T00:00:00',
  //       receiptNumber: 'REC-001',
  //     }

  // Initialize events if they don't exist
  // if (!getFromStorage('events')) {
  //   const events = [
  //     {
  //       id: '1',
  //       title: 'Welcome Party',
  //       description: 'Welcome party for new residents',
  //       date: '2023-06-15T18:00:00',
  //       location: 'Common Room',
  //       attendees: [],
  //     },
  //     {
  //       id: '2',
  //       title: 'Maintenance Day',
  //       description: 'General maintenance of all facilities',
  //       date: '2023-06-10T10:00:00',
  //       location: 'All Floors',
  //       attendees: [],
  //     },
  //   ];
  //   saveToStorage('events', events);
  // }
};

// Call initializeData to set up demo data
document.addEventListener('DOMContentLoaded', initializeData);
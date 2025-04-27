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
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Initial data setup (for demo purposes)
const initializeData = () => {
  // Fetch from the server dynamically in 
  // student-dashboard.js and warden-dashboard.js seperately
  // to be fetched:
  // - rooms (for wardens only)
  // - maintenance requests + leaves (for both students and wardens)
  // - events (for both students and wardens)
  
  
  
  // if (!getFromStorage('users')) {
  //   const users = [
  //     {
  //       id: '1',
  //       username: 'student1',
  //       password: 'password',
  //       role: 'student',
  //       name: 'John Doe',
  //       roomNumber: '101',
  //       bedNumber: 'A',
  //     },
  //     {
  //       id: '2',
  //       username: 'warden1',
  //       password: 'password',
  //       role: 'warden',
  //       name: 'Jane Smith',
  //     },
  //   ];
  //   saveToStorage('users', users);
  // }
  
  // Initialize rooms if they don't exist
  if (!getFromStorage('rooms')) {
    const rooms = [
      {
        id: '101',
        number: '101',
        floor: '1',
        capacity: 4,
        occupiedBeds: ['A'],
        type: 'Standard',
      },
      {
        id: '102',
        number: '102',
        floor: '1',
        capacity: 4,
        occupiedBeds: [],
        type: 'Standard',
      },
      {
        id: '201',
        number: '201',
        floor: '2',
        capacity: 2,
        occupiedBeds: [],
        type: 'Premium',
      },
      {
        id: '202',
        number: '202',
        floor: '2',
        capacity: 2,
        occupiedBeds: [],
        type: 'Premium',
      },
    ];
    saveToStorage('rooms', rooms);
  }
  
  // Initialize maintenance requests if they don't exist
  if (!getFromStorage('maintenanceRequests')) {
    const maintenanceRequests = [
      {
        id: '1',
        userId: '1',
        roomNumber: '101',
        title: 'Broken light fixture',
        description: 'The ceiling light in room 101 is flickering and sometimes doesn\'t turn on.',
        status: 'Received',
        createdAt: '2023-05-15T10:30:00',
        updatedAt: '2023-05-15T10:30:00',
      },
    ];
    saveToStorage('maintenanceRequests', maintenanceRequests);
  }
  
  // Initialize payment records if they don't exist
  // HOLD FOR NOW
  // if (!getFromStorage('payments')) {
  //   const payments = [
  //     {
  //       id: '1',
  //       userId: '1',
  //       amount: 500,
  //       type: 'Rent',
  //       status: 'Paid',
  //       date: '2023-05-01T09:00:00',
  //       dueDate: '2023-05-10T00:00:00',
  //       receiptNumber: 'REC-001',
  //     },
  //   ];
  //   saveToStorage('payments', payments);
  // }
  
  // Initialize events if they don't exist
  if (!getFromStorage('events')) {
    const events = [
      {
        id: '1',
        title: 'Welcome Party',
        description: 'Welcome party for new residents',
        date: '2023-06-15T18:00:00',
        location: 'Common Room',
        attendees: [],
      },
      {
        id: '2',
        title: 'Maintenance Day',
        description: 'General maintenance of all facilities',
        date: '2023-06-10T10:00:00',
        location: 'All Floors',
        attendees: [],
      },
    ];
    saveToStorage('events', events);
  }
};

// Call initializeData to set up demo data
document.addEventListener('DOMContentLoaded', initializeData);
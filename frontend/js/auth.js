// Authentication related functions

// Store for current user
let currentUser = null;

// Function to check if user is logged in
const isLoggedIn = () => {
  const user = getFromStorage('currentUser');
  if (user) {
    currentUser = user;
    return true;
  }
  return false;
};

// Function to log in user
const login = async (credential, password, role) => {
  let body = null;
  if (role == 'student') {
    body = { 'student_id': credential, password };
  } else {
    body = { 'email': credential, password };
  }
  const response = await fetch(`http://localhost:3000/api/login/${role}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    }
  );
  const data = await response.json();
  console.log(data);
  // expected data
  // {
  //   "success": true,
  //   "message": "Login successful",
  //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlcjAwMSIsInJvb21OdW1iZXIiOm51bGwsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzQ1Mzg4NDQzLCJleHAiOjE3NDUzOTAyNDN9.fgLCYhRqJlu9wAS9gTEBTCc3Iy7l1prTf7zQG8enpmk"
  // }

  if (!data.success) {
    return data;
  }

  // decode the token
  const decodedToken = atob(data.token.split('.')[1]);
  // parse the decoded token
  const parsedToken = JSON.parse(decodedToken);
  // expected parsed payload of token
  //   {
  //     "name": "user001",
  //     "roomNumber": null | number,
  //     "role": "student" | "warden",
  //     "iat": 1745388443,
  //     "exp": 1745390243
  // }
  let userData = {
    role: parsedToken.role,
    name: parsedToken.name,
    token: data.token
  };
  if (parsedToken.role == 'student') {
    // save user data to local storage
    userData.roomNumber = parsedToken.roomNumber;
  }
  currentUser = userData;
  saveToStorage('currentUser', userData);
  return { success: data.success, user: userData };
};

// Function to log out user
const logout = () => {
  currentUser = null;
  removeFromStorage('currentUser');
  window.location.href = 'index.html';
};

// Function to get current user
const getCurrentUser = () => {
  if (!currentUser) {
    currentUser = getFromStorage('currentUser');
  }
  return currentUser;
};

// Function to redirect based on role
const redirectToDashboard = (role) => {
  switch (role) {
    case 'student':
      window.location.href = 'student-dashboard.html';
      break;
    case 'warden':
      window.location.href = 'warden-dashboard.html';
      break;
    default:
      window.location.href = 'index.html';
  }
};

// Check if user is already logged in and redirect if needed
document.addEventListener('DOMContentLoaded', () => {
  // Only do this on the login page (index.html)
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    if (isLoggedIn()) {
      redirectToDashboard(currentUser.role);
    }

    // Add event listener for login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const credential = document.getElementById('credentials').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        console.log(role);

        const result = await login(credential, password, role);

        if (result.success) {
          showNotification('Login successful!', 'success');

          // Short delay to show notification before redirect
          setTimeout(() => {
            redirectToDashboard(result.user.role);
          }, 500);
        } else {
          showNotification(result.message, 'error');
        }
      });
    }
  } else {
    // For other pages, check if user is logged in
    if (!isLoggedIn()) {
      window.location.href = 'index.html';
    }
  }
});

// Protect routes based on role
const protectRoute = (allowedRoles) => {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = 'index.html';
    return false;
  }

  if (!allowedRoles.includes(user.role)) {
    showNotification('You do not have permission to access this page', 'error');
    redirectToDashboard(user.role);
    return false;
  }

  return true;
};
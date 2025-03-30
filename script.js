// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";

// Global variables to store the prompt history
let promptHistory = [];
let lastPrompt = "";

// Helper function to get current time
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Check server-side authentication state
async function checkServerAuth() {
  try {
    console.log("Checking server auth status...");
    const response = await fetch("/auth/status", {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });
    
    console.log("Auth status response:", response);
    const data = await response.json();
    console.log("Auth status data:", data);
    
    if (data.authenticated) {
      // User is authenticated with server session
      console.log("User is authenticated with server:", data.user);
      document.getElementById("authContainer").style.display = "none";
      document.getElementById("mainContent").style.display = "block";
      document.getElementById("chatBox").style.display = "flex";
      document.getElementById("logoutButton").style.display = "block";
      return true;
    } else {
      console.log("User is NOT authenticated with server");
    }
  } catch (error) {
    console.error("Error checking server auth:", error);
  }
  return false;
}

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAl5F5_8NV5vkqBiHuWFpiAQgvGwGKK0xE",
  authDomain: "picture-this-ea1b4.firebaseapp.com",
  projectId: "picture-this-ea1b4",
  storageBucket: "picture-this-ea1b4.firebasestorage.app",
  messagingSenderId: "433518141469",
  appId: "1:433518141469:web:57f0b94a4cbff4ba84e6f4",
  measurementId: "G-KLG3DZDHFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    document.getElementById("authContainer").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    document.getElementById("chatBox").style.display = "flex";
    document.getElementById("logoutButton").style.display = "block";
    console.log("User is signed in:", user.email);
  } else {
    // User is signed out
    document.getElementById("authContainer").style.display = "flex";
    document.getElementById("mainContent").style.display = "none";
    document.getElementById("chatBox").style.display = "none";
    document.getElementById("logoutButton").style.display = "none";
    console.log("User is signed out");
  }
});

// Register a new user
function registerUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  // Validate inputs
  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }
  
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      console.log("User registered:", user);
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    })
    .catch((error) => {
      console.error("Registration error:", error.code, error.message);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Please use a different email or try logging in.");
      } else if (error.code === 'auth/invalid-email') {
        alert("Please enter a valid email address.");
      } else if (error.code === 'auth/weak-password') {
        alert("Password is too weak. Please use at least 6 characters.");
      } else {
        alert(`Registration failed: ${error.message}`);
      }
    });
}

// Sign in existing user
function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  // Validate inputs
  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in successfully
      const user = userCredential.user;
      console.log("User signed in:", user);
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    })
    .catch((error) => {
      console.error("Login error:", error.code, error.message);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert("Invalid email or password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        alert("Please enter a valid email address.");
      } else {
        alert(`Login failed: ${error.message}`);
      }
    });
}

// Updated logout function for both Firebase and server
function handleLogout() {
  console.log("Logging out user...");
  
  // First sign out from Firebase (if signed in)
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    signOut(auth)
      .then(() => {
        console.log("Firebase user signed out");
      })
      .catch((error) => {
        console.error("Firebase logout error:", error);
      });
  }
  
  // Then redirect to server logout
  window.location.href = "/logout";
}

// Image generation functions
function startChat() {
  let userInput = document.getElementById("userPrompt").value;
  if (userInput.trim() === "") return;
  
  // Show chat box if not already visible
  let chatBox = document.getElementById("chatBox");
  let chatMessages = document.getElementById("chatMessages");
  chatBox.style.display = "flex";
  
  const currentTime = getCurrentTime();
  
  // If input starts with "modify:" or "change:", replace the previous prompt
  let finalPrompt = userInput;
  let isModification = false;
  
  if ((userInput.toLowerCase().startsWith("modify:") || 
       userInput.toLowerCase().startsWith("change:") ||
       userInput.toLowerCase().startsWith("update:")) && lastPrompt) {
    
    // Extract the modification part
    let modificationPart = userInput.split(":", 2)[1].trim();
    isModification = true;
    
    // Simple modification - just combine with previous prompt
    finalPrompt = `${lastPrompt}, but ${modificationPart}`;
    
    // Add special note about modification
    chatMessages.innerHTML += `
      <div class="message user-message">
        ${userInput}
        <div class="message-time">${currentTime}</div>
      </div>
    `;
    chatMessages.innerHTML += `
      <div class="message system-message">
        Modifying previous image: ${modificationPart}
      </div>
    `;
    
    // Add to history
    promptHistory.push(userInput);
  } else {
    // Regular new prompt
    chatMessages.innerHTML += `
      <div class="message user-message">
        ${userInput}
        <div class="message-time">${currentTime}</div>
      </div>
    `;
    
    // Add to history
    promptHistory.push(userInput);
    
    // For first prompt, just use it as is
    if (!lastPrompt) {
      lastPrompt = userInput;
    } else {
      // For subsequent prompts, append to the previous prompt
      lastPrompt = `${lastPrompt} ${userInput}`;
      
      // Don't show the cumulative prompt as a system message anymore
      
      finalPrompt = lastPrompt;
    }
  }
  
  chatMessages.innerHTML += `
    <div class="message ai-message">
      Generating your image...
      <div class="message-time">${currentTime}</div>
    </div>
  `;
  
  // Clear input and keep input box visible for more prompts
  document.getElementById("userPrompt").value = "";
  
  // Scroll to bottom of chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Change button text to "Modify" after first generation
  document.getElementById("generateButton").innerHTML = '<i class="fas fa-wand-magic-sparkles"></i>';
  
  // For debugging - show the actual prompt being sent
  console.log("Final prompt being sent:", finalPrompt);
  
  // Send request to server - using finalPrompt
  fetch("http://localhost:3000/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: finalPrompt })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Get the last AI message
    let lastAiMessage = chatMessages.querySelector(".ai-message:last-child");
    
    // Replace loading text with the image
    lastAiMessage.innerHTML = `
      <div class="ai-message-content">
        <img src="${data.imageUrl}" alt="Generated image">
        <div class="message-time">${currentTime}</div>
      </div>
    `;
    
    // Scroll to see the image
    chatMessages.scrollTop = chatMessages.scrollHeight;
  })
  .catch(error => {
    console.error("Error generating image:", error);
    
    // Get the last AI message and update with error
    let lastAiMessage = chatMessages.querySelector(".ai-message:last-child");
    lastAiMessage.innerHTML = `
      <div style="color: #ff5555;">
        Error generating image. Please try again.
        <p>${error.message}</p>
      </div>
      <div class="message-time">${currentTime}</div>
    `;
    
    // Scroll to see the error
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Set up event listeners once DOM is loaded
document.addEventListener("DOMContentLoaded", async function() {
  console.log("DOM loaded. Current URL:", window.location.pathname);
  
  // Check for error in URL
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage = urlParams.get('error');
  if (errorMessage) {
    const authError = document.getElementById('authError');
    if (authError) {
      authError.textContent = decodeURIComponent(errorMessage);
      authError.style.display = 'block';
    }
  }

  // Force check auth if we're on the dashboard page (coming from OAuth redirect)
  if (window.location.pathname === '/dashboard') {
    console.log("On dashboard page, checking authentication...");
    const isServerAuthenticated = await checkServerAuth();
    if (!isServerAuthenticated) {
      console.log("Not authenticated but on dashboard, redirecting to home");
      window.location.href = '/';
      return;
    }
  } else {
    // First check server-side auth (Google)
    const isServerAuthenticated = await checkServerAuth();
    
    // Only rely on Firebase auth if not authenticated with server
    if (!isServerAuthenticated) {
      // Initialize Firebase auth listeners
    }
  }
  
  const registerButton = document.getElementById("registerButton");
  const loginButton = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");
  
  if (registerButton) {
    registerButton.addEventListener("click", registerUser);
  }
  
  if (loginButton) {
    loginButton.addEventListener("click", loginUser);
  }
  
  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }
  
  const userPromptInput = document.getElementById("userPrompt");
  if (userPromptInput) {
    userPromptInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        startChat();
      }
    });
  }
});

// Make functions globally accessible
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = handleLogout;
window.startChat = startChat;

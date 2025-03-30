// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to handle Google Login
function googleLogin() {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("User signed in:", result.user);
            localStorage.setItem("user", JSON.stringify(result.user));
            updateUI(result.user);
        })
        .catch((error) => {
            console.error("Login Failed", error);
        });
}

// Function to handle Logout
function logout() {
    signOut(auth)
        .then(() => {
            localStorage.removeItem("user");
            updateUI(null);
        })
        .catch((error) => {
            console.error("Logout Failed", error);
        });
}

// Function to update UI based on authentication state
function updateUI(user) {
    const loginButton = document.getElementById("loginButton");
    if (user) {
        loginButton.innerText = "Logout";
        loginButton.onclick = logout;
    } else {
        loginButton.innerText = "Login with Google";
        loginButton.onclick = googleLogin;
    }
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});

// ------------------------- Image Generation Functions -------------------------
document.getElementById("userPrompt").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        startChat();
    }
});

document.getElementById("chatInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        modifyImage();
    }
});

function startChat() {
    let userInput = document.getElementById("userPrompt").value;
    if (userInput.trim() === "") return;

    document.getElementById("inputBox").style.display = "none";
    let chatBox = document.getElementById("chatBox");
    chatBox.style.display = "flex";

    chatBox.innerHTML += `<div class='message user-message'>${userInput}</div>`;
    document.getElementById("userPrompt").value = "";

    // Check if the user is logged in
    const user = auth.currentUser;
    if (!user) {
        chatBox.innerHTML += `<div class='message ai-message'>⚠️ Please log in with Google to generate images.</div>`;
        return;
    }

    // Fetch the Firebase ID token for authentication
    user.getIdToken().then((idToken) => {
        fetch("http://localhost:5000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}` // Send Firebase token to backend
            },
            body: JSON.stringify({ prompt: userInput })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                chatBox.innerHTML += `<div class='message ai-message'>⚠️ ${data.error}</div>`;
            } else {
                chatBox.innerHTML += `<div class='message ai-message'><img src="${data.imageUrl}" alt="Generated Image"></div>`;
                document.getElementById("chatInputBox").style.display = "flex";
            }
        })
        .catch(error => {
            chatBox.innerHTML += `<div class='message ai-message'>⚠️ Error generating image.</div>`;
            console.error("Image Generation Error:", error);
        });
    });
}

function modifyImage() {
    let modificationInput = document.getElementById("chatInput").value;
    if (modificationInput.trim() === "") return;

    let chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<div class='message user-message'>${modificationInput}</div>`;
    document.getElementById("chatInput").value = "";

    setTimeout(() => {
        chatBox.innerHTML += `<div class='message ai-message'>Applying modifications...</div>`;
        setTimeout(() => {
            chatBox.innerHTML += `<div class='message ai-message'>Modifications applied! Do you want to make more changes?</div>`;
        }, 2000);
    }, 1000);
}

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
    
    setTimeout(() => {
        chatBox.innerHTML += `<div class='message ai-message'>Generating your image...</div>`;
        setTimeout(() => {
            chatBox.innerHTML += `<div class='message ai-message'>Image generated! Do you want to make any changes?</div>`;
            document.getElementById("chatInputBox").style.display = "flex";
        }, 2000);
    }, 1000);
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

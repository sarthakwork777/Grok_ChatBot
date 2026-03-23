const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const clearBtn = document.getElementById('clear-btn');

const appendMessage = (text, sender) => {
    // Remove welcome screen if it exists
    const welcome = document.querySelector('.welcome-screen');
    if (welcome) welcome.remove();

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'user' ? 'user-msg' : 'bot-msg');
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    
    // Smooth Auto-scroll to bottom
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
};

const sendMessage = async () => {
    const message = userInput.value.trim();
    if (!message) return;

    // 1. Add user message to UI
    appendMessage(message, 'user');
    
    // 2. Clear and focus input immediately for better UX
    userInput.value = '';
    userInput.focus();
    
    // 3. Show "Thinking" indicator
    typingIndicator.classList.remove('hidden');

    try {
        // IMPORTANT: Changed to relative path for Render/Production
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        if (data.reply) {
            appendMessage(data.reply, 'bot');
        } else {
            appendMessage("Error: Could not retrieve response from AI.", 'bot');
        }
    } catch (error) {
        console.error("Fetch error:", error);
        appendMessage("Network error. Please check if the server is live.", 'bot');
    } finally {
        // 4. Hide "Thinking" indicator
        typingIndicator.classList.add('hidden');
    }
};

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Optional: Clear Button Logic
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        chatBox.innerHTML = `
            <div class="welcome-screen">
                <h2>Chat Cleared</h2>
                <p>Ready for a new session.</p>
            </div>`;
    });
}
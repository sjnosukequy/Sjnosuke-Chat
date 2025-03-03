// DOM Elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const themeToggle = document.getElementById('theme-toggle');
const chatList = document.getElementById('chat-list');
const newChatBtn = document.getElementById('new-chat-btn');
const deleteChatBtn = document.getElementById('delete-chat-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// Settings elements
const modelSelect = document.getElementById('model-select');
const systemPrompt = document.getElementById('system-prompt');
const seedInput = document.getElementById('seed-input');
const jsonToggle = document.getElementById('json-toggle');
const privateToggle = document.getElementById('private-toggle');

var md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="code-container"><button class="copy-button btn btn-ghost" onclick="copyToClipboard(\`${md.utils.escapeHtml(str)}\`)">Copy</button><code class="hljs">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
            } catch (__) { }
        }
        return `<pre class="code-container"><button class="copy-button btn btn-ghost" onclick="copyToClipboard(\`${md.utils.escapeHtml(str)}\`)">Copy</button><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
    }
});


// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
        alert('Code copied to clipboard!');
    }, function (err) {
        console.error('Could not copy text: ', err);
    });
}

let themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset"
]

// Custom Theme
for (let i in themes) {
    let k = document.createElement("li")
    let a = document.createElement("a")
    a.innerText = themes[i]
    a.addEventListener("click", () => {
        localStorage.setItem("theme", a.innerText);
        document.getElementsByTagName("html")[0].setAttribute("data-theme", a.innerText)
    })
    k.appendChild(a)
    document.getElementById('List_Theme').appendChild(k)
}

let theme = localStorage.getItem("theme")
if (theme == null)
    localStorage.setItem("theme", 'synthwave');
else
    document.getElementsByTagName("html")[0].setAttribute("data-theme", theme)

const ModelEndPonit = 'https://text.pollinations.ai/models'
const ChatEndPonit = 'https://text.pollinations.ai/'


async function loadModels() {

    const res = await fetch(ModelEndPonit)
    const json = await res.json()
    for (let i of json) {
        const option = document.createElement('option');
        option.value = i.name;
        option.textContent = i.description;
        modelSelect.appendChild(option);
    }

}

// Sample responses for demo
const aiResponses = [
    "# HI",
    "That's an interesting question. While I don't have real-time data, I can offer some general insights on this topic.",
    "I'm designed to be helpful, harmless, and honest in my responses.",
    "I can help with a wide range of topics including coding, general knowledge, creative writing, and more.",
    "Let me think about that for a moment... That's a complex question with multiple perspectives to consider."
];

// Chat and Settings Management
let chats = [];
let currentChatId = null;
let settings = {
    model: 'openai',
    systemPrompt: '',
    seed: '',
    jsonFormat: false,
    privateMode: false
};

// Initialize app
async function initApp() {
    await loadModels();
    loadChats();
    loadSettings();

    if (chats.length === 0) {
        createNewChat();
    } else {
        loadChat(chats[0].id);
    }

    renderChatList();
}

// Load chats from localStorage
function loadChats() {
    const savedChats = localStorage.getItem('ai-chats');
    if (savedChats) {
        chats = JSON.parse(savedChats);
    }
}

// Save chats to localStorage
function saveChats() {
    localStorage.setItem('ai-chats', JSON.stringify(chats));
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('ai-settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);

        // Update UI
        // console.log(modelSelect)
        modelSelect.value = settings.model;
        modelSelect.value = settings.model;
        // console.log(modelSelect.value)
        systemPrompt.value = settings.systemPrompt;
        seedInput.value = settings.seed;
        jsonToggle.checked = settings.jsonFormat;
        privateToggle.checked = settings.privateMode;
    }
}

// Save settings to localStorage
function saveSettings() {
    settings = {
        model: modelSelect.value,
        systemPrompt: systemPrompt.value,
        seed: seedInput.value,
        jsonFormat: jsonToggle.checked,
        privateMode: privateToggle.checked
    };

    localStorage.setItem('ai-settings', JSON.stringify(settings));
}

// Create a new chat
function createNewChat() {
    const newChat = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString()
    };

    chats.unshift(newChat);
    saveChats();
    loadChat(newChat.id);
    renderChatList();
}

// Load a specific chat
function loadChat(chatId) {
    currentChatId = chatId;
    const chat = chats.find(c => c.id === chatId);

    if (chat) {
        // Clear chat container
        chatContainer.innerHTML = '';

        // Add welcome message if chat is empty
        if (chat.messages.length === 0) {
            addAIMessage("Hello! I'm your AI assistant. How can I help you today?", false);
        } else {
            // Load messages
            chat.messages.forEach(msg => {
                if (msg.role === 'user') {
                    addUserMessage(msg.content, false);
                } else {
                    addAIMessage(msg.content, false);
                }
            });
        }

        // Update chat title if it's "New Chat" and has messages
        if (chat.title === 'New Chat' && chat.messages.length > 0) {
            chat.title = chat.messages[0].text.substring(0, 30) + (chat.messages[0].text.length > 30 ? '...' : '');
            saveChats();
            renderChatList();
        }

        // Highlight current chat in the list
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === chatId) {
                item.classList.add('active');
            }
        });
    }
}

// Delete current chat
function deleteCurrentChat() {
    if (!currentChatId) return;

    const index = chats.findIndex(c => c.id === currentChatId);
    if (index !== -1) {
        chats.splice(index, 1);
        saveChats();

        if (chats.length === 0) {
            createNewChat();
        } else {
            loadChat(chats[0].id);
        }

        renderChatList();
    }
}

// Render chat list
function renderChatList() {
    chatList.innerHTML = '';

    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item p-2 rounded-lg cursor-pointer ${chat.id === currentChatId ? 'active' : ''}`;
        chatItem.dataset.id = chat.id;

        chatItem.innerHTML = `
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-primary">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <div class="truncate text-base">${chat.title}</div>
            </div>
        `;

        chatItem.addEventListener('click', () => {
            loadChat(chat.id);
        });

        chatList.appendChild(chatItem);
    });
}

// Add user message to chat
function addUserMessage(message, save = true) {
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'w-fit max-w-[75%] lg:max-w-[65%] self-end';
    const render = md.render(message)
    userMessageDiv.innerHTML = `
        <div class="text-accent-content bg-accent p-3 rounded-md break-words">${render}</div>
    `;
    chatContainer.appendChild(userMessageDiv);
    scrollToBottom();

    if (save && currentChatId) {
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) {
            chat.messages.push({
                id: Date.now().toString(),
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });

            // Update chat title if it's the first message
            if (chat.title === 'New Chat') {
                chat.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
                renderChatList();
            }

            saveChats();
        }
    }
}

// Add AI message to chat
function addAIMessage(message, save = true) {
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'w-fit max-w-[75%] lg:max-w-[65%]';
    const render = md.render(message)
    aiMessageDiv.innerHTML = `
        <div class="bg-primary text-primary-content p-3 rounded-md break-words">${render}</div>
    `;
    chatContainer.appendChild(aiMessageDiv);
    scrollToBottom();

    if (save && currentChatId) {
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) {
            chat.messages.push({
                id: Date.now().toString(),
                role: 'assistant',
                content: message,
                timestamp: new Date().toISOString()
            });
            saveChats();
        }
    }
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.classList.add('hidden');
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Simulate AI response
async function simulateAIResponse() {
    // const randomIndex = Math.floor(Math.random() * aiResponses.length);
    // const responseTime = 1000 + Math.random() * 2000; // Random time between 1-3 seconds

    // showTypingIndicator();

    // setTimeout(() => {
    //     hideTypingIndicator();
    //     addAIMessage(aiResponses[randomIndex]);
    // }, responseTime);
    showTypingIndicator();
    const chat = chats.find(c => c.id === currentChatId);
    const messages = []
    if (systemPrompt.value) messages.push({ "role": "system", "content": systemPrompt.value });
    for (let i = 0; i < chat.messages.length; i++) {
        messages.push({ "role": chat.messages[i].role, "content": chat.messages[i].content });
    }

    const res = await fetch(ChatEndPonit, {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify({
            "model": modelSelect.value,
            "seed": seedInput.value ? seedInput.value : Math.floor(Math.random() * 1000000000),
            "jsonMode": jsonToggle.checked,
            "private": true,
            "messages": messages
        })
    })
    const res_clone = res.clone()
    let data_message = ''
    try {
        const json = await res.json()
        data_message = "```javascript \n" + JSON.stringify(json, null, 2) + "\n ```"
    } catch (e) {
        const text = await res_clone.text()
        console.log(text)
        data_message = text.toString()
    } finally {
        hideTypingIndicator();
        addAIMessage(data_message);
    }

}

// Event Listeners

// Handle send button click
sendButton.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
        addUserMessage(message);
        userInput.value = '';
        console.log(userInput.value);
        simulateAIResponse();
    }
});

// Handle enter key press
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (e.ctrlKey || e.shiftKey || e.altKey) {
            e.preventDefault();
            userInput.value += '\n';
        }
        else {
            e.preventDefault();
            const message = userInput.value.trim();
            if (message) {
                addUserMessage(message);
                userInput.value = '';
                console.log(userInput.value);
                simulateAIResponse();
            }
        }
    }
});

userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});


// New chat button
newChatBtn.addEventListener('click', createNewChat);

// Delete chat button
deleteChatBtn.addEventListener('click', deleteCurrentChat);

// Settings button
settingsBtn.addEventListener('click', () => {
    settingsModal.showModal();
});

// Save settings button
saveSettingsBtn.addEventListener('click', () => {
    saveSettings();
});

// Focus input on page load
window.onload = () => {
    initApp();
    userInput.value = '';
    userInput.focus();
};
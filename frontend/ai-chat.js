// === Config ===
const INSPIRATION_IMAGES = [
    '/images/Lota_Dress_blk-twirl2_web_1000x1538.png',
    '/images/PicjamDownload_1_629x1800.png'
];


// === State and Session Management ===

/**
 * Gets or creates a unique session ID for the user.
 * @returns {string} The session ID.
 */
function getOrCreateSessionId() {
    let sessionId = localStorage.getItem('nano-banana-session-id');
    if (!sessionId) {
        sessionId = crypto.randomUUID(); 
        localStorage.setItem('nano-banana-session-id', sessionId);
    }
    return sessionId;
}

// === DOM Manipulation and Page Flow ===

/**
 * Loads an HTML fragment from the server and swaps the body content.
 * @param {string} fragmentName - The name of the fragment to load (e.g., 'generating', 'approval').
 */
async function loadFragment(fragmentName) {
    try {
        const response = await fetch(`/static/${fragmentName}/code.html`);
        if (!response.ok) {
            throw new Error(`Could not load fragment: ${fragmentName}`);
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        document.body.innerHTML = doc.body.innerHTML;
        
        // Re-initialize event listeners for the new content
        initializePage();

    } catch (error) {
        console.error('Error loading fragment:', error);
    }
}

/**
 * The main function to trigger the design generation process.
 * @param {string} prompt - The user's design prompt.
 */
async function generateDesign(prompt) {
    await loadFragment('generating');
    
    const promptDisplay = document.querySelector('.italic.text-gray-800');
    if (promptDisplay) {
        promptDisplay.textContent = `"${prompt}"`;
    }

    const sessionId = getOrCreateSessionId();
    const API_ENDPOINT = '/api/design'; 

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, sessionId })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Gemini Response:", data.design_output);
            await loadFragment('approval');
            console.log('TODO: Populate the approval page with the received data.');
        } else {
            console.error("Error from Server:", data.message);
            alert(data.message || "An unexpected error occurred.");
            // In case of an error, we can't go back to the 'design' fragment easily
            // as it's not a full page load. For now, we just log it. A full reload
            // might be a simple solution here: location.reload();
        }

    } catch (error) {
        console.error('API Call Failed:', error);
        alert('Could not connect to the design service. Please try again later.');
    }
}

/**
 * Sets up event listeners and initial state for the current page.
 */
function initializePage() {
    // === Initialization for the Design Page ===
    const inspirationImage = document.getElementById('inspiration-image');
    if (inspirationImage) {
        // Randomly select and set the inspiration image
        const randomImage = INSPIRATION_IMAGES[Math.floor(Math.random() * INSPIRATION_IMAGES.length)];
        inspirationImage.src = randomImage;
    }

    const sendButton = document.getElementById('send-prompt-button');
    const promptInput = document.getElementById('prompt-input');

    if (sendButton && promptInput) {
        sendButton.addEventListener('click', () => {
            const prompt = promptInput.value;
            if (prompt.trim()) {
                generateDesign(prompt);
            }
        });

        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendButton.click();
            }
        });
    }

    // === Initialization for the Approval Page ===
    // TODO: Add event listeners for the 'approval' page here
    // const approveButton = document.getElementById('approve-button');
    // if (approveButton) { ... }
}


// === Initial Load ===
document.addEventListener('DOMContentLoaded', initializePage);

/**
 * UNIVERSITY OF BRADFORD - ENABLE Portal Script
 * Handles accessibility toggles, state persistence, Read-Aloud, and Chatbot simulation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Accessibility Toggles Initialization
    initAccessibility();

    // 2. Navigation Active State
    updateNavActiveState();

    // 3. Simple Functions
    initReadingMask();
    initColorOverlay();
    initBackToTop();
    initReadAloud();
    initChatbot();

    // 4. Form Validation (if on survey page)
    const surveyForm = document.getElementById('survey-form');
    if (surveyForm) {
        initSurveyForm(surveyForm);
    }
});

/**
 * Initializes accessibility features and restores saved preferences from localStorage.
 */
function initAccessibility() {
    const body = document.body;
    const themeBtn = document.getElementById('toggle-theme');
    const contrastBtn = document.getElementById('toggle-contrast');
    const dyslexiaBtn = document.getElementById('toggle-dyslexia');
    const fontSizesArr = ['font-sm', 'font-md', 'font-lg'];
    
    // Restore saved settings
    const savedTheme = localStorage.getItem('enable-theme') || 'light';
    const savedFontSize = localStorage.getItem('enable-font-size') || 'font-sm';
    const isDyslexia = localStorage.getItem('enable-dyslexia') === 'true';

    body.setAttribute('data-theme', savedTheme);
    body.classList.add(savedFontSize);
    if (isDyslexia) body.classList.add('dyslexia-font');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('enable-theme', newTheme);
        });
    }

    if (contrastBtn) {
        contrastBtn.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            let newTheme = currentTheme === 'high-contrast' ? 'light' : 'high-contrast';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('enable-theme', newTheme);
        });
    }

    if (dyslexiaBtn) {
        dyslexiaBtn.addEventListener('click', () => {
            const active = body.classList.toggle('dyslexia-font');
            localStorage.setItem('enable-dyslexia', active);
        });
    }

    fontSizesArr.forEach(size => {
        const btn = document.getElementById(`toggle-${size}`);
        if (btn) {
            btn.addEventListener('click', () => {
                body.classList.remove(...fontSizesArr);
                body.classList.add(size);
                localStorage.setItem('enable-font-size', size);
            });
        }
    });
}

/**
 * Read Aloud functionality using Web Speech API.
 */
function initReadAloud() {
    const speakBtn = document.getElementById('toggle-audio');
    if (!speakBtn) return;

    let synth = window.speechSynthesis;
    let isSpeaking = false;

    speakBtn.addEventListener('click', () => {
        if (isSpeaking) {
            synth.cancel();
            speakBtn.classList.remove('active-audio');
            isSpeaking = false;
        } else {
            const mainText = document.querySelector('main').innerText;
            const utterThis = new SpeechSynthesisUtterance(mainText);
            
            utterThis.onend = () => {
                speakBtn.classList.remove('active-audio');
                isSpeaking = false;
            };

            synth.speak(utterThis);
            speakBtn.classList.add('active-audio');
            isSpeaking = true;
        }
    });

    // Cleanup when leaving page
    window.addEventListener('beforeunload', () => synth.cancel());
}

/**
 * Simulation Chatbot with Bradford University Data.
 */
function initChatbot() {
    // 1. Create UI Elements
    const bubble = document.createElement('div');
    bubble.id = 'chatbot-bubble';
    bubble.innerHTML = '<i class="fas fa-comments"></i>';
    document.body.appendChild(bubble);

    const windowEl = document.createElement('div');
    windowEl.id = 'chatbot-window';
    windowEl.innerHTML = `
        <div id="chatbot-header">
            <span>Bradford Support Bot</span>
            <div style="display:flex; gap:10px; align-items:center;">
                <i class="fas fa-volume-up" id="toggle-autoread" style="cursor:pointer; font-size: 0.9rem;" title="Toggle Auto-Read"></i>
                <i class="fas fa-times" id="close-chat" style="cursor:pointer"></i>
            </div>
        </div>
        <div id="chatbot-messages"></div>
        <div id="chatbot-input-area">
            <input type="text" id="chatbot-input" placeholder="Ask about library, support...">
            <button id="chatbot-send"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    document.body.appendChild(windowEl);

    const msgContainer = document.getElementById('chatbot-messages');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const closeBtn = document.getElementById('close-chat');
    const autoReadBtn = document.getElementById('toggle-autoread');
    let autoReadEnabled = false;

    autoReadBtn.addEventListener('click', () => {
        autoReadEnabled = !autoReadEnabled;
        autoReadBtn.style.color = autoReadEnabled ? '#ffff00' : '#ffffff';
        autoReadBtn.title = autoReadEnabled ? "Auto-Read ON" : "Auto-Read OFF";
    });

    // Welcome Message with Read Aloud support
    const addMessage = (text, sender) => {
        const div = document.createElement('div');
        div.className = `chat-msg msg-${sender}`;
        
        if (sender === 'bot') {
            div.innerHTML = `
                ${text}
                <i class="fas fa-volume-up speaker-icon" style="margin-left:8px; cursor:pointer; opacity:0.6; font-size: 0.8rem;" title="Read aloud"></i>
            `;
            const icon = div.querySelector('.speaker-icon');
            icon.addEventListener('click', () => {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(text);
                window.speechSynthesis.speak(utter);
            });

            // Auto-read if enabled
            if (autoReadEnabled) {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(text);
                window.speechSynthesis.speak(utter);
            }
        } else {
            div.innerText = text;
        }
        
        msgContainer.appendChild(div);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    };

    addMessage("Hello! I am the ENABLE Assistant. How can I help you with University of Bradford services today?", "bot");

    bubble.addEventListener('click', () => {
        windowEl.style.display = 'flex';
        bubble.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
        windowEl.style.display = 'none';
        bubble.style.display = 'flex';
    });

    const handleSend = () => {
        const query = input.value.toLowerCase();
        if (!query) return;

        addMessage(input.value, "user");
        input.value = '';

        setTimeout(() => {
            let response = "I'm sorry, I don't have that specific information. Try asking about the 'library', 'disability support', or 'campus location'. You can also ask about 'careers', 'counselling', or 'money'.";
            
            // Move specific/multi-word keywords to the top
            if (query.includes('it support') || query.includes('password') || query.includes('wifi')) {
                response = "For IT issues, visit the IT Service Desk in the J.B. Priestley Building or call 01274 233322.";
            } else if (query.includes('enroll') || query.includes('enrolment')) {
                response = "Enrollment is done via the Bradford Student Portal using your student ID and password.";
            } else if (query.includes('exam')) {
                response = "Exam timetables are typically released 4 weeks before the exam period. Check the 'Assessment' tab in the student portal.";
            } else if (query.includes('library')) {
                response = "The J.B. Priestley Library is located on the City Campus. It offers 24/7 online support and physical access. Contact: 01274 233301.";
            } else if (query.includes('disability') || query.includes('neurodiversity')) {
                response = "The Disability Service offers specialist guidance for neurodiverse students. Email them at disabilities@bradford.ac.uk.";
            } else if (query.includes('support')) {
                response = "We offer various support services, including Disability, Mental Health, and Careers support. Which one would you like to know about?";
            } else if (query.includes('location') || query.includes('address') || query.includes('where')) {
                response = "The main City Campus is located at Richmond Road, Bradford, BD7 1DP. It's a 15-minute walk from the city center.";
            } else if (query.includes('hours') || query.includes('opening')) {
                response = "Most student services are open 9am-5pm. The Library has 24/7 study access during peak times.";
            } else if (query.includes('union') || query.includes('ubu')) {
                response = "The Students' Union (UBU) is located in Student Central. They offer societies and various advice.";
            } else if (query.includes('food') || query.includes('cafe') || query.includes('eat')) {
                response = "Visit the Atrium Cafe in the Richmond Building or the Students' Union for a variety of food and drinks.";
            } else if (query.includes('gym') || query.includes('sport') || query.includes('fitness')) {
                response = "The Unique Fitness center is on the City Campus and offers a gym, swimming pool, and classes.";
            } else if (query.includes('careers') || query.includes('jobs')) {
                response = "The Careers and Employability Service helps with jobs and CVs. Visit them in Student Central.";
            } else if (query.includes('counselling') || query.includes('mental health')) {
                response = "The University offers free counselling. Contact counselling@bradford.ac.uk or visit MyBradford.";
            } else if (query.includes('money') || query.includes('finance')) {
                response = "For financial advice, visit the Student Money team in the Richmond Building.";
            } else if (query.includes('safety') || query.includes('security')) {
                response = "University Security is available 24/7. In an emergency on campus, call 01274 236999.";
            } else if (query.includes('hello') || query.includes('hi')) {
                response = "Hello! I can help with info about the library, support services, campus locations, and more. What's on your mind?";
            } else if (query.includes('help')) {
                response = "You can ask me about: Library, IT Support, Exams, Enrollment, Disability Support, Food, Gym, or Careers.";
            }

            addMessage(response, "bot");
        }, 600);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
}

function initReadingMask() {
    const mask = document.createElement('div');
    mask.id = 'reading-mask';
    document.body.appendChild(mask);
    const toggleBtn = document.getElementById('toggle-mask');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isVisible = mask.style.display === 'block';
            mask.style.display = isVisible ? 'none' : 'block';
            toggleBtn.classList.toggle('active');
        });
        document.addEventListener('mousemove', (e) => {
            if (mask.style.display === 'block') {
                mask.style.setProperty('--mask-y', `${e.clientY}px`);
                mask.style.setProperty('-webkit-mask-y', `${e.clientY}px`);
            }
        });
    }
}

function initColorOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'color-overlay';
    document.body.appendChild(overlay);
    const toggleBtn = document.getElementById('toggle-overlay');
    if (toggleBtn) {
        let modes = ['', 'overlay-sepia', 'overlay-blue'];
        let currentMode = 0;
        toggleBtn.addEventListener('click', () => {
            overlay.className = '';
            currentMode = (currentMode + 1) % modes.length;
            if (modes[currentMode]) overlay.classList.add(modes[currentMode]);
        });
    }
}

function initBackToTop() {
    const btt = document.createElement('div');
    btt.id = 'back-to-top';
    btt.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btt);
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) btt.classList.add('visible');
        else btt.classList.remove('visible');
    });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function updateNavActiveState() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) link.classList.add('active');
        else link.classList.remove('active');
    });
}

function initSurveyForm(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const container = form.parentElement;
        container.innerHTML = `<div class="card" style="text-align: center;"><h2>Success!</h2><p>Feedback submitted.</p></div>`;
    });
}

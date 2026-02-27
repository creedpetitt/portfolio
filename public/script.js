const commandInput = document.getElementById('command-input');
const outputContainer = document.getElementById('output');
const terminalBody = document.getElementById('terminal-body');
const inputLine = document.querySelector('.input-line');

let commandHistory = [];
let historyIndex = -1;

const asciiArt = `
 ██████╗██████╗ ███████╗███████╗██████╗ 
██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗
██║     ██████╔╝█████╗  █████╗  ██║  ██║
██║     ██╔══██╗██╔══╝  ██╔══╝  ██║  ██║
╚██████╗██║  ██║███████╗███████╗██████╔╝
 ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═════╝ 
`;

const commands = {
    help: async () => `Available commands:<br>
        <span style="color: var(--text-success);">≫</span> about<br>
        <span style="color: var(--text-success);">≫</span> skills<br>
        <span style="color: var(--text-success);">≫</span> projects<br>
        <span style="color: var(--text-success);">≫</span> resume<br>
        <span style="color: var(--text-success);">≫</span> contact<br>
        <span style="color: var(--text-success);">≫</span> clear`,
    about: async () => `Hi, my name is Creed Petitt!<br>I am a Computer Engineering student at the University of Oklahoma.<br>I am very interested in low level systems programming and hardware design, and that's what most of my projects focus on.<br> I also have experience with web development and cloud technologies- this website was built using my own custom web framework!<br>See ≫ projects`,
    skills: async () => `My technical skills include:<br>
        <span style="color: var(--text-user);">★</span> <strong>Languages:</strong> C++, Rust, Java, Python, SQL, MATLAB<br>
        <span style="color: var(--text-user);">★</span> <strong>Technologies:</strong> Linux, Docker, AWS, GitHub Actions, Postgres`,
    projects: async () => {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            let html = '<br><div style="display: flex; flex-direction: column; gap: 15px;">';
            data.forEach(p => {
                html += `
                <div style="border: 1px solid var(--border-color); padding: 12px; border-radius: 5px; background: rgba(255,255,255,0.02);">
                    <strong style="color: var(--text-highlight); font-size: 1.1em;">${p.name}</strong><br>
                    <span style="color: var(--text-main);">${p.description}</span><br>
                    <span style="color: var(--text-success); font-size: 0.9em;">Stack: ${p.stack}</span><br>
                    <a href="${p.link}" target="_blank" rel="noopener noreferrer" style="color: var(--text-user); text-decoration: none;">[View Source ↗]</a>
                </div>`;
            });
            html += '</div><br>';
            return html;
        } catch (e) {
            return `Error fetching projects.`;
        }
    },
    resume: async () => {
        window.open('/resume.pdf', '_blank');
        return `Opening resume...`;
    },
    contact: async () => `Email: <a href="mailto:creedpetitt@gmail.com" style="color: var(--text-highlight);">creedpetitt@gmail.com</a><br>LinkedIn: <a href="https://linkedin.com/in/creed-petitt" style="color: var(--text-highlight);" target="_blank">linkedin.com/in/creed-petitt</a><br>GitHub: <a href="https://github.com/creedpetitt" style="color: var(--text-highlight);" target="_blank">github.com/creedpetitt</a>`,
    clear: async () => {
        outputContainer.innerHTML = '';
        return null;
    },
    cls: async () => commands.clear()
};

function createPromptHTML() {
    return `<span class="user">creed</span> <span class="symbol">~ $</span>`;
}

async function typewriter(text, element, speed = 5) {
    for (let i = 0; i < text.length; i++) {
        element.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
        terminalBody.scrollTop = terminalBody.scrollHeight;
        if (text.charAt(i) !== ' ' && text.charAt(i) !== '\n') {
            await new Promise(r => setTimeout(r, speed));
        }
    }
}

async function initTerminal() {
    outputContainer.innerHTML = '';
    inputLine.style.display = 'none';
    
    const asciiDiv = document.createElement('pre');
    asciiDiv.style.color = 'var(--text-highlight)';
    asciiDiv.style.lineHeight = '1.2';
    asciiDiv.style.marginBottom = '20px';
    outputContainer.appendChild(asciiDiv);
    await typewriter(asciiArt, asciiDiv, 2);

    let uuid = 'loading...';
    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        uuid = config.uuid;
    } catch(e) {}

    const welcomeLine = document.createElement('div');
    welcomeLine.className = 'line';
    outputContainer.appendChild(welcomeLine);
    
    const welcomeMsg = `Welcome to my Website\n` +
                      `Session UUID: ${uuid}\n\n` +
                      `Available Commands:\n` +
                      ` ≫ about    ≫ skills    ≫ projects\n` +
                      ` ≫ resume   ≫ contact   ≫ clear\n\n`;
    
    await typewriter(welcomeMsg, welcomeLine, 10);
    
    const finalPromptLine = document.createElement('div');
    finalPromptLine.className = 'line';
    outputContainer.appendChild(finalPromptLine);
    await typewriter('creed ~ $ ', finalPromptLine, 50);
    
    outputContainer.removeChild(finalPromptLine);
    inputLine.style.display = 'flex';
    commandInput.focus();
}

async function processCommand(cmd) {
    const trimmedCmd = cmd.trim().toLowerCase();
    if (trimmedCmd) {
        commandHistory.push(trimmedCmd);
        historyIndex = commandHistory.length;
    }

    const echoLine = document.createElement('div');
    echoLine.className = 'line';
    echoLine.innerHTML = `<span class="prompt">${createPromptHTML()}</span> ${cmd}`;
    outputContainer.appendChild(echoLine);

    if (!trimmedCmd) return;

    let responseHtml = '';
    if (commands[trimmedCmd]) {
        responseHtml = await commands[trimmedCmd]();
    } else {
        responseHtml = `sh: command not found: ${trimmedCmd}`;
    }

    if (responseHtml !== null) {
        const responseLine = document.createElement('div');
        responseLine.className = 'line';
        responseLine.innerHTML = responseHtml;
        outputContainer.appendChild(responseLine);
    }
    
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = commandInput.value;
        processCommand(cmd);
        commandInput.value = '';
    }
    else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            commandInput.value = commandHistory[historyIndex];
        }
    }
    else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            commandInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            commandInput.value = '';
        }
    }
});

terminalBody.addEventListener('click', () => commandInput.focus());

initTerminal();

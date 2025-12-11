const CONFIG_FILE = 'config.json';
const PERSONAL_CONFIG_FILE = 'personal.json';
const headerTitleEl = document.getElementById('header-title');
const mainContainerEl = document.getElementById('main-container');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeToggleText = document.getElementById('theme-toggle-text');

/**
 * Sets the theme on the document and saves the preference.
 * @param {string} theme - The theme to set ('light' or 'dark').
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggleText) {
        themeToggleText.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
}

/**
 * Darkens a hex color by a given percentage.
 * @param {string} hex - The hex color code (without #).
 * @param {number} percent - The percentage to darken (0-100).
 * @returns {string} The darkened hex color (without #).
 */
function darkenColor(hex, percent = 30) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse RGB values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Darken each component
    r = Math.max(0, Math.floor(r * (1 - percent / 100)));
    g = Math.max(0, Math.floor(g * (1 - percent / 100)));
    b = Math.max(0, Math.floor(b * (1 - percent / 100)));

    // Convert back to hex
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return toHex(r) + toHex(g) + toHex(b);
}

/**
 * Checks if the current theme is dark mode.
 * @returns {boolean} True if dark mode is active.
 */
function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}

/**
 * Toggles the theme between light and dark.
 */
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateLinkColors();
}

/**
 * Updates the colors of all existing link elements based on current theme.
 */
function updateLinkColors() {
    const linkElements = document.querySelectorAll('.link-item');
    linkElements.forEach(linkEl => {
        // Extract original colors from current background/foreground
        let currentBg = linkEl.style.backgroundColor;
        let currentFg = linkEl.style.color;

        // Parse RGB to hex
        const rgbToHex = (rgb) => {
            const result = rgb.match(/\d+/g);
            if (!result) return null;
            const r = parseInt(result[0]);
            const g = parseInt(result[1]);
            const b = parseInt(result[2]);
            return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
        };

        let bgHex = rgbToHex(currentBg);
        let fgHex = rgbToHex(currentFg);

        if (!bgHex || !fgHex) return;

        // Store original colors as data attributes if not already stored
        if (!linkEl.dataset.originalBg) {
            linkEl.dataset.originalBg = bgHex;
            linkEl.dataset.originalFg = fgHex;
        }

        // Use stored original colors
        let originalBg = linkEl.dataset.originalBg;
        let originalFg = linkEl.dataset.originalFg;

        // Apply darkening if in dark mode, otherwise use original
        if (isDarkMode()) {
            bgHex = darkenColor(originalBg, 10);
            fgHex = darkenColor(originalFg, 10);
        } else {
            bgHex = originalBg;
            fgHex = originalFg;
        }

        linkEl.style.backgroundColor = `#${bgHex}`;
        linkEl.style.color = `#${fgHex}`;
    });
}

/**
 * Initializes the theme based on saved preference or system settings.
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? 'dark' : 'light');
    }

    themeToggleBtn.addEventListener('click', toggleTheme);
}

/**
 * Fetches and processes the configuration files.
 */
async function loadContent() {
    try {
        const response = await fetch(CONFIG_FILE);
        if (!response.ok) {
            throw new Error(`Could not fetch ${CONFIG_FILE}. Status: ${response.status}`);
        }
        const config = await response.json();

        // Attempt to fetch and merge the optional personal configuration
        try {
            const personalResponse = await fetch(PERSONAL_CONFIG_FILE);
            if (personalResponse.ok) {
                const personalConfig = await personalResponse.json();
                if (personalConfig.sections && Array.isArray(personalConfig.sections)) {
                    if (personalConfig.position === 'top') {
                        config.sections = personalConfig.sections.concat(config.sections);
                    } else { // 'bottom' or default behavior
                        config.sections = config.sections.concat(personalConfig.sections);
                    }
                }
            }
        } catch (error) {
            // This is not a critical error, as the file is optional.
            // We can log it to the console for debugging purposes.
            console.info(`Optional file '${PERSONAL_CONFIG_FILE}' not found or could not be processed.`);
        }

        renderPage(config);
    } catch (error) {
        console.error('Failed to load or render page:', error);
        renderError(error.message);
    }
}

/**
 * Renders the entire page based on the loaded config.
 * @param {object} config - The configuration object from config.json.
 */
function renderPage(config) {
    headerTitleEl.textContent = config.title || 'Bookmarks';

    // Clear any existing content (e.g., previous error messages)
    mainContainerEl.innerHTML = '';

    // Render each section
    config.sections.forEach(sectionData => {
        const sectionEl = createSectionElement(sectionData, config.defaults);
        mainContainerEl.appendChild(sectionEl);
    });
}

/**
 * Creates a complete section element with its title and links.
 * @param {object} sectionData - The data for a single section.
 * @param {object} defaults - The default values from the config.
 * @returns {HTMLElement} The created <section> element.
 */
function createSectionElement(sectionData, defaults) {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'section';

    const titleEl = document.createElement('h2');
    titleEl.className = 'section-title';
    titleEl.textContent = sectionData.title || defaults.section.title;
    sectionEl.appendChild(titleEl);

    const linksContainerEl = document.createElement('div');
    linksContainerEl.className = 'links-container';

    sectionData.links.forEach(linkData => {
        // Check if the link object is empty to create a line break
        if (Object.keys(linkData).length === 0) {
            const breakEl = document.createElement('div');
            breakEl.className = 'line-break';
            linksContainerEl.appendChild(breakEl);
        } else {
            const linkEl = createLinkElement(linkData, defaults.link);
            linksContainerEl.appendChild(linkEl);
        }
    });

    sectionEl.appendChild(linksContainerEl);
    return sectionEl;
}

/**
 * Creates a single link (<a>) element.
 * @param {object} linkData - The data for a single link.
 * @param {object} defaultLink - The default link values.
 * @returns {HTMLAnchorElement} The created <a> element.
 */
function createLinkElement(linkData, defaultLink) {
    const linkEl = document.createElement('a');
    linkEl.className = 'link-item';

    // Use provided values or fall back to defaults
    linkEl.href = linkData.href ?? defaultLink.href;
    linkEl.textContent = linkData.text ?? defaultLink.text;

    let bgColor = linkData.bg ?? defaultLink.bg;
    let fgColor = linkData.fg ?? defaultLink.fg;

    // Store original colors as data attributes
    linkEl.dataset.originalBg = bgColor;
    linkEl.dataset.originalFg = fgColor;

    if (isDarkMode()) {
        bgColor = darkenColor(bgColor, 10);
        fgColor = darkenColor(fgColor, 10);
    }

    // Set colors, ensuring '#' is prepended to the hex codes
    linkEl.style.backgroundColor = `#${bgColor}`;
    linkEl.style.color = `#${fgColor}`;

    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';

    if (linkData.tooltip) {
        setupTooltip(linkEl, linkData.tooltip);
    }

    return linkEl;
}

/**
 * Sets up tooltip functionality for a link element.
 * @param {HTMLElement} linkEl - The link element to attach the tooltip to.
 * @param {string} tooltipText - The text to display in the tooltip.
 */
function setupTooltip(linkEl, tooltipText) {
    let tooltipEl = null;

    linkEl.addEventListener('mouseenter', (e) => {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip';
        tooltipEl.textContent = tooltipText;
        document.body.appendChild(tooltipEl);

        positionTooltip(e.target, tooltipEl);

        // Show tooltip with a slight delay for smooth appearance
        setTimeout(() => {
            if (tooltipEl) {
                tooltipEl.classList.add('show');
            }
        }, 10);
    });

    linkEl.addEventListener('mouseleave', () => {
        if (tooltipEl) {
            tooltipEl.classList.remove('show');
            setTimeout(() => {
                if (tooltipEl && tooltipEl.parentNode) {
                    tooltipEl.parentNode.removeChild(tooltipEl);
                }
                tooltipEl = null;
            }, 200); // Match transition duration
        }
    });

    // Update position on mouse move to handle edge cases
    linkEl.addEventListener('mousemove', (e) => {
        if (tooltipEl) {
            positionTooltip(e.target, tooltipEl);
        }
    });
}

/**
 * Positions the tooltip relative to the target element, ensuring it stays within viewport.
 * @param {HTMLElement} targetEl - The element the tooltip is attached to.
 * @param {HTMLElement} tooltipEl - The tooltip element to position.
 */
function positionTooltip(targetEl, tooltipEl) {
    const rect = targetEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const edgePadding = 10;
    const offset = 8; // Distance from target element

    // Calculate initial position (above the element, centered)
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - offset;

    // Adjust horizontal position if tooltip goes off-screen
    if (left < edgePadding) {
        left = edgePadding;
    } else if (left + tooltipRect.width > window.innerWidth - edgePadding) {
        left = window.innerWidth - tooltipRect.width - edgePadding;
    }

    // Adjust vertical position if tooltip goes off top of screen
    if (top < edgePadding) {
        // Position below the element instead
        top = rect.bottom + offset;
    }

    // Ensure tooltip doesn't go off bottom of screen
    if (top + tooltipRect.height > window.innerHeight - edgePadding) {
        top = window.innerHeight - tooltipRect.height - edgePadding;
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
}

/**
 * Renders an error message in the main container.
 * @param {string} message - The error message to display.
 */
function renderError(message) {
    mainContainerEl.innerHTML = `
        <div class="error-message">
            <strong>Error loading content</strong>
            <p>${message}</p>
        </div>
    `;
    headerTitleEl.textContent = 'Error';
    document.title = 'Error';
}

// Initial load
initializeTheme();
loadContent();

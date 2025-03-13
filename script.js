// BOOKMARKS FUNCTIONS
    
function setupBookmarkListeners() {
    const addBookmarkLinks = document.querySelectorAll('[id="add-bookmark-btn"], [id="add-bookmark-main-btn"], .add-link-btn');
    const bookmarkForm = document.getElementById('bookmark-form');
    const cancelBookmarkBtn = document.getElementById('cancel-bookmark');
    const bookmarksSearchInput = document.getElementById('bookmarks-search');
    const filterCategoriesSelect = document.getElementById('filter-categories');
    
    // Handle all Add Bookmark buttons/links
    addBookmarkLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showAddBookmarkModal();
        });
    });
    
    if (cancelBookmarkBtn) {
        cancelBookmarkBtn.addEventListener('click', () => closeModal(document.getElementById('bookmark-modal')));
    }
    
    if (bookmarkForm) {
        bookmarkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveBookmark();
        });
    }
    
    if (bookmarksSearchInput) {
        bookmarksSearchInput.addEventListener('input', () => filterBookmarks(bookmarksSearchInput.value));
    }
    
    if (filterCategoriesSelect) {
        filterCategoriesSelect.addEventListener('change', () => filterBookmarksByCategory(filterCategoriesSelect.value));
    }
}

function showAddBookmarkModal() {
    const bookmarkModalTitle = document.getElementById('bookmark-modal-title');
    const bookmarkId = document.getElementById('bookmark-id');
    const bookmarkForm = document.getElementById('bookmark-form');
    
    if (bookmarkModalTitle) bookmarkModalTitle.textContent = 'Add New Bookmark';
    if (bookmarkId) bookmarkId.value = '';
    if (bookmarkForm) bookmarkForm.reset();
    
    openModal('bookmark-modal');
}

function saveBookmark() {
    const bookmarkId = document.getElementById('bookmark-id').value;
    const bookmarkTitle = document.getElementById('bookmark-title').value;
    const bookmarkUrl = document.getElementById('bookmark-url').value;
    const bookmarkCategory = document.getElementById('bookmark-category').value;
    const bookmarkIcon = document.getElementById('bookmark-icon').value;
    
    if (!bookmarkTitle || !bookmarkUrl) return; // Basic validation
    
    // Make sure URL has a protocol
    let formattedUrl = bookmarkUrl;
    if (!bookmarkUrl.startsWith('http://') && !bookmarkUrl.startsWith('https://')) {
        formattedUrl = 'https://' + bookmarkUrl;
    }
    
    if (bookmarkId) {
        // Update existing bookmark
        const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === bookmarkId);
        if (bookmarkIndex !== -1) {
            bookmarks[bookmarkIndex] = {
                ...bookmarks[bookmarkIndex],
                title: bookmarkTitle,
                url: formattedUrl,
                category: bookmarkCategory,
                icon: bookmarkIcon,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Add new bookmark
        const newBookmark = {
            id: generateId(),
            title: bookmarkTitle,
            url: formattedUrl,
            category: bookmarkCategory,
            icon: bookmarkIcon,
            clicks: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        bookmarks.push(newBookmark);
    }
    
    saveToLocalStorage('bookmarks', bookmarks);
    closeModal(document.getElementById('bookmark-modal'));
    renderQuickLinks();
    renderBookmarks();
}

function renderQuickLinks() {
    const bookmarksGrid = document.getElementById('bookmarks-grid');
    if (!bookmarksGrid) return;
    
    bookmarksGrid.innerHTML = '';
    
    // If no custom bookmarks, use defaults
    if (bookmarks.length === 0) {
        const defaultBookmarks = [
            { id: 'default-1', title: 'GitHub', url: 'https://github.com', icon: 'fa-github', category: 'development' },
            { id: 'default-2', title: 'LinkedIn', url: 'https://linkedin.com', icon: 'fa-linkedin', category: 'work' },
            { id: 'default-3', title: 'CodePen', url: 'https://codepen.io', icon: 'fa-codepen', category: 'development' },
            { id: 'default-4', title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'fa-stack-overflow', category: 'development' },
            { id: 'default-5', title: 'Dribbble', url: 'https://dribbble.com', icon: 'fa-dribbble', category: 'design' },
            { id: 'default-6', title: 'Behance', url: 'https://behance.net', icon: 'fa-behance', category: 'design' }
        ];
        
        defaultBookmarks.forEach(bookmark => {
            const iconClass = bookmark.icon.startsWith('fa-') ? 
                (bookmark.icon.includes('fa-github') || 
                 bookmark.icon.includes('fa-linkedin') || 
                 bookmark.icon.includes('fa-codepen') || 
                 bookmark.icon.includes('fa-stack-overflow') || 
                 bookmark.icon.includes('fa-dribbble') || 
                 bookmark.icon.includes('fa-behance') ? 'fab' : 'fas') : 'fas';
            
            const bookmarkElement = document.createElement('a');
            bookmarkElement.href = bookmark.url;
            bookmarkElement.target = '_blank';
            bookmarkElement.className = 'bookmark-item';
            bookmarkElement.innerHTML = `
                <i class="${iconClass} ${bookmark.icon}"></i>
                <span>${bookmark.title}</span>
            `;
            
            bookmarksGrid.appendChild(bookmarkElement);
        });
        
        return;
    }
    
    // Show user's bookmarks sorted by click count
    const quickLinks = [...bookmarks]
        .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        .slice(0, 6);
    
    quickLinks.forEach(bookmark => {
        const iconClass = bookmark.icon.startsWith('fa-') ? 
            (bookmark.icon.includes('github') || 
             bookmark.icon.includes('linkedin') || 
             bookmark.icon.includes('codepen') || 
             bookmark.icon.includes('stack-overflow') || 
             bookmark.icon.includes('dribbble') || 
             bookmark.icon.includes('behance') ? 'fab' : 'fas') : 'fas';
        
        const bookmarkElement = document.createElement('a');
        bookmarkElement.href = bookmark.url;
        bookmarkElement.target = '_blank';
        bookmarkElement.className = 'bookmark-item';
        bookmarkElement.setAttribute('data-id', bookmark.id);
        bookmarkElement.innerHTML = `
            <i class="${iconClass} ${bookmark.icon}"></i>
            <span>${bookmark.title}</span>
        `;
        
        // Track clicks
        bookmarkElement.addEventListener('click', (e) => {
            incrementBookmarkClicks(bookmark.id);
        });
        
        bookmarksGrid.appendChild(bookmarkElement);
    });
}

function incrementBookmarkClicks(bookmarkId) {
    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === bookmarkId);
    if (bookmarkIndex !== -1) {
        bookmarks[bookmarkIndex].clicks = (bookmarks[bookmarkIndex].clicks || 0) + 1;
        saveToLocalStorage('bookmarks', bookmarks);
    }
}

function renderBookmarks() {
    const bookmarksList = document.getElementById('bookmarks-list');
    if (!bookmarksList) return;
    
    bookmarksList.innerHTML = '';
    
    if (bookmarks.length === 0) {
        bookmarksList.innerHTML = '<div class="text-center">No bookmarks found</div>';
        return;
    }
    
    // Get search query if any
    const searchQuery = document.getElementById('bookmarks-search')?.value?.toLowerCase().trim() || '';
    
    // Get category filter
    const categoryFilter = document.getElementById('filter-categories')?.value || 'all';
    
    let filteredBookmarks = [...bookmarks];
    
    // Apply search filter
    if (searchQuery) {
        filteredBookmarks = filteredBookmarks.filter(bookmark => 
            bookmark.title.toLowerCase().includes(searchQuery) || 
            bookmark.url.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        filteredBookmarks = filteredBookmarks.filter(bookmark => bookmark.category === categoryFilter);
    }
    
    if (filteredBookmarks.length === 0) {
        bookmarksList.innerHTML = '<div class="text-center">No bookmarks found</div>';
        return;
    }
    
    filteredBookmarks.forEach(bookmark => {
        const iconClass = bookmark.icon.startsWith('fa-') ? 
            (bookmark.icon.includes('github') || 
             bookmark.icon.includes('linkedin') || 
             bookmark.icon.includes('codepen') || 
             bookmark.icon.includes('stack-overflow') || 
             bookmark.icon.includes('dribbble') || 
             bookmark.icon.includes('behance') ? 'fab' : 'fas') : 'fas';
        
        const bookmarkCard = document.createElement('div');
        bookmarkCard.className = 'bookmark-card';
        bookmarkCard.innerHTML = `
            <div class="bookmark-icon">
                <i class="${iconClass} ${bookmark.icon}"></i>
            </div>
            <h3 class="bookmark-title">${bookmark.title}</h3>
            <div class="bookmark-url">${bookmark.url}</div>
            <a href="${bookmark.url}" target="_blank" class="bookmark-visit" data-id="${bookmark.id}">Visit</a>
            <div class="bookmark-actions">
                <button class="edit-bookmark" data-id="${bookmark.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-bookmark" data-id="${bookmark.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        bookmarkCard.querySelector('.bookmark-visit').addEventListener('click', () => {
            incrementBookmarkClicks(bookmark.id);
        });
        
        bookmarkCard.querySelector('.edit-bookmark').addEventListener('click', () => {
            editBookmark(bookmark.id);
        });
        
        bookmarkCard.querySelector('.delete-bookmark').addEventListener('click', () => {
            deleteBookmark(bookmark.id);
        });
        
        bookmarksList.appendChild(bookmarkCard);
    });
}

function filterBookmarks(query) {
    renderBookmarks();
}

function filterBookmarksByCategory(category) {
    renderBookmarks();
}

function editBookmark(bookmarkId) {
    const bookmark = bookmarks.find(bookmark => bookmark.id === bookmarkId);
    if (!bookmark) return;
    
    const bookmarkModalTitle = document.getElementById('bookmark-modal-title');
    const bookmarkIdInput = document.getElementById('bookmark-id');
    const bookmarkTitleInput = document.getElementById('bookmark-title');
    const bookmarkUrlInput = document.getElementById('bookmark-url');
    const bookmarkCategoryInput = document.getElementById('bookmark-category');
    const bookmarkIconInput = document.getElementById('bookmark-icon');
    
    if (bookmarkModalTitle) bookmarkModalTitle.textContent = 'Edit Bookmark';
    if (bookmarkIdInput) bookmarkIdInput.value = bookmark.id;
    if (bookmarkTitleInput) bookmarkTitleInput.value = bookmark.title;
    if (bookmarkUrlInput) bookmarkUrlInput.value = bookmark.url;
    if (bookmarkCategoryInput) bookmarkCategoryInput.value = bookmark.category;
    if (bookmarkIconInput) bookmarkIconInput.value = bookmark.icon;
    
    openModal('bookmark-modal');
}

function deleteBookmark(bookmarkId) {
    showConfirmModal('Delete Bookmark', 'Are you sure you want to delete this bookmark?', () => {
        bookmarks = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
        saveToLocalStorage('bookmarks', bookmarks);
        renderQuickLinks();
        renderBookmarks();
    });
}

// SETTINGS FUNCTIONS

function setupSettingsListeners() {
    const displayNameInput = document.getElementById('display-name');
    const userEmailInput = document.getElementById('user-email');
    const themeSelectEl = document.getElementById('theme-select');
    const accentColorEl = document.getElementById('accent-color');
    const exportDataBtn = document.getElementById('export-data');
    const clearDataBtn = document.getElementById('clear-data');
    
    if (displayNameInput) {
        displayNameInput.addEventListener('change', () => {
            settings.username = displayNameInput.value;
            saveToLocalStorage('settings', settings);
            updateUserInterface();
        });
    }
    
    if (userEmailInput) {
        userEmailInput.addEventListener('change', () => {
            settings.email = userEmailInput.value;
            saveToLocalStorage('settings', settings);
        });
    }
    
    if (themeSelectEl) {
        themeSelectEl.addEventListener('change', () => {
            applyTheme(themeSelectEl.value);
        });
    }
    
    if (accentColorEl) {
        accentColorEl.addEventListener('change', () => {
            applyAccentColor(accentColorEl.value);
        });
    }
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAllData);
    }
    
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            showConfirmModal(
                'Clear All Data', 
                'Are you sure you want to clear all your data? This action cannot be undone.', 
                clearAllData
            );
        });
    }
}

function exportAllData() {
    const data = {
        tasks,
        notes,
        events,
        bookmarks,
        settings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `dashboard_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
}

function clearAllData() {
    localStorage.removeItem('tasks');
    localStorage.removeItem('notes');
    localStorage.removeItem('events');
    localStorage.removeItem('bookmarks');
    
    // Keep basic settings but reset to defaults
    settings = {
        username: 'User',
        email: '',
        theme: 'light',
        accentColor: 'blue'
    };
    saveToLocalStorage('settings', settings);
    
    // Reset data
    tasks = [];
    notes = [];
    events = [];
    bookmarks = [];
    
    // Apply theme settings
    applyTheme(settings.theme);
    applyAccentColor(settings.accentColor);
    updateUserInterface();
    
    // Re-render everything
    renderAllData();
}

// WEATHER FUNCTIONALITY (Mock data for demo)
function updateWeather() {
    const weatherTemp = document.getElementById('weather-temp');
    const weatherDesc = document.getElementById('weather-desc');
    const weatherLocation = document.getElementById('weather-location');
    const weatherIcon = document.querySelector('.weather-icon i');
    
    if (!weatherTemp || !weatherDesc || !weatherLocation || !weatherIcon) return;
    
    const weatherIcons = ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain', 'fa-bolt', 'fa-snowflake'];
    const weatherDescriptions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm', 'Snowy'];
    const locations = ['New York', 'San Francisco', 'London', 'Tokyo', 'Sydney', 'Berlin'];
    
    const randomIndex = Math.floor(Math.random() * weatherIcons.length);
    const randomTemp = Math.floor(Math.random() * 30) + 50; // 50-80°F
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    weatherIcon.className = `fas ${weatherIcons[randomIndex]}`;
    weatherTemp.textContent = `${randomTemp}°F`;
    weatherDesc.textContent = weatherDescriptions[randomIndex];
    weatherLocation.textContent = randomLocation;
    
    // Update forecast
    const forecastIcons = document.querySelectorAll('.forecast-item i');
    const forecastTemps = document.querySelectorAll('.forecast-item p:last-child');
    
    for (let i = 0; i < forecastIcons.length; i++) {
        const forecastIndex = Math.floor(Math.random() * weatherIcons.length);
        const forecastTemp = Math.floor(Math.random() * 25) + 50; // 50-75°F
        
        if (forecastIcons[i]) {
            forecastIcons[i].className = `fas ${weatherIcons[forecastIndex]}`;
        }
        
        if (forecastTemps[i]) {
            forecastTemps[i].textContent = `${forecastTemp}°F`;
        }
    }
}

// UTILITY FUNCTIONS

function loadFromLocalStorage() {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    notes = JSON.parse(localStorage.getItem('notes')) || [];
    events = JSON.parse(localStorage.getItem('events')) || [];
    bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    settings = JSON.parse(localStorage.getItem('settings')) || {
        username: 'User',
        email: '',
        theme: 'light',
        accentColor: 'blue'
    };
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function renderAllData() {
    // Render dashboard widgets
    renderTaskSummary();
    renderUpcomingTasks();
    renderRecentNotes();
    renderQuickLinks();
    
    // Render section content
    renderTasks();
    renderNotes();
    renderBookmarks();
    
    // Calendar specific
    if (document.getElementById('calendar-days')) {
        renderCalendar();
    }
    
    // Remove duplicate add new links/buttons
    removeDuplicateLinks();
}

function removeDuplicateLinks() {
    // This helps with the issue of duplicate "Add New" links
    const noteLinks = document.querySelectorAll('.add-note-link');
    if (noteLinks.length > 1) {
        for (let i = 1; i < noteLinks.length; i++) {
            noteLinks[i].classList.add('duplicate-link');
        }
    }
    
    const linkLinks = document.querySelectorAll('.add-link-btn');
    if (linkLinks.length > 1) {
        for (let i = 1; i < linkLinks.length; i++) {
            linkLinks[i].classList.add('duplicate-link');
        }
    }
}

// Initialize weather on page load
const refreshWeatherBtn = document.getElementById('refresh-weather');
if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener('click', updateWeather);
}

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
initApp();
});

function initApp() {
// Global DOM Elements
const sidebarEl = document.querySelector('.sidebar');
const mainContentEl = document.querySelector('.main-content');
const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const themeToggleBtn = document.getElementById('theme-toggle');
const navItems = document.querySelectorAll('.sidebar-nav ul li');
const sections = document.querySelectorAll('.content-section');
const currentDateEl = document.getElementById('current-date');
const mobileOverlay = document.getElementById('mobile-overlay');
const searchInput = document.getElementById('search-input');

// Global variables for state
let tasks = [];
let notes = [];
let events = [];
let bookmarks = [];
let settings = {
    username: 'User',
    email: '',
    theme: 'light',
    accentColor: 'blue'
};

// Calendar State
let currentDate = new Date();
let selectedDate = new Date();

// Load data and initialize UI
loadFromLocalStorage();
renderAllData();
setupEventListeners();

// Initialize theme
applyTheme(settings.theme);
applyAccentColor(settings.accentColor);
updateUserInterface();

// Initialize current date
updateCurrentDate();

// Initialize weather
updateWeather();

// Initialize calendar if we're on a page with a calendar
if (document.getElementById('calendar-days')) {
    renderCalendar();
}

// DASHBOARD SETUP AND FUNCTIONS

// Update current date display
function updateCurrentDate() {
    if (currentDateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

// Apply theme settings
function applyTheme(theme) {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    settings.theme = theme;
    saveToLocalStorage('settings', settings);
}

// Apply accent color
function applyAccentColor(color) {
    document.documentElement.style.setProperty('--primary-color', getAccentColorValue(color));
    document.documentElement.style.setProperty('--primary-light', getAccentLightColorValue(color));
    settings.accentColor = color;
    saveToLocalStorage('settings', settings);
}

// Get color values from color name
function getAccentColorValue(color) {
    const colorMap = {
        'blue': '#4e85fd',
        'purple': '#7e4efd',
        'green': '#4ebd5b',
        'orange': '#fd8e4e',
        'pink': '#fd4e93'
    };
    return colorMap[color] || colorMap['blue'];
}

function getAccentLightColorValue(color) {
    const lightColorMap = {
        'blue': '#e6f0ff',
        'purple': '#f0e6ff',
        'green': '#e6ffe8',
        'orange': '#fff1e6',
        'pink': '#ffe6ef'
    };
    return lightColorMap[color] || lightColorMap['blue'];
}

// Update user interface with settings
function updateUserInterface() {
    const usernameEl = document.getElementById('username');
    const displayNameInput = document.getElementById('display-name');
    const userEmailEl = document.getElementById('user-email');
    const themeSelectEl = document.getElementById('theme-select');
    const accentColorEl = document.getElementById('accent-color');
    
    if (usernameEl) usernameEl.textContent = settings.username || 'User';
    if (displayNameInput) displayNameInput.value = settings.username || '';
    if (userEmailEl) userEmailEl.value = settings.email || '';
    if (themeSelectEl) themeSelectEl.value = settings.theme;
    if (accentColorEl) accentColorEl.value = settings.accentColor;
}

// NAVIGATION AND EVENT LISTENERS

function setupEventListeners() {
    // Sidebar Toggle
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // Mobile overlay for sidebar
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeSidebar);
    }
    
    // Theme Toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navigateToSection(item.getAttribute('data-section'));
        });
    });
    
    // Section navigation buttons
    setupSectionNavButtons();
    
    // Setup modals
    setupModals();
    
    // Setup search
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Task related listeners
    setupTaskListeners();
    
    // Note related listeners
    setupNoteListeners();
    
    // Calendar related listeners
    setupCalendarListeners();
    
    // Bookmark related listeners
    setupBookmarkListeners();
    
    // Settings related listeners
    setupSettingsListeners();
}

function toggleSidebar() {
    sidebarEl.classList.toggle('active');
    if (mobileOverlay) {
        mobileOverlay.classList.toggle('active', sidebarEl.classList.contains('active'));
    }
}

function closeSidebar() {
    sidebarEl.classList.remove('active');
    if (mobileOverlay) {
        mobileOverlay.classList.remove('active');
    }
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    applyTheme(currentTheme);
}

function navigateToSection(sectionId) {
    // Update navigation active state
    navItems.forEach(navItem => {
        navItem.classList.toggle('active', navItem.getAttribute('data-section') === sectionId);
    });
    
    // Show target section, hide others
    sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    
    // Special case for calendar - re-render
    if (sectionId === 'calendar' && document.getElementById('calendar-days')) {
        renderCalendar();
    }
}

function setupSectionNavButtons() {
    const viewAllTasks = document.getElementById('view-all-tasks');
    const viewAllNotes = document.getElementById('view-all-notes');
    const viewAllBookmarks = document.getElementById('view-all-bookmarks');
    
    if (viewAllTasks) {
        viewAllTasks.addEventListener('click', () => navigateToSection('tasks'));
    }
    
    if (viewAllNotes) {
        viewAllNotes.addEventListener('click', () => navigateToSection('notes'));
    }
    
    if (viewAllBookmarks) {
        viewAllBookmarks.addEventListener('click', () => navigateToSection('bookmarks'));
    }
}

function setupModals() {
    // Close modal buttons
    document.querySelectorAll('.close-modal, .btn-secondary[id^="cancel-"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal'));
        });
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function showConfirmModal(title, message, confirmCallback) {
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmAction = document.getElementById('confirm-action');
    const confirmModal = document.getElementById('confirm-modal');
    
    if (!confirmTitle || !confirmMessage || !confirmAction || !confirmModal) return;
    
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    
    // Remove previous event listener
    const newConfirmBtn = confirmAction.cloneNode(true);
    confirmAction.parentNode.replaceChild(newConfirmBtn, confirmAction);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', () => {
        confirmCallback();
        closeModal(confirmModal);
    });
    
    openModal('confirm-modal');
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const activeSection = document.querySelector('.content-section.active');
    
    if (!activeSection) return;
    
    // Determine which section is active and filter that content
    if (activeSection.id === 'dashboard') {
        // Generic dashboard search - highlight matching items
        highlightSearchResults(query);
    } else if (activeSection.id === 'tasks') {
        filterTasks(query);
    } else if (activeSection.id === 'notes') {
        filterNotes(query);
    } else if (activeSection.id === 'bookmarks') {
        filterBookmarks(query);
    }
}

function highlightSearchResults(query) {
    // Simple highlight logic for dashboard items
    if (!query) {
        // Remove any existing highlights
        document.querySelectorAll('.highlight').forEach(el => {
            el.classList.remove('highlight');
        });
        return;
    }
    
    // Add logic to highlight matching content in dashboard
}

// TASKS FUNCTIONS

function setupTaskListeners() {
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskForm = document.getElementById('task-form');
    const cancelTaskBtn = document.getElementById('cancel-task');
    const taskFilterBtns = document.querySelectorAll('.filter-btn');
    const sortTasksSelect = document.getElementById('sort-tasks');
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', showAddTaskModal);
    }
    
    if (cancelTaskBtn) {
        cancelTaskBtn.addEventListener('click', () => closeModal(document.getElementById('task-modal')));
    }
    
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveTask();
        });
    }
    
    if (taskFilterBtns) {
        taskFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderTasks();
            });
        });
    }
    
    if (sortTasksSelect) {
        sortTasksSelect.addEventListener('change', renderTasks);
    }
}

function showAddTaskModal() {
    const taskModalTitle = document.getElementById('task-modal-title');
    const taskId = document.getElementById('task-id');
    const taskForm = document.getElementById('task-form');
    const taskDueDate = document.getElementById('task-due-date');
    
    if (taskModalTitle) taskModalTitle.textContent = 'Add New Task';
    if (taskId) taskId.value = '';
    if (taskForm) taskForm.reset();
    
    // Set default due date to today
    if (taskDueDate) {
        const today = new Date().toISOString().split('T')[0];
        taskDueDate.value = today;
    }
    
    openModal('task-modal');
}

function saveTask() {
    const taskId = document.getElementById('task-id').value;
    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const taskDueDate = document.getElementById('task-due-date').value;
    const taskPriority = document.getElementById('task-priority').value;
    
    if (!taskTitle || !taskDueDate) return; // Basic validation
    
    if (taskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title: taskTitle,
                description: taskDescription,
                dueDate: taskDueDate,
                priority: taskPriority,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Add new task
        const newTask = {
            id: generateId(),
            title: taskTitle,
            description: taskDescription,
            dueDate: taskDueDate,
            priority: taskPriority,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        tasks.push(newTask);
    }
    
    saveToLocalStorage('tasks', tasks);
    closeModal(document.getElementById('task-modal'));
    renderTaskSummary();
    renderUpcomingTasks();
    renderTasks();
}

function renderTaskSummary() {
    const tasksCompletionEl = document.getElementById('tasks-completion');
    const completedTasksEl = document.getElementById('completed-tasks');
    const totalTasksEl = document.getElementById('total-tasks');
    const tasksProgressCircle = document.getElementById('progress-circle-1');
    
    if (!tasksCompletionEl || !completedTasksEl || !totalTasksEl) return;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    tasksCompletionEl.textContent = `${completionPercentage}%`;
    completedTasksEl.textContent = completedTasks;
    totalTasksEl.textContent = totalTasks;
    
    // Update progress circle if it exists
    if (tasksProgressCircle) {
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (completionPercentage / 100) * circumference;
        tasksProgressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        tasksProgressCircle.style.strokeDashoffset = offset;
    }
}

function renderUpcomingTasks() {
    const upcomingTasksList = document.getElementById('upcoming-tasks-list');
    if (!upcomingTasksList) return;
    
    upcomingTasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        upcomingTasksList.innerHTML = '<li class="text-center">No upcoming tasks</li>';
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingTasks = tasks
        .filter(task => !task.completed)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);
    
    if (upcomingTasks.length === 0) {
        upcomingTasksList.innerHTML = '<li class="text-center">No upcoming tasks</li>';
        return;
    }
    
    upcomingTasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        let dueDateText = '';
        
        if (isSameDay(dueDate, today)) {
            dueDateText = 'Today';
        } else if (isSameDay(dueDate, new Date(today.getTime() + 86400000))) {
            dueDateText = 'Tomorrow';
        } else {
            dueDateText = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
            <span>${task.title}</span>
            <span class="task-date">${dueDateText}</span>
        `;
        
        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            toggleTaskCompletion(task.id);
        });
        
        upcomingTasksList.appendChild(li);
    });
}

function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;
    
    tasksList.innerHTML = '';
    
    // Get active filter
    const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
    
    // Get sort option
    const sortBy = document.getElementById('sort-tasks')?.value || 'date-asc';
    
    let filteredTasks = [...tasks];
    
    // Apply search filter if search is active
    const searchQuery = document.getElementById('search-input')?.value?.toLowerCase().trim() || '';
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery) || 
            (task.description && task.description.toLowerCase().includes(searchQuery))
        );
    }
    
    // Apply status filter
    if (activeFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (activeFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    // Apply sort
    filteredTasks = sortTasksByOption(filteredTasks, sortBy);
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<div class="text-center">No tasks found</div>';
        return;
    }
    
    filteredTasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isOverdue = !task.completed && dueDate < today;
        
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
        taskItem.innerHTML = `
            <div class="task-item-header">
                <div>
                    <h3 class="task-title ${task.completed ? 'completed' : ''}">${task.title}</h3>
                    <span class="task-date">${formatDate(task.dueDate)}</span>
                </div>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            <p class="task-description">${task.description || 'No description'}</p>
            <div class="task-actions">
                <button class="toggle-task" data-id="${task.id}">
                    <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="edit-task" data-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-task" data-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        taskItem.querySelector('.toggle-task').addEventListener('click', () => {
            toggleTaskCompletion(task.id);
        });
        
        taskItem.querySelector('.edit-task').addEventListener('click', () => {
            editTask(task.id);
        });
        
        taskItem.querySelector('.delete-task').addEventListener('click', () => {
            deleteTask(task.id);
        });
        
        tasksList.appendChild(taskItem);
    });
}

function sortTasksByOption(tasks, option) {
    switch (option) {
        case 'date-asc':
            return [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        case 'date-desc':
            return [...tasks].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        case 'priority':
            const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
            return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        default:
            return tasks;
    }
}

function filterTasks(query) {
    renderTasks();
}

function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        tasks[taskIndex].updatedAt = new Date().toISOString();
        saveToLocalStorage('tasks', tasks);
        renderTaskSummary();
        renderUpcomingTasks();
        renderTasks();
    }
}

function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;
    
    const taskModalTitle = document.getElementById('task-modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescInput = document.getElementById('task-description');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskPriorityInput = document.getElementById('task-priority');
    
    if (taskModalTitle) taskModalTitle.textContent = 'Edit Task';
    if (taskIdInput) taskIdInput.value = task.id;
    if (taskTitleInput) taskTitleInput.value = task.title;
    if (taskDescInput) taskDescInput.value = task.description || '';
    if (taskDueDateInput) taskDueDateInput.value = task.dueDate;
    if (taskPriorityInput) taskPriorityInput.value = task.priority;
    
    openModal('task-modal');
}

function deleteTask(taskId) {
    showConfirmModal('Delete Task', 'Are you sure you want to delete this task?', () => {
        tasks = tasks.filter(task => task.id !== taskId);
        saveToLocalStorage('tasks', tasks);
        renderTaskSummary();
        renderUpcomingTasks();
        renderTasks();
    });
}

// NOTES FUNCTIONS

function setupNoteListeners() {
    const addNoteLinks = document.querySelectorAll('[id="add-note-btn"], [id="add-note-main-btn"], .add-note-link');
    const noteForm = document.getElementById('note-form');
    const cancelNoteBtn = document.getElementById('cancel-note');
    const notesSearchInput = document.getElementById('notes-search');
    const sortNotesSelect = document.getElementById('sort-notes');
    
    // Handle all Add Note buttons/links
    addNoteLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showAddNoteModal();
        });
    });
    
    if (cancelNoteBtn) {
        cancelNoteBtn.addEventListener('click', () => closeModal(document.getElementById('note-modal')));
    }
    
    if (noteForm) {
        noteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveNote();
        });
    }
    
    if (notesSearchInput) {
        notesSearchInput.addEventListener('input', () => filterNotes(notesSearchInput.value));
    }
    
    if (sortNotesSelect) {
        sortNotesSelect.addEventListener('change', () => sortNotes(sortNotesSelect.value));
    }
}

function showAddNoteModal() {
    const noteModalTitle = document.getElementById('note-modal-title');
    const noteId = document.getElementById('note-id');
    const noteForm = document.getElementById('note-form');
    const noteColor = document.getElementById('note-color');
    
    if (noteModalTitle) noteModalTitle.textContent = 'Add New Note';
    if (noteId) noteId.value = '';
    if (noteForm) noteForm.reset();
    if (noteColor) noteColor.value = '#ffffff';
    
    openModal('note-modal');
}

function saveNote() {
    const noteId = document.getElementById('note-id').value;
    const noteTitle = document.getElementById('note-title').value;
    const noteContent = document.getElementById('note-content').value;
    const noteColor = document.getElementById('note-color').value;
    
    if (!noteTitle || !noteContent) return; // Basic validation
    
    if (noteId) {
        // Update existing note
        const noteIndex = notes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title: noteTitle,
                content: noteContent,
                color: noteColor,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Add new note
        const newNote = {
            id: generateId(),
            title: noteTitle,
            content: noteContent,
            color: noteColor,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.push(newNote);
    }
    
    saveToLocalStorage('notes', notes);
    closeModal(document.getElementById('note-modal'));
    renderRecentNotes();
    renderNotes();
}

function renderRecentNotes() {
    const recentNotesList = document.getElementById('recent-notes-list');
    if (!recentNotesList) return;
    
    recentNotesList.innerHTML = '';
    
    if (notes.length === 0) {
        recentNotesList.innerHTML = '<div class="text-center">No notes yet</div>';
        return;
    }
    
    const recentNotes = [...notes]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 2);
    
    recentNotes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.style.backgroundColor = note.color;
        noteCard.innerHTML = `
            <h4>${note.title}</h4>
            <p>${note.content.substring(0, 60)}${note.content.length > 60 ? '...' : ''}</p>
            <span class="note-date">${formatDate(note.updatedAt)}</span>
        `;
        
        noteCard.addEventListener('click', () => {
            editNote(note.id);
        });
        
        recentNotesList.appendChild(noteCard);
    });
}

function renderNotes() {
    const notesGrid = document.getElementById('notes-grid');
    if (!notesGrid) return;
    
    notesGrid.innerHTML = '';
    
    if (notes.length === 0) {
        notesGrid.innerHTML = '<div class="text-center">No notes found</div>';
        return;
    }
    
    // Get search query if any
    const searchQuery = document.getElementById('notes-search')?.value?.toLowerCase().trim() || '';
    
    // Get sort option
    const sortBy = document.getElementById('sort-notes')?.value || 'date-desc';
    
    let filteredNotes = [...notes];
    
    // Apply search filter
    if (searchQuery) {
        filteredNotes = filteredNotes.filter(note => 
            note.title.toLowerCase().includes(searchQuery) || 
            note.content.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply sort
    switch (sortBy) {
        case 'date-desc':
            filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            break;
        case 'date-asc':
            filteredNotes.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
            break;
        case 'title':
            filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    if (filteredNotes.length === 0) {
        notesGrid.innerHTML = '<div class="text-center">No notes found</div>';
        return;
    }
    
    filteredNotes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.style.backgroundColor = note.color;
        noteItem.innerHTML = `
            <div class="note-item-header">
                <h3 class="note-item-title">${note.title}</h3>
                <span class="note-item-date">${formatDate(note.updatedAt)}</span>
            </div>
            <div class="note-item-content">${note.content.replace(/\n/g, '<br>')}</div>
            <div class="note-item-actions">
                <button class="edit-note" data-id="${note.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-note" data-id="${note.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        noteItem.querySelector('.edit-note').addEventListener('click', (e) => {
            e.stopPropagation();
            editNote(note.id);
        });
        
        noteItem.querySelector('.delete-note').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNote(note.id);
        });
        
        // Click on note to edit
        noteItem.addEventListener('click', () => {
            editNote(note.id);
        });
        
        notesGrid.appendChild(noteItem);
    });
}

function filterNotes(query) {
    renderNotes();
}

function sortNotes(option) {
    renderNotes();
}

function editNote(noteId) {
    const note = notes.find(note => note.id === noteId);
    if (!note) return;
    
    const noteModalTitle = document.getElementById('note-modal-title');
    const noteIdInput = document.getElementById('note-id');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const noteColorInput = document.getElementById('note-color');
    
    if (noteModalTitle) noteModalTitle.textContent = 'Edit Note';
    if (noteIdInput) noteIdInput.value = note.id;
    if (noteTitleInput) noteTitleInput.value = note.title;
    if (noteContentInput) noteContentInput.value = note.content;
    if (noteColorInput) noteColorInput.value = note.color;
    
    openModal('note-modal');
}

function deleteNote(noteId) {
    showConfirmModal('Delete Note', 'Are you sure you want to delete this note?', () => {
        notes = notes.filter(note => note.id !== noteId);
        saveToLocalStorage('notes', notes);
        renderRecentNotes();
        renderNotes();
    });
}

// CALENDAR FUNCTIONS

function setupCalendarListeners() {
    const addEventBtn = document.getElementById('add-event-btn');
    const cancelEventBtn = document.getElementById('cancel-event');
    const eventForm = document.getElementById('event-form');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (addEventBtn) {
        addEventBtn.addEventListener('click', showAddEventModal);
    }
    
    if (cancelEventBtn) {
        cancelEventBtn.addEventListener('click', () => closeModal(document.getElementById('event-modal')));
    }
    
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEvent();
        });
    }
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

function showAddEventModal() {
    const eventModalTitle = document.getElementById('event-modal-title');
    const eventId = document.getElementById('event-id');
    const eventForm = document.getElementById('event-form');
    const eventDate = document.getElementById('event-date');
    
    if (eventModalTitle) eventModalTitle.textContent = 'Add New Event';
    if (eventId) eventId.value = '';
    if (eventForm) eventForm.reset();
    
    // Set default date to selected date
    if (eventDate) {
        const dateString = selectedDate.toISOString().split('T')[0];
        eventDate.value = dateString;
    }
    
    openModal('event-modal');
}

function saveEvent() {
    const eventId = document.getElementById('event-id').value;
    const eventTitle = document.getElementById('event-title').value;
    const eventDate = document.getElementById('event-date').value;
    const eventTime = document.getElementById('event-time').value;
    const eventDescription = document.getElementById('event-description').value;
    const eventColor = document.getElementById('event-color').value;
    
    if (!eventTitle || !eventDate) return; // Basic validation
    
    if (eventId) {
        // Update existing event
        const eventIndex = events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
            events[eventIndex] = {
                ...events[eventIndex],
                title: eventTitle,
                date: eventDate,
                time: eventTime,
                description: eventDescription,
                color: eventColor,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Add new event
        const newEvent = {
            id: generateId(),
            title: eventTitle,
            date: eventDate,
            time: eventTime,
            description: eventDescription,
            color: eventColor,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        events.push(newEvent);
    }
    
    saveToLocalStorage('events', events);
    closeModal(document.getElementById('event-modal'));
    renderCalendar();
    renderEventsForSelectedDate();
}

function renderCalendar() {
    const calendarDaysEl = document.getElementById('calendar-days');
    const calendarMonthYearEl = document.getElementById('calendar-month-year');
    
    if (!calendarDaysEl || !calendarMonthYearEl) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month and year display
    calendarMonthYearEl.textContent = new Date(year, month, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    
    // Clear calendar days
    calendarDaysEl.innerHTML = '';
    
    // Get first day of month and total days in month
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get days from previous month
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    
    // Generate previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const dayElement = createCalendarDayElement(
            daysInPreviousMonth - i,
            new Date(year, month - 1, daysInPreviousMonth - i),
            'other-month'
        );
        calendarDaysEl.appendChild(dayElement);
    }
    
    // Generate current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const classes = [];
        
        if (isSameDay(date, new Date())) {
            classes.push('today');
        }
        
        if (isSameDay(date, selectedDate)) {
            classes.push('selected');
        }
        
        const dayElement = createCalendarDayElement(day, date, classes.join(' '));
        calendarDaysEl.appendChild(dayElement);
    }
    
    // Generate next month days
    const totalDaysDisplayed = firstDayOfMonth + daysInMonth;
    const remainingCells = 42 - totalDaysDisplayed; // 6 rows of 7 days
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createCalendarDayElement(
            day,
            new Date(year, month + 1, day),
            'other-month'
        );
        calendarDaysEl.appendChild(dayElement);
    }
    
    // Update selected date display and events
    updateSelectedDateDisplay();
    renderEventsForSelectedDate();
}

function createCalendarDayElement(dayNumber, date, additionalClasses = '') {
    const dayElement = document.createElement('div');
    dayElement.className = `calendar-day ${additionalClasses}`;
    
    const dayNumberElement = document.createElement('div');
    dayNumberElement.className = 'day-number';
    dayNumberElement.textContent = dayNumber;
    dayElement.appendChild(dayNumberElement);
    
    // Add event dots
    const eventsOnThisDay = events.filter(event => isSameDay(new Date(event.date), date));
    
    eventsOnThisDay.slice(0, 3).forEach(event => {
        const eventDot = document.createElement('div');
        eventDot.className = 'event-dot';
        eventDot.style.backgroundColor = event.color;
        dayElement.appendChild(eventDot);
    });
    
    // Add more indicator if there are more than 3 events
    if (eventsOnThisDay.length > 3) {
        const moreIndicator = document.createElement('div');
        moreIndicator.className = 'more-events';
        moreIndicator.textContent = '+' + (eventsOnThisDay.length - 3);
        dayElement.appendChild(moreIndicator);
    }
    
    // Add click event
    dayElement.addEventListener('click', () => {
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Add selected class to clicked day
        dayElement.classList.add('selected');
        
        // Update selected date
        selectedDate = new Date(date);
        
        // Update selected date display and events
        updateSelectedDateDisplay();
        renderEventsForSelectedDate();
    });
    
    return dayElement;
}

function updateSelectedDateDisplay() {
    const selectedDateEl = document.getElementById('selected-date');
    if (!selectedDateEl) return;
    
    selectedDateEl.textContent = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

function renderEventsForSelectedDate() {
    const eventsForDayEl = document.getElementById('events-for-day');
    if (!eventsForDayEl) return;
    
    eventsForDayEl.innerHTML = '';
    
    const eventsOnSelectedDate = events.filter(event => 
        isSameDay(new Date(event.date), selectedDate)
    ).sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
    });
    
    if (eventsOnSelectedDate.length === 0) {
        eventsForDayEl.innerHTML = '<p class="no-events">No events scheduled for today.</p>';
        return;
    }
    
    eventsOnSelectedDate.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <div class="event-color" style="background-color: ${event.color}"></div>
            <div class="event-details">
                <h4>${event.title}</h4>
                <p>${event.description || 'No description'}</p>
            </div>
            <div class="event-time">${event.time || 'All day'}</div>
            <div class="event-actions">
                <button class="edit-event" data-id="${event.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-event" data-id="${event.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        eventItem.querySelector('.edit-event').addEventListener('click', () => {
            editEvent(event.id);
        });
        
        eventItem.querySelector('.delete-event').addEventListener('click', () => {
            deleteEvent(event.id);
        });
        
        eventsForDayEl.appendChild(eventItem);
    });
}

function editEvent(eventId) {
    const event = events.find(event => event.id === eventId);
    if (!event) return;
    
    const eventModalTitle = document.getElementById('event-modal-title');
    const eventIdInput = document.getElementById('event-id');
    const eventTitleInput = document.getElementById('event-title');
    const eventDateInput = document.getElementById('event-date');
    const eventTimeInput = document.getElementById('event-time');
    const eventDescInput = document.getElementById('event-description');
    const eventColorInput = document.getElementById('event-color');
    
    if (eventModalTitle) eventModalTitle.textContent = 'Edit Event';
    if (eventIdInput) eventIdInput.value = event.id;
    if (eventTitleInput) eventTitleInput.value = event.title;
    if (eventDateInput) eventDateInput.value = event.date;
    if (eventTimeInput) eventTimeInput.value = event.time || '';
    if (eventDescInput) eventDescInput.value = event.description || '';
    if (eventColorInput) eventColorInput.value = event.color;
    
    openModal('event-modal');
}

function deleteEvent(eventId) {
    showConfirmModal('Delete Event', 'Are you sure you want to delete this event?', () => {
        events = events.filter(event => event.id !== eventId);
        saveToLocalStorage('events', events);
        renderCalendar();
        renderEventsForSelectedDate();
    });
}
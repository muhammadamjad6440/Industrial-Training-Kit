/**
 * Industrial Training Kit - Project 1 Logic
 * Purpose: Full application functionality including navigation, state persistence, and project management.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let appState = {
        projects: JSON.parse(localStorage.getItem('itk_projects')) || [
            {
                id: 1,
                title: "Digital Entry Point",
                desc: "Building a flexible, responsive frontend using pure HTML, CSS, and JS.",
                progress: 75,
                status: "In Progress",
                locked: false,
                class: "project-1-img"
            },
            {
                id: 2,
                title: "Advanced State Management",
                desc: "Mastering complex application logic without external libraries.",
                progress: 0,
                status: "Locked",
                locked: true,
                class: "project-2-img"
            }
        ],
        darkMode: localStorage.getItem('itk_dark_mode') === 'true'
    };

    // --- Selectors ---
    const sidebarLinks = document.querySelectorAll('.nav-menu ul li a');
    const appViews = document.querySelectorAll('.app-view');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const themeToggle = document.getElementById('themeToggle');
    const modal = document.getElementById('projectModal');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const topAddBtn = document.getElementById('topAddBtn');
    const closeModal = document.querySelector('.close-modal');
    const newProjectForm = document.getElementById('newProjectForm');
    const projectGrid = document.getElementById('main-project-grid');
    const dashboardGrid = document.getElementById('dashboard-projects');
    const searchInput = document.querySelector('.search-bar input');
    
    // Notification elements
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const clearAllBtn = document.querySelector('.clear-all');
    const notificationBadge = document.querySelector('.badge');

    // --- Core Functions ---

    // 1. Navigation Logic
    function switchView(viewId) {
        appViews.forEach(view => {
            view.classList.remove('active');
            if (view.id === `${viewId}-view`) {
                view.classList.add('active');
            }
        });

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === viewId) {
                link.classList.add('active');
            }
        });

        // Close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
            sidebar.classList.remove('active');
        }
    }

    // 2. Render Projects
    function renderProjects() {
        const createCard = (proj) => `
            <article class="project-card ${proj.locked ? 'locked' : ''}">
                <div class="card-image ${proj.class || 'project-1-img'}"></div>
                <div class="card-body">
                    <span class="tag ${proj.locked ? 'tag-locked' : 'tag-active'}">${proj.status}</span>
                    <h3>${proj.title}</h3>
                    <p>${proj.desc}</p>
                    <div class="card-footer">
                        ${proj.locked ? 
                            `<span class="unlock-req">Locked Content</span>` : 
                            `<div class="progress-bar"><div class="progress" style="width: ${proj.progress}%;"></div></div>
                             <span class="progress-text">${proj.progress}% Complete</span>`
                        }
                    </div>
                </div>
            </article>
        `;

        // Update Main Project Grid
        if (projectGrid) {
            projectGrid.innerHTML = appState.projects.map(p => createCard(p)).join('');
        }

        // Update Dashboard (Recent Projects)
        if (dashboardGrid) {
            dashboardGrid.innerHTML = appState.projects.slice(0, 3).map(p => createCard(p)).join('');
        }

        // Update overall progress stat
        const totalProgress = Math.round(appState.projects.reduce((acc, curr) => acc + curr.progress, 0) / appState.projects.length);
        const progressStat = document.getElementById('overall-progress');
        if (progressStat) progressStat.textContent = `${totalProgress}%`;
    }

    // 3. Save State
    function saveState() {
        localStorage.setItem('itk_projects', JSON.stringify(appState.projects));
        localStorage.setItem('itk_dark_mode', appState.darkMode);
    }

    // --- Event Listeners ---

    // Sidebar Navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('href').substring(1);
            switchView(viewId);
        });
    });

    // Mobile Menu Toggle
    if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.add('active'));
    if (closeSidebar) closeSidebar.addEventListener('click', () => sidebar.classList.remove('active'));

    // Notification Dropdown Logic
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            const list = document.querySelector('.notification-list');
            list.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No new notifications</p>';
            if (notificationBadge) notificationBadge.style.display = 'none';
        });
    }

    // Theme Toggle
    if (themeToggle) {
        themeToggle.checked = appState.darkMode;
        if (appState.darkMode) document.body.classList.add('dark-mode');

        themeToggle.addEventListener('change', () => {
            appState.darkMode = themeToggle.checked;
            document.body.classList.toggle('dark-mode');
            saveState();
        });
    }

    // Modal Controls
    const openModal = () => modal.style.display = 'block';
    const hideModal = () => modal.style.display = 'none';

    if (addProjectBtn) addProjectBtn.addEventListener('click', openModal);
    if (topAddBtn) topAddBtn.addEventListener('click', openModal);
    if (closeModal) closeModal.addEventListener('click', hideModal);

    // Close dropdowns when clicking outside
    window.addEventListener('click', (e) => {
        if (notificationDropdown && !notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
            notificationDropdown.classList.remove('active');
        }
        if (e.target === modal) hideModal();
    });

    // Form Submission
    if (newProjectForm) {
        newProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newProj = {
                id: Date.now(),
                title: document.getElementById('projectTitle').value,
                desc: document.getElementById('projectDesc').value,
                progress: 0,
                status: "In Progress",
                locked: false,
                class: "project-1-img"
            };

            appState.projects.unshift(newProj);
            saveState();
            renderProjects();
            hideModal();
            newProjectForm.reset();
            alert('New Project Created Successfully!');
        });
    }

    // Search Logic
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.project-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });
    }

    // --- Initial Load ---
    // Handle initial URL hash if any
    const initialView = window.location.hash ? window.location.hash.substring(1) : 'dashboard';
    switchView(initialView);
    renderProjects();

    console.log('Industrial Training Kit: Full Logic Initialized');
});

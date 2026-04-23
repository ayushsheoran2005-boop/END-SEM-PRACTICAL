/* ========================================
   MAIN APP — Router + Utilities
   ======================================== */
const App = (() => {

    const pages = {
        dashboard: { title: 'Dashboard', render: () => DashboardPage.render() },
        vehicles: { title: 'Vehicles', render: () => VehiclesPage.render() },
        drivers: { title: 'Drivers', render: () => DriversPage.render() },
        trips: { title: 'Trips', render: () => TripsPage.render() },
        optimization: { title: 'Optimization', render: () => OptimizationPage.render() },
        control: { title: 'Fleet Control', render: () => ControlPage.render() },
    };

    let currentPage = 'dashboard';

    function init() {
        // Route from hash
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        navigateTo(hash, false);

        // Sidebar nav clicks
        document.getElementById('sidebarNav').addEventListener('click', e => {
            const link = e.target.closest('.nav-link');
            if (link) {
                e.preventDefault();
                navigateTo(link.dataset.page);
            }
        });

        // Mobile menu toggle
        document.getElementById('menuToggle').addEventListener('click', toggleMobileMenu);

        // Modal close
        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('modalOverlay').addEventListener('click', e => {
            if (e.target === document.getElementById('modalOverlay')) closeModal();
        });

        // Hash change
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'dashboard';
            if (hash !== currentPage) navigateTo(hash, false);
        });

        // ESC to close modal
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeModal();
        });
    }

    function navigateTo(page, updateHash = true) {
        if (!pages[page]) page = 'dashboard';

        // Cleanup old page
        if (currentPage === 'control' && typeof ControlPage !== 'undefined') {
            ControlPage.cleanup();
        }

        currentPage = page;

        // Update hash
        if (updateHash) window.location.hash = page;

        // Render page
        const container = document.getElementById('pageContainer');
        container.style.animation = 'none';
        container.offsetHeight; // trigger reflow
        container.style.animation = 'fadeIn 0.3s ease';
        container.innerHTML = pages[page].render();

        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Update mobile title
        document.getElementById('mobilePageTitle').textContent = pages[page].title;

        // Close mobile menu
        closeMobileMenu();

        // Scroll to top
        window.scrollTo(0, 0);
    }

    function toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');

        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', closeMobileMenu);
            document.body.appendChild(overlay);
        }
        overlay.classList.toggle('active', sidebar.classList.contains('open'));
    }

    function closeMobileMenu() {
        document.getElementById('sidebar').classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    function openModal(title, bodyHTML) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = bodyHTML;
        document.getElementById('modalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(() => {
            const firstInput = document.querySelector('#modalBody input, #modalBody select');
            if (firstInput) firstInput.focus();
        }, 200);
    }

    function closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    function toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', init);

    return { navigateTo, openModal, closeModal, toast };
})();

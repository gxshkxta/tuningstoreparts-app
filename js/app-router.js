/* ============================================================
   TUNINGSTOREPARTS APP — ROUTER (SPA Navigation)
   ============================================================ */

(function() {
    "use strict";

    // --- ГЛОБАЛНИ ФУНКЦИИ ЗА DRAWER ---
    function openDrawer() {
        var drawer = document.getElementById('drawer');
        var overlay = document.getElementById('drawerOverlay');
        if (drawer) drawer.classList.add('open');
        if (overlay) overlay.classList.add('open');
    }

    function closeDrawer() {
        var drawer = document.getElementById('drawer');
        var overlay = document.getElementById('drawerOverlay');
        if (drawer) drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }

    // --- ФУНКЦИЯ ЗА НАВИГАЦИЯ ---
    function navigateTo(screenId) {
        // Скриваме всички екрани
        document.querySelectorAll('.screen').forEach(function(screen) {
            screen.classList.remove('active');
        });

        // Показваме избрания
        var targetScreen = document.getElementById('screen-' + screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Обновяваме активния таб в bottom nav
        document.querySelectorAll('.nav-item').forEach(function(tab) {
            tab.classList.remove('active');
            if (tab.dataset.target === screenId) {
                tab.classList.add('active');
            }
        });

        // Скролваме до горе при смяна на екран
        var container = document.getElementById('app-screen-container');
        if (container) container.scrollTop = 0;
        
        // Затваряме drawer, ако е отворен
        closeDrawer();
    }

    // Излагаме navigateTo глобално, за да го ползваме в HTML бутони
    window.appNavigate = navigateTo;
    window.closeDrawer = closeDrawer;

    // --- ЛОГИКА ЗА BOTTOM NAV ---
    function initBottomNav() {
        document.querySelectorAll('.nav-item').forEach(function(tab) {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                var target = this.dataset.target;
                if (target) {
                    navigateTo(target);
                }
            });
        });
    }

    // --- ЛОГИКА ЗА DRAWER ---
    function initDrawer() {
        var openBtn = document.getElementById('openDrawerBtn');
        var closeBtn = document.getElementById('closeDrawerBtn');
        var overlay = document.getElementById('drawerOverlay');

        if (openBtn) openBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (overlay) overlay.addEventListener('click', closeDrawer);

        // Затваряне при клик на линк в drawer-а
        var drawer = document.getElementById('drawer');
        if (drawer) {
            drawer.querySelectorAll('.drawer-link').forEach(function(link) {
                link.addEventListener('click', closeDrawer);
            });
        }
    }

    // --- СТАРТИРАНЕ ---
    document.addEventListener('DOMContentLoaded', function() {
        // Изчакваме малко, за да сме сигурни, че DOM е готов
        setTimeout(function() {
            initBottomNav();
            initDrawer();
            
            // Отваряме Home екрана
            navigateTo('home');
        }, 50);
    });

})();
/* ============================================================
   TUNINGSTOREPARTS APP — ROUTER (SPA Navigation)
   ============================================================ */

(function() {
    "use strict";

    // Функция за превключване на екрани
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
        document.getElementById('app-screen-container').scrollTop = 0;
        
        // Затваряме drawer, ако е отворен
        closeDrawer();
    }

    // Логика за Bottom Nav
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

    // Логика за Drawer (Хамбургер)
    function initDrawer() {
        var openBtn = document.getElementById('openDrawerBtn');
        var closeBtn = document.getElementById('closeDrawerBtn');
        var overlay = document.getElementById('drawerOverlay');
        var drawer = document.getElementById('drawer');

        if (!openBtn || !drawer) return;

        function openDrawer() {
            drawer.classList.add('open');
            overlay.classList.add('open');
        }

        function closeDrawer() {
            drawer.classList.remove('open');
            overlay.classList.remove('open');
        }

        openBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (overlay) overlay.addEventListener('click', closeDrawer);

        // Затваряне при клик на линк в drawer-а
        drawer.querySelectorAll('.drawer-link').forEach(function(link) {
            link.addEventListener('click', closeDrawer);
        });
    }

    // Излагаме navigateTo глобално, за да го ползваме в HTML бутони
    window.appNavigate = navigateTo;

    // Стартиране
    document.addEventListener('DOMContentLoaded', function() {
        initBottomNav();
        initDrawer();
        
        // По подразбиране отваряме Home
        navigateTo('home');
    });

})();
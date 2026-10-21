/* ============================================================
   TUNINGSTOREPARTS APP — ROUTER
   ============================================================ */

(function() {
    "use strict";

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

    function navigateTo(screenId) {
        document.querySelectorAll('.screen').forEach(function(screen) {
            screen.classList.remove('active');
        });

        var targetScreen = document.getElementById('screen-' + screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        document.querySelectorAll('.nav-item').forEach(function(tab) {
            tab.classList.remove('active');
            if (tab.dataset.target === screenId) {
                tab.classList.add('active');
            }
        });

        var container = document.getElementById('app-screen-container');
        if (container) container.scrollTop = 0;
        
        closeDrawer();
    }

    window.appNavigate = navigateTo;
    window.closeDrawer = closeDrawer;

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

    function initDrawer() {
        var openBtn = document.getElementById('openDrawerBtn');
        var closeBtn = document.getElementById('closeDrawerBtn');
        var overlay = document.getElementById('drawerOverlay');

        if (openBtn) openBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (overlay) overlay.addEventListener('click', closeDrawer);

        var drawer = document.getElementById('drawer');
        if (drawer) {
            drawer.querySelectorAll('.drawer-link').forEach(function(link) {
                link.addEventListener('click', closeDrawer);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            initBottomNav();
            initDrawer();
            navigateTo('home');
        }, 50);
    });

})();
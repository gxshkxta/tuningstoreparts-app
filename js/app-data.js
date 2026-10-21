/* ============================================================
   TUNINGSTOREPARTS APP — DATA (Products + Search + Filter)
   ============================================================ */

(function() {
    "use strict";

    var DATA_CACHE = null;
    var allParts = [];
    var allAccessories = [];
    var currentPartsCategory = "all";
    var currentAccessoriesCategory = "all";

    function loadData(callback) {
        if (DATA_CACHE) { callback(DATA_CACHE); return; }
        fetch("data/products/products.json")
            .then(function(r) { return r.json(); })
            .then(function(data) {
                DATA_CACHE = data;
                callback(data);
            })
            .catch(function(err) { console.error("Грешка при данни:", err); });
    }

    function getIcon(isAcc) {
        if (isAcc) {
            return '<svg viewBox="0 0 24 24" fill="none" stroke="#2f4f6b" stroke-width="2" style="width:32px;height:32px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>';
        }
        return '<svg viewBox="0 0 24 24" fill="none" stroke="#2f4f6b" stroke-width="2" style="width:32px;height:32px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>';
    }

    function createProductCard(item, isAcc, index) {
        return ''
            + '<a href="#" class="product-card-app" data-item-index="' + index + '" data-type="' + (isAcc ? 'acc' : 'part') + '">'
            + '  <div class="product-img-app" style="background:#e6ecf1;">' + getIcon(isAcc) + '</div>'
            + '  <div class="product-body-app">'
            + '    <div class="product-badge-app">' + item.condition + '</div>'
            + '    <h3 class="product-title-app">' + item.title + '</h3>'
            + '    <p class="product-meta-app">' + (item.make ? item.make + ' ' + item.model : item.category) + '</p>'
            + '    <div class="product-price-app">' + item.price + ' €</div>'
            + '  </div>'
            + '</a>';
    }

    function attachCardListeners() {
        document.querySelectorAll('.product-card-app').forEach(function(card) {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                var type = this.getAttribute('data-type');
                var index = parseInt(this.getAttribute('data-item-index'), 10);
                var item = (type === 'acc') ? allAccessories[index] : allParts[index];
                if (item) openProductDetail(item, type === 'acc');
            });
        });
    }

    function openProductDetail(item, isAcc) {
        document.getElementById('detail-title').textContent = item.title;
        document.getElementById('detail-condition').textContent = item.condition;
        document.getElementById('detail-price').textContent = item.price;
        
        var meta = item.make ? (item.make + ' ' + item.model + (item.year ? ' (' + item.year + ')' : '')) : item.category;
        document.getElementById('detail-meta').textContent = meta;

        var iconBig = isAcc 
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="#2f4f6b" stroke-width="2" style="width:40px;height:40px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="#2f4f6b" stroke-width="2" style="width:40px;height:40px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>';
        
        document.getElementById('detail-icon').innerHTML = iconBig;

        if (window.appNavigate) {
            window.appNavigate('product-detail');
        }
    }

    function renderPartsFiltered() {
        var grid = document.getElementById("parts-grid");
        var searchInput = document.getElementById("search-parts");
        if (!grid) return;

        var search = searchInput ? searchInput.value.toLowerCase() : "";
        
        var filtered = allParts.map(function(p, i) { return { item: p, idx: i }; }).filter(function(obj) {
            var p = obj.item;
            var matchesSearch = p.title.toLowerCase().includes(search) || 
                                (p.make && p.make.toLowerCase().includes(search)) ||
                                (p.model && p.model.toLowerCase().includes(search));
            var matchesCategory = currentPartsCategory === "all" || p.category === currentPartsCategory;
            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 20px;">Няма намерени части.</p>';
        } else {
            grid.innerHTML = filtered.map(function(obj) { return createProductCard(obj.item, false, obj.idx); }).join("");
            attachCardListeners();
        }
    }

    function renderAccessoriesFiltered() {
        var grid = document.getElementById("accessories-grid");
        var searchInput = document.getElementById("search-accessories");
        if (!grid) return;

        var search = searchInput ? searchInput.value.toLowerCase() : "";

        var filtered = allAccessories.map(function(a, i) { return { item: a, idx: i }; }).filter(function(obj) {
            var a = obj.item;
            var matchesSearch = a.title.toLowerCase().includes(search);
            var matchesCategory = currentAccessoriesCategory === "all" || a.category === currentAccessoriesCategory;
            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 20px;">Няма намерени аксесоари.</p>';
        } else {
            grid.innerHTML = filtered.map(function(obj) { return createProductCard(obj.item, true, obj.idx); }).join("");
            attachCardListeners();
        }
    }

    function setupFilters() {
        var partsFilterContainer = document.getElementById("filter-parts");
        var partsSearch = document.getElementById("search-parts");
        
        if (partsFilterContainer) {
            var categories = ["all"].concat(Array.from(new Set(allParts.map(function(p) { return p.category; }))));
            partsFilterContainer.innerHTML = categories.map(function(cat) {
                var label = cat === "all" ? "Всички" : cat;
                var activeClass = cat === currentPartsCategory ? "active" : "";
                return '<button class="filter-chip ' + activeClass + '" data-cat="' + cat + '">' + label + '</button>';
            }).join("");

            partsFilterContainer.querySelectorAll('.filter-chip').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    currentPartsCategory = this.dataset.cat;
                    partsFilterContainer.querySelectorAll('.filter-chip').forEach(function(b) { b.classList.remove('active'); });
                    this.classList.add('active');
                    renderPartsFiltered();
                });
            });
        }

        if (partsSearch) {
            partsSearch.addEventListener('input', renderPartsFiltered);
        }

        var accFilterContainer = document.getElementById("filter-accessories");
        var accSearch = document.getElementById("search-accessories");

        if (accFilterContainer) {
            var accCategories = ["all"].concat(Array.from(new Set(allAccessories.map(function(a) { return a.category; }))));
            accFilterContainer.innerHTML = accCategories.map(function(cat) {
                var label = cat === "all" ? "Всички" : cat;
                var activeClass = cat === currentAccessoriesCategory ? "active" : "";
                return '<button class="filter-chip ' + activeClass + '" data-cat="' + cat + '">' + label + '</button>';
            }).join("");

            accFilterContainer.querySelectorAll('.filter-chip').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    currentAccessoriesCategory = this.dataset.cat;
                    accFilterContainer.querySelectorAll('.filter-chip').forEach(function(b) { b.classList.remove('active'); });
                    this.classList.add('active');
                    renderAccessoriesFiltered();
                });
            });
        }

        if (accSearch) {
            accSearch.addEventListener('input', renderAccessoriesFiltered);
        }
    }

    function initProducts() {
        loadData(function(data) {
            allParts = data.parts || [];
            allAccessories = data.accessories || [];
            
            renderPartsFiltered();
            renderAccessoriesFiltered();
            setupFilters();
        });
    }

    document.addEventListener('DOMContentLoaded', initProducts);
})();
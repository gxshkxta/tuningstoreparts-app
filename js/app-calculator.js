/* ============================================================
   TUNINGSTOREPARTS APP — CALCULATOR (Smart Logic)
   ============================================================ */

(function() {
    "use strict";

    var VEHICLES_CACHE = null;

    function loadVehicles(callback) {
        if (VEHICLES_CACHE) {
            callback(VEHICLES_CACHE);
            return;
        }
        fetch("data/vehicles/makes.json")
            .then(function(r) { return r.json(); })
            .then(function(data) {
                VEHICLES_CACHE = data;
                callback(data);
            })
            .catch(function(err) {
                console.error("Грешка при зареждане на vehicles:", err);
            });
    }

    /* ============================================================
       СКРИТО ИЗЧИСЛЯВАНЕ НА ТЕГЛО
       (Потребителят не го вижда, системата го смята сама)
       ============================================================ */
    function getSmartWeight(make, model, year) {
        var weight = 1200; // База за нормална кола
        var m = (model || "").toLowerCase();
        var mk = (make || "").toLowerCase();
        var y = parseInt(year, 10) || 2010;

        // 1. Корекция по тип кола
        if (m.match(/suv|crossover|x[1-7]|q[3-8]|tiguan|touareg|pajero|patrol|land cruiser|range rover|duster|kuga|sportage|tucson/i)) {
            weight += 400; // SUV/Джипове са по-тежки
        } else if (m.match(/van|transporter|sprinter|ducato|boxer|jumper|trafic|vivaro|expert|caddy|kangoo|partner/i)) {
            weight += 500; // Бусове
        } else if (m.match(/a8|7 series|s-class|s80|s90|passat|vectra|mondeo|superb|talisman|insignia/i)) {
            weight += 250; // Големи седани
        } else if (m.match(/a1|a2|smart|c1|107|aygo|panda|up|mii|picanto|i10|fortwo/i)) {
            weight -= 250; // Малки градски коли
        }

        // 2. Корекция по година (старите коли са по-тежки, новите - по-леки)
        if (y < 1995) weight += 150;
        else if (y < 2005) weight += 80;
        else if (y > 2015) weight -= 100;

        return weight;
    }

    /* ============================================================
       ИЗЧИСЛЯВАНЕ НА ЦЕНА
       ============================================================ */
    function calculatePrice(make, model, year, condition, region) {
        var weight = getSmartWeight(make, model, year);
        var metalPricePerTon = 190; // 190 € / тон
        
        // Базова цена = само стойността на метала
        var basePrice = (weight / 1000) * metalPricePerTon;
        
        // Добавки според състоянието
        if (condition === "В движение") basePrice += 250;
        else if (condition === "Не е в движение") basePrice += 100;
        else if (condition === "Катастрофирал") basePrice += 50;
        else if (condition === "За части") basePrice += 120;
        // За скрап – остава само цената на метала
        
        // Корекция по регион (София е с по-високи цени)
        if (region === "София") basePrice *= 1.1;
        else if (region === "Пловдив" || region === "Варна" || region === "Бургас") basePrice *= 1.0;
        else basePrice *= 0.9; // По-малки градове
        
        // Диапазон ±10%
        var min = Math.round((basePrice * 0.9) / 10) * 10;
        var max = Math.round((basePrice * 1.1) / 10) * 10;
        
        return { min: min, max: max };
    }

    function initCalculator() {
        var form = document.getElementById('calc-form');
        if (!form) return;

        var makeSelect = document.getElementById('calc-make');
        var modelSelect = document.getElementById('calc-model');
        var yearSelect = document.getElementById('calc-year');
        var formCard = form.closest('.card');
        var resultCard = document.getElementById('calc-result');

        if (!makeSelect || !modelSelect || !yearSelect) return;

        window.resetCalculator = function() {
            form.reset();
            modelSelect.innerHTML = '<option value="">— Първо изберете марка —</option>';
            modelSelect.disabled = true;
            yearSelect.innerHTML = '<option value="">— Модел —</option>';
            yearSelect.disabled = true;
            resultCard.classList.add('hidden');
            formCard.classList.remove('hidden');
        };

        loadVehicles(function(data) {
            var makes = data.makes || [];

            makeSelect.innerHTML = '<option value="">— Изберете марка —</option>';
            makes.forEach(function(make) {
                var opt = document.createElement('option');
                opt.value = make.name;
                opt.textContent = make.name;
                makeSelect.appendChild(opt);
            });

            makeSelect.addEventListener('change', function() {
                var selectedMake = makes.find(function(m) { return m.name === makeSelect.value; });

                if (!selectedMake) {
                    modelSelect.innerHTML = '<option value="">— Първо изберете марка —</option>';
                    modelSelect.disabled = true;
                    yearSelect.innerHTML = '<option value="">— Модел —</option>';
                    yearSelect.disabled = true;
                    return;
                }

                modelSelect.innerHTML = '<option value="">— Изберете модел —</option>';
                selectedMake.models.forEach(function(model) {
                    var opt = document.createElement('option');
                    opt.value = model.name;
                    opt.textContent = model.name;
                    opt.dataset.yearFrom = model.yearFrom || "";
                    opt.dataset.yearTo = model.yearTo || "";
                    modelSelect.appendChild(opt);
                });
                
                modelSelect.disabled = false;
                yearSelect.innerHTML = '<option value="">— Модел —</option>';
                yearSelect.disabled = true;
            });

            modelSelect.addEventListener('change', function() {
                var opt = modelSelect.options[modelSelect.selectedIndex];
                if (!opt || !opt.value) {
                    yearSelect.disabled = true;
                    yearSelect.innerHTML = '<option value="">— Модел —</option>';
                    return;
                }

                var yf = parseInt(opt.dataset.yearFrom, 10);
                var yt = parseInt(opt.dataset.yearTo, 10) || new Date().getFullYear();
                if (isNaN(yf)) yf = 1980;

                yearSelect.innerHTML = '<option value="">— Изберете година —</option>';
                for (var y = yt; y >= yf; y--) {
                    var o = document.createElement('option');
                    o.value = y;
                    o.textContent = y;
                    yearSelect.appendChild(o);
                }
                yearSelect.disabled = false;
            });
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var make = makeSelect.value;
            var model = modelSelect.value;
            var year = yearSelect.value;
            var condition = document.getElementById('calc-condition').value;
            var region = document.getElementById('calc-region').value;
            
            if (!make || !model || !year || !condition || !region) {
                alert("Моля, попълнете всички полета.");
                return;
            }

            // Изчисляваме
            var price = calculatePrice(make, model, year, condition, region);

            // Попълваме резултата (БЕЗ да показваме килограми на потребителя!)
            document.getElementById('result-vehicle-info').textContent = make + ' ' + model + ' (' + year + ')';
            document.getElementById('result-price').textContent = price.min + ' — ' + price.max + ' €';


            formCard.classList.add('hidden');
            resultCard.classList.remove('hidden');
            
            document.getElementById('app-screen-container').scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', initCalculator);
})();
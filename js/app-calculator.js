/* ============================================================
   TUNINGSTOREPARTS APP — CALCULATOR (Final Fix)
   ============================================================ */

(function() {
    "use strict";

    console.log("🚀 app-calculator.js се зарежда...");

    var VEHICLES_CACHE = null;

    function loadVehicles(callback) {
        if (VEHICLES_CACHE) {
            console.log("📦 Vehicles от кеша");
            callback(VEHICLES_CACHE);
            return;
        }
        fetch("data/vehicles/makes.json")
            .then(function(r) { return r.json(); })
            .then(function(data) {
                console.log("✅ Vehicles заредени:", data.makes ? data.makes.length : 0, "марки");
                VEHICLES_CACHE = data;
                callback(data);
            })
            .catch(function(err) {
                console.error("❌ Грешка при vehicles:", err);
            });
    }

    function getSmartWeight(make, model, year) {
        var weight = 1200;
        var m = (model || "").toLowerCase();
        var y = parseInt(year, 10) || 2010;

        if (m.match(/suv|crossover|x[1-7]|q[3-8]|tiguan|touareg|pajero|patrol|land cruiser|range rover|duster|kuga|sportage|tucson/i)) {
            weight += 400;
        } else if (m.match(/van|transporter|sprinter|ducato|boxer|jumper|trafic|vivaro|expert|caddy|kangoo|partner/i)) {
            weight += 500;
        } else if (m.match(/a8|7 series|s-class|s80|s90|passat|vectra|mondeo|superb|talisman|insignia/i)) {
            weight += 250;
        } else if (m.match(/a1|a2|smart|c1|107|aygo|panda|up|mii|picanto|i10|fortwo/i)) {
            weight -= 250;
        }

        if (y < 1995) weight += 150;
        else if (y < 2005) weight += 80;
        else if (y > 2015) weight -= 100;

        return weight;
    }

    function calculatePrice(make, model, year, condition, region) {
        var weight = getSmartWeight(make, model, year);
        var metalPricePerTon = 190;
        var basePrice = (weight / 1000) * metalPricePerTon;

        if (condition === "В движение") basePrice += 120;
        else if (condition === "Не е в движение") basePrice += 50; // ← ПОПРАВЕНО
        else if (condition === "Катастрофирал") basePrice += 25;
        else if (condition === "За части") basePrice += 60;

        if (region === "София") basePrice *= 1.1;
        else if (region === "Пловдив" || region === "Варна" || region === "Бургас") basePrice *= 1.0;
        else basePrice *= 0.9;

        var min = Math.round((basePrice * 0.9) / 10) * 10;
        var max = Math.round((basePrice * 1.1) / 10) * 10;

        return { min: min, max: max };
    }

    window.closeResultModal = function() {
        var modal = document.getElementById("resultModal");
        var reqForm = document.getElementById("request-form");
        if (modal) modal.classList.add("hidden");
        if (reqForm) reqForm.reset();
    };

    function initCalculator() {
        console.log("🔍 initCalculator() се извиква");

        var form = document.getElementById("calc-form");
        console.log("📋 Форма намерена:", !!form);

        if (!form) {
            console.error("❌ ФОРМАТА НЕ Е НАМЕРЕНА! Няма да закача submit.");
            return;
        }

        var makeSelect = document.getElementById("calc-make");
        var modelSelect = document.getElementById("calc-model");
        var yearSelect = document.getElementById("calc-year");

        console.log("🔍 Make select:", !!makeSelect);
        console.log("🔍 Model select:", !!modelSelect);
        console.log("🔍 Year select:", !!yearSelect);

        if (!makeSelect || !modelSelect || !yearSelect) {
            console.error("❌ Липсват select елементи!");
            return;
        }

        var modalEl = document.getElementById("resultModal");
        console.log("🔍 Modal:", !!modalEl);
        if (modalEl) modalEl.classList.add("hidden");

        console.log("🔧 Закачам submit listener...");

        form.addEventListener("submit", function(e) {
            console.log("🎯 SUBMIT задействан!");
            e.preventDefault();
            e.stopPropagation();

            var make = makeSelect.value;
            var model = modelSelect.value;
            var year = yearSelect.value;
            var condition = document.getElementById("calc-condition").value;
            var region = document.getElementById("calc-region").value;

            console.log("📊 Данни:", { make, model, year, condition, region });

            if (!make || !model || !year || !condition || !region) {
                alert("Моля, попълнете всички полета.");
                return;
            }

            var price = calculatePrice(make, model, year, condition, region);
            console.log("💰 Цена:", price);

            var infoEl = document.getElementById("result-vehicle-info");
            var priceEl = document.getElementById("result-price");

            if (infoEl) infoEl.textContent = make + " " + model + " (" + year + ")";
            if (priceEl) priceEl.textContent = price.min + " — " + price.max + " €";
            if (modalEl) {
                modalEl.classList.remove("hidden");
                console.log("✅ Модалът е показан!");
            }
        });

        console.log("✅ Submit listener закачен успешно!");

        var reqForm = document.getElementById("request-form");
        if (reqForm) {
            reqForm.addEventListener("submit", function(e) {
                e.preventDefault();
                var name = document.getElementById("req-name").value;
                var phone = document.getElementById("req-phone").value;
                alert("Благодарим, " + name + "! Ще се свържем с вас на " + phone + " до 1 час.");
                window.closeResultModal();
            });
        }

        loadVehicles(function(data) {
            var makes = data.makes || [];
            console.log("📋 Попълвам", makes.length, "марки");

            makeSelect.innerHTML = '<option value="">— Изберете марка —</option>';
            makes.forEach(function(make) {
                var opt = document.createElement("option");
                opt.value = make.name;
                opt.textContent = make.name;
                makeSelect.appendChild(opt);
            });

            makeSelect.addEventListener("change", function() {
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
                    var opt = document.createElement("option");
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

            modelSelect.addEventListener("change", function() {
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
                    var o = document.createElement("option");
                    o.value = y;
                    o.textContent = y;
                    yearSelect.appendChild(o);
                }
                yearSelect.disabled = false;
            });
        });
    }

    // ГАРАНТИРАНО ИЗВИКВАНЕ
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCalculator);
    } else {
        initCalculator();
    }
    window.addEventListener("load", initCalculator);
})();
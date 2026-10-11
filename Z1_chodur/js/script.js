/**
 * script.js - Kompletná interaktívna logika pre osobnú vizitku (FEI STU)
 */

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.schedule-table')) {
        initSchedulePage();
    }

    if (document.getElementById('map')) {
        initMapPage();
    }
});

/* =================================================================
   1. SCHEDULE LOGIC (Rozvrh, Progress bar a Prebiehajúca/Najbližšia hodina)
   ================================================================= */
function initSchedulePage() {
    const SEMESTER_START = new Date('2026-09-21T07:00:00');
    const SEMESTER_END = new Date('2026-12-18T21:00:00');

    const progressBar = document.getElementById('semester-progress-bar');
    const progressText = document.getElementById('semester-progress-text');

    if (progressBar && progressText) {
        const now = new Date();
        const total = SEMESTER_END.getTime() - SEMESTER_START.getTime();
        const elapsed = now.getTime() - SEMESTER_START.getTime();

        let pct = (elapsed / total) * 100;
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;

        progressBar.style.width = `${pct.toFixed(1)}%`;

        if (now < SEMESTER_START) {
            progressText.textContent = 'Semester sa ešte nezačal.';
        } else if (now > SEMESTER_END) {
            progressText.textContent = 'Semester sa už skončil.';
        } else {
            progressText.textContent = `Uplynulo ${pct.toFixed(1)}% semestra.`;
        }
    }

    checkCurrentAndNextLesson();

    const buttons = document.querySelectorAll('.filter-btn');
    const cells = document.querySelectorAll('.schedule-table td[data-type]');
    const emptyMsg = document.getElementById('filter-empty-message');

    if (buttons.length > 0) {
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('filter-btn--active'));
                btn.classList.add('filter-btn--active');

                const filter = btn.getAttribute('data-filter');
                let count = 0;

                cells.forEach(cell => {
                    if (filter === 'all' || cell.getAttribute('data-type') === filter) {
                        cell.style.opacity = '1';
                        cell.style.filter = 'none';
                        count++;
                    } else {
                        cell.style.opacity = '0.2';
                        cell.style.filter = 'grayscale(100%)';
                    }
                });

                if (emptyMsg) {
                    emptyMsg.style.display = (count === 0) ? 'block' : 'none';
                }
            });
        });
    }
}

function checkCurrentAndNextLesson() {
    const statusBox = document.getElementById('current-lesson-status');
    if (!statusBox) return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const dayNames = { 1: 'v Pondelok', 2: 'v Utorok', 3: 'v Stredu', 4: 'vo Štvrtok', 5: 'v Piatok' };

    const scheduleItems = [
        { day: 1, startMins: 9 * 60, timeStr: '9:00', name: 'Operačné systémy (Cvičenie)' },
        { day: 1, startMins: 11 * 60, timeStr: '11:00', name: 'Webové technológie 1 (Cvičenie)' },
        { day: 1, startMins: 13 * 60, timeStr: '13:00', name: 'Telesná kultúra 5' },

        { day: 2, startMins: 8 * 60, timeStr: '8:00', name: 'Analýza a zložitosť algoritmov (Prednáška)' },
        { day: 2, startMins: 10 * 60, timeStr: '10:00', name: 'Webové technológie 1 (Prednáška)' },
        { day: 2, startMins: 15 * 60, timeStr: '15:00', name: 'Softvérové inžinierstvo (Prednáška)' },
        { day: 2, startMins: 17 * 60, timeStr: '17:00', name: 'Softvérové inžinierstvo (Cvičenie)' },

        { day: 3, startMins: 8 * 60, timeStr: '8:00', name: 'Operačné systémy (Prednáška)' },
        { day: 3, startMins: 10 * 60, timeStr: '10:00', name: 'Analýza a zložitosť algoritmov (Prednáška)' },
        { day: 3, startMins: 13 * 60, timeStr: '13:00', name: 'Webové technológie 1 (Prednáška)' },
        { day: 3, startMins: 16 * 60, timeStr: '16:00', name: 'Počítačové siete (Cvičenie)' },

        { day: 4, startMins: 11 * 60, timeStr: '11:00', name: 'Softvérové inžinierstvo (Cvičenie)' },
        { day: 4, startMins: 13 * 60, timeStr: '13:00', name: 'Počítačové siete (Prednáška)' },

        { day: 5, startMins: 8 * 60, timeStr: '8:00', name: 'Analýza a zložitosť algoritmov (Cvičenie)' }
    ];

    const timeSlots = [
        { id: 1, start: 7 * 60, end: 7 * 60 + 50, name: '7:00 - 7:50' },
        { id: 2, start: 8 * 60, end: 8 * 60 + 50, name: '8:00 - 8:50' },
        { id: 3, start: 9 * 60, end: 9 * 60 + 50, name: '9:00 - 9:50' },
        { id: 4, start: 10 * 60, end: 10 * 60 + 50, name: '10:00 - 10:50' },
        { id: 5, start: 11 * 60, end: 11 * 60 + 50, name: '11:00 - 11:50' },
        { id: 6, start: 12 * 60, end: 12 * 60 + 50, name: '12:00 - 12:50' },
        { id: 7, start: 13 * 60, end: 13 * 60 + 50, name: '13:00 - 13:50' },
        { id: 8, start: 14 * 60, end: 14 * 60 + 50, name: '14:00 - 14:50' },
        { id: 9, start: 15 * 60, end: 15 * 60 + 50, name: '15:00 - 15:50' },
        { id: 10, start: 16 * 60, end: 16 * 60 + 50, name: '16:00 - 16:50' },
        { id: 11, start: 17 * 60, end: 17 * 60 + 50, name: '17:00 - 17:50' },
        { id: 12, start: 18 * 60, end: 18 * 60 + 50, name: '18:00 - 18:50' },
        { id: 13, start: 19 * 60, end: 19 * 60 + 50, name: '19:00 - 19:50' },
        { id: 14, start: 20 * 60, end: 20 * 60 + 50, name: '20:00 - 20:50' }
    ];

    let currentSlot = null;
    if (currentDay >= 1 && currentDay <= 5) {
        currentSlot = timeSlots.find(s => currentMins >= s.start && currentMins <= s.end);
    }

    if (currentSlot) {
        statusBox.innerHTML = `<strong>Práve prebieha výučba:</strong> Čas ${currentSlot.name}.`;
        statusBox.style.backgroundColor = '#d1fae5';
        statusBox.style.color = '#065f46';
        return;
    }

    let nextLesson = null;
    if (currentDay >= 1 && currentDay <= 5) {
        nextLesson = scheduleItems.find(item => item.day === currentDay && item.startMins > currentMins);
    }

    if (!nextLesson) {
        for (let i = 1; i <= 7; i++) {
            let targetDay = (currentDay + i) % 7;
            if (targetDay === 0) targetDay = 7;
            if (targetDay > 5) continue;

            nextLesson = scheduleItems.find(item => item.day === targetDay);
            if (nextLesson) break;
        }
    }

    if (nextLesson) {
        const dayStr = dayNames[nextLesson.day];
        statusBox.innerHTML = `<strong>Výučba aktuálne neprebieha.</strong> Najbližšia hodina bude <strong>${dayStr} o ${nextLesson.timeStr}</strong> (${nextLesson.name}).`;
    } else {
        statusBox.innerHTML = `<strong>Výučba aktuálne neprebieha.</strong> Najbližšia hodina bude <strong>v Pondelok o 9:00</strong> (Operačné systémy).`;
    }

    statusBox.style.backgroundColor = '#e0f2fe';
    statusBox.style.color = '#0369a1';
}

/* =================================================================
   2. MAP LOGIC
   ================================================================= */
function initMapPage() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const instructions = document.getElementById('map-instructions');
    const distanceResult = document.getElementById('distance-result');
    const pointsListEl = document.getElementById('map-points-list');

    const schoolCoord = { lat: 48.1518, lng: 17.0733, name: 'FEI STU Bratislava' };
    const homeCoord = { lat: 48.3324, lng: 19.6671, name: 'Bydlisko (Lučenec)' };

    const map = L.map('map').setView([48.25, 18.5], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let markersData = [
        { lat: schoolCoord.lat, lng: schoolCoord.lng, name: schoolCoord.name },
        { lat: homeCoord.lat, lng: homeCoord.lng, name: homeCoord.name }
    ];

    const savedPoints = localStorage.getItem('mapCustomPoints');
    if (savedPoints) {
        try {
            markersData = markersData.concat(JSON.parse(savedPoints));
        } catch (e) {
            console.error('Error parsing localStorage', e);
        }
    }

    let leafletMarkers = [];
    let selectedPointsForDistance = [];
    let polylineLayer = null;

    function renderMarkersAndList() {
        leafletMarkers.forEach(m => map.removeLayer(m));
        leafletMarkers = [];

        if (pointsListEl) pointsListEl.innerHTML = '';

        markersData.forEach((data, index) => {
            const marker = L.marker([data.lat, data.lng]).addTo(map);
            marker.bindPopup(`<b>${data.name}</b><br><button onclick="window.selectPointForDistance(${index})" style="margin-top:5px; padding:4px 8px; cursor:pointer;">Vybrať na meranie</button>`);
            leafletMarkers.push(marker);

            if (pointsListEl) {
                const li = document.createElement('li');
                li.className = 'map-point-item';
                li.innerHTML = `
                    <span><strong>${data.name}</strong> (${data.lat.toFixed(4)}, ${data.lng.toFixed(4)})</span>
                    <button class="map-select-btn" onclick="window.selectPointForDistance(${index})">Vybrať</button>
                `;
                pointsListEl.appendChild(li);
            }
        });

        const customCount = markersData.length - 2;
        if (instructions) {
            if (customCount === 0) {
                instructions.textContent = 'Prázdny stav: Zatiaľ ste nepridali žiadne vlastné body. Kliknutím kamkoľvek do mapy pridáte nový bod.';
            } else {
                instructions.textContent = `Máte pridaných ${customCount} vlastných bodov. Kliknutím na mapu pridáte ďalší alebo vyberte body zo zoznamu.`;
            }
        }
    }

    window.selectPointForDistance = function(index) {
        const pt = markersData[index];
        selectedPointsForDistance.push(pt);

        if (selectedPointsForDistance.length === 1) {
            distanceResult.textContent = `Vybraný 1. bod: ${pt.name}. Teraz vyberte druhý bod zo zoznamu alebo mapy.`;
        } else if (selectedPointsForDistance.length === 2) {
            const p1 = selectedPointsForDistance[0];
            const p2 = selectedPointsForDistance[1];

            const distanceKm = calculateHaversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
            distanceResult.textContent = `Vzdialenosť medzi ${p1.name} a ${p2.name} je približne ${distanceKm.toFixed(2)} km.`;

            if (polylineLayer) map.removeLayer(polylineLayer);
            polylineLayer = L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], { color: '#ff6600', weight: 4 }).addTo(map);
            map.fitBounds(polylineLayer.getBounds(), { padding: [50, 50] });

            selectedPointsForDistance = [];
        }
    };

    map.on('click', (e) => {
        const name = prompt('Zadajte názov nového bodu:', `Bod ${markersData.length + 1}`);
        if (name && name.trim() !== '') {
            markersData.push({ lat: e.latlng.lat, lng: e.latlng.lng, name: name.trim() });
            localStorage.setItem('mapCustomPoints', JSON.stringify(markersData.slice(2)));
            renderMarkersAndList();
        }
    });

    renderMarkersAndList();
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
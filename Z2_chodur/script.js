const CACHE_KEY = 'obedoveMenu_v3';
const DNI = ['Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok'];

const RESTAURACIE = [
    { id: 'eatandmeet', nazov: 'Eat & Meet', url: 'https://eatandmeet.sk/tyzdenne-menu', lokalnyUrl: 'data/eatandmeet.html', adresa: 'Staré Grunty 36, Bratislava', parser: parsujEatAndMeet },
    { id: 'hospoda', nazov: 'Naše Hospoda', url: 'https://nasehospoda-karloveska.sk/#menu', lokalnyUrl: 'data/nacehospoda.html', adresa: 'Karloveská, Bratislava – Karlova Ves', parser: parsujHospodu },
    { id: 'machnac', nazov: 'Machnáč', url: 'https://machnac.sk/denneMenu.html', lokalnyUrl: 'data/machnac.html', adresa: '' /* TODO: doplň adresu */, parser: parsujMachnac }
];

let data = {};
let zvolenyDen = 'day-1';
let rezim = 'den';

function zistiIdDna(t) {
    if (!t) return null;
    t = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const i = ['pondel', 'utor', 'stred', 'stvrt', 'piat', 'sobot', 'nedel'].findIndex(k => t.includes(k));
    return i === -1 ? null : 'day-' + (i + 1);
}
const cisty = t => (t || '').replace(/\s+/g, ' ').trim();
function text(rodic, sel) { const e = rodic.querySelector(sel); return e ? cisty(e.textContent) : ''; }
function el(tag, trieda, obsah) {
    const e = document.createElement(tag);
    if (trieda) e.className = trieda;
    if (obsah !== undefined) e.textContent = obsah;
    return e;
}

function kategoria(typ) {
    const t = (typ || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/polievk/.test(t)) return 'polievka';
    if (/sladk/.test(t)) return 'sladke';
    if (/mucn/.test(t)) return 'mucne';
    if (/vegetarian/.test(t)) return 'vegetarianske';
    if (/salat/.test(t)) return 'salat';
    return 'hlavne';
}
function jedlo(den, typ, nazov, cena) { return nazov ? { den, typ, nazov, cena } : null; }

function parsujEatAndMeet(doc) {
    const out = [];
    doc.querySelectorAll('.tab-pane').forEach((denHtml, i) => {
        if (i > 6) return;
        denHtml.querySelectorAll('.menu-details').forEach(p =>
            out.push(jedlo('day-' + (i + 1), text(p, 'h4'), text(p, '.menu-description'), text(p, '.price'))));
    });
    return out;
}

function parsujHospodu(doc) {
    const out = [];
    doc.querySelectorAll('article').forEach(denHtml => {
        const den = zistiIdDna(text(denHtml, '.uppercase'));
        if (!den) return;
        const videne = new Set();
        denHtml.querySelectorAll('.divide-y > div').forEach(p => {
            const nazov = text(p, '.min-w-0 .font-bold');
            if (videne.has(nazov)) return;
            videne.add(nazov);
            out.push(jedlo(den, text(p, '.text-zinc-400 span') || text(p, '.text-zinc-400'), nazov, text(p, '.shrink-0')));
        });
    });
    return out;
}

function parsujMachnac(doc) {
    const ceny = { polievka: '', hlavne: '', menu: '' };
    doc.querySelectorAll('.denne_menu_ceny h4').forEach(h => {
        const t = cisty(h.textContent);
        const cena = (t.match(/^[\d.,]+\s*€/) || [''])[0];
        if (!cena) return;
        if (/menu polievka/i.test(t)) ceny.polievka = cena;
        else if (/bez polievky/i.test(t)) ceny.hlavne = cena;
        else if (/polievka a/i.test(t)) ceny.menu = cena;
    });
    const out = [];
    if (ceny.menu) out.info = 'Hlavné jedlo, polievka a nápoj spolu: ' + ceny.menu;
    let den = null, poradie = 0;
    doc.querySelectorAll('.menu-container h2, .menu-container .item-menu').forEach(p => {
        if (p.tagName === 'H2') { den = zistiIdDna(cisty(p.textContent)); poradie = 0; return; }
        const nazov = text(p, 'h4');
        if (!den || !nazov) return;
        const jePolievka = poradie++ === 0;
        out.push(jedlo(den, jePolievka ? 'Polievka' : 'Hlavné jedlo', nazov,
            jePolievka ? ceny.polievka : ceny.hlavne));
    });
    return out;
}

async function nacitajRestauraciu(r) {
    try {
        const odpoved = await fetch(r.lokalnyUrl);
        if (!odpoved.ok) throw new Error('Stránka nie je dostupná (' + odpoved.status + ')');
        const doc = new DOMParser().parseFromString(await odpoved.text(), 'text/html');
        const vysledok = r.parser(doc);
        const jedla = vysledok.filter(Boolean);
        if (jedla.length === 0) throw new Error('Menu sa nepodarilo nájsť, štruktúra stránky sa asi zmenila');
        data[r.id] = { jedla, info: vysledok.info || '', aktualizovane: new Date().toISOString(), chyba: null };
    } catch (e) {
        data[r.id] = { jedla: [], aktualizovane: new Date().toISOString(), chyba: e.message };
    }
}

async function nacitajVsetko() {
    nastavNacitavanie(true);
    await Promise.all(RESTAURACIE.map(nacitajRestauraciu));
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    nastavNacitavanie(false);
    vykresli();
}

function dataSuAktualne() {
    try {
        const ulozene = JSON.parse(localStorage.getItem(CACHE_KEY));
        const dnes = new Date().toDateString();
        const ok = ulozene && RESTAURACIE.every(r => ulozene[r.id] && !ulozene[r.id].chyba &&
            new Date(ulozene[r.id].aktualizovane).toDateString() === dnes);
        if (ok) data = ulozene;
        return !!ok;
    } catch (e) { return false; }
}

function nastavNacitavanie(on) {
    document.getElementById('nacitavanie').hidden = !on;
    document.querySelectorAll('#ovladanie button').forEach(b => b.disabled = on);
}

function aktivneRestauracie() {
    const zaskrtnute = [...document.querySelectorAll('.filter-restauracie:checked')].map(c => c.value);
    return RESTAURACIE.filter(r => zaskrtnute.includes(r.id));
}

function vytvorKartu(r, dni) {
    const d = data[r.id] || { jedla: [], chyba: null };
    const karta = el('article', 'karta');
    const hlavicka = el('header', 'karta-hlavicka');
    hlavicka.appendChild(el('h3', null, r.nazov));
    if (r.adresa) hlavicka.appendChild(el('p', 'adresa', r.adresa));
    if (r.url) {
        const odkaz = el('a', 'zdroj-odkaz', 'Pôvodná stránka ↗');
        odkaz.href = r.url; odkaz.target = '_blank'; odkaz.rel = 'noopener';
        hlavicka.appendChild(odkaz);
    }
    if (d.aktualizovane) {
        const t = el('time', 'aktualizacia', 'Aktualizované: ' + new Date(d.aktualizovane).toLocaleString('sk-SK'));
        t.dateTime = d.aktualizovane;
        hlavicka.appendChild(t);
    }
    karta.appendChild(hlavicka);
    if (d.info) karta.appendChild(el('p', 'karta-info', d.info));

    if (d.chyba) { karta.appendChild(el('p', 'sprava sprava-chyba', 'Menu sa nepodarilo načítať: ' + d.chyba)); return karta; }

    dni.forEach(den => {
        const jedla = d.jedla.filter(j => j.den === den);
        const blok = el('section', 'den-blok');
        if (dni.length > 1) blok.appendChild(el('h4', null, DNI[Number(den.slice(4)) - 1]));
        if (jedla.length === 0) blok.appendChild(el('p', 'sprava', 'Menu na tento deň nie je k dispozícii.'));
        jedla.forEach(j => {
            const riadok = el('div', 'jedlo jedlo-' + kategoria(j.typ));
            const popis = el('div', 'jedlo-popis');
            popis.append(el('span', 'jedlo-typ', j.typ), el('span', 'jedlo-nazov', j.nazov));
            riadok.appendChild(popis);
            if (j.cena) riadok.appendChild(el('span', 'cena', j.cena));
            blok.appendChild(riadok);
        });
        karta.appendChild(blok);
    });
    return karta;
}

function vykresli() {
    const obsah = document.getElementById('obsah-menu');
    obsah.replaceChildren();
    document.querySelectorAll('#tlacidla-dni button').forEach(b =>
        b.classList.toggle('active', rezim === 'den' && b.dataset.den === zvolenyDen));
    document.getElementById('prepni-tyzden').classList.toggle('active', rezim === 'tyzden');

    const dni = rezim === 'tyzden' ? DNI.map((_, i) => 'day-' + (i + 1)) : [zvolenyDen];
    const restauracie = aktivneRestauracie();
    if (restauracie.length === 0) obsah.appendChild(el('p', 'sprava', 'Zvoľ aspoň jednu reštauráciu.'));
    restauracie.forEach(r => {
        const stlpec = el('div', rezim === 'tyzden' ? 'col-12 col-xl-4' : 'col-12 col-lg-4');
        stlpec.appendChild(vytvorKartu(r, dni));
        obsah.appendChild(stlpec);
    });
}

function pripravOvladanie() {
    RESTAURACIE.forEach(r => {
        const label = el('label', 'filter-polozka');
        const c = $('<input type="checkbox" class="filter-restauracie" checked>').val(r.id).on('change', vykresli);
        label.append(c[0], ' ' + r.nazov);
        $('#filtre').append(label);
    });
    $('#tlacidla-dni button[data-den]').on('click', function () {
        zvolenyDen = $(this).data('den'); rezim = 'den'; vykresli();
    });
    $('#prepni-tyzden').on('click', () => { rezim = 'tyzden'; vykresli(); });
    $('#aktualizovat').on('click', nacitajVsetko);
    $('#vymazat').on('click', () => {
        localStorage.removeItem(CACHE_KEY); data = {}; vykresli();
        $('#stav').text('Uložené dáta boli vymazané. Použi „Aktualizovať menu“.');
    });
}

function inicializuj() {
    pripravOvladanie();
    const den = new Date().getDay();
    if (den >= 1 && den <= 5) zvolenyDen = 'day-' + den;
    else document.getElementById('stav').textContent = 'Cez víkend menu nie je k dispozícii, zobrazujeme pondelok.';
    if (dataSuAktualne()) vykresli(); else nacitajVsetko();
}
document.addEventListener('DOMContentLoaded', inicializuj);
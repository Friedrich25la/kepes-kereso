/* menu.js - FINAL JAVÍTOTT verzió (Vesszők kezelése javítva) */

// 1. A FŐMENÜ SORRENDJE
const MAIN_MENU_ORDER = [
    { name: "Új termékek", url: "https://www.trinexus.hu/shop_artspec.php?artspec=2", type: "manual" },
    { name: "Akciók", url: "https://www.trinexus.hu/akcios-termekek", type: "manual" },
    { name: "Képes kereső", url: "https://friedrich25la.github.io/kepes-kategoriakereso/?source_cat=554948", type: "manual" },
    { name: "RIB hajó", url: "https://friedrich25la.github.io/rib-hajok/?source_cat=121689", type: "manual" },
    { name: "Haswing", url: "https://friedrich25la.github.io/haswing-landing/#top?source_cat=329206", type: "manual" },
    { name: "Csomagajánlatok", url: "https://www.trinexus.hu/Csomagajanlatok", type: "manual" },
    { name: "Kiárusítás alatt", url: "https://www.trinexus.hu/kiarusitas", type: "manual" },

    // Itt kezdődnek a kategóriák, amiknek eddig nem volt linkje:
    { name: "Kötelező felszerelés", url: "https://www.trinexus.hu/kotelezo-felszereles", type: "cat" },
    { name: "Hajó", url: "https://www.trinexus.hu/hajo", type: "cat" },
    { name: "Gumicsónak", url: "https://www.trinexus.hu/gumicsonak", type: "cat" },
    { name: "Csónak", url: "https://www.trinexus.hu/csonak-kajak-kenu", type: "cat" },
    { name: "Robbanómotor", url: "https://www.trinexus.hu/robbanomotor", type: "cat" },
    { name: "Elektromos csónakmotor", url: "https://www.trinexus.hu/elektromos-csonakmotor", type: "cat" },
    { name: "Navigáció, autopilot, rádió", url: "https://www.trinexus.hu/navigacio-autopilot-radio", type: "cat" },
    { name: "Kajak, kenu és kiegészítőik", url: "https://www.trinexus.hu/csonak-kajak-kenu-kiegeszitok", type: "cat" },
    { name: "Halradar", url: "https://www.trinexus.hu/halradar", type: "cat" },
    { name: "Hajófelszerelés", url: "https://www.trinexus.hu/hajofelszereles", type: "cat" },
    { name: "Festék, vegyi és karbantartó anyag", url: "https://www.trinexus.hu/festek-vegyi-karbantarto-anyag", type: "cat" },
    { name: "Tréler, tartozék", url: "https://www.trinexus.hu/trelek-tartozek", type: "cat" },
    { name: "Elektronika, audió, napelem", url: "https://www.trinexus.hu/elektronika", type: "cat" },
    { name: "Vízisport", url: "https://www.trinexus.hu/vizisport", type: "cat" },
    { name: "Horgász termékek", url: "https://www.trinexus.hu/horgasztermek", type: "cat" },
    { name: "Garmin okosórák", url: "https://www.trinexus.hu/Garmin-Okosorak", type: "cat" },

    { name: "Jetski", url: "https://www.trinexus.hu/Jetski", type: "manual" },
    { name: "Vitorlás termékek", url: "https://www.trinexus.hu/vitorlas-termek", type: "manual" },

    { name: "Ajándéktárgyak, oktatási anyagok", url: "https://www.trinexus.hu/ajandektargy", type: "cat" },
    { name: "Ruházat", url: "https://www.trinexus.hu/ruhazat", type: "cat" }
];

// 2. ADATBÁZIS - JAVÍTVA (Idézőjelek hozzáadva a vesszős nevekhez)
const CSV_DATA = `ID,Szülő kategória,Kategória neve,URL
1,Kötelező felszerelés,0 - 6 méter közötti hajótest,https://www.trinexus.hu/kotelezo-felszereles-0-6-m-kozotti-hajotestek
2,Kötelező felszerelés,6 - 12 méter közötti hajótest,https://www.trinexus.hu/kotelezo-felszereles-6-12-m-kozotti-hajotestek
3,Kötelező felszerelés,12 - 15 méter közötti hajótest,https://www.trinexus.hu/kotelezo-felszereles-12-15-m-kozotti-hajotestek
4,Kötelező felszerelés,15 - 20 méter közötti hajótest,https://www.trinexus.hu/kotelezo-felszereles-15-20-m-kozotti-hajotestek
5,Kötelező felszerelés,Csónak, kajak-kenu és egyéb,https://www.trinexus.hu/kotelezo-felszereles-kajak-kenu-egyeb
6,Hajó,RIB hajó,https://www.trinexus.hu/hajo-rib-hajo
7,Hajó,Ponton,https://www.trinexus.hu/hajo-ponton
8,Hajó,Elektromos hajó,https://www.calistra.hu?source_cat=723996
9,Hajó,Calandra,https://www.trinexus.hu/hajo-calandra
10,Gumicsónak,Dawn Marine Farfalla,https://www.trinexus.hu/dawn-marine-farfalla
11,Gumicsónak,Kolibri,https://www.trinexus.hu/gumicsonak-kolibri
12,Gumicsónak,Honda,https://www.trinexus.hu/gumicsonak-honda
13,Gumicsónak,Allroundmarin,https://www.trinexus.hu/gumicsonak-allroundmarin
14,Gumicsónak,Takaróponyva,https://www.trinexus.hu/gumicsonak-takaroponyva
15,Gumicsónak,Pumpa, szerelvény, ülés, kiegészítő,https://www.trinexus.hu/gumicsonak-pumpa-szerelveny-ules-kiegeszito
16,"Csónak",Caytan alumínium csónakok,https://www.trinexus.hu/Caytan-aluminium-csonakok
17,"Csónak",Műanyag csónakok,https://www.trinexus.hu/csonak-muanyag-csonakok
18,"Csónak",Cadrava alumínium csónakok,https://www.trinexus.hu/csonak-cadrava-aluminium-csonakok
20,"Csónak",Sevylor termék,https://www.trinexus.hu/csonak-sevylor-termek
21,Robbanómotor,Mercury,https://www.trinexus.hu/robbanomotor-mercury
22,Robbanómotor,Tohatsu,https://www.trinexus.hu/robbanomotor-tohatsu
23,Robbanómotor,Honda,https://www.trinexus.hu/robbanomotor-honda
24,Robbanómotor,Selva,https://www.trinexus.hu/Selva
25,Robbanómotor,Yamaha,https://www.trinexus.hu/robbanomotor-yamaha
26,Robbanómotor,Parsun,https://www.trinexus.hu/robbanomotor-parsun
27,Robbanómotor,Tomos alkatrész,https://www.trinexus.hu/robbanomotor-alkatresz-tartozek
28,Robbanómotor,Propeller, propellervédő, propellerzár,https://www.trinexus.hu/robbanomotor-propeller-propellervedo-propellerzar
29,Robbanómotor,Motorkarbantartás,https://www.trinexus.hu/robbanomotor-motorkarbantartas
30,Robbanómotor,Olaj,https://www.trinexus.hu/sct/997623/Olaj
31,Elektromos csónakmotor,Haswing,https://www.trinexus.hu/elektromos-csonakmotor-haswing
32,Elektromos csónakmotor,Torqeedo,https://www.trinexus.hu/sct/316924/Torqeedo
33,Elektromos csónakmotor,Epropulsion,https://www.trinexus.hu/elektromos-csonakmotor-epropulsion
34,Elektromos csónakmotor,Golden EZ,https://www.trinexus.hu/ez
35,Elektromos csónakmotor,Minn Kota,https://www.trinexus.hu/elektromos-csonakmotor-minn-kota
36,Elektromos csónakmotor,Zebco,https://www.trinexus.hu/elektromos-csonakmotor-zebco
37,Elektromos csónakmotor,Mercury Avator,https://www.trinexus.hu/Mercury-Avator
38,Elektromos csónakmotor,Dawn Marine,https://www.trinexus.hu/elektromos-csonakmotor-dawn-marine
39,Elektromos csónakmotor,Flover,https://www.trinexus.hu/elektromos-csonakmotor-flover
40,Elektromos csónakmotor,Hordtáska elektromos motorhoz,https://www.trinexus.hu/elektromos-csonakmotor-hordtaska-motorhoz
41,Elektromos csónakmotor,További kategóriák,https://www.trinexus.hu/elektromos-csonakmotor
42,"Navigáció, autopilot, rádió",Kézi GPS,https://www.trinexus.hu/kezi-gps
43,"Navigáció, autopilot, rádió",Chartplotter,https://www.trinexus.hu/chartplotter
44,"Navigáció, autopilot, rádió",Radar, kompasz, navigációs műszer,https://www.trinexus.hu/radar-kompasz-navigacios-muszer
45,"Navigáció, autopilot, rádió",Autopilot,https://www.trinexus.hu/autopilot
46,"Navigáció, autopilot, rádió",Rádió,https://www.trinexus.hu/radio
47,"Navigáció, autopilot, rádió",Térképszoftver,https://www.trinexus.hu/terkepszoftver
48,Halradar,Deeper,https://www.trinexus.hu/halradar-deeper
49,Halradar,Humminbird,https://www.trinexus.hu/halradar-humminbird
50,Halradar,Garmin,https://www.trinexus.hu/halradar-garmin
51,Halradar,Lowrance,https://www.trinexus.hu/halradar-lowrance
52,Halradar,Simrad halradarok,https://www.trinexus.hu/simrad-halradarok
53,Halradar,Halradar etetőhajóra,https://www.trinexus.hu/halradar-etetohajora
54,Halradar,Jeladó és monitor tartó,https://www.trinexus.hu/jelado-monitor-tarto
55,Hajófelszerelés,Mentőfelszerelés, biztonsági tartozék,https://www.trinexus.hu/hajofelszereles-mentofelszereles-biztonsagi-tartozekok
56,Hajófelszerelés,Kikötés, horgonyzás,https://www.trinexus.hu/hajofelszereles-kikotes-horgonyzas
57,Hajófelszerelés,Fedélzeti felszerelés,https://www.trinexus.hu/hajofelszereles-fedelzeti-felszereles
58,Hajófelszerelés,Motortartozék,https://www.trinexus.hu/hajofelszereles-motortartozekok
59,Hajófelszerelés,Fény, világítás, műszer, távcső,https://www.trinexus.hu/hajofelszereles-feny-vilagitas-muszer-tavcso
60,Hajófelszerelés,Üzemanyag rendszer és tartozékai,https://www.trinexus.hu/hajofelszereles-uzemanyag-rendszer-es-tartozekai
61,Hajófelszerelés,Vízrendszer és tartozékai,https://www.trinexus.hu/hajofelszereles-vizirendszer-es-tartozekai
62,Hajófelszerelés,Kabin, konyha, kényelem,https://www.trinexus.hu/hajofelszereles-kabin-konyha-kenyelem
63,"Festék, vegyi és karbantartó anyag",Algagátló, alapozó, fedőfesték,https://www.trinexus.hu/festek-vegyi-karbantarto-anyag-algagatlo-alapozo
64,"Festék, vegyi és karbantartó anyag",Yachtikon - tisztítás, karbantartás,https://www.trinexus.hu/festek-vegyi-karbantarto-anyag-yachtikon-tisztitas-karbantartas
65,"Festék, vegyi és karbantartó anyag",Tisztító és ápoló szer,https://www.trinexus.hu/festek-vegyi-karbantarto-anyag-tisztito-apolo-szer
66,"Festék, vegyi és karbantartó anyag",Javító, karbantartó anyag,https://www.trinexus.hu/festek-vegyi-karbantarto-anyag-javito-karbantarto-anyag
67,"Festék, vegyi és karbantartó anyag",International - tisztítás, karbantartás,https://www.trinexus.hu/festek-vegyi-karbantarto-anyag-international-tisztitas-karbantartas
68,"Tréler, tartozék",Tréler, tartozékai,https://www.trinexus.hu/treler-tartozekai
69,"Tréler, tartozék",Csörlő, heveder, rögzítő,https://www.trinexus.hu/csorlo-heveder-rogzito
70,"Tréler, tartozék",Görgő, Y ütköző,https://www.trinexus.hu/gorgo-y-utkozo
71,"Elektronika, audió, napelem",Napelem,https://www.trinexus.hu/elektronika-napelem
72,"Elektronika, audió, napelem",Szélgenerátor,https://www.trinexus.hu/Szelgenerator
73,"Elektronika, audió, napelem",Akkumulátor, töltő, kapcsoló...,https://www.trinexus.hu/elektronika-akkumulator-tolto-kapcsolo-doboz
74,"Elektronika, audió, napelem",Kapcsoló, panel,https://www.trinexus.hu/elektronika-kapcsolo-panel
75,"Elektronika, audió, napelem",Szivargyújtó, csatlakozó,https://www.trinexus.hu/elektronika-szivargyujto-csatlakozo
76,"Elektronika, audió, napelem",Generátor,https://www.trinexus.hu/elektronika-generator
77,"Elektronika, audió, napelem",Audió,https://www.trinexus.hu/audio-video
78,Vízisport,Hobie pedálos SUP,https://www.trinexus.hu/Hobie-pedalos-SUP
79,Vízisport,Úszószőnyeg,https://www.trinexus.hu/Uszoszonyeg
80,Vízisport,Tube, fánk, banán,https://www.trinexus.hu/vizisport-tube-fank-banan
81,Vízisport,Vízisí, Wakeboard, SUP, Szerelvény,https://www.trinexus.hu/vizisport-vizisi-wakeboard-ernyo-szerelveny
82,Vízisport,Kötelek, sportmellény, száraztasak,https://www.trinexus.hu/vizisport-kotelek-sportmelleny-szaraztasak-kiegeszito
83,Vízisport,Búvárkodás,https://www.trinexus.hu/vizisport-buvarkodas
84,Vízisport,Jobe vízi scooter,https://www.trinexus.hu/Jobe-vizi-scooter
85,Horgász termékek,Etetőhajók és tartozékaik,https://www.trinexus.hu/horgasztermek-etetohajok-tartozekaik
86,Horgász termékek,"Bot-, jeladó, és radartartó",https://www.trinexus.hu/horgasztermekek-bot-jelado-radartarto
87,Horgász termékek,Hasznos horgászholmi,https://www.trinexus.hu/horgasztermek-hasznos-horgaszholmik
88,Horgász termékek,Egyéb horgász termékek,https://www.trinexus.hu/horgasztermekek-egyeb-horgasztermekek
89,Horgász termékek,Levegőztető pumpák,https://www.trinexus.hu/Levegozteto-pumpak
90,Garmin okosórák,Marq,https://www.trinexus.hu/Marq
91,Garmin okosórák,Fenix/Epix/Enduro,https://www.trinexus.hu/Fenix-Epix-Enduro
92,Garmin okosórák,Forerunner,https://www.trinexus.hu/Forerunner
93,Garmin okosórák,Instinct,https://www.trinexus.hu/Instinct
94,Garmin okosórák,vívofit Junior,https://www.trinexus.hu/vivofit-Junior
95,Garmin okosórák,Óraszíjak,https://www.trinexus.hu/Oraszijak
96,Ajándéktárgyak, oktatási anyagok,Ajándékutalvány,https://www.trinexus.hu/Ajandekutalvany
97,Ajándéktárgyak, oktatási anyagok,Hajómodell,https://www.trinexus.hu/ajandektargy-hajosmodell
98,Ajándéktárgyak, oktatási anyagok,Dísztárgyak,https://www.trinexus.hu/ajandektargy-butor-disztargy
99,Ajándéktárgyak, oktatási anyagok,Hajós oktatási anyag,https://www.trinexus.hu/hajos-oktatasi-anyag
100,Ajándéktárgyak, oktatási anyagok,Lakberendezés,https://www.trinexus.hu/Lakberendezes
101,Ajándéktárgyak, oktatási anyagok,Hobbi építőkészlet,https://www.trinexus.hu/Hobbi-epitokeszlet
102,Ajándéktárgyak, oktatási anyagok,Térkép, könyv, naptár,poszter,https://www.trinexus.hu/ajandektargy-terkep-konyv-naptar-poszter
103,Ajándéktárgyak, oktatási anyagok,Kulcstartó,https://www.trinexus.hu/ajandektargy-kulcstarto
104,Ajándéktárgyak, oktatási anyagok,Karkötők,https://www.trinexus.hu/ajandektargy-karkotok
105,Ajándéktárgyak, oktatási anyagok,Mindenféle egyebek,https://www.trinexus.hu/Mindenfele-egyebek
106,Ruházat,Vízálló ruházat,https://www.trinexus.hu/ruhazat-vizallo-ruhazat
107,Ruházat,Póló,https://www.trinexus.hu/ruhazat-polo
108,Ruházat,Lábbeli,https://www.trinexus.hu/ruhazat-labbeli
109,Ruházat,Sapka,https://www.trinexus.hu/ruhazat-sapka
110,Ruházat,Hajós divat, táska,https://www.trinexus.hu/spl/411011/Hajos-divat-taska
111,Ruházat,Párna, takaró,https://www.trinexus.hu/spl/304560/Parna-takaro
112,Ruházat,Törülközők,https://www.trinexus.hu/spl/816441/Torulkozok
113,Ruházat,Hajós divat, ruházat,https://www.trinexus.hu/spl/551633/Hajos-divat-ruhazat
114,Ruházat,Sapka, kalap,https://www.trinexus.hu/spl/646654/Sapka-kalap
115,Kajak, kenu és kiegészítőik,Sit on top kajak,https://www.trinexus.hu/Sit-on-top-kajak
116,Kajak, kenu és kiegészítőik,Hagyományos kajak-kenu,https://www.trinexus.hu/csonak-kajak-kenu-hagyomanyos
117,Kajak, kenu és kiegészítőik,Evezős kiegészítő,https://www.trinexus.hu/csonak-kajak-kenu-evezos-kiegeszito
118,Kajak, kenu és kiegészítőik,Jobe kajak,https://www.trinexus.hu/Jobe-kajak

`;

function parseCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    const nodes = {};

    const splitCSV = (str) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (char === '"') { inQuotes = !inQuotes; }
            else if (char === ',' && !inQuotes) {
                result.push(current.trim()); current = '';
            } else { current += char; }
        }
        result.push(current.trim());
        return result;
    };

    lines.forEach((line, i) => {
        if (i === 0) return;
        const cols = splitCSV(line);
        if (cols.length < 3) return;

        let parentName = cols[1].replace(/^"|"$/g, '').trim();
        let name = cols[2].replace(/^"|"$/g, '').trim();
        let rawUrl = cols.length > 3 ? cols[3].replace(/^"|"$/g, '').trim() : '';

        let url = rawUrl;
        if (rawUrl && !rawUrl.startsWith('http')) {
            url = 'https://www.trinexus.hu/' + rawUrl;
        }

        const node = { name: name, parentName: parentName, url: url, children: [] };
        if (!nodes[name]) nodes[name] = node;
        else nodes[name + '_' + i] = node;
    });

    const groupedByParent = {};
    Object.values(nodes).forEach(node => {
        if (!groupedByParent[node.parentName]) groupedByParent[node.parentName] = [];
        groupedByParent[node.parentName].push(node);
    });

    return groupedByParent;
}

function buildHybridMenu() {
    const groupedData = parseCSV(CSV_DATA);
    let html = '';

    MAIN_MENU_ORDER.forEach(item => {
        let hasSub = false;
        let children = [];
        let url = item.url || '#';
        let target = item.type === 'manual' ? '_blank' : '_self';

        if (item.type === 'cat' && groupedData[item.name]) {
            children = groupedData[item.name];
            hasSub = true;
        }

        html += `<li class="mm-item ${hasSub ? 'has-sub' : ''}">`;
        html += `<a href="${url}" class="mm-link" target="${target}">${item.name}</a>`;

        if (hasSub) {
            html += `<div class="mm-panel"><div class="mm-grid">`;
            children.forEach(child => {
                html += `<div class="mm-col"><a href="${child.url}" class="mm-col-title" target="_blank">${child.name}</a></div>`;
            });
            html += `</div></div>`;
        }
        html += `</li>`;
    });

    return html;
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('megaMenuRoot');
    if (container) container.innerHTML = buildHybridMenu();

    const btn = document.getElementById('catMenuBtn');
    const wrap = document.getElementById('searchWrapper');

    if (btn && wrap) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            wrap.classList.toggle('menu-active');
        });
        document.body.addEventListener('click', () => {
            wrap.classList.remove('menu-active');
        });
        const panel = document.querySelector('.mm-container');
        if (panel) panel.addEventListener('click', e => e.stopPropagation());
    }

    // ===============================================
    // JAVÍTOTT POZICIONÁLÁS (BIZTONSÁGI LIMITTEL)
    // ===============================================
    const items = document.querySelectorAll('.mm-item.has-sub');

    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const panel = item.querySelector('.mm-panel');
            if (!panel) return;

            // Reset
            panel.style.top = '-1px';

            const rect = panel.getBoundingClientRect();
            const panelHeight = rect.height;
            const viewportHeight = window.innerHeight;

            const itemRect = item.getBoundingClientRect();
            const spaceBelow = viewportHeight - itemRect.top;

            if (panelHeight > spaceBelow - 20) {
                // Mennyivel kell feljebb húzni?
                let shiftAmount = panelHeight - spaceBelow + 40;

                // BIZTONSÁGI LIMIT: Ne menjen ki felül a képernyőről!
                // Megnézzük, mennyi hely van felfelé (a menüpont tetejétől az ablak tetejéig)
                const spaceAbove = itemRect.top;

                // Ha a shiftAmount nagyobb, mint a fenti hely (mínusz fejléc magasság kb 60px),
                // akkor csak annyit húzunk rajta, amennyit szabad.
                const maxShift = spaceAbove - 60;

                if (shiftAmount > maxShift) {
                    shiftAmount = maxShift;
                }

                panel.style.top = `-${shiftAmount}px`;
            }
        });
    });

});


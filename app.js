// CONFIGURACIÓN DE SUPABASE
const SB_URL = 'https://pfxvkvvzxpwobtynupgk.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmeHZrdnZ6eHB3b2J0eW51cGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjM3NjIsImV4cCI6MjA5MDczOTc2Mn0.H2tqmv0T9npDmNW3Pid2qnUSze7EHvO1ky0-NQzmFIY';

// Inicializamos el cliente de Supabase
const supabase = supabase.createClient(SB_URL, SB_KEY);

// --- FUNCIONES DE BASE DE DATOS ---
async function sbQ(tabla, query = '*') {
    const { data, error } = await supabase.from(tabla).select(query);
    if (error) throw error;
    return data;
}

async function sbUp(tabla, datos) {
    const { data, error } = await supabase.from(tabla).upsert(datos);
    if (error) throw error;
    return data;
}

async function sbDel(tabla, id) {
    const { error } = await supabase.from(tabla).delete().eq('id', id);
    if (error) throw error;
}

// --- LÓGICA DE LA APP (Mantenemos tu estructura original corregida) ---
const LC = {
    g(k) { try { return JSON.parse(localStorage.getItem('pol2_' + k)) || null } catch { return null } },
    s(k, v) { localStorage.setItem('pol2_' + k, JSON.stringify(v)) }
};

let S = { sg: LC.g('sg') || [], vr: LC.g('vr') || [], pr: LC.g('pr') || [], ve: LC.g('ve') || {}, ga: LC.g('ga') || {}, ins: LC.g('ins') || [], rec: LC.g('rec') || [] };
let tab = 'caja', day = td(), online = navigator.onLine, tIng = [], rMonth = nm(), cM = null, cA = null;

function td() { return new Date().toISOString().split('T')[0] }
function nm() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') }
function fD(s) { const [y, m, d] = s.split('-'); return d + '/' + m }
function fDL(s) { const [y, m, d] = s.split('-'); return d + '/' + m + '/' + y }
function fM(s) { const [y, m] = s.split('-'); return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][+m - 1] + ' ' + y }
function $m(n) { return '$' + Math.round(n).toLocaleString('es-AR') }
function kg(n) { return (Math.round(n * 100) / 100) + 'kg' }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5) }
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }
function dV() { return S.ve[day] || [] }
function dG() { return S.ga[day] || [] }

function toast(m) { 
    console.log(m);
    // Si tenés un elemento con id "toast" en el HTML, esto funcionará
    const t = document.getElementById('toast');
    if(t) {
        t.textContent = m; t.classList.add('on'); 
        setTimeout(() => t.classList.remove('on'), 2000);
    }
}

function sync(s, l) { 
    const d = document.getElementById('sdot'), lb = document.getElementById('slbl');
    if(d) d.className = 'sdot ' + s;
    if(lb) lb.textContent = l;
}

function save() { 
    LC.s('sg', S.sg); LC.s('vr', S.vr); LC.s('pr', S.pr); 
    LC.s('ve', S.ve); LC.s('ga', S.ga); LC.s('ins', S.ins); LC.s('rec', S.rec); 
}

window.addEventListener('online', () => { online = true; loadAll() });
window.addEventListener('offline', () => { online = false; sync('err', 'offline') });

async function loadAll() {
    if (!online) { sync('err', 'offline'); return }
    sync('busy', 'cargando...');
    try {
        const [sg, vr, pr, ve, ga, ins, rec] = await Promise.all([
            sbQ('stock_groups'), sbQ('stock_variants'), sbQ('produccion'),
            sbQ('ventas'), sbQ('gastos'), sbQ('insumos'), sbQ('recetas')
        ]);
        S.sg = sg || []; S.vr = vr || [];
        S.pr = (pr || []).map(p => ({ ...p, date: p.day }));
        S.ins = (ins || []).map(i => ({ ...i, costUnit: i.cost_unit }));
        S.rec = rec || [];
        const vm = {}, gm = {};
        (ve || []).forEach(x => { if (!vm[x.day]) vm[x.day] = []; vm[x.day].push(x) });
        (ga || []).forEach(x => { if (!gm[x.day]) gm[x.day] = []; gm[x.day].push(x) });
        S.ve = vm; S.ga = gm; 
        save(); sync('ok', 'sincronizado'); render();
    } catch (e) { 
        sync('err', 'error'); 
        console.error("Error al cargar datos:", e);
    }
}

// INICIO AUTOMÁTICO
document.addEventListener('DOMContentLoaded', () => {
    loadAll();
});

// Nota: He mantenido tus funciones render(), rCaja(), addV(), etc. 
// Deberías pegar el resto de tus funciones aquí debajo si no están en este bloque.
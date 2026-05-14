const searchBtn = document.getElementById('searchBtn');
const nameInput = document.getElementById('playerName');
const infoText = document.getElementById('info-text');
const listContainer = document.getElementById('listContainer');
const tableBody = document.getElementById('tableBody');

const targetServerId = "3e3gdb"; 

async function searchPlayer() {
    const pName = nameInput.value.trim().toLowerCase();

    updateStatus("Menghubungkan...", "var(--text-dim)");
    listContainer.style.display = "none";
    tableBody.innerHTML = "";

    // const proxyUrl = "https://api.allorigins.win/raw?url=";
    const proxyUrl = "https://corsproxy.io/?";
    const targetUrl = `https://servers-frontend.fivem.net/api/servers/single/${targetServerId}`;

    try {
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        if (!response.ok) throw new Error();

        const result = await response.json();
        const players = result.Data.players || [];

        const filtered = players.filter(p => p.name.toLowerCase().includes(pName));

        if (filtered.length > 0) {
            updateStatus(`${filtered.length} pemain ditemukan`, "var(--text-dim)");
            renderTable(filtered);
        } else {
            updateStatus("Tidak ada pemain ditemukan", "var(--danger)");
        }
    } catch (err) {
        updateStatus("Gagal memuat data", "var(--danger)");
    }
}

function renderTable(players) {
    tableBody.innerHTML = "";
    players.forEach(p => {
        const row = document.createElement('tr');
        
        let pClass = "good";
        if (p.ping > 100) pClass = "warn";
        if (p.ping > 200) pClass = "bad";

        row.innerHTML = `
            <td style="color: var(--text-dim)">#${p.id}</td>
            <td>${p.name}</td>
            <td class="ping-val ${pClass}">${p.ping}ms</td>
        `;
        tableBody.appendChild(row);
    });
    listContainer.style.display = "block";
}

function updateStatus(text, color) {
    infoText.innerText = text;
    infoText.style.color = color;
}

searchBtn.addEventListener('click', searchPlayer);
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPlayer();
});
const searchBtn = document.getElementById('searchBtn');
const serverInput = document.getElementById('serverId');
const nameInput = document.getElementById('playerName');
const infoText = document.getElementById('info-text');
const listContainer = document.getElementById('listContainer');
const playerTable = document.getElementById('playerTable');

async function searchPlayer() {
    const sId = serverInput.value.trim();
    const pName = nameInput.value.trim().toLowerCase();

    if (!sId) {
        updateStatus("Masukkan Server ID terlebih dahulu", "red");
        return;
    }

    updateStatus("Mencari server...", "#2c3e50");
    listContainer.style.display = "none";
    playerTable.innerHTML = "";

    const proxyUrl = "https://api.allorigins.win/raw?url=";
    const targetUrl = `https://servers-frontend.fivem.net/api/servers/single/${sId}`;

    try {
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        const result = await response.json();
        const allPlayers = result.Data.players;

        // Proses Filtering berdasarkan nama pemain
        const filteredPlayers = allPlayers.filter(p => 
            p.name.toLowerCase().includes(pName)
        );

        if (filteredPlayers.length > 0) {
            updateStatus(`Ditemukan ${filteredPlayers.length} pemain sesuai nama "${pName}"`, "green");
            renderTable(filteredPlayers);
        } else {
            updateStatus("Pemain tidak ditemukan di server ini.", "orange");
        }
    } catch (err) {
        updateStatus("Gagal mengambil data. Pastikan ID Server benar.", "red");
    }
}

function renderTable(players) {
    players.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.id}</td>
            <td><strong>${p.name}</strong></td>
            <td><span class="ping-badge">${p.ping}ms</span></td>
        `;
        playerTable.appendChild(row);
    });
    listContainer.style.display = "block";
}

function updateStatus(text, color) {
    infoText.innerText = text;
    infoText.style.color = color;
}

searchBtn.addEventListener('click', searchPlayer);
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const nameInput = document.getElementById('playerName');
    const infoText = document.getElementById('info-text');
    const listContainer = document.getElementById('listContainer');
    const tableBody = document.getElementById('tableBody');

    const targetServerId = "3e3gdb"; 

    async function searchPlayer() {
        const pName = nameInput.value.trim().toLowerCase();

        updateStatus("Menghubungkan ke SatuMimpi...", "var(--text-dim)");
        listContainer.style.display = "none";
        tableBody.innerHTML = "";

        // Ganti ke corsproxy.io karena AllOrigins sedang sering timeout
        const targetUrl = `https://servers-frontend.fivem.net/api/servers/single/${targetServerId}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

        try {
            // Mengambil data tanpa AbortController agar tidak cepat timeout[cite: 2]
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error("Server Sibuk");

            const result = await response.json();
            
            if (!result || !result.Data || !result.Data.players) {
                updateStatus("Data pemain tidak publik atau sedang error.", "var(--danger)");
                return;
            }

            const allPlayers = result.Data.players;
            const filtered = allPlayers.filter(p => p.name.toLowerCase().includes(pName));

            if (filtered.length > 0) {
                updateStatus(`${filtered.length} pemain online`, "var(--success)");
                renderTable(filtered);
            } else {
                updateStatus(`"${pName}" sedang tidak online.`, "var(--danger)");
            }
        } catch (err) {
            console.error("Error Log:", err);
            updateStatus("Gagal memuat data. Coba lagi dalam 5 detik.", "var(--danger)");
        }
    }

    function renderTable(players) {
        tableBody.innerHTML = "";
        players.forEach(p => {
            const row = document.createElement('tr');
            let pClass = p.ping > 200 ? "bad" : (p.ping > 100 ? "warn" : "good");

            row.innerHTML = `
                <td style="color: var(--text-dim)">#${p.id}</td>
                <td style="font-weight: 600;">${p.name}</td>
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
    nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchPlayer(); });
});
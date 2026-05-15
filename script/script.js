document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const nameInput = document.getElementById('playerName');
    const infoText = document.getElementById('info-text');
    const listContainer = document.getElementById('listContainer');
    const tableBody = document.getElementById('tableBody');
    const serverSelect = document.getElementById('serverSelect'); // Menambahkan referensi dropdown

    async function searchPlayer() {
        const pName = nameInput.value.trim().toLowerCase();
        
        // MENGAMBIL ID SERVER DARI DROPDOWN SAAT INI
        const selectedServerId = serverSelect.value;
        // Mengambil nama server yang dipilih untuk pesan status
        const selectedServerName = serverSelect.options[serverSelect.selectedIndex].text;

        updateStatus(`Menghubungkan ke ${selectedServerName}...`, "var(--text-dim)");
        listContainer.style.display = "none";
        tableBody.innerHTML = "";

        // URL target menggunakan ID dari dropdown
        const targetUrl = `https://servers-frontend.fivem.net/api/servers/single/${selectedServerId}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

        try {
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error("Server Sibuk");

            const result = await response.json();
            
            if (!result || !result.Data || !result.Data.players) {
                updateStatus("Data pemain tidak publik atau server sedang offline.", "var(--danger)");
                return;
            }

            const allPlayers = result.Data.players;
            const filtered = allPlayers.filter(p => p.name.toLowerCase().includes(pName));

            if (filtered.length > 0) {
                updateStatus(`${filtered.length} pemain ditemukan di ${selectedServerName}`, "var(--success)");
                renderTable(filtered);
            } else {
                updateStatus(`"${pName}" sedang offline/tidak dapat ditemukan di ${selectedServerName}.`, "var(--danger)");
            }
        } catch (err) {
            console.error("Error Log:", err);
            updateStatus("Gagal memuat data. Proxy mungkin limit atau server down.", "var(--danger)");
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

    // Listener untuk tombol cari
    searchBtn.addEventListener('click', searchPlayer);

    // Listener untuk menekan Enter pada input
    nameInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') searchPlayer(); 
    });

    // OPSIONAL: Otomatis cari saat dropdown diubah (jika input nama tidak kosong)
    serverSelect.addEventListener('change', () => {
        if (nameInput.value.trim() !== "") {
            searchPlayer();
        }
    });
});
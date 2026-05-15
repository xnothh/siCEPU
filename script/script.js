document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const nameInput = document.getElementById('playerName');
    const infoText = document.getElementById('info-text');
    const listContainer = document.getElementById('listContainer');
    const tableBody = document.getElementById('tableBody');
    const serverSelect = document.getElementById('serverSelect');

    async function searchPlayer() {
        const pName = nameInput.value.trim().toLowerCase();
        const selectedServerId = serverSelect.value;
        const selectedServerName = serverSelect.options[serverSelect.selectedIndex].text;

        updateStatus(`Menghubungkan ke ${selectedServerName}...`, "var(--text-dim)");
        listContainer.style.display = "none";
        tableBody.innerHTML = "";

        const targetUrl = `https://servers-frontend.fivem.net/api/servers/single/${selectedServerId}`;
        
        /**
         * DAFTAR PROXY (DIPRIORITASKAN)
         * Ganti link pertama dengan link Cloudflare Worker milikmu!
         */
        const proxies = [
            `https://satumimpi-proxy.username.workers.dev/?url=${encodeURIComponent(targetUrl)}&v=${Date.now()}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
            `https://thingproxy.freeboard.io/fetch/${targetUrl}`
        ];

        let success = false;

        for (let proxyUrl of proxies) {
            try {
                // Jangan tampilkan pesan "jalur cadangan" jika ini adalah percobaan pertama (Cloudflare)
                if (proxies.indexOf(proxyUrl) > 0) {
                    updateStatus(`Mencoba jalur cadangan...`, "var(--text-dim)");
                }
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout 8 detik

                const response = await fetch(proxyUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error("Gagal");

                const result = await response.json();
                
                if (result && result.Data && result.Data.players) {
                    const allPlayers = result.Data.players;
                    const filtered = allPlayers.filter(p => p.name.toLowerCase().includes(pName));

                    if (filtered.length > 0) {
                        updateStatus(`${filtered.length} ditemukan di ${selectedServerName}`, "var(--success)");
                        renderTable(filtered);
                    } else {
                        updateStatus(`"${pName}" tidak ditemukan.`, "var(--danger)");
                    }
                    success = true;
                    break; 
                }
            } catch (err) {
                console.warn(`Jalur ${proxies.indexOf(proxyUrl) + 1} gagal.`);
                continue; 
            }
        }

        if (!success) {
            updateStatus("Semua jalur sibuk/error. Coba refresh halaman.", "var(--danger)");
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
    serverSelect.addEventListener('change', () => { if (nameInput.value.trim() !== "") searchPlayer(); });
});
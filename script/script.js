document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const nameInput = document.getElementById('playerName');
    const infoText = document.getElementById('info-text');
    const listContainer = document.getElementById('listContainer');
    const tableBody = document.getElementById('tableBody');
    const serverSelect = document.getElementById('serverSelect');

    async function fetchServerData() {
        const pName = nameInput.value.trim().toLowerCase();
        const selectedServerId = serverSelect.value;
        const selectedServerName = serverSelect.options[serverSelect.selectedIndex].text;

        // Reset tampilan setiap kali pencarian baru dimulai
        updateStatus(`Menghubungkan ke ${selectedServerName}...`, "var(--text-dim)");
        listContainer.style.display = "none";
        tableBody.innerHTML = "";
        
        const targetUrl = `https://servers-frontend.fivem.net/api/servers/single/${selectedServerId}`;
        
        // Daftar Proxy Fallback
        const proxies = [
            `https://sicepu.ariyautama77.workers.dev/?url=${encodeURIComponent(targetUrl)}&v=${Date.now()}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
            `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
        ];

        let success = false;

        for (let proxyUrl of proxies) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); 

                const response = await fetch(proxyUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error("Gagal");

                const result = await response.json();
                
                if (result && result.Data && result.Data.players) {
                    const allPlayers = result.Data.players;
                    
                    // Jika input kosong -> tampilkan semua. Jika ada teks -> filter nama.
                    const filtered = pName === "" 
                        ? allPlayers 
                        : allPlayers.filter(p => p.name.toLowerCase().includes(pName));

                    if (filtered.length > 0) {
                        renderTable(filtered);
                        updateStatus(pName === "" ? `Total Online: ${filtered.length}` : `${filtered.length} Pemain ditemukan`, "var(--success)");
                        listContainer.style.display = "block";
                    } else {
                        updateStatus(`"${pName}" tidak ditemukan di ${selectedServerName}.`, "var(--danger)");
                    }
                    
                    success = true;
                    break; 
                }
            } catch (err) {
                console.warn(`Jalur ${proxies.indexOf(proxyUrl) + 1} gagal...`);
                continue;
            }
        }

        if (!success) {
            updateStatus("Semua jalur sibuk. Coba lagi dalam beberapa saat.", "var(--danger)");
        }
    }

    function renderTable(players) {
        tableBody.innerHTML = "";
        players.sort((a, b) => a.id - b.id);

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
    }

    function updateStatus(text, color) {
        infoText.innerText = text;
        infoText.style.color = color;
    }

    // LISTENER AKSI USER
    
    // 1. Klik tombol Search
    searchBtn.addEventListener('click', fetchServerData);
    
    // 2. Tekan tombol ENTER pada kolom input
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchServerData();
        }
    });

    // 3. Ganti server pada dropdown (Otomatis load karena server berubah)
    serverSelect.addEventListener('change', fetchServerData);

    /** * PENTING: Baris fetchServerData() di sini telah dihapus 
     * agar web tidak otomatis loading saat pertama kali dibuka.
     */
});
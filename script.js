async function searchPlayer() {
    const pName = nameInput.value.trim().toLowerCase();
    updateStatus("Menghubungkan...", "var(--text-dim)");
    
    // Gunakan proxy ini, sangat stabil untuk Netlify dan Localhost
    const proxyUrl = "https://api.allorigins.win/raw?url="; 
    const targetUrl = `https://servers-frontend.fivem.net/api/servers/single/${targetServerId}`;

    try {
        // Tambahkan cache: 'no-cache' agar data selalu fresh (penting untuk list player)
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
            cache: 'no-cache'
        });

        if (!response.ok) throw new Error("Proxy Error");

        const result = await response.json();
        
        // Validasi struktur data FiveM
        if (!result || !result.Data || !result.Data.players) {
            updateStatus("Data tidak tersedia.", "var(--danger)");
            return;
        }

        const filtered = result.Data.players.filter(p => 
            p.name.toLowerCase().includes(pName)
        );

        if (filtered.length > 0) {
            updateStatus(`${filtered.length} ditemukan`, "var(--text-dim)");
            renderTable(filtered);
        } else {
            updateStatus("Pemain tidak ditemukan", "var(--danger)");
        }
    } catch (err) {
        // Jika AllOrigins gagal, beri pesan yang jelas
        updateStatus("Koneksi gagal. Coba refresh halaman.", "var(--danger)");
        console.error("Detail Error:", err);
    }
}
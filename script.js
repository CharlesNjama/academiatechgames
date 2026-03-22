document.addEventListener('DOMContentLoaded', () => {
    const isHomePage = document.querySelector('#game-grid') !== null;
    const isPlayPage = document.querySelector('#game-viewport') !== null;

    if (isHomePage) {
        initHomePage();
    } else if (isPlayPage) {
        initPlayPage();
    }
});

async function fetchGames() {
    try {
        const response = await fetch('games.json');
        return await response.json();
    } catch (error) {
        console.error('Error fetching games:', error);
        return [];
    }
}

async function initHomePage() {
    const games = await fetchGames();
    const grid = document.querySelector('#game-grid');
    const searchInput = document.querySelector('input[placeholder="Search universe..."]');
    const categoryButtons = document.querySelectorAll('.category-btn');

    function renderGames(filteredGames) {
        if (filteredGames.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <span class="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">search_off</span>
                    <h3 class="text-xl font-bold text-on-surface-variant">The void is empty</h3>
                    <p class="text-on-surface-variant/60">No games found in this sector. Try another transmission.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredGames.map(game => `
            <div class="group cursor-pointer" onclick="location.href='play.html?game=${game.id}'">
                <div class="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-high mb-4">
                    <img src="${game.thumbnail}" alt="${game.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button class="bg-primary text-on-primary p-4 rounded-full shadow-lg scale-75 group-hover:scale-100 transition-transform">
                            <span class="material-symbols-outlined text-3xl">play_circle</span>
                        </button>
                    </div>
                </div>
                <h5 class="font-bold text-lg leading-tight group-hover:text-primary transition-colors">${game.title}</h5>
                <div class="flex items-center justify-between mt-1">
                    <span class="text-xs text-on-surface-variant font-semibold uppercase">${game.category}</span>
                    <div class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px] text-yellow-400" style="font-variation-settings: 'FILL' 1;">star</span>
                        <span class="text-xs font-bold">${game.rating}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderGames(games);

    searchInput?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = games.filter(g => 
            g.title.toLowerCase().includes(term) || 
            g.category.toLowerCase().includes(term) ||
            g.tags.some(t => t.toLowerCase().includes(term))
        );
        renderGames(filtered);
    });

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('bg-primary', 'text-on-primary'));
            categoryButtons.forEach(b => b.classList.add('bg-surface-container-high', 'text-on-surface-variant'));
            btn.classList.add('bg-primary', 'text-on-primary');
            btn.classList.remove('bg-surface-container-high', 'text-on-surface-variant');

            const category = btn.getAttribute('data-category');
            if (category === 'ALL') {
                renderGames(games);
            } else {
                renderGames(games.filter(g => g.category === category));
            }
        });
    });
}

async function initPlayPage() {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    const games = await fetchGames();
    const game = games.find(g => g.id === gameId) || games[0];

    if (game) {
        document.title = `${game.title} | AcademiaTechGames`;
        document.querySelector('#game-title').textContent = game.title.replace(/_/g, ' ');
        document.querySelector('#game-description').textContent = game.description;
        document.querySelector('#game-player-frame').src = game.embedUrl;
        
        const tagsContainer = document.querySelector('#game-tags');
        tagsContainer.innerHTML = game.tags.map(tag => `
            <span class="bg-surface-container-high text-on-surface-variant text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">${tag}</span>
        `).join('');
    }
}

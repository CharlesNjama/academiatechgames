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
        const response = await fetch('games.json?v=' + Date.now());
        return await response.json();
    } catch (error) {
        console.error('Error fetching games:', error);
        return [];
    }
}

async function initHomePage() {
    const games = await fetchGames();
    const grid = document.querySelector('#game-grid');
    const heroGrid = document.querySelector('#hero-grid');
    const searchInput = document.querySelector('input[placeholder="Search universe..."]');
    const categoryButtons = document.querySelectorAll('.category-btn');

    function renderHero(featuredGames) {
        if (!heroGrid) return;
        if (featuredGames.length === 0) {
            heroGrid.style.display = 'none';
            return;
        }

        const mainGame = featuredGames[0];
        const secondaryGames = featuredGames.slice(1, 4);

        let heroHtml = `
            <!-- Featured Category -->
            <div class="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-xl bg-surface-container-high transition-all hover:translate-y-[-4px] cursor-pointer" onclick="location.href='play.html?game=${mainGame.id}'">
                <img class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" src="${mainGame.thumbnail}"/>
                <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                <div class="absolute bottom-8 left-8">
                    <span class="bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">TRENDING NOW</span>
                    <h3 class="text-5xl font-black italic tracking-tighter mb-2">${mainGame.title}</h3>
                    <p class="text-on-surface-variant mb-6 max-w-xs">${mainGame.description}</p>
                    <button class="kinetic-gradient text-on-primary font-bold px-8 py-3 rounded-full flex items-center gap-2 pulse-shadow group/btn">
                            LAUNCH CORE <span class="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">rocket_launch</span>
                    </button>
                </div>
            </div>
        `;

        secondaryGames.forEach((game, index) => {
            const colors = ['bg-secondary', 'bg-tertiary', 'bg-primary'];
            const color = colors[index % colors.length];
            heroHtml += `
                <div class="relative group overflow-hidden rounded-xl bg-surface-container-high transition-all hover:translate-y-[-4px] cursor-pointer" onclick="location.href='play.html?game=${game.id}'">
                    <img class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" src="${game.thumbnail}"/>
                    <div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                    <div class="absolute bottom-6 left-6">
                        <h4 class="text-xl font-extrabold italic tracking-tight uppercase">${game.title}</h4>
                        <div class="flex items-center gap-2 mt-2">
                            <span class="w-2 h-2 rounded-full ${color}"></span>
                            <span class="text-xs text-on-surface-variant font-bold uppercase tracking-widest">${game.category}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        heroGrid.innerHTML = heroHtml;
    }

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

    renderHero(games);
    renderGames(games);

    searchInput?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = games.filter(g => 
            g.title.toLowerCase().includes(term) || 
            g.category.toLowerCase().includes(term) ||
            (g.tags && g.tags.some(t => t.toLowerCase().includes(term)))
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
        if (tagsContainer && game.tags) {
            tagsContainer.innerHTML = game.tags.map(tag => `
                <span class="bg-surface-container-high text-on-surface-variant text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">${tag}</span>
            `).join('');
        }

        // --- FULL PAGE / FULLSCREEN LOGIC ---
        const fullscreenBtn = document.querySelector('#fullscreen-btn');
        const fullpageBtn = document.querySelector('#fullpage-btn');
        const gameFrame = document.querySelector('#game-player-frame');

        if (fullscreenBtn && gameFrame) {
            fullscreenBtn.addEventListener('click', () => {
                if (gameFrame.requestFullscreen) {
                    gameFrame.requestFullscreen();
                } else if (gameFrame.webkitRequestFullscreen) { /* Safari */
                    gameFrame.webkitRequestFullscreen();
                } else if (gameFrame.msRequestFullscreen) { /* IE11 */
                    gameFrame.msRequestFullscreen();
                }
            });
        }

        if (fullpageBtn) {
            fullpageBtn.addEventListener('click', () => {
                window.open(game.embedUrl, '_blank');
            });
        }
    }
}


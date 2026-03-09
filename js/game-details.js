document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    let rawGameId = urlParams.get('id');

    // Fallback to hash if query param is missing (handles server redirects that strip query strings)
    if (!rawGameId && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        rawGameId = hashParams.get('id');
        console.log('Using game ID from hash:', rawGameId);
    }

    const gameId = rawGameId ? rawGameId.trim().toLowerCase() : null;

    console.log('Loading game details for ID:', gameId);

    if (!gameId) {
        console.warn('No game ID provided in URL.');
        showError('No game selected. Please return to the games section and select a game.');
        return;
    }

    fetch('data/games.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(games => {
            console.log('Total games loaded:', games.length);
            const game = games.find(g => g.id.toLowerCase() === gameId);

            if (game) {
                console.log('Game found:', game.title);
                populateGameDetails(game);
            } else {
                console.error('Game not found for ID:', gameId);
                showError(`Game not found: "${gameId}"`);
            }
        })
        .catch(error => {
            console.error('Error loading game data:', error);
            handleLoadingError();
        });

    function showError(message) {
        const container = document.getElementById('game-content-container');
        if (container) {
            container.innerHTML = `
                <div class="col-md-12 text-center py-5">
                    <div class="alert alert-danger" style="background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; color: #721c24; padding: 30px; border-radius: 10px;">
                        <h4 class="alert-heading">Oops!</h4>
                        <p>${message}</p>
                        <hr style="border-top: 1px solid rgba(114, 28, 36, 0.2);">
                        <p class="mb-0"><a href="index.html" class="btn btn-primary">Back to Home</a></p>
                    </div>
                </div>`;
        }
        // Remove loader
        const loader = document.getElementById('ftco-loader');
        if (loader) loader.classList.remove('show');
    }

    function handleLoadingError() {
        if (window.location.protocol === 'file:') {
            showLocalServerError();
        } else {
            showError('There was an error loading the game data. Please try again later.');
        }
    }

    function showLocalServerError() {
        const container = document.getElementById('game-content-container');
        if (container) {
            container.innerHTML = `
                <div class="col-md-12 text-center py-5">
                    <div class="alert alert-warning" style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; color: #856404; padding: 20px; border-radius: 10px;">
                        <h4 class="alert-heading">Local Server Required</h4>
                        <p>To load the dynamic game details, the website must be viewed through a local web server.</p>
                        <hr style="border-top: 1px solid rgba(133, 100, 4, 0.2);">
                        <p class="mb-0">Please use <strong>Prepros</strong>, <strong>Live Server</strong>, or run <code>npx serve</code> in your project directory.</p>
                    </div>
                </div>`;
        }
        // Remove loader
        const loader = document.getElementById('ftco-loader');
        if (loader) loader.classList.remove('show');
    }

    function populateGameDetails(game) {
        // Update Title & Breadcrumb
        document.title = `${game.title} - Spill Games`;

        // Update Main Section
        const titleMain = document.getElementById('game-title-main');
        titleMain.innerHTML = `${game.title_part1} <span>${game.title_part2}</span>`;
        document.getElementById('game-description').textContent = game.description;

        // Update Image
        const gameImage = document.getElementById('game-image');
        gameImage.style.backgroundImage = `url(${game.icon})`;

        // Update How to Play
        const howToPlayList = document.getElementById('game-how-to-play');
        howToPlayList.innerHTML = game.how_to_play.map(step =>
            `<li><span class="icon-check mr-2"></span>${step}</li>`
        ).join('');

        // Update Key Features
        const keyFeaturesList = document.getElementById('game-key-features');
        keyFeaturesList.innerHTML = game.key_features.map(feature =>
            `<li><span class="icon-check mr-2"></span>${feature}</li>`
        ).join('');

        // Update Store Links
        document.getElementById('game-app-store').href = game.appStore;
        document.getElementById('game-play-store').href = game.playStore;

        // Wait a tiny bit for images to layout, then ensure content is visible
        setTimeout(function () {
            const animatedElements = document.querySelectorAll('.ftco-animate');
            animatedElements.forEach(el => {
                el.classList.remove('ftco-animate');
                el.style.opacity = 1;
                el.style.visibility = 'visible';
            });
        }, 100);

        // Remove loader after populating
        const loader = document.getElementById('ftco-loader');
        if (loader) loader.classList.remove('show');
    }
});

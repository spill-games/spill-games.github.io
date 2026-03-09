document.addEventListener('DOMContentLoaded', function () {
    const galleryContainer = document.getElementById('games-gallery');
    if (!galleryContainer) return;

    if (window.location.protocol === 'file:') {
        console.error('CORS Error: The games gallery cannot be loaded when opening the HTML file directly in the browser.');
        galleryContainer.innerHTML = `
            <div class="col-md-12 text-center py-5">
                <div class="alert alert-warning" style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; color: #856404; padding: 20px; border-radius: 10px;">
                    <h4 class="alert-heading">Local Server Required</h4>
                    <p>To load the dynamic games gallery, the website must be viewed through a local web server.</p>
                    <hr style="border-top: 1px solid rgba(133, 100, 4, 0.2);">
                    <p class="mb-0">Please use <strong>Prepros</strong>, <strong>Live Server</strong>, or run <code>npx serve</code> in your project directory.</p>
                </div>
            </div>`;
        return;
    }

    fetch('data/games.json')
        .then(response => response.json())
        .then(games => {
            renderGallery(games);
            renderHomeSlider(games);
        })
        .catch(error => console.error('Error loading games:', error));

    function renderGallery(games) {
        let html = '';
        const total = games.length;
        const rem3 = total % 3;
        const rem2 = total % 2;

        games.forEach((game, index) => {
            let mdCol = 4;
            if (rem3 > 0 && index < rem3) {
                mdCol = 12 / rem3;
            }

            let smCol = 6;
            if (rem2 > 0 && index < rem2) {
                smCol = 12 / rem2;
            }

            let colClass = `col-md-${mdCol} col-sm-${smCol} col-${smCol}`;

            html += `
                <div class="${colClass} ftco-animate px-1 py-1">
                    <div class="gallery img d-flex align-items-center position-relative"
                        style="background-image: url(${game.feature_graphic}); aspect-ratio: 1 / 1; height: auto;">
                        
                        <!-- Full tile link for Game Details -->
                        <a href="${game.url}" class="position-absolute w-100 h-100" style="top: 0; left: 0; z-index: 1;"></a>
                        
                        <!-- Store Links (Overlay) -->
                        <div class="d-flex justify-content-center w-100 mb-4" style="gap: 40px; z-index: 2; position: relative; pointer-events: none;">
                            ${game.playStore ? `<a href="${game.playStore}" target="_blank" class="icon store-icon d-flex align-items-center justify-content-center" style="margin: 0; pointer-events: auto;">
                                <span class="icon-android"></span>
                            </a>` : ''}
                            ${game.appStore ? `<a href="${game.appStore}" target="_blank" class="icon store-icon d-flex align-items-center justify-content-center" style="margin: 0; pointer-events: auto;">
                                <span class="icon-apple"></span>
                            </a>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        galleryContainer.innerHTML = html;

        // Trigger animations for the new elements
        setTimeout(function () {
            if (typeof contentWayPoint === 'function') {
                contentWayPoint();
            } else {
                // Fallback: manually trigger the same logic as in main.js
                $('.ftco-animate').waypoint(function (direction) {
                    if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                        $(this.element).addClass('item-animate');
                        setTimeout(function () {
                            $('body .ftco-animate.item-animate').each(function (k) {
                                var el = $(this);
                                setTimeout(function () {
                                    var effect = el.data('animate-effect');
                                    if (effect === 'fadeIn') {
                                        el.addClass('fadeIn ftco-animated');
                                    } else if (effect === 'fadeInLeft') {
                                        el.addClass('fadeInLeft ftco-animated');
                                    } else if (effect === 'fadeInRight') {
                                        el.addClass('fadeInRight ftco-animated');
                                    } else {
                                        el.addClass('fadeInUp ftco-animated');
                                    }
                                    el.removeClass('item-animate');
                                }, k * 50, 'easeInOutExpo');
                            });
                        }, 100);
                    }
                }, { offset: '95%' });
            }
        }, 100);
    }

    function renderHomeSlider(games) {
        const sliderContainer = document.querySelector('.home-slider');
        if (!sliderContainer) return;

        let html = '';
        games.forEach(game => {
            html += `
                <div class="slider-item" style="background-image: url(${game.feature_graphic});">
                    <div class="overlay"></div>
                    <div class="container">
                        <div class="row slider-text justify-content-center align-items-center" data-scrollax-parent="true">
                            <div class="col-md-10 col-sm-12 text-center ftco-animate">
                                <h1 class="mb-4">We strive to make immersive games<br>And it would make us proud if you played them!</h1>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Replace the element entirely to avoid owlCarousel internal destruction errors on empty instances
        const $newSlider = $('<section class="home-slider owl-carousel" id="home"></section>').html(html);
        $(sliderContainer).replaceWith($newSlider);

        // Re-initialize owl carousel with same settings as main.js
        $newSlider.owlCarousel({
            loop: true,
            autoplay: true,
            margin: 0,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            nav: false,
            autoplayHoverPause: false,
            items: 1,
            navText: ["<span class='ion-md-arrow-back'></span>", "<span class='ion-chevron-right'></span>"],
            responsive: {
                0: { items: 1, nav: false },
                600: { items: 1, nav: false },
                1000: { items: 1, nav: false }
            }
        });

        // Initialize Scrollax for the new items if the global Scrollax object is available
        if (typeof $.Scrollax === 'function' && $('[data-scrollax-parent]').length > 0) {
            $.Scrollax();
        }

        // Trigger waypoint animations for the new elements in the slider
        setTimeout(function () {
            if (typeof contentWayPoint === 'function') {
                contentWayPoint();
            } else {
                $('.ftco-animate').waypoint(function (direction) {
                    if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                        $(this.element).addClass('item-animate');
                        setTimeout(function () {
                            $('body .ftco-animate.item-animate').each(function (k) {
                                var el = $(this);
                                setTimeout(function () {
                                    var effect = el.data('animate-effect');
                                    if (effect === 'fadeIn') {
                                        el.addClass('fadeIn ftco-animated');
                                    } else if (effect === 'fadeInLeft') {
                                        el.addClass('fadeInLeft ftco-animated');
                                    } else if (effect === 'fadeInRight') {
                                        el.addClass('fadeInRight ftco-animated');
                                    } else {
                                        el.addClass('fadeInUp ftco-animated');
                                    }
                                    el.removeClass('item-animate');
                                }, k * 50, 'easeInOutExpo');
                            });
                        }, 100);
                    }
                }, { offset: '95%' });
            }
        }, 100);
    }
});

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Cinematic Intro Sequence & Hero Animation
window.addEventListener('load', () => {
    const mainVideo = document.getElementById('mainVideo');
    const introLoader = document.getElementById('intro-loader');
    let videoReady = false;

    // Mark video as ready when it has buffered enough
    if (mainVideo) {
        const markReady = () => { videoReady = true; };
        mainVideo.addEventListener('canplaythrough', markReady, { once: true });
        // If already buffered (cached)
        if (mainVideo.readyState >= 4) videoReady = true;
    }

    // Phase 1: Animate intro text in
    const introTL = gsap.timeline();

    introTL
        .to(".intro-subtext", {
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            delay: 0.3
        })
        .to(".intro-text", {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out"
        }, "-=0.4")
        .to(".intro-line", {
            width: "80%",
            duration: 1.8,
            ease: "power1.inOut"
        }, "-=0.6")
        .add(() => {
            // Phase 2: Wait until video is ready, then transition
            const proceed = () => {
                // Fade out intro
                gsap.to(introLoader, {
                    opacity: 0,
                    duration: 1.2,
                    ease: "power2.inOut",
                    onComplete: () => {
                        introLoader.style.display = 'none';

                        // Play video and fade it in smoothly
                        if (mainVideo) {
                            mainVideo.play().catch(() => { });
                            mainVideo.style.opacity = '1';
                        }

                        // Phase 3: Reveal hero content
                        gsap.from(".hero-content .reveal", {
                            y: 50,
                            opacity: 0,
                            duration: 1.8,
                            stagger: 0.25,
                            ease: "power4.out",
                            delay: 0.3
                        });
                    }
                });
            };

            if (videoReady) {
                // Video already buffered — go after a brief hold for readability
                setTimeout(proceed, 1200);
            } else {
                // Wait for video, but max 4s safety timeout
                const safetyTimeout = setTimeout(proceed, 4000);
                mainVideo.addEventListener('canplaythrough', () => {
                    clearTimeout(safetyTimeout);
                    setTimeout(proceed, 600);
                }, { once: true });
            }
        }, "+=0.5");
});

// Scroll Reveal Animations
const reveals = document.querySelectorAll('.reveal');

reveals.forEach((el) => {
    gsap.to(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out"
    });
});

// Video Intersection Observer (Optimization)
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
            video.play().catch(() => {
                // Autoplay might be blocked by browser until interaction
            });
        } else {
            video.pause();
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('video:not(#mainVideo)').forEach(video => {
    videoObserver.observe(video);
});

// Experience Image Parallax
gsap.to(".exp-image img", {
    scrollTrigger: {
        trigger: ".experience",
        start: "top bottom",
        scrub: true
    },
    y: -50,
    ease: "none"
});

// Gallery Functionality (Filtering & Lightbox)
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

let currentIndex = 0;
let activeGalleryItems = [...galleryItems];

// Filtering Logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        // Update Active Button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter Items
        const itemsToHide = [];
        const itemsToShow = [];

        galleryItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                itemsToShow.push(item);
            } else {
                itemsToHide.push(item);
            }
        });

        // GSAP Animation for Filtering
        gsap.to(itemsToHide, {
            opacity: 0,
            scale: 0.8,
            duration: 0.4,
            display: 'none',
            ease: 'power2.in'
        });

        gsap.to(itemsToShow, {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            display: 'block',
            ease: 'power2.out',
            delay: 0.2,
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });

        activeGalleryItems = itemsToShow;
    });
});

// Lightbox Logic
const openLightbox = (index) => {
    currentIndex = index;
    const item = activeGalleryItems[currentIndex];
    const img = item.querySelector('img');
    const caption = item.querySelector('.item-overlay span').textContent;

    lightboxImg.src = img.src;
    lightboxCaption.textContent = caption;

    gsap.set(lightbox, { display: 'flex' });
    gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.fromTo(lightboxImg, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, delay: 0.2 });
};

const closeLightbox = () => {
    gsap.to(lightbox, {
        opacity: 0, duration: 0.4, onComplete: () => {
            lightbox.style.display = 'none';
        }
    });
};

const nextImage = () => {
    currentIndex = (currentIndex + 1) % activeGalleryItems.length;
    updateLightboxImage();
};

const prevImage = () => {
    currentIndex = (currentIndex - 1 + activeGalleryItems.length) % activeGalleryItems.length;
    updateLightboxImage();
};

const updateLightboxImage = () => {
    const item = activeGalleryItems[currentIndex];
    const img = item.querySelector('img');
    const caption = item.querySelector('.item-overlay span').textContent;

    gsap.to(lightboxImg, {
        opacity: 0, scale: 0.9, duration: 0.3, onComplete: () => {
            lightboxImg.src = img.src;
            lightboxCaption.textContent = caption;
            gsap.to(lightboxImg, { opacity: 1, scale: 1, duration: 0.3 });
        }
    });
};

galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const activeIndex = activeGalleryItems.indexOf(item);
        if (activeIndex !== -1) {
            openLightbox(activeIndex);
        }
    });

    // Parallax Effect (Updated)
    item.addEventListener('mousemove', (e) => {
        const img = item.querySelector('img');
        const { left, top, width, height } = item.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        gsap.to(img, {
            x: x * 30,
            y: y * 30,
            duration: 0.6,
            ease: "power2.out"
        });
    });

    item.addEventListener('mouseleave', () => {
        const img = item.querySelector('img');
        gsap.to(img, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        });
    });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', nextImage);
lightboxPrev.addEventListener('click', prevImage);

// Close Lightbox on click outside image
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    }
});

// WhatsApp Inquiry Form
const enquiryForm = document.getElementById('enquiryForm');
if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('userName').value;
        const phone = "+91 " + document.getElementById('userPhone').value;
        const date = document.getElementById('eventDate').value;
        const details = document.getElementById('eventDetails').value;

        const adminNumber = "918749009617";

        const message = `*AMC Royal - New Inquiry*%0A%0A` +
            `*Name:* ${name}%0A` +
            `*Phone:* ${phone}%0A` +
            `*Event Date:* ${date || 'Not specified'}%0A` +
            `*Details:* ${details || 'No additional details'}`;

        const whatsappUrl = `https://wa.me/${adminNumber}?text=${message}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');

        // Success feedback
        alert("Redirecting to WhatsApp to send your inquiry...");
        enquiryForm.reset();
    });
}

// Smooth Scroll for Nav Links
document.querySelectorAll('nav a, .hero-btns a, .scroll-down').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Configuration - Update this array with your image filenames
const IMAGE_CONFIG = {
    folder: 'images/', // Your images folder path
    images: [
        'image1.png',
        'image2.png',
        'image3.png',
        'image4.png',
        'image5.png',
        'image6.png'
        // Add more image filenames here
    ]
};

let allImages = [];
let currentFilter = 'all';
let currentModalImageId = null;

// Initialize the gallery
document.addEventListener('DOMContentLoaded', () => {
    loadImages();
    setupFilters();
});

// Load images from configuration
function loadImages() {
    // Load existing likes from localStorage
    const savedLikes = JSON.parse(localStorage.getItem('imageLikes') || '{}');
    
    // Create image objects from config
    allImages = IMAGE_CONFIG.images.map((filename, index) => ({
        id: index,
        filename: filename,
        src: IMAGE_CONFIG.folder + filename,
        name: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        likes: savedLikes[filename]?.likes || 0,
        liked: savedLikes[filename]?.liked || false,
        uploadDate: savedLikes[filename]?.date || new Date().toISOString()
    }));
    
    renderGallery();
}

// Setup filter buttons
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderGallery();
        });
    });
}

// Render the gallery
function renderGallery() {
    const gallery = document.getElementById('gallery');
    
    if (allImages.length === 0) {
        gallery.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎨</div>
                <p>No images available yet. Check back soon!</p>
            </div>
        `;
        return;
    }
    
    let filteredImages = [...allImages];
    
    // Apply filters
    if (currentFilter === 'popular') {
        filteredImages.sort((a, b) => b.likes - a.likes);
    } else if (currentFilter === 'recent') {
        filteredImages.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }
    
    gallery.innerHTML = filteredImages.map(img => `
        <div class="image-card" onclick="openModal(${img.id})">
            <div class="image-wrapper">
                <img src="${img.src}" alt="${img.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect width=%22300%22 height=%22300%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2220%22 fill=%22%23999%22%3EImage Not Found%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="image-info">
                <div class="image-title">${img.name}</div>
                <div class="image-actions">
                    <button class="like-btn ${img.liked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike(${img.id})">
                        ${img.liked ? '❤️' : '🤍'}
                        <span class="like-count">${img.likes}</span>
                    </button>
                    <span class="image-date">${formatDate(img.uploadDate)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle like on an image
function toggleLike(id) {
    const image = allImages.find(img => img.id === id);
    if (image) {
        if (image.liked) {
            image.likes = Math.max(0, image.likes - 1);
            image.liked = false;
        } else {
            image.likes++;
            image.liked = true;
        }
        saveLikes();
        renderGallery();
        
        // Update modal if it's open
        if (currentModalImageId === id) {
            updateModalLike(image);
        }
    }
}

// Save likes to localStorage
function saveLikes() {
    const likesData = {};
    allImages.forEach(img => {
        likesData[img.filename] = {
            likes: img.likes,
            liked: img.liked,
            date: img.uploadDate
        };
    });
    localStorage.setItem('imageLikes', JSON.stringify(likesData));
}

// Open image modal
function openModal(id) {
    const image = allImages.find(img => img.id === id);
    if (image) {
        currentModalImageId = id;
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        
        modalImage.src = image.src;
        modalTitle.textContent = image.name;
        
        updateModalLike(image);
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentModalImageId = null;
}

// Toggle like in modal
function toggleLikeModal() {
    if (currentModalImageId !== null) {
        toggleLike(currentModalImageId);
    }
}

// Update modal like button
function updateModalLike(image) {
    const modalHeart = document.getElementById('modalHeart');
    const modalLikeCount = document.getElementById('modalLikeCount');
    const modalLikeBtn = document.getElementById('modalLikeBtn');
    
    modalHeart.textContent = image.liked ? '❤️' : '🤍';
    modalLikeCount.textContent = image.likes;
    
    if (image.liked) {
        modalLikeBtn.classList.add('liked');
    } else {
        modalLikeBtn.classList.remove('liked');
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
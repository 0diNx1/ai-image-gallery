const IMAGE_CONFIG = {
  folder: "images/",
  images: ["image1.png", "image2.png", "image3.png", "image4.png", "image5.png", "image6.png","image7.png","image8.png"]
};

let allImages = [];
let currentFilter = "all";
let currentModalImageId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadImages();
  setupFilters();
  setupThemeToggle();
  setupSearch();
  ScrollReveal().reveal(".image-card", { interval: 100, scale: 0.95 });
});

function loadImages() {
  const savedLikes = JSON.parse(localStorage.getItem("imageLikes") || "{}");
  allImages = IMAGE_CONFIG.images.map((filename, index) => ({
    id: index,
    filename,
    src: IMAGE_CONFIG.folder + filename,
    name: filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
    likes: savedLikes[filename]?.likes || 0,
    liked: savedLikes[filename]?.liked || false,
    uploadDate: savedLikes[filename]?.date || new Date().toISOString()
  }));
  renderGallery();
}

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderGallery();
    });
  });
}

function renderGallery() {
  const gallery = document.getElementById("gallery");
  let filteredImages = [...allImages];
  if (currentFilter === "popular") filteredImages.sort((a, b) => b.likes - a.likes);
  if (currentFilter === "recent") filteredImages.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  const query = document.getElementById("searchInput")?.value?.toLowerCase() || "";
  if (query) filteredImages = filteredImages.filter(img => img.name.toLowerCase().includes(query));

  if (filteredImages.length === 0) {
    gallery.innerHTML = `<p style="text-align:center; color:#bbb;">No images found.</p>`;
    return;
  }

  gallery.innerHTML = filteredImages.map(img => `
    <div class="image-card" onclick="openModal(${img.id})">
      <img src="${img.src}" alt="${img.name}">
      <div class="image-info">
        <h4 class="image-title">${img.name}</h4>
        <button class="like-btn ${img.liked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike(${img.id})">
          ${img.liked ? '❤️' : '🤍'} <span>${img.likes}</span>
        </button>
      </div>
    </div>
  `).join("");
}

function toggleLike(id) {
  const img = allImages.find(i => i.id === id);
  if (!img) return;
  img.liked = !img.liked;
  img.likes += img.liked ? 1 : -1;
  saveLikes();
  renderGallery();
  if (currentModalImageId === id) updateModalLike(img);
}

function saveLikes() {
  const likesData = {};
  allImages.forEach(img => likesData[img.filename] = { likes: img.likes, liked: img.liked, date: img.uploadDate });
  localStorage.setItem("imageLikes", JSON.stringify(likesData));
}

function openModal(id) {
  const img = allImages.find(i => i.id === id);
  if (!img) return;
  currentModalImageId = id;
  document.getElementById("modalImage").src = img.src;
  document.getElementById("modalTitle").textContent = img.name;
  updateModalLike(img);
  document.getElementById("imageModal").classList.add("active");
}

function closeModal() {
  document.getElementById("imageModal").classList.remove("active");
  currentModalImageId = null;
}

function toggleLikeModal() {
  if (currentModalImageId !== null) toggleLike(currentModalImageId);
}

function updateModalLike(img) {
  document.getElementById("modalHeart").textContent = img.liked ? "❤️" : "🤍";
  document.getElementById("modalLikeCount").textContent = img.likes;
}

function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    toggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  });
}

function setupSearch() {
  document.getElementById("searchInput").addEventListener("input", renderGallery);
}

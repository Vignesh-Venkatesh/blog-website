async function revealCover(cover: HTMLImageElement) {
    try {
        await cover.decode();
    } catch {
        // Continue when decoding is unsupported or the image failed to load.
    }
    // Commit the initial appearance before revealing cached images as well.
    requestAnimationFrame(() => requestAnimationFrame(() => {
        if (cover.isConnected) {
            cover.classList.add(cover.classList.contains("home-cover")
                ? "home-cover-loaded" : "article-cover-loaded");
        }
    }));
}

function initCovers() {
    document.querySelectorAll<HTMLImageElement>(".home-cover, .article-cover").forEach((cover) => {
        if (cover.complete && cover.naturalWidth > 0) {
            void revealCover(cover);
        } else {
            cover.addEventListener("load", () => void revealCover(cover), { once: true });
        }
    });
}

document.addEventListener("astro:page-load", initCovers);

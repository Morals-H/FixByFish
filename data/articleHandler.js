function togglePanel() {
    const panel = document.getElementById('panel');
    const tabs = document.getElementById('tabs');
    const icon = document.querySelector('.tabs-icon');

    if (panel.style.right === '0px') {
        panel.style.right = '-300px';
        tabs.style.right = '0px';
        icon.src = '/images/icons/Tabs.png';
    } else {
        panel.style.right = '0px';
        tabs.style.right = '250px';
        icon.src = '/images/icons/Exit.png';
    }
}

//load navbar
function loadArticles() {
    fetch('/data/articles.json')
        .then(response => response.json())
        .then(data => {
            const articleList = document.getElementById('article-list');
            data.forEach(article => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${article.url}">${article.title}</a>`;
                articleList.appendChild(li);
            });
        })
        .catch(error => console.error('Error loading articles:', error));
}

// Initialize everything when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    
    setTimeout(() => {
    loadArticles();
}, 250);
});
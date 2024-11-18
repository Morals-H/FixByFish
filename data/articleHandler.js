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

document.addEventListener('DOMContentLoaded', () => {
    function loadRecommendedSection() {
        // Load the recommended HTML
        fetch('/data/recommended.html') // Adjust the path to your sub-HTML
            .then(response => response.text())
            .then(html => {
                const recommendedContainer = document.getElementById('recommended');
                recommendedContainer.innerHTML = html; // Insert sub-HTML into the placeholder

                // Now populate the articles dynamically
                loadArticles();
            })
            .catch(error => console.error('Error loading recommended section:', error));
    }

    function loadArticles() {
        fetch('/data/articles.json')
            .then(response => response.json())
            .then(data => {
                // Handle all articles section
                const articleList = document.getElementById('article-list');
                if (articleList) {
                    data.forEach(article => {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="${article.url}">${article.title}</a>`;
                        articleList.appendChild(li);
                    });
                } else {
                    console.error('Error: article-list container not found.');
                }
    
                // Handle recommended articles section
                const middleArticles = data.slice(1, -1); // Exclude first and last entry
                const cubesContainer = document.querySelector('.article-cubes');
                if (cubesContainer) {
                    const shuffledArticles = middleArticles.sort(() => 0.5 - Math.random());
                    const selectedArticles = shuffledArticles.slice(0, 4);
    
                    // Clear existing cubes and append new ones
                    cubesContainer.innerHTML = '';
                    selectedArticles.forEach(article => {
                        const cube = document.createElement('a');
                        cube.href = article.url;
                        cube.className = 'cube';
                        cube.innerHTML = `
                            <h3><b>${article.title}</b></h3>
                            <p>${article.desc}</p>
                        `;
                        cubesContainer.appendChild(cube);
                    });
                } else {
                    console.error('Error: article-cubes container not found.');
                }
            })
            .catch(error => console.error('Error loading articles:', error));
    }
    
    

    // Load the recommended section
    loadRecommendedSection();
});

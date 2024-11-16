fetch('/articles.json')
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

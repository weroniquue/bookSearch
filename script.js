const endpoint = 'https://www.googleapis.com/books/v1/volumes?q=intitle:';
var loadElements = 0;
var totalBooks = 0;
var pollingForData = false;
var maxResult = "&maxResults=9"

var xhr = new XMLHttpRequest();

var contentContainer = document.getElementsByClassName('content-container')[0];
var loadingContainer = document.getElementsByClassName('loading-container')[0];




xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {

        pollingForData = false;
        var books = JSON.parse(xhr.response);
        totalBooks = books.totalItems;
        loadElements += books.items.length;

        const html = books.items.map((book, index) => {

            const title = book.volumeInfo.title;
            const cover = book.volumeInfo.imageLinks === undefined ? "" : book.volumeInfo.imageLinks.thumbnail;
            console.log(index + " " + title + " " + index%3);
            //const authors = book.volumeInfo.authors.map(function(a) { return `<div>${a}</div>` }).join('')

                return `
                    <article>
                        <h1>${title}</h1>
                        <img src="${cover}" alt="image">
                    </article>`
        }).join('');

        page = document.createElement('div');
        page.className += "flex-container";
        page.innerHTML = html;

        contentContainer.appendChild(page);

    } else {
        console.log('The request failed!');
    }
}


function displayBook(title) {
    xhr.open('GET', endpoint + title + maxResult );
    xhr.send();
    pollingForData = true;


    window.onscroll = function() {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 200) {
            if(loadElements<totalBooks && !pollingForData){
                pollingForData = true;
                xhr.open('GET', endpoint + title + '&startIndex=' + loadElements + maxResult);
                xhr.send();
            }

        }
    };
}

document.querySelector('#search').addEventListener('keyup', function (event) {
    if (event.key === "Enter") {
        while(contentContainer.firstChild){
            contentContainer.removeChild(contentContainer.firstChild);
        }
        console.log(document.getElementById("search").value);
        displayBook(document.getElementById("search").value);
    }
});

const endpoint = 'https://www.googleapis.com/books/v1/volumes?q=intitle:';
var loadElements = 0;
var totalBooks = 0;
var pollingForData = false;
const maxResult = "&maxResults=9"
const descriptionMaxLength = 100;

var httpRequest = new XMLHttpRequest();
const contentContainer = document.getElementsByClassName('content-container')[0];

httpRequest.onload = function () {
    if (httpRequest.status >= 200 && httpRequest.status < 300) {

        pollingForData = false;
        var books = JSON.parse(httpRequest.response);
        var html = "";
        page = document.createElement('div');

        if (books.totalItems == 0) {
            html = `<h1>No elements.</h1>`;
            page.className += "error";
            document.getElementById("search").value = "";

        } else {
            totalBooks = books.totalItems;
            loadElements += books.items.length;

            html = books.items.map(book => {

                const title = book.volumeInfo.title;
                const cover = book.volumeInfo.imageLinks === undefined ? "defbookcover.jpg" : book.volumeInfo.imageLinks.thumbnail;
                const description = book.volumeInfo.description === undefined ? "Description is not available." :
                    book.volumeInfo.description.substring(0, book.volumeInfo.description.lastIndexOf(" ", descriptionMaxLength)) + "...";

                return `
                    <article>
                        <img src="${cover}" alt="image">
                        <h1>${title}</h1>
                        <p>${description}</p>
                    </article>`
            }).join('');
            page.className += "flex-container";
        }

        page.innerHTML = html;

        contentContainer.appendChild(page);
    }
}

httpRequest.onerror = function () {
    error = document.createElement('h3');
    error.className += "error";
    error.innerText = 'The request failed!';
    contentContainer.appendChild(error);
}


function displayBook(title) {
    httpRequest.open('GET', endpoint + title + maxResult);
    httpRequest.send();
    pollingForData = true;

    window.onscroll = function () {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 200) {
            if (loadElements < totalBooks && !pollingForData) {
                pollingForData = true;
                httpRequest.open('GET', endpoint + title + '&startIndex=' + loadElements + maxResult);
                httpRequest.send();
            }
        }
    };
}

document.querySelector('#search').addEventListener('keyup', function (event) {
    if (event.key === "Enter") {
        while (contentContainer.firstChild) {
            contentContainer.removeChild(contentContainer.firstChild);
        }
        displayBook(document.getElementById("search").value);
    }
});

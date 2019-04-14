const endpoint = 'https://www.googleapis.com/books/v1/volumes?q=intitle:';
var loadElements = 0;
var totalBooks = 0;
var pollingForData = false;
const maxResult = "&maxResults=9"
const descriptionMaxLength = 100;

const contentContainer = document.getElementsByClassName('content-container')[0];

function makeRequest(method, url){

    return new Promise(function (resolve, reject) {
        var httpRequest  = new XMLHttpRequest();
        httpRequest .open(method, url);

        httpRequest.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(httpRequest .response);
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


            } else {
                reject({
                    status: this.status,
                    statusText: httpRequest .statusText
                });
            }
        };
        httpRequest .onerror = function () {
            error = document.createElement('h3');
            error.className += "error";
            error.innerText = 'The request failed!';
            contentContainer.appendChild(error);

            reject({
                status: this.status,
                statusText: httpRequest .statusText
            });
        };
        httpRequest.send();
    });


}

function displayBook(title) {
    makeRequest('GET', endpoint + title + maxResult)
    .then(function (data) {

    }).catch(function (err) {
        console.error('Augh, there was an error!', err.statusText);
    });

    pollingForData = true;

    window.onscroll = function () {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 200) {
            if (loadElements < totalBooks && !pollingForData) {
                pollingForData = true;
                makeRequest('GET', endpoint + title + '&startIndex=' + loadElements + maxResult)
                    .then(function (data) {

                    }).catch(function (err) {
                        console.error('Augh, there was an error!', err.statusText);
                    });
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

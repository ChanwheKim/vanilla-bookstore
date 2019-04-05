// Load application styles
import 'styles/index.scss';

// ================================
// START YOUR APP HERE
// ================================

// Importing component templates
import loginTemplate from 'Templates/login.ejs';
import cartContainerTemplate from 'Templates/cartContainer.ejs';
import headerTemplate from 'Templates/header.ejs';
import sideBarTemplate from 'Templates/sidebar.ejs';
import buttonMoreTemplate from 'Templates/buttonMore.ejs';
import listContainerTemplate from 'Templates/listContainer.ejs';
import showcaseTemplate from 'Templates/showcase.ejs';
import cardContainerTemplate from 'Templates/cardContainer.ejs';
import footerTemplate from 'Templates/footer.ejs';
import myAppTemplate from 'Templates/myApp.ejs';

import Cart from 'cart.js';

// Import Gorilla Module
import Gorilla from '../Gorilla';

const urlForBooks = 'http://localhost:3000/v1/search/book?display=20&';
const urlForshortUrl = 'http://localhost:3000/v1/util/shorturl?url=';
const bookListData = [];
const userCart = new Cart();
const displayState = {type : 'list', showingItemIdx : 0, loading : false, isListOnUI : false};
let userInfo = {};
let searchWord;
let startIdx;

const modal = new Gorilla.Component(loginTemplate, {display : false});
const cartList = new Gorilla.Component(cartContainerTemplate, {cart : userCart.retrieveCartDate(), display : false});
const header = new Gorilla.Component(headerTemplate, {userInfo : {}}, {cartList, modal});
const sideBar = new Gorilla.Component(sideBarTemplate);
const buttonMore = new Gorilla.Component(buttonMoreTemplate, {isListOnUI : displayState.isListOnUI});
const listContainer = new Gorilla.Component(listContainerTemplate, {bookListData}, {buttonMore});
const showcase = new Gorilla.Component(showcaseTemplate, {showcase : bookListData[displayState.showingItemIdx]});
const cardContainer = new Gorilla.Component(cardContainerTemplate, {bookListData}, {showcase, buttonMore});
const footer = new Gorilla.Component(footerTemplate);
const myApp = new Gorilla.Component(myAppTemplate, {type : displayState.type}, {header, sideBar, listContainer, footer});

modal.hideModalWindow = function() {
    modal.display = false;
};

const config = {
    apiKey: 'AIzaSyBZCUtdaDEM5Ft4d_M95vkv1CTuP9YPpGE',
    authDomain: 'vanilla-bookstre.firebaseapp.com',
    databaseURL: 'https://vanilla-bookstre.firebaseio.com',
    projectId: 'vanilla-bookstre',
    storageBucket: 'vanilla-bookstre.appspot.com',
    messagingSenderId: '162191801819',
};

firebase.initializeApp(config);

modal.controlSignUp = function() {
    const provider = new firebase.auth.GoogleAuthProvider();

    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    firebase.auth().signInWithPopup(provider).then(function handleUserInfo(result) {
        userInfo = result.user;
        userInfo.loggedIn = true;

        header.userInfo = userInfo;

        modal.display = false;
    }).catch(handleError);
};

buttonMore.displayMore = requestBookInfo;

header.displayLoginPopup = function() {
    modal.display = true;
};

header.getInputData = function(ev) {
    if(ev.keyCode === 13) {
        ev.preventDefault();

        searchWord = ev.target.value;

        if(searchWord.length >= 1 && searchWord.length <= 20) {
            bookListData.length = 0;

            requestBookInfo(searchWord);
        }
    }
};

listContainer.addToCart = controlCart;

cardContainer.displaySelectedCard = function(ev) {
    const cardItem = ev.currentTarget;
    const index = cardItem.id;

    showcase.showcase = bookListData[index];
};

cardContainer.handleCarouselMotion = function(ev) {
    const cardLists = cardContainer._element.children[1].children[1];
    const left = cardLists.offsetLeft;

    if(ev.target.classList.contains('icon-arrow-front')) {
        const containerLeft = cardLists.offsetLeft;
        const lastElLeft = cardLists.lastElementChild.offsetLeft;

        if(Math.abs(containerLeft) <= lastElLeft) {
            cardLists.style.left = `${left - 170}px`;
        }

        displayState.showingItemIdx++;

        showcase.showcase = bookListData[displayState.showingItemIdx];
    } else if(ev.target.classList.contains('icon-arrow-back')) {
        if(cardLists.offsetLeft < 0) {
            cardLists.style.left = `${left + 170}px`;

            displayState.showingItemIdx--;

            showcase.showcase = bookListData[displayState.showingItemIdx];
        }
    }
};

cartList.deleteItem = function(ev) {
    const listElement = ev.target.closest('.cart__lists--item');
    const key = listElement.dataset.key;

    userCart.deleteItem(key);

    cartList.cart = userCart.retrieveCartDate();
};

cartList.toggleCartBox = function(ev) {
    if(ev.target.classList.contains('icon-cart') || ev.target.classList.contains('cart__count')) {
        cartList.display = cartList.display ? false : true;
    }
};

myApp.controlView = function(ev) {
    displayState.type = ev.target.classList.contains('icon-list') ? 'list' : 'grid';

    displayLists();
};

Gorilla.renderToDOM(
    myApp,
    document.querySelector('#root')
);

function requestBookInfo() {
    if(!displayState.loading) {
        const request = new XMLHttpRequest();

        displayState.loading = true;

        startIdx = bookListData.length === 0 ? 0 : bookListData.length;

        request.open('GET', `${urlForBooks}query=${searchWord}&start=${startIdx + 1}`);
        request.send();
        request.onerror = handleError;
        request.onreadystatechange = function handleFirstResult() {
            if(request.readyState === 4 && request.status === 200) {
                bookListData.push(...JSON.parse(request.responseText).items);

                formatNumber();

                formatDate();

                removeBoldTag();

                shortenDescription();

                requestShortUrl();
            }
        };
    }
}

function formatNumber() {
    for(let i = startIdx; i < bookListData.length; i++) {
        bookListData[i].price = `${bookListData[i].price.substr(0, bookListData[i].price.length - 3)},${bookListData[i].price.substr(bookListData[i].price.length - 3)}`;
    }
}

function formatDate() {
    for(let i = startIdx; i < bookListData.length; i++) {
        bookListData[i].pubdate = `${bookListData[i].pubdate.substr(0, 4)}.${bookListData[i].pubdate.substr(4, 2)}.${bookListData[i].pubdate.substr(6)}`;
    }
}

function removeBoldTag() {
    for(let i = startIdx; i < bookListData.length; i++) {
        bookListData[i].author = deleteBoldTag(bookListData[i].author);
        bookListData[i].title = deleteBoldTag(bookListData[i].title);
        bookListData[i].description = deleteBoldTag(bookListData[i].description);
    }

    function deleteBoldTag(texts) {
        while(texts.includes('<b>') || texts.includes('</b>')) {
            texts = texts.replace('<b>', '');
            texts = texts.replace('</b>', '');
        }

        return texts;
    }
}

function shortenDescription() {
    let splitWords;
    let count;

    for(let i = startIdx; i < bookListData.length; i++) {
        splitWords = bookListData[i].description.split(' ');

        count = 0;

        for(let j = 0; j < splitWords.length; j++) {
            if(count + splitWords[j].length > 50) {
                bookListData[i].shortDescription = splitWords.slice(0, j).concat(['...']).join(' ');
                break;
            } else {
                count += splitWords[j].length;
            }
        }
    }
}

function requestShortUrl() {
    const urlToIndex = {};
    let count = 0;
    let request;

    for(let i = startIdx; i < bookListData.length; i++) {
        urlToIndex[bookListData[i].link] = i;

        request = new XMLHttpRequest();
        request.open('GET', urlForshortUrl + bookListData[i].link);
        request.send();
        request.onload = handleUrlResult;
        request.onerror = handleError;
    }

    function handleUrlResult(result) {
        const orginUrl = JSON.parse(result.target.response).result.orgUrl;
        const url = JSON.parse(result.target.response).result.url;
        const index = urlToIndex[orginUrl];

        count++;

        bookListData[index].url = url;

        if(count === 20) {
            displayState.isListOnUI = true;
            displayLists();
        }
    }
}

function displayLists() {
    if(displayState.type === 'list') {
        listContainer._view.context = {bookListData};

        myApp._view.children = {header, sideBar, listContainer, footer};
    } else {
        showcase._view.context = {showcase : bookListData[displayState.showingItemIdx]};

        cardContainer._view.context = {bookListData};
        cardContainer._view.children = {showcase, buttonMore};

        myApp._view.children = {header, sideBar, cardContainer, footer};
    }

    myApp.type = displayState.type;

    buttonMore.isListOnUI = displayState.isListOnUI;

    if(userCart.length > 0) {
        cartList.cart = userCart.retrieveCartDate();
    }

    if(userInfo.loggedIn) {
        header.userInfo = userInfo;
    }

    displayState.loading = false;
}

function controlCart(ev) {
    const id = ev.target.closest('.list-item').id;
    const bookSelected = bookListData[id];

    if(!userCart.hasItem(bookSelected.title + bookSelected.author)) {
        userCart.addToCart(bookSelected.title, bookSelected.author, bookSelected.image);
        userCart.persistData();
    }

    cartList.cart = userCart.retrieveCartDate();
}

function handleError(error) {
    alert(error);
}

window.addEventListener('load', function() {
    userCart.readStorage();

    if(userCart.length > 0) {
        cartList.cart = userCart.retrieveCartDate();
    }
});

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */

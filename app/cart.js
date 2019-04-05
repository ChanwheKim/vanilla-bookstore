export default function Cart() {
    this.data = {};
    this.length = 0;
}

Cart.prototype.addToCart = function(title, author, img) {
    const key = title.concat(author).split(' ').join('');
    const item = {title, author, img, key};

    this.data[key] = item;
    this.length++;

    return item;
};

Cart.prototype.deleteItem = function(key) {
    delete this.data[key];
    this.length--;
    this.persistData();
};

Cart.prototype.hasItem = function(key) {
    return this.data[key] !== undefined;
};

Cart.prototype.persistData = function() {
    localStorage.setItem('cart', JSON.stringify(this.data));
};

Cart.prototype.readStorage = function() {
    const storage = JSON.parse(localStorage.getItem('cart'));

    if(storage) {
        this.data = storage;
        this.length = Object.keys(storage).length;
    }
};

Cart.prototype.retrieveCartDate = function() {
    return Object.values(this.data);
};

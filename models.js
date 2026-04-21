// Dead code file full of classes and models that are never used

class UserModel {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    save() {
        console.log("Saving user to database...");
    }
}

class ProductModel {
    constructor(sku, price) {
        this.sku = sku;
        this.price = price;
    }
}

const DATABASE_URL = "mongodb://unused-db-string";
let globalCache = {};

function initDB() {
    return true;
}

module.exports = { UserModel, ProductModel, initDB };

var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "caeser",
    database: "BamazonDB"
});

connection.connect(function(err) {
    // console.log("Connected as id: "+ connection.threadId);
    if (err) throw err;

});

var start = function() {
    inquirer.prompt([{

        type: "list",
        name: "mngrOption",
        message: "What would you like to do?",
        choices: [
            'View products for sale',
            'View low inventory',
            'Add to inventory',
            'Add new products',
            "I'm done, thanks"
        ]
    }]).then(function(answer) {

        if (answer.mngrOption === 'View products for sale') {
            viewSales();
        } else if (answer.mngrOption === 'View low inventory') {
            viewLow();
        } else if (answer.mngrOption === 'Add to inventory') {
            addInventory();
        } else if (answer.mngrOption === 'Add new products') {
            addProduct();
        } else if (answer.mngrOption === "I'm done, thanks") {
            console.log("Have a great rest of your day");
            process.exit();
        }
    });
};

var viewSales = function() {

    connection.query("SELECT * FROM products", function(err, results) {

        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product Name", "Department", "Price", "Stock"],
            colWidths: [4, 35, 15, 8, 8]
        });
        // console.log("result" + results);

        for (var i = 0; i < results.length; i++) {
            table.push([results[i].id, results[i].product_name, results[i].department_name, results[i].price, results[i].stock_quanity]);
        }

        console.log(table.toString());
        start();
    })
}

var viewLow = function() {
    connection.query("SELECT * FROM products", function(err, results) {

        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product Name", "Department", "Price", "Stock"],
            colWidths: [4, 35, 15, 8, 8]
        });
        // console.log("result" + results);

        for (var i = 0; i < results.length; i++) {
            if (results[i].stock_quanity < 5) {
                table.push([results[i].id, results[i].product_name, results[i].department_name, results[i].price, results[i].stock_quanity]);
            }
        }



        console.log(table.toString());
        start();
    })
}

var addInventory = function() {

    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product Name", "Quantity"],
        });
        // console.log("result" + results);
        for (var i = 0; i < results.length; i++) {
            table.push([results[i].id, results[i].product_name, results[i].stock_quanity]);
        }

        console.log(table.toString());

        inquirer.prompt([{
            type: 'input',
            name: 'itemId',
            message: 'Which inventory would you like to add to? (Please enter the ID #)',
            validate: function(value) {
                if (isNaN(value) == false) {
                    return true
                } else {
                    return false;
                }
            }
        }, {
            type: 'input',
            name: 'amount',
            message: 'How many would you like to add?',
            validate: function(value) {
                if (isNaN(value) == false) {
                    return true
                } else {
                    return false;
                }
            }
        }]).then(function(answer) {

            connection.query('SELECT * FROM products WHERE ?', [{
                id: answer.itemId
            }], function(err, selectedItem) {
                if (err) throw err;
                console.log('You have added ' + answer.amount + ' ' + selectedItem[0].product_name + ' to the inventory.')
                connection.query('UPDATE products SET ? WHERE ?', [{
                    stock_quanity: parseInt(selectedItem[0].stock_quanity) + parseInt(answer.amount)
                }, {
                    id: answer.itemId
                }], function(err, inventory) {
                    if (err) throw err;
                    start();
                });

            });
        });
    })
}

var addProduct = function() {

    inquirer.prompt([

        {
            type: 'input',
            name: 'productToAdd',
            message: 'What product would you like to add?'

        }, {

            type: 'input',
            name: 'deptToAdd',
            message: 'What department should it be filed under?'

        }, {

            type: 'input',
            name: 'priceToAdd',
            message: 'What will be the price?'

        }, {

            type: 'input',
            name: 'stockToAdd',
            message: 'How many will be added to inventory?'
        }

    ]).then(function(answer) {

        connection.query('INSERT INTO products SET ?', {
            product_name: answer.productToAdd, 
            department_name: answer.deptToAdd, 
            price: answer.priceToAdd, 
            stock_quanity: answer.stockToAdd
        }, function(err, res) {
            if (err) throw err;

            console.log(answer.productToAdd + ' added successfully!');
            start();
        });
    });

}
start();

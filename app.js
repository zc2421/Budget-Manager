//budget controller
var budgetController = (function (){

    //build object
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function (){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        //have access to current value, index, or entire array
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };



    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    }

    return {
        addItem: function(type, des, val){

            var newItem, id;

            //create new id
            if (data.allItems[type].length > 0){
                id = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                id = 0;
            }


            //create new item based on type
            if (type === "exp"){
                newItem = new Expense(id, des, val);
            } else if (type === "inc"){
                newItem = new Income(id, des, val);
            }

            //push it into data structure
            data.allItems[type].push(newItem);

            return newItem;
        },


        deleteItem: function(type, id) {
            console.log("delete");
            var ids, index;
            // console.log(type);
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },


        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage of spent income
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function(){
            console.log(data);
        }

    };
})();








//ui controller
var UIController = (function (){

    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    return{
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            }
        },

        addListItem: function(obj,type){
            //create html string with placeholder text
            var html, newHtml, element;
            if (type === 'inc'){
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%">\n' +
                    '       <div class="item__description">%description%</div>\n' +
                    '       <div class="right clearfix">\n' +
                    '           <div class="item__value">%value%</div>\n' +
                    '           <div class="item__delete">\n' +
                    '               <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
                    '           </div>\n' +
                    '       </div>\n' +
                    '   </div>';
            }else if (type === 'exp'){
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%">\n' +
                    '       <div class="item__description">%description%</div>\n' +
                    '       <div class="right clearfix">\n' +
                    '            <div class="item__value">%value%</div>\n' +
                    '            <div class="item__percentage">21%</div>\n' +
                    '            <div class="item__delete">\n' +
                    '               <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
                    '            </div>\n' +
                    '       </div>\n' +
                    '    </div>';
            }



            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);


            //insert html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },


        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },



        clearFields: function(){
            var fields, fieldsArr;
            //return list not array
            fields = document.querySelectorAll(DOMStrings.inputDescription + "," + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            //up to 3
            fieldsArr.forEach(function(cur, i, arr){
                cur.value = "";
            });

            fieldsArr[0].focus();
        },


        displayBudget: function(obj){
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },


        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            console.log(fields);

            var nodeListForEach = function (list, callback){
                for (var i = 0; i < list.length; i++){
                    callback(list[i],i);
                }
            };

            nodeListForEach(fields, function(cur, index){
                if (percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%';
                } else {
                    cur.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, months, month, year;

            now = new Date();
            //var christmas = new Date(2016, 11, 25);

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },


        getDOMstrings: function(){
            return DOMStrings;
        }
    }

})();










//global app controller
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
        //hit button
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        //hit enter key
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };



    var updateBudget = function(){
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };


    var updatePercentages = function () {
        //1. calculate percentages
        budgetCtrl.calculatePercentages();

        //2. read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. update UI with new percentage
        UICtrl.displayPercentages(percentages);
    };



    var ctrlAddItem = function(){

        var input, newItem;
        //1. get the field input
        input = UICtrl.getInput();
        if (input.description === "" || isNaN(input.value) || input.value <= 0){
            return;
        }


        //2. add the items to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        //4. clear the fields;
        UICtrl.clearFields();

        //5. Calculate and update the budget
        updateBudget();

        //6. Update percentages
        updatePercentages();

    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID){

            splitID = itemID.split('-');
            type = splitID[0];
            // (type === "income") ? type = "inc" : type = "exp";
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);


            //2. Delete the item from UI
            UICtrl.deleteListItem(itemID);

            //3. Update new budget
            updateBudget();

            //4. Update percentages
            updatePercentages();
        }
    };



    return {
        init: function(){
            console.log("app starts");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        }
    }



})(budgetController, UIController);



controller.init();
// Variables

const incomeInput = document.querySelector('#income');
const expenseNameInput = document.querySelector('#expense-name');
const expenseAmountInput = document.querySelector('#expense-amount');
const categoryInput = document.querySelector('#category');
const addIncomeBtn = document.querySelector('#income-form button');
const addExpenseBtn = document.querySelector('#expense-form button');
const resetAppBtn = document.querySelector('#reset-app');
const resetIncomeBtn = document.querySelector('#reset-income');
const expenseList = document.querySelector('#expense-list');
const incomeFormTitle = document.querySelector('#income-form .form-title');
const expenseFormTitle = document.querySelector('#expense-form .form-title');
const forms = document.querySelectorAll('.form');
const formControls = document.querySelectorAll('.controls');
const selectOptions = forms[1].querySelector('select');


// State

let editState = false;
let isExpandedForm1 = false;
let isExpandedForm2 = false;
let categories = [];
// Function Expression

const onAddIncome = (e) => {
    e.preventDefault();
    let income = incomeInput.value ; 
    
    if (income === 0 || income === '' || income < 0) {
        alert('Please, enter a number greater than 0.');
    } else { 
        clearInputs();
        return addToTotalBudget(parseFloat(income));
    }
    
}



const onAddExpense = (e) => {
    e.preventDefault();
    let expenseName = expenseNameInput.value.trim();
    let expenseAmount = expenseAmountInput.value;
    let categoryName = categoryInput.value.trim();
    let selectCat = selectOptions.value;
    categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1, categoryName.length); 
    expenseName = expenseName.charAt(0).toUpperCase() + expenseName.slice(1, expenseName.length); 
    
    if (expenseName.length && expenseAmount.length && (categoryName.length || selectCat !== 'default')) {
        
        if (!editState) {
            
                if (selectCat !== 'default') {
                    addItemToDom(expenseName, expenseAmount, selectCat);
                    addItemToStorage(expenseName, expenseAmount, selectCat);
                    clearInputs();
                } else {
                    addItemToDom(expenseName, expenseAmount, categoryName);
                    addItemToStorage(expenseName, expenseAmount, categoryName);
                    clearInputs();
                }
            
            
            return checkUI();
        } else {
            const itemList = document.querySelectorAll('#expense-list .list-item');
            
            itemList.forEach(item => {
                if (item.classList.contains('edit')) { 
                    const name = item.querySelector('.name');
                    const amount = item.querySelector('.amount');
                    const oldName = name.textContent;
                    name.textContent = expenseName;
                    amount.textContent = expenseAmount;
                    clearInputs();
                    editMode(false)
                    editItemFromStorage(oldName, expenseName, expenseAmount);
                    
                    return checkUI();
                }
            })
        }
        
    } else {
        alert('Please, fill up all the boxes in order to add an expense.');
    }
}

const onCancelBtn = (e) => {
    e.preventDefault();
    clearInputs();
    
    return editMode(false);
}



const onResetApp = () => {
    const totalBudget = document.querySelector('.total-budget p');
    
    if(confirm('Are you sure you want to reset everything?')) {
        totalBudget.textContent = '0';
        expenseList.innerHTML = '';
        forms.forEach(form => expand(true, form));
        
        localStorage.removeItem('expenses');
        localStorage.removeItem('budget');
    }
    
    return checkUI();
}

const onResetIncome = () => {
    const totalBudget = document.querySelector('.total-budget p');
    
    if (confirm('Reset the income to 0?')) {
        totalBudget.textContent = '0';
        localStorage.removeItem('budget');
        return calculateBalance();
    }
    
}

const onListItemClick = (e) => {
    if (e.target.classList.contains('fa-trash')) { 
        const listElement = e.target.parentElement.parentElement.parentElement;
        const name = listElement.querySelector('.name');
        removeItem(listElement);
        removeItemFromStorage(name.textContent)
        return checkUI();
    } else if (e.target.classList.contains('fa-pen-to-square')) {
        expand(true, forms[1]);

        const listItem = e.target.parentElement.parentElement.parentElement;
        const itemName = listItem.querySelector('.name').textContent;
        const itemAmount = listItem.querySelector('.amount').textContent;
        expenseNameInput.value = itemName;
        expenseAmountInput.value = itemAmount;
        expenseAmountInput.focus();

        return editMode(true, listItem);
    };
}

// Function Declaration

function createButton (type) {
    const button = document.createElement('button');
    const icon = document.createElement('i');
    
    if (type === 'edit' || type === 'remove') {
        button.className = type === 'edit' ? 'edit-btn' : 'remove-btn';
        icon.className = `fa-sharp fa-solid ${type === 'edit' ? 'fa-pen-to-square' : 'fa-trash'}`;
    } else {
        button.className = 'form-btn cancel';
        button.setAttribute('type', 'submit');
        button.textContent = 'Cancel';
        icon.className = 'fa-sharp fa-solid fa-cancel';
    }
    
    button.appendChild(icon);
    
    return button;
    
}

function createListElement (expenseName, expenseAmount) {
    const listItem = document.createElement('li'); 
    listItem.className = 'list-item';
    const itemName = document.createElement('h3');
    itemName.className = 'name';
    itemName.textContent = expenseName;
    const itemAmount = document.createElement('p');
    itemAmount.className = 'amount';
    itemAmount.textContent = expenseAmount;
    const btnsWrap = document.createElement('div');
    btnsWrap.className = 'list-buttons';
    const editBtn = createButton('edit');
    const removeBtn = createButton('remove');
    
    btnsWrap.appendChild(editBtn);
    btnsWrap.appendChild(removeBtn);
    listItem.appendChild(itemName);
    listItem.appendChild(itemAmount);
    listItem.appendChild(btnsWrap);
    
    return listItem;
}

function createCategory(category) {
    const div = document.createElement('div');
    div.classList.add('category', `${category}`);

    const categoryName = document.createElement('h2');
    categoryName.classList.add('category-name');
    categoryName.textContent = category;

    const option = document.createElement('option');
    option.textContent = category;
    option.setAttribute('value', category);

    selectOptions.appendChild(option);
    div.appendChild(categoryName);

    return div;
}

function addItemToDom(name, amount, categoryName) {
    const item = createListElement(name, amount);
    
    if (categories.includes(categoryName)) {
        const catElement = document.querySelector(`.category.${categoryName}`);
        catElement.appendChild(item);
    } else {
        const categoryElement = createCategory(categoryName);
        categoryElement.appendChild(item);  
        expenseList.appendChild(categoryElement);
        categories.push(categoryName);
    }
    
    
    
    
    
    // console.log(categories , categoryElement);
    return;
}

function removeItem(item) {
    if (confirm('Are you sure you want to delete this item?')) {
        const itemName = item.querySelector('.name');

        item.remove();
        return removeItemFromStorage(itemName);
    }
}

function calculateBalance () {
    const balance = document.querySelector('.balance p');
    const totalBudget =  parseFloat(document.querySelector('.total-budget p').textContent);
    const expenses = document.querySelector('.expenses p');
    const listItems = document.querySelectorAll('#expense-list .list-item');
    let totalExpenses = 0;
    
    // Check expenses
    
    if (listItems.length) {
        
        listItems.forEach(item => {
            const itemAmount = item.querySelector('.amount');
            totalExpenses += parseFloat(itemAmount.textContent);
        })
    }
    
    expenses.textContent = `${totalExpenses}`;
    
    return balance.textContent = `${(totalBudget - totalExpenses).toFixed(2)}`
    
}

function addToTotalBudget (income) {
    const totalBudget = document.querySelector('.total-budget p')
    const amount = parseFloat(totalBudget.textContent);
    
    totalBudget.textContent = `${amount + income}`;
    setBudgetToStorage(parseFloat(income));
    
    return calculateBalance();
}

function editMode(state, item) {
    const listItems = Array.from(document.querySelectorAll('#expense-list li'));
    const cancelBtn = createButton('cancel');
    const formControl = document.querySelector('#expense-form .form-control:last-child')
    
    if (state) {
        const icon = addExpenseBtn.querySelector('i');
        const checkedItems = listItems.filter(itm => itm !== item);
        
        
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-pen-to-square');
        
        if (!editState) {
            cancelBtn.addEventListener('click', onCancelBtn)
            formControl.appendChild(cancelBtn);
            
            addExpenseBtn.classList.add('edit');
            addExpenseBtn.firstChild.textContent = 'Update';
        }
        
        item.classList.add('edit');
        
        checkedItems.forEach(item => {
            if (item.classList.contains('edit')) {
                item.classList.remove('edit');
            }
        })
        
        return editState = state;
    } else {
        const icon = addExpenseBtn.querySelector('i');
        const cancelBtn = formControl.querySelector('button:last-child')
        icon.classList.remove('fa-pen-to-square');
        icon.classList.add('fa-minus');
        
        addExpenseBtn.classList.remove('edit');
        addExpenseBtn.firstChild.textContent = 'Add Expense'
        
        cancelBtn.remove();
        
        listItems.forEach(item => {
            if (item.classList.contains('edit')) {
                item.classList.remove('edit');
            }
        })
        
        return editState = state;
    }
}

function showHide (e) {
    const formTitle = e.currentTarget.querySelector('h2');
    const formTitleIcon = formTitle.querySelector('i');
    const formControls = e.currentTarget.querySelector('.controls');
   
    let isExpanded = e.currentTarget.id === 'income-form' ? isExpandedForm1 : isExpandedForm2;

    if ( isExpanded && (e.target === formTitle || e.target === formTitleIcon)) {
        formControls.classList.remove('show');
        formControls.classList.add('hidden');
        formTitleIcon.style.transform = 'rotate(0deg)';

        return e.currentTarget.id === 'income-form' ? isExpandedForm1 = false : isExpandedForm2 = false;

    } else if (!isExpanded && (e.target === formTitle || e.target === formTitleIcon)) {
        formControls.classList.remove('hidden');
        formControls.classList.add('show');
        formTitleIcon.style.transform = 'rotate(180deg)';

        return e.currentTarget.id === 'income-form' ? isExpandedForm1 = true : isExpandedForm2 = true;
    }
}

function expand(state,form) {
    const formTitle = form.querySelector('h2');
    const formTitleIcon = formTitle.querySelector('i');
    const formControls = form.querySelector('.controls');
   
    if (state) {
        formControls.classList.remove('hidden');
        formControls.classList.add('show');
        formTitleIcon.style.transform = 'rotate(0deg)';

        return form.id === 'income-form' ? isExpandedForm1 = true : isExpandedForm2 = true;
    } else {
        formControls.classList.remove('show');
        formControls.classList.add('hidden');
        formTitleIcon.style.transform = 'rotate(180deg)';
        
        return form.id === 'income-form' ? isExpandedForm1 = false : isExpandedForm2 = false;
    }

}

// Local Storage

function addItemToStorage(name, amount, category) {
    const itemsFromStorage = getItemsFromStorage();

    const item = {
       name,
       amount,
       category
    };

    itemsFromStorage.push(item);

    return localStorage.setItem('expenses', JSON.stringify(itemsFromStorage));
}

function getItemsFromStorage() {
    let itemsFromStorage;

    if (localStorage.getItem('expenses') === null) {
        itemsFromStorage = [];
    } else {
        itemsFromStorage = JSON.parse(localStorage.getItem('expenses'));
    }

     return itemsFromStorage;
}

function removeItemFromStorage(name) {
    let itemsFromStorage = getItemsFromStorage();

    itemsFromStorage = itemsFromStorage.filter(i => i.name !== name);

    localStorage.setItem('expenses', JSON.stringify(itemsFromStorage));
}

function editItemFromStorage(oldName, name, amount) {
    let itemsFromStorage = getItemsFromStorage();

    itemsFromStorage = itemsFromStorage.map(item => {
        if (item.name === oldName) {
            return {
                name,
                amount
            }
        } else {
            return {
                name: item.name,
                amount: item.amount
            }
        }
    })

    return localStorage.setItem('expenses', JSON.stringify(itemsFromStorage));
}

function setBudgetToStorage(budget) {
    let budgetFromStorage = getBudgetFromStorage();

    budgetFromStorage += budget;

    return localStorage.setItem('budget', JSON.stringify(budgetFromStorage));
}

function getBudgetFromStorage() {
    let budgetFromStorage = localStorage.getItem('budget');

    if (budgetFromStorage === null) {
        budgetFromStorage = 0
    } else {
        budgetFromStorage = JSON.parse(budgetFromStorage);
    }

    return budgetFromStorage;
}

function resetAppBudget() {
    const budgetFromStorage = getBudgetFromStorage();

}
// UI

function clearInputs() {
    incomeInput.value = '';
    expenseAmountInput.value = '';
    expenseNameInput.value = '';
    categoryInput.value = '';
    selectOptions.value = 'default';
}

function checkUI() {
    const listItems = document.querySelectorAll('#expense-list li');
    const expenseListWrapper = document.querySelector('.list-wrapper');
    const totalBudget = parseFloat(document.querySelector('.total-budget p').textContent);

    if (!listItems.length) {
        expenseListWrapper.style.display = 'none';
        if (totalBudget === 0) {
            resetAppBtn.style.display = 'none';
        }
    } else {
        resetAppBtn.style.display = 'block';
        expenseListWrapper.style.display = 'block';
    }


    return calculateBalance();
}

function displayItems() {
    const itemsFromStorage = getItemsFromStorage();
    const totalBudget = document.querySelector('.total-budget p');

    if (itemsFromStorage.length) {
        itemsFromStorage.forEach(item => addItemToDom(item.name, item.amount, item.category));
    }

    totalBudget.textContent = `${getBudgetFromStorage()}`

    formControls.forEach(control => control.classList.add('hidden'));

    checkUI();
  }

// initialize app

function init() {
    addIncomeBtn.addEventListener('click', onAddIncome);
    addExpenseBtn.addEventListener('click', onAddExpense);
    expenseList.addEventListener('click', onListItemClick);
    resetAppBtn.addEventListener('click', onResetApp);
    resetIncomeBtn.addEventListener('click', onResetIncome);
    forms.forEach(form => form.addEventListener('click', showHide))
    document.addEventListener('DOMContentLoaded', displayItems)
    
    checkUI();
}

init();



const incomeInput = document.querySelector('#income');
const expenseNameInput = document.querySelector('#expense-name');
const expenseAmountInput = document.querySelector('#expense-amount');
const addIncomeBtn = document.querySelector('#income-form button');
const addExpenseBtn = document.querySelector('#expense-form button');
const resetBtn = document.querySelector('.reset-btn');
const expenseList = document.querySelector('#expense-list');
const incomeFormTitle = document.querySelector('#income-form .form-title');
const expenseFormTitle = document.querySelector('#expense-form .form-title');

let editState = false;

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
    let expenseName = expenseNameInput.value;
    let expenseAmount = expenseAmountInput.value;
    expenseName = expenseName.charAt(0).toUpperCase() + expenseName.slice(1, expenseName.length); 
    
    if (expenseName.length && expenseAmount.length) {
        
        if (!editState) {
            
            const listElement = createListElement(expenseName, expenseAmount);
            
            expenseList.appendChild(listElement);
            clearInputs();
            
            return checkUI();
        } else {
            const itemList = document.querySelectorAll('#expense-list .list-item');
            
            itemList.forEach(item => {
                if (item.classList.contains('edit')) { 
                    const name = item.querySelector('.name');
                    const amount = item.querySelector('.amount');
                    name.textContent = expenseName;
                    amount.textContent = expenseAmount;
                    clearInputs();
                    editMode(false)
                    
                    return checkUI();
                }
            })
        }
        
    } else {
        alert('Please, fill up both boxes in order to add an expense.');
    }
}

const onCancelBtn = (e) => {
    e.preventDefault();
    clearInputs();
    
    return editMode(false);
}


const onListItemClick = (e) => {
    if (e.target.classList.contains('fa-trash')) { 
        removeItem(e.target.parentElement.parentElement.parentElement);
        return checkUI();
    } else if (e.target.classList.contains('fa-pen-to-square')) {
        const listItem = e.target.parentElement.parentElement.parentElement;
        const itemName = listItem.querySelector('.name').textContent;
        const itemAmount = listItem.querySelector('.amount').textContent;
        expenseNameInput.value = itemName;
        expenseAmountInput.value = itemAmount;
        
        return editMode(true, listItem);
    };
}

const onReset = () => {
    const totalBudget = document.querySelector('.total-budget p');

    if(confirm('Are you sure you want to reset everything?')) {
        totalBudget.textContent = '0';
        expenseList.innerHTML = '';
    }

    return checkUI();
}

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

function expandForm (e) {
    const formControls = e.target.parentElement.querySelectorAll('.form-control');
    const formCaret = e.target.parentElement.querySelector('.form-title i');
    
    formControls.forEach(control => {
        control.style.display = 'flex';
    })
    
    formCaret.style.transform = 'rotate(180deg)';
}

function collapseForm (e) {
    const formControls = e.target.parentElement.querySelectorAll('.form-control');
    const formCaret = e.target.parentElement.querySelector('.form-title i');
    
    formControls.forEach(control => {
        control.style.display = 'none';
    })

    formCaret.style.transform = 'rotate(180deg)';
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

function removeItem(item) {
    if (confirm('Are you sure you want to delete this item?')) {
        item.remove();
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
    
    return balance.textContent = `${totalBudget - totalExpenses}`
    
}

function addToTotalBudget (income) {
    const totalBudget = document.querySelector('.total-budget p')
    const amount = parseFloat(totalBudget.textContent);
    
    totalBudget.textContent = `${amount + income}`;
    
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
            addExpenseBtn.firstChild.textContent = 'Update'
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

function clearInputs() {
    incomeInput.value = '';
    expenseAmountInput.value = '';
    expenseNameInput.value = ''
}

function checkUI() {
    const listItems = document.querySelectorAll('#expense-list li');
    const expenseListWrapper = document.querySelector('.list-wrapper');
    const totalBudget = parseFloat(document.querySelector('.total-budget p').textContent);

    if (!listItems.length) {
        expenseListWrapper.style.display = 'none';
        if (totalBudget === 0) {
            resetBtn.style.display = 'none';
        }
    } else {
        resetBtn.style.display = 'block';
        expenseListWrapper.style.display = 'block';
    }

    return calculateBalance();
}

// Event Listeners

addIncomeBtn.addEventListener('click', onAddIncome);
addExpenseBtn.addEventListener('click', onAddExpense);
expenseList.addEventListener('click', onListItemClick);
resetBtn.addEventListener('click', onReset)
incomeFormTitle.addEventListener('click', collapseForm);

checkUI();


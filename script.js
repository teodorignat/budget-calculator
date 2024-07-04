const incomeInput = document.querySelector('#income');
const addIncomeBtn = document.querySelector('#income-form button');

const calculateBalance = () => {
    const balance = document.querySelector('.balance p');
    const totalBudget =  parseFloat(document.querySelector('.total-budget p').textContent);
    const expenses = parseFloat(document.querySelector('.expenses p').textContent);

    return balance.textContent = `${totalBudget - expenses}`

}

const addToTotalBudget = (income) => {
    const totalBudget = document.querySelector('.total-budget p')
    const amount = parseFloat(totalBudget.textContent);

    totalBudget.textContent = `${amount + income}`;

    return calculateBalance();
} 

const onAddIncome = (e) => {
    e.preventDefault();
    const income = incomeInput.value ; 

    if (income === 0 || income === '' || income < 0) {
        alert('Please, enter a number greater than 0');
    } else { 
       return addToTotalBudget(parseFloat(income));
    }
}

addIncomeBtn.addEventListener('click', onAddIncome);
const API_URL = 'http://localhost:3000/api/expenses';

const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalAmountEl = document.getElementById('total-amount');

// 1. Fetch and display expenses when the page loads
async function fetchExpenses() {
    try {
        const response = await fetch(API_URL);
        const expenses = await response.json();

        expenseList.innerHTML = ''; // Clear current list

        let total = 0; // Initialize total tracker

        expenses.forEach(expense => {
            const amount = Number(expense.AMOUNT);
            total += amount; // Add each expense amount to the total

            const tr = document.createElement('tr');
            const formattedDate = new Date(expense.CREATED_AT).toLocaleDateString();

            tr.innerHTML = `
                <td>${escapeHTML(expense.DESCRIPTION)}</td>
                <td>${escapeHTML(expense.CATEGORY)}</td>
                <td>$${amount.toFixed(2)}</td>
                <td>${formattedDate}</td>
                <td><button class="delete-btn" onclick="deleteExpense(${expense.ID})">Delete</button></td>
            `;
            expenseList.appendChild(tr);
        });

        // Update the total display on the page
        totalAmountEl.textContent = `$${total.toFixed(2)}`;

    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}

// 2. Handle form submission (Create expense)
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page from reloading

    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, amount, category })
        });

        if (response.ok) {
            expenseForm.reset(); // Reset form fields
            fetchExpenses();     // Refresh table list
        } else {
            alert('Failed to add expense');
        }
    } catch (error) {
        console.error('Error adding expense:', error);
    }
});

// 3. Handle deleting an expense
async function deleteExpense(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchExpenses(); // Refresh table list
        } else {
            alert('Failed to delete expense');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
    }
}

// Security helper to prevent basic XSS injection in DOM rendering
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Load expenses on initial page load
fetchExpenses();
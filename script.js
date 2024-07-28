const createAccountButton = document.getElementById('create-account');
const accountsList = document.getElementById('accounts');

const API_URL = 'http://localhost:4000/accounts'; // Backend API endpoint

// Fetch accounts from the backend
const fetchAccounts = async () => {
    const response = await fetch(API_URL);
    const accounts = await response.json();
    accountsList.innerHTML = accounts.map(account => `
        <li>${account.name} - $${account.balance.toFixed(2)}</li>
    `).join('');
};

// Create a new account
const createAccount = async () => {
    const accountName = document.getElementById('account-name').value;
    if (!accountName) return alert('Account name is required');

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: accountName }),
    });

    if (response.ok) {
        document.getElementById('account-name').value = ''; // Clear input
        fetchAccounts(); // Refresh accounts list
    } else {
        alert('Failed to create account');
    }
};

// Event listeners
createAccountButton.addEventListener('click', createAccount);
window.onload = fetchAccounts; // Fetch accounts on page load

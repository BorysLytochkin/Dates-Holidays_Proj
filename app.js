document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        button.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const calculateBtn = document.getElementById('calculate-btn');
const calculationTypeSelect = document.getElementById('calculation-type');
const resultsTable = document.getElementById('results-table');

[startDateInput, endDateInput].forEach(input => {
    input.addEventListener('change', () => {
        startDateInput.max = endDateInput.value || '';
        endDateInput.min = startDateInput.value || '';
    });
});

function calculateDifference(startDate, endDate, option) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start); 

    switch (option) {
        case 'days':
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        case 'hours':
            return Math.ceil(diffTime / (1000 * 60 * 60));
        case 'minutes':
            return Math.ceil(diffTime / (1000 * 60));
        case 'seconds':
            return Math.ceil(diffTime / 1000);
        default:
            return null;
    }
}

function saveResult(startDate, endDate, result) {
    const results = JSON.parse(localStorage.getItem('results')) || [];
    results.push({ startDate, endDate, result });
    if (results.length > 10) results.shift(); 
    localStorage.setItem('results', JSON.stringify(results));
    renderResults(); 
}

function renderResults() {
    const results = JSON.parse(localStorage.getItem('results')) || [];
    resultsTable.innerHTML = `
        <tr>
            <th>Початкова дата</th>
            <th>Кінцева дата</th>
            <th>Результат</th>
        </tr> `;
    results.forEach(({ startDate, endDate, result }) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${startDate}</td><td>${endDate}</td><td>${result}</td>`;
        resultsTable.appendChild(row);
    });
}

calculateBtn.addEventListener('click', () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const calculationType = calculationTypeSelect.value;

    if (!startDate || !endDate) {
        alert('Будь ласка, оберіть обидві дати!');
        return;
    }

    const result = calculateDifference(startDate, endDate, calculationType);
    if (result !== null) {
        saveResult(startDate, endDate, `${result} ${calculationType}`);
    }
});

renderResults();



const countrySelect = document.getElementById('country');
const yearSelect = document.getElementById('year');
const holidaysTableBody = document.querySelector('#holidays-table tbody');
const apiKey = 'UQlIzeC5ztzxnMjD8sADDGiJ0HQXYfpw';

async function fetchCountries() {
    const response = await fetch(`https://calendarific.com/api/v2/countries?api_key=${apiKey}`);
    const data = await response.json();
    const countries = data.response.countries;

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country['iso-3166'];
        option.textContent = country.country_name;
        countrySelect.appendChild(option);
    });

    yearSelect.disabled = false;
}

async function fetchHolidays(country, year) {
    const response = await fetch(`https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${country}&year=${year}`);
    const data = await response.json();
    const holidays = data.response.holidays;

    holidaysTableBody.innerHTML = '';
    holidays.forEach(holiday => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(holiday.date.iso).toLocaleDateString()}</td>
            <td>${holiday.name}</td>
        `;
        holidaysTableBody.appendChild(row);
    });
}

countrySelect.addEventListener('change', () => {
    if (countrySelect.value) {
        fetchHolidays(countrySelect.value, yearSelect.value);
    }
});

yearSelect.addEventListener('change', () => {
    if (countrySelect.value) {
        fetchHolidays(countrySelect.value, yearSelect.value);
    }
});

function initYearSelect() {
    const currentYear = new Date().getFullYear();
    for (let i = 2001; i <= 2049; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

initYearSelect();
fetchCountries();



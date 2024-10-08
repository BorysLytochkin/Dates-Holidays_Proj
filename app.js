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

function calculateDifference(startDate, endDate, option, filterOption) {

    let daysCount = filterDays(startDate, endDate, filterOption);

    switch (option) {
        case 'days':
            return daysCount;
        case 'hours':
            return daysCount * 24;
        case 'minutes':
            return daysCount * 24 * 60;
        case 'seconds':
            return daysCount * 24 * 60 * 60;
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

    countrySelect.addEventListener('change', function() {

        if (countrySelect.value !== "") {
            yearSelect.disabled = false;
        } else {
            yearSelect.disabled = true;
        }
    });
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

const weekPresetBtn = document.getElementById('week-preset');
const monthPresetBtn = document.getElementById('month-preset');

weekPresetBtn.addEventListener('click', () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 6); 

    startDateInput.value = startDate.toISOString().split('T')[0];
    endDateInput.value = endDate.toISOString().split('T')[0];
});

monthPresetBtn.addEventListener('click', () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); 

    startDateInput.value = startDate.toISOString().split('T')[0];
    endDateInput.value = endDate.toISOString().split('T')[0];
});

const dayFilterSelect = document.getElementById('day-filter');

function filterDays(startDate, endDate, filterOption) {
    let currentDate = new Date(startDate);
    const filteredDates = [];

    while (currentDate <= new Date(endDate)) {
        const dayOfWeek = currentDate.getDay();

        if (filterOption === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) {
            filteredDates.push(new Date(currentDate));
        } else if (filterOption === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) {
            filteredDates.push(new Date(currentDate));
        } else if (filterOption === 'all') {
            filteredDates.push(new Date(currentDate));
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return filteredDates.length; 
}


calculateBtn.addEventListener('click', () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const calculationType = calculationTypeSelect.value;
    const dayFilter = dayFilterSelect.value; 

    if (!startDate || !endDate) {
        alert('Будь ласка, оберіть обидві дати!');
        return;
    }

    const result = calculateDifference(startDate, endDate, calculationType, dayFilter); 
    if (result !== null) {
        saveResult(startDate, endDate, `${result} ${calculationType} (з урахуванням фільтра ${dayFilter})`);
    }
});

let sortAscending = true; 

document.getElementById('sort-date-btn').addEventListener('click', () => {
    const holidaysRows = Array.from(holidaysTableBody.querySelectorAll('tr'));
    holidaysRows.sort((a, b) => {
        const dateA = new Date(a.children[0].textContent.split('.').reverse().join('-')); 
        const dateB = new Date(b.children[0].textContent.split('.').reverse().join('-'));
        return sortAscending ? dateA - dateB : dateB - dateA;
    });

    sortAscending = !sortAscending; 

    holidaysTableBody.innerHTML = '';
    holidaysRows.forEach(row => holidaysTableBody.appendChild(row));
});




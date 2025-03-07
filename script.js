const translations = {
    ru: {
        title: "Расписание уроков",
        grade: "Класс:",
        letter: "Буква:",
        day: "День",
        load: "Загрузить",
        time: "Время",
        subject: "Предмет",
        teacher: "Учитель",
        noData: "Нет данных",
        schoolName: "Школа-гимназия №13 имени А.Навои"
    },
    kz: {
        title: "Сабақ кестесі",
        grade: "Сынып:",
        letter: "Әріп:",
        day: "Күні",
        load: "Жүктеу",
        time: "Уақыт",
        subject: "Пән",
        teacher: "Мұғалім",
        noData: "Деректер жоқ",
        schoolName: "Ә.Науаи атындағы №13 мектеп-гимназия"
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const grades = {
        "5": ["А", "Ә", "Б", "В", "Г"],
        "6": ["А", "Ә", "Б", "В", "Г"],
        "7": ["А", "Ә", "Б", "В", "Г", "Д"],
        "8": ["А", "Ә", "Б", "В", "Г"],
        "9": ["А", "Ә", "Б", "В", "Г"],
        "10": ["А", "Ә", "Б"],
        "11": ["А", "Ә", "Б", "В"]
    };
    const daysRu = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const daysKz = ["Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма", "Сенбі"];
    // Get DOM elements
    const gradeSelect = document.getElementById("gradeSelect");
    const classSelect = document.getElementById("classSelect");
    const daySelect = document.getElementById("daySelect");
    
    // Initialize dropdowns
    fillSelect(gradeSelect, Object.keys(grades));
    fillSelect(classSelect, grades["5"]);
    fillSelect(daySelect, daysKz);
    
    // Grade change handler
    gradeSelect.addEventListener("change", () => {
        fillSelect(classSelect, grades[gradeSelect.value]);
    });

    // Theme handling
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Language handling
    const langSwitch = document.getElementById('langSwitch');
    const langIcon = document.getElementById('langIcon');
    const savedLang = localStorage.getItem('lang') || 'kz';
    
    setLanguage(savedLang);

    langSwitch.addEventListener('click', () => {
        const currentLang = html.getAttribute('data-lang');
        const newLang = currentLang === 'kz' ? 'ru' : 'kz';
        setLanguage(newLang);
        localStorage.setItem('lang', newLang);
    });

    function setLanguage(lang) {
        html.setAttribute('data-lang', lang);
        langIcon.src = `assets/${lang === 'kz' ? 'kazakh' : 'russian'}.png`;
        
        // Update text content
        document.querySelector('main h1').textContent = translations[lang].title;
        document.querySelector('header h1').textContent = translations[lang].schoolName;
        
        // Update labels
        const labels = document.querySelectorAll('.filters label');
        labels[0].childNodes[0].textContent = translations[lang].grade;
        labels[1].childNodes[0].textContent = translations[lang].letter;
        labels[2].childNodes[0].textContent = translations[lang].day;
        
        // Update button
        document.querySelector('button[onclick="loadSchedule()"]').textContent = translations[lang].load;
        
        // Update table headers
        const headers = document.querySelectorAll('th');
        headers[0].textContent = translations[lang].time;
        headers[1].textContent = translations[lang].subject;
        headers[2].textContent = translations[lang].teacher;

        // Update day select options
        fillSelect(daySelect, lang === 'kz' ? daysKz : daysRu);
    }

    // Add loadSchedule function
    window.loadSchedule = async function() {
        const grade = gradeSelect.value;
        const letter = classSelect.value;
        const day = daySelect.value;
        const currentLang = html.getAttribute('data-lang');
        
        const fileName = currentLang === 'kz' 
            ? `Сабақ кестесі - ${grade} ${letter}.xlsx`
            : `Расписание - ${grade} ${letter}.xlsx`;
            
        const filePath = `data/schedule-${currentLang}/${fileName}`;
        
        try {
            const response = await fetch(filePath);
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the sheet for the selected day
            const dayIndex = (currentLang === 'kz' ? daysKz : daysRu).indexOf(day);
            const sheet = workbook.Sheets[workbook.SheetNames[dayIndex]];
            
            // Convert sheet data to JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            // Update table with schedule data
            updateScheduleTable(jsonData);
        } catch (error) {
            console.error('Error loading schedule:', error);
            showError(currentLang === 'kz' ? translations.kz.noData : translations.ru.noData);
        }
    };

    function updateScheduleTable(data) {
        const tbody = document.querySelector('#scheduleTable tbody');
        tbody.innerHTML = '';
        
        // Skip header row if it exists
        const startRow = data[0][0] === '№' || data[0][0] === 'Time' ? 1 : 0;
        
        for (let i = startRow; i < data.length; i++) {
            const row = data[i];
            if (!row[0]) continue; // Skip empty rows
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row[0]}</td>
                <td>${row[1] || '-'}</td>
                <td>${row[2] || '-'}</td>
            `;
            tbody.appendChild(tr);
        }
    }

    function showError(message) {
        const tbody = document.querySelector('#scheduleTable tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="3">${message}</td>
            </tr>
        `;
    }
});

function fillSelect(select, options) {
    select.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join("");
}

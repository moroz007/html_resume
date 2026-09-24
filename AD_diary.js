// Показываем текущую дату
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('currentDate').textContent =
        `📅 ${now.toLocaleDateString('ru-RU', options)}`;
}

// Переключение вкладок
function showTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Показать выбранную
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`.tab[onclick="showTab('${tabName}')"]`).classList.add('active');

    // Если открыли историю - обновить
    if (tabName === 'history') {
        loadHistory();
    }
}

// Сохранение измерения
function saveMeasurement() {
    const systolic = document.getElementById('systolic').value;
    const diastolic = document.getElementById('diastolic').value;
    const pulse = document.getElementById('pulse').value;
    const notes = document.getElementById('notes').value;

    if (!systolic || !diastolic || !pulse) {
        showStatus('Заполните все поля!', 'error');
        return;
    }

    // Получаем существующие данные
    let measurements = JSON.parse(localStorage.getItem('healthData') || '[]');

    // Добавляем новое измерение
    const newMeasurement = {
        id: Date.now(),
        date: new Date().toLocaleString('ru-RU'),
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: parseInt(pulse),
        notes: notes
    };

    measurements.unshift(newMeasurement); // Добавляем в начало

    // Сохраняем
    localStorage.setItem('healthData', JSON.stringify(measurements));

    // Очищаем поля
    document.getElementById('systolic').value = '';
    document.getElementById('diastolic').value = '';
    document.getElementById('pulse').value = '';
    document.getElementById('notes').value = '';

    showStatus('✅ Измерение сохранено!', 'success');

    // Автопереход на историю через 1 секунду
    setTimeout(() => showTab('history'), 1000);
}

// Загрузка истории
function loadHistory() {
    const measurements = JSON.parse(localStorage.getItem('healthData') || '[]');
    const historyList = document.getElementById('history-list');

    if (measurements.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #777;">Нет сохраненных измерений</p>';
        return;
    }

    let html = `<p>Всего измерений: ${measurements.length}</p>`;

    measurements.forEach(measurement => {
        // Определяем статус давления
        let pressureStatus = '';
        let statusClass = '';

        if (measurement.systolic > 140 || measurement.diastolic > 90) {
            pressureStatus = 'Повышенное';
            statusClass = 'danger';
        } else if (measurement.systolic < 100 || measurement.diastolic < 60) {
            pressureStatus = 'Пониженное';
            statusClass = 'danger';
        } else {
            pressureStatus = 'Норма';
            statusClass = 'normal';
        }

        // Статус пульса
        let pulseStatus = '';
        if (measurement.pulse > 100) {
            pulseStatus = '<span class="danger">Высокий</span>';
        } else if (measurement.pulse < 60) {
            pulseStatus = '<span class="danger">Низкий</span>';
        } else {
            pulseStatus = '<span class="normal">Норма</span>';
        }

        html += `
            <div class="history-item">
                <div style="font-weight: bold;">${measurement.date}</div>
                <div>📊 Давление: <b>${measurement.systolic}/${measurement.diastolic}</b>
                    <span class="${statusClass}">${pressureStatus}</span>
                </div>
                <div>❤️ Пульс: <b>${measurement.pulse}</b> уд/мин ${pulseStatus}</div>
                ${measurement.notes ? `<div>📝 Заметки: ${measurement.notes}</div>` : ''}
                <button onclick="deleteMeasurement(${measurement.id})" style="margin-top: 5px; background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    Удалить
                </button>
            </div>
        `;
    });

    historyList.innerHTML = html;
}

// Удаление измерения
function deleteMeasurement(id) {
    let measurements = JSON.parse(localStorage.getItem('healthData') || '[]');
    measurements = measurements.filter(m => m.id !== id);
    localStorage.setItem('healthData', JSON.stringify(measurements));
    loadHistory();
}

// Очистка всех данных
function clearAllData() {
    if (confirm('Удалить всю историю измерений? Это действие нельзя отменить.')) {
        localStorage.removeItem('healthData');
        loadHistory();
        showStatus('История очищена', 'success');
    }
}

// Экспорт в CSV

/*
function exportToCSV() {
    const measurements = JSON.parse(localStorage.getItem('healthData') || '[]');

    let csv = 'Дата;Верхнее давление;Нижнее давление;Пульс;Заметки\n';

    measurements.forEach(m => {
        csv += `"${m.date}";${m.systolic};${m.diastolic};${m.pulse};"${m.notes || ''}"\n`;
    });

    // Создаем и скачиваем файл
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `давление_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showExportResult(`CSV файл создан. Записей: ${measurements.length}`);
}
*/

function exportToCSV() {
    const measurements = JSON.parse(localStorage.getItem('healthData') || '[]');

    // Добавляем BOM (Byte Order Mark) для правильной кодировки UTF-8
    const BOM = '\uFEFF';

    let csv = BOM + 'Дата;Верхнее давление;Нижнее давление;Пульс;Заметки\n';

    measurements.forEach(m => {
        // Экранируем кавычки и добавляем дату в кавычках
        const safeNotes = (m.notes || '').replace(/"/g, '""');
        csv += `"${m.date}";${m.systolic};${m.diastolic};${m.pulse};"${safeNotes}"\n`;
    });

    // Указываем правильный MIME type для Excel
    const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `давление_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Экспорт в текст
function exportToText() {
    const measurements = JSON.parse(localStorage.getItem('healthData') || '[]');

    let text = 'ДНЕВНИК ДАВЛЕНИЯ\n';
    text += `Сформировано: ${new Date().toLocaleString('ru-RU')}\n`;
    text += `Всего измерений: ${measurements.length}\n\n`;

    measurements.forEach(m => {
        text += `📅 ${m.date}\n`;
        text += `  Давление: ${m.systolic}/${m.diastolic}\n`;
        text += `  Пульс: ${m.pulse} уд/мин\n`;
        if (m.notes) text += `  Заметки: ${m.notes}\n`;
        text += '─'.repeat(30) + '\n';
    });

    // Копируем в буфер обмена
    navigator.clipboard.writeText(text).then(() => {
        showExportResult('✅ Данные скопированы в буфер обмена!');
    });
}

// Печать
function printData() {
    const measurements = JSON.parse(localStorage.getItem('healthData') || '[]');

    let printContent = `
        <html>
        <head><title>Дневник давления</title></head>
        <body>
        <h1>Дневник артериального давления</h1>
        <p>Пациент: [Введите имя]</p>
        <p>Период: ${measurements.length > 0 ?
            `${measurements[measurements.length-1].date} - ${measurements[0].date}` :
            'Нет данных'}</p>
        <table border="1" cellpadding="5" style="width:100%; border-collapse: collapse;">
        <tr><th>Дата</th><th>Давление</th><th>Пульс</th><th>Заметки</th></tr>
    `;

    measurements.forEach(m => {
        printContent += `
            <tr>
                <td>${m.date}</td>
                <td>${m.systolic}/${m.diastolic}</td>
                <td>${m.pulse}</td>
                <td>${m.notes || ''}</td>
            </tr>
        `;
    });

    printContent += '</table></body></html>';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Показать статус
function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.style.color = type === 'error' ? '#ff4444' : '#4CAF50';
    setTimeout(() => { statusEl.textContent = ''; }, 3000);
}

// Показать результат экспорта
function showExportResult(message) {
    const resultEl = document.getElementById('export-result');
    resultEl.textContent = message;
    resultEl.style.display = 'block';
    setTimeout(() => { resultEl.style.display = 'none'; }, 5000);
}

// Инициализация
updateDateTime();
setInterval(updateDateTime, 60000); // Обновлять дату каждую минуту

// Загрузить историю при загрузке страницы
window.onload = function() {
    loadHistory();
};

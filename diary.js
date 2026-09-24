// Глобальные переменные
let records = JSON.parse(localStorage.getItem('trainingRecords') || '[]');

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    addExercise();
    loadHistory();
});

// ============ УПРАЖНЕНИЯ И ПОДХОДЫ ============

function addExercise() {
    const container = document.getElementById('exercises-container');
    const exerciseIndex = container.children.length;

    const exerciseHTML = `
        <div class="exercise-card" data-index="${exerciseIndex}">
            <button class="remove-exercise" onclick="removeExercise(${exerciseIndex})">×</button>

            <div class="exercise-header">
                <div style="flex: 2;">
                    <label>Упражнение</label>
                    <select class="exercise-type" onchange="updateExerciseName(this, ${exerciseIndex})">
                        <option value="">Выберите упражнение</option>
                        <option value="Жим от груди сидя">
                            Жим от груди сидя</option>
                        <option value="Скручивание на пресс">
                            Скручивание на пресс</option>
                        <option value="Разгибание ног сидя">
                            Разгибание ног сидя</option>
                        <option value="Вертикальная тяга с раздельными рукоятиями">
                            Вертикальная тяга с раздельными рукоятиями</option>
                        <option value="Сгибание на бицепс сидя">
                            Сгибание на бицепс сидя</option>
                        <option value="Разгибание трицепс сидя">
                            Разгибание трицепс сидя</option>
                        <option value="Разгибание спины в блочном">
                            Разгибание спины в блочном</option>
                        <option value="Отведение плеча бабочка">
                            Отведение плеча бабочка</option>
                        <option value="Отведение плеча">
                            Отведение плеча</option>
                        <option value="Горизонтальный жим ногами">
                            Горизонтальный жим ногами</option>
                        <option value="Вертикальная тяга сидя">
                            Вертикальная тяга сидя</option>
                        <option value="Тяга горизонтального блока">
                            Тяга горизонтального блока</option>
                        <option value="custom">
                            Своё упражнение...</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label>Своё название</label>
                    <input type="text" class="exercise-custom-name"
                           placeholder="Введите название"
                           style="display: none;">
                </div>
            </div>

            <div class="sets-container" id="sets-${exerciseIndex}"></div>

            <button type="button" class="btn btn-secondary"
                    onclick="addSet(${exerciseIndex})"
                    style="margin-top: 10px; width: 100%;">
                ➕ Добавить подход
            </button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', exerciseHTML);
    addSet(exerciseIndex);
}

function addSet(exerciseIndex) {
    const setsContainer = document.getElementById(`sets-${exerciseIndex}`);
    const setIndex = setsContainer.children.length;

    const setHTML = `
        <div class="set-row" data-set="${setIndex}">
            <div class="set-number">Подход ${setIndex + 1}</div>
            <div style="flex: 1;">
                <input type="number" class="set-weight"
                       placeholder="Вес (кг)" min="0" step="0.5"
                       style="width: 100%; padding: 8px;">
            </div>
            <div style="flex: 1;">
                <input type="number" class="set-reps"
                       placeholder="Повторения" min="1"
                       style="width: 100%; padding: 8px;">
            </div>
            <button class="remove-set" onclick="removeSet(${exerciseIndex}, ${setIndex})">×</button>
        </div>
    `;

    setsContainer.insertAdjacentHTML('beforeend', setHTML);
}

function removeExercise(exerciseIndex) {
    if (confirm('Удалить это упражнение?')) {
        const exerciseCard = document.querySelector(`.exercise-card[data-index="${exerciseIndex}"]`);
        if (exerciseCard) {
            exerciseCard.remove();
            updateExerciseNumbers();
        }
    }
}

function removeSet(exerciseIndex, setIndex) {
    if (confirm('Удалить этот подход?')) {
        const setsContainer = document.getElementById(`sets-${exerciseIndex}`);
        const setRow = setsContainer.querySelector(`.set-row[data-set="${setIndex}"]`);
        if (setRow) {
            setRow.remove();
            updateSetNumbers(exerciseIndex);
        }
    }
}

function updateExerciseNumbers() {
    const exercises = document.querySelectorAll('.exercise-card');
    exercises.forEach((exercise, index) => {
        exercise.setAttribute('data-index', index);

        const addSetBtn = exercise.querySelector('button[onclick^="addSet"]');
        if (addSetBtn) {
            addSetBtn.setAttribute('onclick', `addSet(${index})`);
        }

        const setsContainer = exercise.querySelector('.sets-container');
        if (setsContainer) {
            setsContainer.id = `sets-${index}`;
        }

        const removeBtn = exercise.querySelector('.remove-exercise');
        if (removeBtn) {
            removeBtn.setAttribute('onclick', `removeExercise(${index})`);
        }
    });
}

function updateSetNumbers(exerciseIndex) {
    const setsContainer = document.getElementById(`sets-${exerciseIndex}`);
    if (!setsContainer) return;

    const setRows = setsContainer.querySelectorAll('.set-row');
    setRows.forEach((setRow, index) => {
        setRow.setAttribute('data-set', index);
        setRow.querySelector('.set-number').textContent = `Подход ${index + 1}`;

        const removeBtn = setRow.querySelector('.remove-set');
        if (removeBtn) {
            removeBtn.setAttribute('onclick', `removeSet(${exerciseIndex}, ${index})`);
        }
    });
}

function updateExerciseName(select, exerciseIndex) {
    const exerciseCard = document.querySelector(`.exercise-card[data-index="${exerciseIndex}"]`);
    const customNameInput = exerciseCard.querySelector('.exercise-custom-name');

    if (select.value === 'custom') {
        customNameInput.style.display = 'block';
    } else {
        customNameInput.style.display = 'none';
        customNameInput.value = '';
    }
}

// ============ СОХРАНЕНИЕ ТРЕНИРОВКИ ============

function saveTraining() {
    const exercises = [];
    const exerciseCards = document.querySelectorAll('.exercise-card');

    if (exerciseCards.length === 0) {
        alert('Добавьте хотя бы одно упражнение!');
        return;
    }

    let hasError = false;

    exerciseCards.forEach((card, exerciseIndex) => {
        const typeSelect = card.querySelector('.exercise-type');
        let exerciseType = typeSelect.value;

        if (exerciseType === 'custom') {
            const customName = card.querySelector('.exercise-custom-name').value;
            if (!customName.trim()) {
                alert(`Введите название для упражнения ${exerciseIndex + 1}`);
                hasError = true;
                return;
            }
            exerciseType = customName;
        } else if (!exerciseType) {
            alert(`Выберите упражнение ${exerciseIndex + 1}`);
            hasError = true;
            return;
        }

        const sets = [];
        const setRows = card.querySelectorAll('.set-row');

        if (setRows.length === 0) {
            alert(`Добавьте хотя бы один подход для упражнения ${exerciseIndex + 1}`);
            hasError = true;
            return;
        }

        setRows.forEach((setRow, setIndex) => {
            const weight = parseFloat(setRow.querySelector('.set-weight').value) || 0;
            const reps = parseInt(setRow.querySelector('.set-reps').value) || 0;

            if (weight > 0 && reps > 0) {
                sets.push({
                    set: setIndex + 1,
                    weight: weight,
                    reps: reps
                });
            } else {
                alert(`Заполните вес и повторения для подхода ${setIndex + 1} в упражнении ${exerciseIndex + 1}`);
                hasError = true;
                return;
            }
        });

        if (hasError) return;

        exercises.push({
            name: exerciseType,
            sets: sets
        });
    });

    if (hasError) return;

    const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('ru-RU'),
        exercises: exercises
    };

    records.unshift(record);
    localStorage.setItem('trainingRecords', JSON.stringify(records));

    alert('✅ Тренировка сохранена!');
    clearTrainingForm();
    showTab('history');
    loadHistory();
}

function clearTrainingForm() {
    const container = document.getElementById('exercises-container');
    container.innerHTML = '';
    addExercise();
}

// ============ ИСТОРИЯ ============

function loadHistory() {
    const container = document.getElementById('history-records');

    if (records.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #6c757d;">
                <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
                <h3>Нет записей</h3>
                <p>Добавьте первую тренировку</p>
            </div>
        `;
        return;
    }

    let html = '';
    records.forEach(record => {
        html += renderRecord(record);
    });

    container.innerHTML = html;
}

function renderRecord(record) {
    let exercisesHTML = '';

    record.exercises.forEach((exercise, idx) => {
        exercisesHTML += `
            <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                <div style="font-weight: bold; margin-bottom: 10px; color: #333;">
                    ${idx + 1}. ${exercise.name}
                </div>
                <div class="exercise-grid">
                    ${exercise.sets.map(set => `
                        <div class="set-badge">
                            <div class="set-weight">${set.weight} кг</div>
                            <div style="font-size: 12px; color: #666;">× ${set.reps}</div>
                            <div style="font-size: 11px; color: #999;">Подход ${set.set}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    return `
        <div class="record-card fade-in">
            <div class="record-header">
                <div class="record-date">${record.date}</div>
                <span class="record-type">🏋️ Тренировка</span>
            </div>
            ${exercisesHTML}
            <div class="record-footer">
                <button class="action-btn" onclick="deleteRecord(${record.id})">🗑 Удалить</button>
            </div>
        </div>
    `;
}

function deleteRecord(id) {
    if (confirm('Удалить эту запись?')) {
        records = records.filter(r => r.id !== id);
        localStorage.setItem('trainingRecords', JSON.stringify(records));
        loadHistory();
    }
}

// ============ ЭКСПОРТ ============

function exportJSON() {
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `тренировки_${getCurrentDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// ============ НАВИГАЦИЯ ============

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`.nav-tab[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'history') loadHistory();
}

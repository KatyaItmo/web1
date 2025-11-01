document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена! JavaScript работает!');
    
    initializeValidation();
    loadHistoryFromServer();
});

function initializeValidation() {
    console.log('Инициализируем валидацию...');
    
    const xInput = document.getElementById('x-coord');
    const yCheckboxes = document.querySelectorAll('input[name="y"]');
    const radiusButtons = document.querySelectorAll('.radius-btn');
    const submitButton = document.getElementById('submit-btn');
    const form = document.getElementById('point-form');
    
    console.log('Найдены элементы:', {
        xInput: xInput,
        yCheckboxes: yCheckboxes.length,
        radiusButtons: radiusButtons.length,
        submitButton: submitButton,
        form: form
    });
    
    setupRadiusButtons(radiusButtons);
    setupFormValidation(form, xInput, yCheckboxes, radiusButtons);
    initializeGraph();
    
    setupClearHistoryButton();
}

function setupRadiusButtons(radiusButtons) {
    console.log('Настраиваем кнопки радиуса...');
    
    radiusButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Нажата кнопка радиуса:', this.textContent);
            
            radiusButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
            
            const selectedValue = this.getAttribute('data-value');
            document.getElementById('r-value').value = selectedValue;
            
            console.log('Выбран радиус:', selectedValue);
            
            currentR = parseFloat(selectedValue);
            redrawGraph();
        });
    });
}

function setupFormValidation(form, xInput, yCheckboxes, radiusButtons) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const isXValid = validateX(xInput);
        const isYValid = validateY(yCheckboxes);
        const isRValid = validateR(radiusButtons);
        
        console.log('Результаты валидации:', {
            x: isXValid,
            y: isYValid, 
            r: isRValid
        });
        
        if (isXValid && isYValid && isRValid) {
            console.log('Все данные корректны! Можно отправлять на сервер.');
            sendDataToServer();
        } else {
            showErrorMessage('Пожалуйста, исправьте ошибки в форме.');
        }
    });
}

function validateX(xInput) {
    let xValue = xInput.value.trim();
    console.log('Валидируем X:', xValue);
    
    const normalizedValue = xValue.replace(/,/g, '.');
    
    console.log('Нормализованное X для парсинга:', normalizedValue);
    
    const xNumber = parseFloat(normalizedValue);
    
    console.log('Числовое значение X:', xNumber);
    
    if (isNaN(xNumber)) {
        showValidationError('x-validation', 'X должно быть числом');
        return false;
    }
    
    if (xNumber < -3 || xNumber > 5) {
        showValidationError('x-validation', 'X должен быть от -3 до 5');
        return false;
    }
    
    clearValidationError('x-validation');
    return true;
}

function validateY(yCheckboxes) {
    console.log('Валидируем Y...');
    
    let atLeastOneChecked = false;
    yCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            atLeastOneChecked = true;
        }
    });
    
    if (!atLeastOneChecked) {
        showValidationError('y-validation', 'Выберите хотя бы одно значение Y');
        return false;
    }
    
    clearValidationError('y-validation');
    return true;
}

function validateR(radiusButtons) {
    console.log('Валидируем R...');
    
    let atLeastOneActive = false;
    radiusButtons.forEach(button => {
        if (button.classList.contains('active')) {
            atLeastOneActive = true;
        }
    });
    
    if (!atLeastOneActive) {
        showValidationError('r-validation', 'Выберите значение радиуса R');
        return false;
    }
    
    clearValidationError('r-validation');
    return true;
}

function showValidationError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.color = '#a55c5c';
}

function clearValidationError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

function showSuccessMessage(message) {
    console.log('Успех:', message);
    const successDiv = document.createElement('div');
    successDiv.style.cssText = 'position:fixed; top:20px; right:20px; background:#4a7b5d; color:white; padding:10px; border-radius:5px; z-index:1000;';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function showErrorMessage(message) {
    console.log('Ошибка:', message);
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed; top:20px; right:20px; background:#a55c5c; color:white; padding:10px; border-radius:5px; z-index:1000;';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}


const GRAPH_CONFIG = {
    width: 700,
    height: 500,
    padding: 50,
    axisColor: '#e6edf3',
    gridColor: '#8b949e',
    areaColor: '#7b9ebd',
    pointRadius: 5,
    xMin: -3,
    xMax: 5,
    yMin: -3,
    yMax: 2
};

let currentR = 2;
let currentPoints = [];
let historyPoints = [];

function initializeGraph() {
    console.log('Инициализируем график...');
    
    const canvas = document.getElementById('coordinate-plane');
    if (!canvas) {
        console.error('Canvas не найден!');
        return;
    }
    
    canvas.width = GRAPH_CONFIG.width;
    canvas.height = GRAPH_CONFIG.height;
    
    redrawGraph();
}

function calculateScale() {
    const availableWidth = GRAPH_CONFIG.width - 2 * GRAPH_CONFIG.padding;
    const availableHeight = GRAPH_CONFIG.height - 2 * GRAPH_CONFIG.padding;
    
    const scaleX = availableWidth / (GRAPH_CONFIG.xMax - GRAPH_CONFIG.xMin);
    const scaleY = availableHeight / (GRAPH_CONFIG.yMax - GRAPH_CONFIG.yMin);
    
    return Math.min(scaleX, scaleY);
}

function mathToPixelX(mathX) {
    const scale = calculateScale();
    return GRAPH_CONFIG.padding + (mathX - GRAPH_CONFIG.xMin) * scale;
}

function mathToPixelY(mathY) {
    const scale = calculateScale();
    return GRAPH_CONFIG.height - GRAPH_CONFIG.padding - (mathY - GRAPH_CONFIG.yMin) * scale;
}

function drawCoordinateSystem() {
    const canvas = document.getElementById('coordinate-plane');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, GRAPH_CONFIG.width, GRAPH_CONFIG.height);
    
    ctx.fillStyle = '#1a1d21';
    ctx.fillRect(0, 0, GRAPH_CONFIG.width, GRAPH_CONFIG.height);
    
    drawGrid(ctx);

    drawAxes(ctx);
    
    drawLabels(ctx);
}

function drawGrid(ctx) {
    ctx.strokeStyle = GRAPH_CONFIG.gridColor;
    ctx.lineWidth = 0.5;
    
    const scale = calculateScale();
    
    for (let x = GRAPH_CONFIG.xMin; x <= GRAPH_CONFIG.xMax; x++) {
        const pixelX = mathToPixelX(x);
        ctx.beginPath();
        ctx.moveTo(pixelX, GRAPH_CONFIG.padding);
        ctx.lineTo(pixelX, GRAPH_CONFIG.height - GRAPH_CONFIG.padding);
        ctx.stroke();
    }
    
    for (let y = GRAPH_CONFIG.yMin; y <= GRAPH_CONFIG.yMax; y++) {
        const pixelY = mathToPixelY(y);
        ctx.beginPath();
        ctx.moveTo(GRAPH_CONFIG.padding, pixelY);
        ctx.lineTo(GRAPH_CONFIG.width - GRAPH_CONFIG.padding, pixelY);
        ctx.stroke();
    }
}

function drawAxes(ctx) {
    ctx.strokeStyle = GRAPH_CONFIG.axisColor;
    ctx.lineWidth = 2;
    
    const xAxisY = mathToPixelY(0);
    ctx.beginPath();
    ctx.moveTo(GRAPH_CONFIG.padding, xAxisY);
    ctx.lineTo(GRAPH_CONFIG.width - GRAPH_CONFIG.padding, xAxisY);
    ctx.stroke();
    
    const yAxisX = mathToPixelX(0);
    ctx.beginPath();
    ctx.moveTo(yAxisX, GRAPH_CONFIG.padding);
    ctx.lineTo(yAxisX, GRAPH_CONFIG.height - GRAPH_CONFIG.padding);
    ctx.stroke();

    drawArrow(ctx, GRAPH_CONFIG.width - GRAPH_CONFIG.padding, xAxisY, 8, 0);
    drawArrow(ctx, yAxisX, GRAPH_CONFIG.padding, 8, -Math.PI / 2);
}

function drawArrow(ctx, x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.lineTo(-size, size / 2);
    ctx.closePath();
    ctx.fillStyle = GRAPH_CONFIG.axisColor;
    ctx.fill();
    
    ctx.restore();
}

function drawLabels(ctx) {
    ctx.fillStyle = GRAPH_CONFIG.axisColor;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let x = GRAPH_CONFIG.xMin; x <= GRAPH_CONFIG.xMax; x++) {
        if (x === 0) continue;
        const pixelX = mathToPixelX(x);
        const pixelY = mathToPixelY(0);
        ctx.fillText(x.toString(), pixelX, pixelY + 15);
        
        ctx.beginPath();
        ctx.moveTo(pixelX, pixelY - 3);
        ctx.lineTo(pixelX, pixelY + 3);
        ctx.strokeStyle = GRAPH_CONFIG.axisColor;
        ctx.stroke();
    }
    
    for (let y = GRAPH_CONFIG.yMin; y <= GRAPH_CONFIG.yMax; y++) {
        if (y === 0) continue;
        const pixelX = mathToPixelX(0);
        const pixelY = mathToPixelY(y);
        ctx.fillText(y.toString(), pixelX - 15, pixelY);
        
        ctx.beginPath();
        ctx.moveTo(pixelX - 3, pixelY);
        ctx.lineTo(pixelX + 3, pixelY);
        ctx.strokeStyle = GRAPH_CONFIG.axisColor;
        ctx.stroke();
    }

    ctx.fillText('0', mathToPixelX(0) - 12, mathToPixelY(0) + 12);

    ctx.fillText('X', GRAPH_CONFIG.width - GRAPH_CONFIG.padding + 20, mathToPixelY(0));
    ctx.fillText('Y', mathToPixelX(0), GRAPH_CONFIG.padding - 20);
}

function drawArea() {
    const canvas = document.getElementById('coordinate-plane');
    const ctx = canvas.getContext('2d');
    
    if (currentR <= 0) return;
    
    ctx.fillStyle = GRAPH_CONFIG.areaColor + '40';
    ctx.strokeStyle = GRAPH_CONFIG.areaColor;
    ctx.lineWidth = 1;
    
    const centerX = mathToPixelX(0);
    const centerY = mathToPixelY(0);
    const scale = calculateScale();
    
    // 1. Первая четверть: четверть круга радиусом R/2
    const radiusPixels = (currentR / 2) * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusPixels, -Math.PI/2, 0, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 2. Вторая четверть: треугольник (0, R/2) - (-R, 0) - (0,0)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(mathToPixelX(-currentR), centerY);
    ctx.lineTo(centerX, mathToPixelY(currentR/2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 3. Четвертая четверть: прямоугольник (0,0) - (R/2, -R)
    const rectStartX = centerX;
    const rectStartY = centerY;
    const rectEndX = mathToPixelX(currentR/2);
    const rectEndY = mathToPixelY(-currentR);
    
    ctx.beginPath();
    ctx.rect(rectStartX, rectStartY, rectEndX - rectStartX, rectEndY - rectStartY);
    ctx.fill();
    ctx.stroke();
}

function drawPoints() {
    const canvas = document.getElementById('coordinate-plane');
    const ctx = canvas.getContext('2d');
    
    currentPoints.forEach(point => {
        // Преобразуем строки в числа для отрисовки
        const x = parseFloat(point.x);
        const y = parseFloat(point.y);
        
        const pixelX = mathToPixelX(x);
        const pixelY = mathToPixelY(y);
        
        ctx.fillStyle = point.hit ? '#4a7b5d' : '#a55c5c';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, GRAPH_CONFIG.pointRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });
}

function setCurrentPoints(points) {
    currentPoints = points;
    redrawGraph();
}

function redrawGraph() {
    drawCoordinateSystem();
    drawArea();
    drawPoints();
}


function sendDataToServer() {
    const x = document.getElementById('x-coord').value.replace(/,/g, '.');
    const yCheckboxes = document.querySelectorAll('input[name="y"]:checked');
    const r = document.getElementById('r-value').value; // Берем как строку!

    const yValues = Array.from(yCheckboxes).map(cb => cb.value); // Берем как строки!

    const formData = new URLSearchParams();
    formData.append('x', x);
    formData.append('r', r);
    yValues.forEach(y => formData.append('y', y));
    
    console.log('Отправка данных на сервер:', { x, yValues, r });
    
    currentPoints = [];
    redrawGraph();
    
    fetch('/cgi-area-checker/area-checker', {  // ИЗМЕНИТЬ ЭТУ СТРОЧКУ
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: formData
	})
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        console.log('Raw server response:', text);
        try {
            const data = JSON.parse(text);
            console.log('Parsed data:', data);
            
            if (data.currentResults) {
                console.log('First point types:', {
                    x: typeof data.currentResults[0]?.x,
                    y: typeof data.currentResults[0]?.y, 
                    r: typeof data.currentResults[0]?.r
                });
                
                // ОБНОВЛЯЕМ ТОЧКИ И ТАБЛИЦУ
                if (data.currentResults && data.currentResults.length > 0) {
                    currentPoints = data.currentResults;
                    redrawGraph(); // Перерисовываем график с новыми точками
                }
                
                if (data.history) {
                    historyPoints = data.history;
                    updateResultsTable();
                }
                
                const pointsCount = data.currentResults ? data.currentResults.length : 0;
                showSuccessMessage(`Проверено ${pointsCount} точек`);
            } else if (data.error) {
                showErrorMessage('Ошибка сервера: ' + data.error);
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Problematic response:', text);
            showErrorMessage('Ошибка формата ответа от сервера');
        }
    })
    .catch(error => {
        console.error('Request failed:', error);
        showErrorMessage('Ошибка при отправке данных: ' + error.message);
    });
}

function loadHistoryFromServer() {
    console.log('Загружаем историю с сервера...');
    
    fetch('/cgi-area-checker/area-checker')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // Сначала получаем как текст
    })
    .then(text => {
        console.log('Raw history response:', text);
        try {
            const data = JSON.parse(text);
            console.log('История загружена:', data);
            
            if (data.history) {
                historyPoints = data.history;
                updateResultsTable();
            }
        } catch (e) {
            console.error('JSON parse error in history:', e);
            console.error('Problematic history response:', text);
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке истории:', error);
    });
}

function clearHistoryOnServer() {
    console.log('Очищаем историю на сервере...');
    
    fetch('/cgi-area-checker/area-checker?action=clear')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('История очищена:', data);
        
        historyPoints = [];
        currentPoints = [];
        
        updateResultsTable();
        redrawGraph();
    })
    .catch(error => {
        console.error('Ошибка при очистке истории:', error);
        showErrorMessage('Ошибка при очистке истории: ' + error.message);
    });
}

function updateResultsTable() {
    const tableBody = document.getElementById('results');
    tableBody.innerHTML = '';
    
    const reversedHistory = [...historyPoints].reverse();
    
    reversedHistory.forEach(point => {
        console.log('Displaying point:', {
            x: point.x,
            y: point.y, 
            r: point.r,
            typeX: typeof point.x,
            typeY: typeof point.y,
            typeR: typeof point.r
        });
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${point.x}</td>
            <td>${point.y}</td>
        <td>${point.r}</td>
            <td class="${point.hit ? 'result-hit' : 'result-miss'}">
                ${point.hit ? 'Попадание' : 'Промах'}
            </td>
            <td>${point.requestTime}</td>
            <td>${point.executionTime}с</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function setupClearHistoryButton() {
    const clearButton = document.getElementById('clear-history');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            clearHistoryOnServer();
        });
    }
}
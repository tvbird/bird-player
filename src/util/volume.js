/**
 * Конвертирование громкости
 *
 * @param vol
 * @param backward
 * @returns {number}
 */
export function convert(vol, backward = false){
    return (backward) ?  Math.floor(vol * 100) :  vol / 100;
}

/**
 * Если значение это цифры
 * @param value
 * @returns {boolean}
 */
export function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

/**
 * Постепенное увеличение/уменьшение громкости
 * @param from    - от 0 до 100
 * @param to    - от 0 до 100
 * @param duration - длинна в мс.
 * @param callback - callback
 */
export function animateValue(from, to, duration, callback) {
    if (from === to)
        return;

    let current = from;
    const range = to - from;
    const increment = to > from? 1 : -1;
    const stepTime = Math.abs(Math.ceil(duration / range));

    const timer = setInterval(() => {
        current += increment;
        callback(current);
        if (current === to) {
            clearInterval(timer);
        }
    }, stepTime);
}
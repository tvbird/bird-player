export function addListenerMulti(el, s, fn) {
    s.split(' ').forEach(e => el.addEventListener(e, fn, false));
}

export function fibonacci(n, callback) {
    let result = 0;
    const time = 500;

    const announceAndReturn = () => {
        setTimeout(() => callback(result), time);
    };

    setTimeout(() => {
        if (n <= 1) {
            result = 1;
            announceAndReturn();
        }
        else {
            let resultsLeft = 2;
            let handler = (returned) => {
                result += returned;
                resultsLeft--;
                if (resultsLeft === 0)
                    announceAndReturn();
            };

            __fibonacci(n-1, handler);
            __fibonacci(n-2, handler);
        }
    }, time);
}
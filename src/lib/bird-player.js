// import dependencies
// import { concat } from '../util/string';

/*!
 * on
 *    wait: ожидание
 *    load: загрука
 *    play: плеер включен
 *    time: идет воспроизведение (Отправляется, когда изменяется значение атрибута currentTime)
 *    pause: пауза
 *    stop: плеер остановлен и выгружены url
 *    error: ошибка при воспроизведении
 */

export class BirdPlayer{

    /**
     * Конструктор
     */
    constructor(el){
        this.audio = document.createElement('audio');
        this.audio.id = "bird-player";

        this.src = [];
        this.el = document.getElementById(el);

        this.__bind();
        this.emit('wait');

    }

    /**
     * Загрузка потоков
     * @param list
     */
    url(list) {
        this.src = [];

        if (typeof list === 'string')
            this.src.push(list)
    }

    /**
     * Установка потоков и включение плеера
     * @returns {Promise<void>}
     */
    play() {
        if (this.state === "pause" && this.src.length)
            return this.audio.play();

        for (let item of this.src) {
            this.audio.src = item;
            this.emit('load');
            this.audio.play();
        }
    }

    /**
     * Запуск плеера (с существующими потоками)
     */
    onlyPlay() {
        this.audio.play();
    }


    /**
     * Пауза
     */
    pause() {
        if (this.audio.src)
            this.audio.pause();
    }


    /**
     * Остановка плеера с выгрузкой потоков
     */
    stop() {
        if (this.audio.src) {
            this.audio.pause();
            this.audio.removeAttribute('src');
            this.audio.load();

            this.emit('stop');
        }
    }

    /**
     * Вызов события
     *
     * @param name
     * @param data
     */
    emit(name, data = null) {
        if (data !== null)
            data = { 'detail': data };

        let event = new CustomEvent(name, data);
        this.el.dispatchEvent(event);

        this.state = name;
    }

    /**
     * Отлов события
     *
     * @param name
     * @param call
     */
    on(name, call) {
        this.el.addEventListener(name, (e) => call(e.detail));
    }


    __bind() {
        const ev = [
            {load: 'load'}, {pause: 'pause'}, {error: 'error'}, {timeupdate: 'time'}, {ended: 'stop'}
        ];

        ev.forEach((item) => {
            for (const [key, value] of Object.entries(item)) {
                this.audio.addEventListener(key, () => this.emit(value));
            }
        });
        this.audio.addEventListener('playing', () => this.emit('play', {url: this.audio.src}));
    }
}
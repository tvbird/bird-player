import { isNumeric, convert, animateValue } from '../util/volume';

/*!
 * Bird Player
 *    on
 *    wait: ожидание
 *    load: загрука
 *    play[url]: плеер включен
 *    time: идет воспроизведение (Отправляется, когда изменяется значение атрибута currentTime)
 *    pause: пауза
 *    stop: плеер остановлен и выгружены url
 *    error: ошибка при воспроизведении
 *    volume[vol]: текущая громкость (0 до 100)
 */

export class BirdPlayer{

    /**
     * Конструктор
     */
    constructor(el){
        this.audio = document.createElement('audio');
        this.audio.id = "bird-player";
        this.audio.volume = 0.5;

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
     * Установка громкости (0 до 100)
     * @param val
     */
    volume(val) {
        if (isNumeric(val)) {
            let vol = parseInt(val);

            if (vol >= 0 && vol <= 100)
                this.audio.volume = convert(vol);
        }
    }

    /**
     * Плавное изменение звука
     *
     * @param to  - в какую громкость нужно перевести
     * @param dur - скорость изменения громкости
     */
    fade(to, dur = 700) {
        let vol = convert(this.audio.volume, true);
        animateValue(vol, parseInt(to), dur, (e) => this.volume(e));
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
            {load: 'load'},
            {pause: 'pause'},
            {timeupdate: 'time'},
            {ended: 'stop'},
            {loadstart: 'load'},
            {error: 'error'},
            // {stalled: 'error'}
        ];

        ev.forEach((item) => {
            for (const [key, value] of Object.entries(item)) {
                this.audio.addEventListener(key, () => this.emit(value));
            }
        });
        this.audio.addEventListener('playing', () => this.emit('play', {url: this.audio.src}));
        this.audio.addEventListener('volumechange', () => this.emit('volume', {volume: convert(this.audio.volume, true)}));
    }
}
import { isNumeric, convert, animateValue } from '../util/volume';
import { Twice } from "./try-twice";

/*!
 * Bird Player
 *  on
 *    wait: ожидание
 *    load: загрука
 *    play[url]: плеер включен
 *    time: идет воспроизведение (Отправляется, когда изменяется значение атрибута currentTime)
 *    pause: пауза
 *    stop: плеер остановлен и выгружены url
 *    error: ошибка при воспроизведении
 *    broken[url | msg]: ошибка при воспроизведении
 *    volume[vol]: текущая громкость (0 до 100)
 */

export class BirdPlayer{

    // TODO Timeout

    /**
     * Конструктор
     *
     * el        - id
     * volume    - громкость
     * src       - потоки
     * twice     - пробовать воспроизвести поток дважды (если была ошибка)
     */
    constructor(params){
        this.src = [];

        const ID = 'bird-player';
        let el = (params && params.el) ? params.el : ID;
        if (el === ID && !document.getElementById(ID)) {
            let div = document.createElement('div');
            div.id = ID;
            div.style.display = 'none';
            document.body.appendChild(div);
        }

        this.el = document.getElementById(el);

        this.audio = document.createElement('audio');
        this.audio.id = el + "-bird-audio";
        this.audio.volume = convert((params && params.volume) ? params.volume : 100);

        if (params && params.src)
            this.url(params.src);

        this.__bind();

        // Инициализация плагинов
        Twice.init(this.el, params, this);

        this.emit('wait');
    }

    /**
     * Загрузка потоков
     * @param list
     */
    url(list) {
        this.src = [];

        if (typeof list === 'string')
            this.src.push(list);
        else
            this.src = list;
    }

    /**
     * Установка потоков и включение плеера
     * @returns {Promise<void>}
     */
    play() {
        if (this.state === "pause" && this.src.length)
            return this.onlyPlay();

        for (let item of this.src) {
            this.audio.src = item;
            this.onlyPlay(item);
        }
    }

    /**
     * Запуск плеера (с существующими потоками)
     */
    async onlyPlay(src) {
        try {
            await this.audio.play();
        }
        catch (e) {
            this.emit('broken', {url: src || this.audio.src, msg: e});
        }
    }


    /**
     * Пауза
     */
    pause() {
        if (this.__isReady())
            this.audio.pause();
    }


    /**
     * Остановка плеера с выгрузкой потоков
     */
    stop() {
        if (this.__isReady()) {
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
     * @param to  - в какую громкость нужно перевести (0-100)
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
        this.el.addEventListener(name, (e) => call(e.detail || e));
    }


    __isReady() {
        return this.audio.src && this.audio.readyState > 0;
    }

    /**
     * Перенаправление событий в emit
     * @private
     */
    __bind() {
        const ev = [
            {load: 'load'},
            {pause: 'pause'},
            {timeupdate: 'time'},
            {ended: 'stop'},
            {loadstart: 'load'},
            {error: 'error'}
        ];

        ev.forEach((item) => {
            for (const [key, value] of Object.entries(item)) {
                this.audio.addEventListener(key, () => this.emit(value));
            }
        });
        this.audio.addEventListener('playing', () => this.emit('play', {url: this.audio.src}));
        this.audio.addEventListener('volumechange', () => this.emit('volume', {volume: convert(this.audio.volume, true)}));
    }

    /*  // loadedmeta
    duration() {
        let min = parseInt(this.audio.duration / 60, 10);
        let sec = parseInt(this.audio.duration % 60);

        return `${min}:${sec}`;
    }*/
}
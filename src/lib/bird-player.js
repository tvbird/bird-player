import { isNumeric, convert, animateValue } from '../util/volume';
import { Twice } from "./try-twice";

/*
 * Bird Player
 *  on
 *    wait: ожидание
 *    load: загрука плеера
 *    url : загружены новые потоки для прослушивания
 *    play[url]: плеер включен
 *    time: идет воспроизведение (Отправляется, когда изменяется значение атрибута currentTime)
 *    pause: пауза
 *    stop: плеер остановлен и выгружены url
 *    error: ошибка при воспроизведении
 *    broken[url | msg]: ошибка при воспроизведении
 *    end: конец потоков
 *    volume[vol]: текущая громкость (0 до 100)
 *    autodisabled:  автовоспроизведение не работает
 */

export class BirdPlayer{

    /**
     * Конструктор
     *
     * el               - id
     * volume           - громкость
     * src              - потоки
     * autoplay[false]  - Автовоспроизведение
     * twice            - пробовать воспроизвести поток дважды (если была ошибка)
     */
    constructor(params){
        const ID = 'bird-player';
        let el = (params && params.el) ? params.el : ID;
        if (el === ID && !document.getElementById(ID)) {
            let div = document.createElement('div');
            div.id = ID;
            div.style.display = 'none';
            document.body.appendChild(div);
        }

        this.el = document.getElementById(el);

        this.autoplay = false;    // Автовоспроизведение
        this.fadeActive = false;  // Включение плавного увеличения звука

        this.load = false;        // Загружается ли поток прямо сейчас
        this.src = [];            // Потоки
        this.srcIndex = 0;        // Индекс текущего потока
        this.buffer = 0;          // Загруженные данные
        this.isFirefox  = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;  // Если браузер Firefox

        this.audio = document.createElement('audio');
        this.audio.id = el + "-bird-audio";
        this.audio.volume = convert((params && params.volume) ? params.volume : 100);

        if (params) {
            if (params.autoplay)
                this.autoplay = params.autoplay;

            if (params.src)
                this.url(params.src);
        }

        this.__bind();

        // Инициализация плагинов
        this.Twice = Twice.init(this.el, params, this);
        this.emit('wait');
    }

    /**
     * Сброс установленных параметров
     */
    reset() {
        this.src = [];
        this.srcIndex = 0;
        this.buffer = -1;

        this.clearAudio();
    }

    /**
     * Загрузка потоков
     * @param list
     */
    url(list) {
        this.reset();
        if (typeof list === 'string')
            list = [list];

        this.src = this.prepare(list);
        this.emit('url', this.src);

        if (this.autoplay)
            this.play();
    }

    /**
     *  Подготовка Url
     *
     * @param urls
     * @returns {[]}
     */
    prepare(urls) {
        let out = [];

        urls.forEach(e => {
            if (this.isFirefox) {  // Исправление ошибки в Firefox
                let url = new URL(e);
                url.searchParams.append('_', new Date().getTime());
                e = url.href;
            }

            out.push(e);
        });


        return out;
    }

    /**
     * Установка потоков и включение плеера
     * @returns {Promise<void>}
     */
    play() {
        if (this.state === "pause" && this.src.length)
            return this.onlyPlay();

        if (typeof this.src[this.srcIndex] !== 'undefined') {
            this.audio.src = this.src[this.srcIndex];
            return this.onlyPlay(this.src[this.srcIndex]);
        } else {
            this.srcIndex = 0;
            this.emit('end');
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
            console.warn(e);
            let msg = e.toString();
            if (msg.indexOf("didn't interact") > -1) {
                this.emit('autodisabled');
                this.stop();
            } else {
                if (msg.indexOf("new load request") === -1 && msg.indexOf("call to pause") === -1 && msg.indexOf("user aborted") === -1) {
                    let url = src || this.audio.src;
                    this.emit('broken', {url: url, msg: e});
                }
            }
        }
    }


    /**
     * Пауза
     */
    pause() {
        this.audio.pause();
    }



    clearAudio() {
        this.audio.pause();
        this.audio.removeAttribute('src');
        this.audio.load();
    }


    /**
     * Остановка плеера с выгрузкой потоков
     */
    stop() {
        this.clearAudio();
        this.emit('stop');
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

    getVolume() {
        return convert(this.audio.volume, true);
    }

    /**
     * Плавное изменение звука
     *
     * @param to  - в какую громкость нужно перевести (0-100)
     * @param dur - скорость изменения громкости
     */
    fade(to, dur = 700) {
        this.fadeActive = true;

        let vol = convert(this.audio.volume, true);
        animateValue(vol, parseInt(to), dur, (e) => this.volume(e), () => this.fadeActive = false);

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
        name.split(' ').forEach(event => {
            this.el.addEventListener(event, (e) => call(e.detail || e));
        });
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

        this.audio.addEventListener('playing', () => {
            this.emit('play', {url: this.audio.src});
            this.load = false;
        });

        this.audio.addEventListener('volumechange', () => {
            if (!this.fadeActive)
                this.emit('volume', {volume: convert(this.audio.volume, true)});
        });

        this.audio.addEventListener('progress', () => {
            this.buffer++;
            this.emit('progress', {buffer: this.buffer});
        });

        this.on('load', () => this.load = true);
        this.on('pause stop error', () => this.buffer = -1);
        this.on('pause stop broken', () => this.load = false);
    }

    /*  // loadedmeta
    duration() {
        let min = parseInt(this.audio.duration / 60, 10);
        let sec = parseInt(this.audio.duration % 60);

        return `${min}:${sec}`;
    }*/
}
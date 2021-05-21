/**
 * Плагин позволяет использовать вторую попытку воспроизведения
 * @type {{active: boolean, url: string, count: number, init(*, *=): void}}
 */

import { fibonacci } from '../util/other';

export const Twice = {
    active: true,
    url: '',
    count: 0,

    init(el, params, bird) {
        if (!this.active)
            return false;

        if (params && typeof params.twice !== 'undefined')
            this.active = params.twice;

        el.addEventListener('stop', () => {this.count = 0});
        el.addEventListener('play', () => {this.count = 100});
        el.addEventListener('broken', (e) => fibonacci(1, () => this.check(bird, e.detail.url)));
    },

    check(bird, url) {
        if (!this.active)
            return false;

        if (this.url !== url)
            this.url = url;

        if (this.count < 1) {
            bird.audio.src = url;
            bird.onlyPlay();
            this.count ++;
        }
    }
};
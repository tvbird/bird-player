// import dependencies
// import { concat } from '../util/string';

export class BirdPlayer{

    constructor(el){
        this.state = 'wait';
        this.audio = document.createElement('audio');
        this.audio.id = "bird-player";

        this.src = [];
        this.el = document.getElementById(el)
    }

    url(list) {
        this.src = [];

        if (typeof list === 'string')
            this.src.push(list)
    }

    play() {
        if (this.state === "pause" && this.src.length)
            return this.audio.play();

        for (let item of this.src) {
            this.audio.src = item;
            this.audio.play();
        }
        
        console.warn(this.audio);
    }

    onlyPlay() {
        this.audio.play();
    }


    pause() {
        if (this.audio.src) {
            this.audio.pause();
            this.state = "pause";
        }
    }


    stop() {
        if (this.audio.src) {
            this.audio.pause();
            this.audio.removeAttribute('src');
            this.audio.load();

            this.state = "stop";
            console.warn(this.audio);
        }
    }

    emit(name) {

    }
}
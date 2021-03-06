var processorInstanciated = false;
var processor = {
    /**
     * Trigger the video frame rendering whenever the video is playing.
     */
    timerCallback: function () {
        if (this.video.paused || this.video.ended) {
            return;
        }
        this.computeFrame();
        let self = this;
        setTimeout(function () {
            self.timerCallback();
        }, 0);
    },

    /**
     * Fetch the height and width of the video when it is available.
     * Start the timer callback afterwards.
     * */
    startTimerCallback: function () {
        let self = this;
        setTimeout(function () {
            self.width = self.video.videoWidth;
            self.height = self.video.videoHeight;
            if (+self.width === 0 || +self.height === 0) {
                self.startTimerCallback();
            }
            else {
                self.timerCallback();
            }
        }, 50);
    },

    doLoad: function (minR, minG, minB, maxR, maxG, maxB, instanceId) {
        console.log('Loading processor for video', instanceId);
        this.video = document.getElementById('chroma-video-' + instanceId);
        this.c1 = document.getElementById("c1-" + instanceId);
        this.minR = minR;
        this.minG = minG;
        this.minB = minB;
        this.maxR = maxR;
        this.maxG = maxG;
        this.maxB = maxB;
        if (this.c1) {
            this.ctx1 = this.c1.getContext("2d");
            this.c2 = document.getElementById("c2-" + instanceId);
            this.ctx2 = this.c2.getContext("2d");
            let self = this;
            console.log('Adding event listeners');
            this.video.addEventListener("play", function () {
                self.startTimerCallback();
            }, false);

            this.video.addEventListener("ended", function () {
                chromaPauseVideo();
            });
            processorInstanciated = true;
        }
    },

    computeFrame: function () {
        this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
        let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
        let l = frame.data.length / 4;
        for (let i = 0; i < l; i++) {
            let r = frame.data[i * 4 + 0];
            let g = frame.data[i * 4 + 1];
            let b = frame.data[i * 4 + 2];
            if (g >= this.minG && g <= this.maxG
                && r >= this.minR && r <= this.maxR
                && b >= this.minB && b <= this.maxB)
                frame.data[i * 4 + 3] = 0;
        }
        this.ctx2.putImageData(frame, 0, 0);
        return;
    }

};


function chromaStartVideo(minR, minG, minB, maxR, maxG, maxB, instanceId) {
    //  processor.timerCallback();
    processor.doLoad(minR, minG, minB, maxR, maxG, maxB, instanceId);
    console.log('Starting video', instanceId);
    jQuery('#chroma-play-link-' + instanceId).hide();
    jQuery('#chroma-placeholder-' + instanceId).hide();
    document.getElementById('chroma-video-' + instanceId).play();
    document.getElementById('chroma-pause-link-' + instanceId).style = '';
}

function chromaPauseVideo(instanceId) {
    console.log('Pausing video', instanceId);
    document.getElementById('chroma-video-' + instanceId).pause();
    jQuery('#chroma-pause-link-' + instanceId).hide();
    jQuery('#chroma-play-link-' + instanceId).show();
}
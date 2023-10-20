

export default class VideoInfo {
    constructor(props) {
        const { videoFile } = props;

        if (!videoFile) throw new Error('Missing required argument: videoFile');

        this.name = videoFile.name;
        this.videoURL = URL.createObjectURL(videoFile);
    }

    async init() {
        return await new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = this.videoURL;
            video.addEventListener('loadedmetadata', () => {
                this.height = video.videoHeight;
                this.width = video.videoWidth;

                this.durSec = video.duration;
                this.durFormatted = formatTime(this.durSec);

                video.remove(); // Remove temporary video element from DOM
                resolve(true);
            });
        });

        function formatTime(durSec) {
            const h = Math.floor(durSec / 3600);
            const m = Math.floor((durSec % 3600) / 60);
            const s = (durSec % 60).toFixed(0);

            return [
                `${h !== 0 ? String(h).padStart(2, '0') + ':' : ''}`,
                `${String(m)}:`,
                `${String(s).padStart(2, '0')}`
            ].join('');
        }
    }
}

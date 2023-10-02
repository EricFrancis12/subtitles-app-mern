

export default class VideoInfo {
    constructor(props) {
        const { videoFile, videoElement } = props;

        if (videoFile) {
            this.name = videoFile.name;
            this.videoURL = URL.createObjectURL(videoFile);

            const video = document.createElement('video');
            video.src = this.videoURL;
            video.addEventListener('loadedmetadata', () => {
                this.height = video.videoHeight;
                this.width = video.videoWidth;

                video.remove(); // Remove temporary video element from DOM
            });
        }

        if (videoElement) {
            this.durSec = videoElement.duration;
            this.durFormatted = formatTime(this.durSec);
        }

        function formatTime(durSec) {
            // change this later to do proper formatting...
            return durSec;
        }
    }
}

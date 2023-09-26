

export default class VideoInfo {
    constructor(props) {
        const { videoFile, videoElement } = props;

        if (videoFile) {
            this.name = videoFile.name;
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

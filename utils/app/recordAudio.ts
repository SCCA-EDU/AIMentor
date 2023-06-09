export class AIMediaRecorder {
  private chunks: Blob[] = [];
  private mediaRecorder: MediaRecorder | undefined;
  constructor() {}
  public initMediaRecorder(): Promise<MediaRecorder> {
    return new Promise((resolve, reject) => {
      // Get access to the user's microphone
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          // Create a new MediaRecorder instance
          this.mediaRecorder = new MediaRecorder(stream);
          resolve(this.mediaRecorder);
        })
        .catch(function (error) {
          reject('Error accessing the microphone.');
          console.error('Error accessing the microphone:', error);
        });
    });
  }
  public startRecord(): void {
    if (this.mediaRecorder) {
      // Event handler for when a data chunk is available
      this.mediaRecorder.ondataavailable = (event) => {
        this.chunks.push(event.data);
      };
    }
    this.mediaRecorder?.start();
  }
  public stopRecord(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.mediaRecorder) {
        // Event handler for when recording is stopped
        this.mediaRecorder.onstop = () => {
          // Create a new Blob from the recorded chunks
          const recordedBlob = new Blob(this.chunks, { type: 'audio/webm' });
          resolve(recordedBlob);
        };
      }
      this.mediaRecorder?.stop();
    });
  }
}

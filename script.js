document.getElementById('process-button').addEventListener('click', async () => {
  const fileInput = document.getElementById('video-input');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a video file.');
    return;
  }

  const progressDiv = document.getElementById('progress');
  progressDiv.innerText = 'Loading FFmpeg...';

  // Load FFmpeg.js
  const { createFFmpeg, fetchFile } = FFmpeg;
  const ffmpeg = createFFmpeg({ log: true });

  try {
    await ffmpeg.load();
    progressDiv.innerText = 'FFmpeg loaded. Processing video...';

    // Read the uploaded file
    const data = await fetchFile(file);
    ffmpeg.FS('writeFile', 'input.mp4', data);

    // Run FFmpeg command to remove silence
    await ffmpeg.run(
      '-i', 'input.mp4',
      '-af', 'silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-30dB',
      'output.mp4'
    );

    // Read the result
    const outputData = ffmpeg.FS('readFile', 'output.mp4');

    // Create a Blob and set up the download link
    const videoBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(videoBlob);
    const downloadLink = document.getElementById('download-link');
    downloadLink.href = url;
    downloadLink.style.display = 'block';

    progressDiv.innerText = 'Processing complete!';
  } catch (error) {
    console.error(error);
    progressDiv.innerText = 'An error occurred during processing.';
  } finally {
    ffmpeg.FS('unlink', 'input.mp4');
    ffmpeg.FS('unlink', 'output.mp4');
  }
});

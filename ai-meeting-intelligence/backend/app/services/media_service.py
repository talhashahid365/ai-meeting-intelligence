import os
import subprocess
import wave
import re
import imageio_ffmpeg

class MediaProcessingService:
    @staticmethod
    def get_ffmpeg_path() -> str:
        """Get the path to the ffmpeg executable."""
        try:
            return imageio_ffmpeg.get_ffmpeg_exe()
        except Exception:
            return "ffmpeg"

    @classmethod
    def get_media_duration(cls, file_path: str) -> float:
        """Extract media duration in seconds using ffmpeg or wave."""
        # Try wave module if wav file
        if file_path.lower().endswith(".wav"):
            try:
                with wave.open(file_path, "rb") as wf:
                    frames = wf.getnframes()
                    rate = wf.getframerate()
                    return frames / float(rate)
            except Exception:
                pass

        # Try ffmpeg
        ffmpeg_bin = cls.get_ffmpeg_path()
        try:
            cmd = [ffmpeg_bin, "-i", file_path]
            # FFmpeg prints info to stderr
            result = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True, timeout=10)
            output = result.stderr
            m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", output)
            if m:
                hours = float(m.group(1))
                minutes = float(m.group(2))
                seconds = float(m.group(3))
                return hours * 3600 + minutes * 60 + seconds
        except Exception as e:
            print(f"Failed to get duration via ffmpeg: {e}")

        # Fallback default duration for demo/audio
        return 120.0

    @classmethod
    def extract_and_normalize_audio(cls, input_media_path: str, output_wav_path: str) -> str:
        """
        Extracts audio from video (or converts audio) into normalized 16kHz mono WAV
        which is ideal for Whisper and STT models while preserving exact timestamps.
        """
        ffmpeg_bin = cls.get_ffmpeg_path()
        cmd = [
            ffmpeg_bin,
            "-y",  # Overwrite output
            "-i", input_media_path,
            "-vn",  # No video
            "-acodec", "pcm_s16le",  # Standard PCM WAV
            "-ar", "16000",  # 16kHz
            "-ac", "1",  # Mono
            output_wav_path
        ]
        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True, timeout=180)
            return output_wav_path
        except Exception as e:
            print(f"Warning: Audio extraction failed or ffmpeg exited with error: {e}")
            # If extraction failed, return input path
            return input_media_path

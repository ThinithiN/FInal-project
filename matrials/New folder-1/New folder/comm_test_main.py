

from voice_comad import predict_audio
import sounddevice as sd
import numpy as np
import wave
import time


def record_audio(filename, duration, samplerate=44100):

    audio_data = sd.rec(int(samplerate * duration), samplerate=samplerate, channels=2, dtype=np.int16)
    sd.wait()

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(samplerate)
        wf.writeframes(audio_data.tobytes())



while True:



    output_filename = "realtime_buffer.wav"
    recording_duration = 1  # Set the duration of the recording in seconds
    print("ready......")
    time.sleep(5)
    print("recode......")
    
    record_audio(output_filename, recording_duration)
    print(f"Recording saved as {output_filename}")
    time.sleep(1)
    ss = predict_audio(output_filename)
    print(ss)
    time.sleep(1)

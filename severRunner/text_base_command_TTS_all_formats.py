

import speech_recognition as sr
import librosa
import numpy as np
from scipy.io.wavfile import write


def audio_fomated_wav(nunformated_audio_parth):

    filename = 'buffer_audio.wav'

    formatted_path = nunformated_audio_parth.replace('/', '\\')
    data, sr = librosa.load(formatted_path)
    normalized_data = (data / np.max(np.abs(data)) * 32767).astype(np.int16)
    write(filename, sr, normalized_data)

    return filename




def audio_to_text(file_path):

    audiofilepath = audio_fomated_wav(file_path)
    
    recognizer = sr.Recognizer()

    
    with sr.AudioFile(audiofilepath) as audio_file:
        
        recognizer.adjust_for_ambient_noise(audio_file)

        
        audio = recognizer.record(audio_file)

        try:
            
            
            text = recognizer.recognize_google(audio)
            return text
        except sr.UnknownValueError:
            print("could not understand audio.")
            return None
        except sr.RequestError as e:
            print("Could not request results from Google Web Speech API; {0}".format(e))
            return None




####### test part #######


# audio_file_path = '1_hash_voice.wav'


# text_string = audio_to_text(audio_file_path)

# if text_string:
   
#     print("Text from audio: {}".format(text_string))

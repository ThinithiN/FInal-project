import librosa
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
import os


svm = 0

def extract_features(file_path):

    print(file_path)
    # Load audio file
    #audio, sr = librosa.load(file_path)
    y, sr = librosa.load(file_path, duration=3, offset=0.5)

    # mfcc = librosa.feature.mfcc(y = audio, sr=sr)
    # mfcc_mean = np.mean(mfcc, axis=1)

    #y, sr = librosa.load(filename, duration=3, offset=0.5)
    mfcc_mean = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)

    return mfcc_mean


def train_svm():

    folder_parth = 'voice_command_dataset'

    ansA = os.listdir(folder_parth+'/ansA')
    ansB = os.listdir(folder_parth+'/ansB')
    ansC = os.listdir(folder_parth + '/ansC')
    ansD = os.listdir(folder_parth + '/ansD')


    # normal_files = ['normal1.wav', 'normal2.wav', 'normal3.wav']

    # Create an empty list to store the features and labels
    features = []
    labels = []

    for file in ansA:
        features.append(extract_features(folder_parth+'/ansA/'+file))
        labels.append('ansA')

    for file in ansB:
        features.append(extract_features(folder_parth+'/ansB/'+file))
        labels.append('ansB')

    for file in ansC:
        features.append(extract_features(folder_parth+'/ansC/'+file))
        labels.append('ansC')

    for file in ansD:
        features.append(extract_features(folder_parth+'/ansD/'+file))
        labels.append('ansD')




    # Step 3: Split the dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

    # Step 4: Train a Support Vector Machine (SVM) classifier kernel='linear'
    global svm
    svm = SVC(kernel='linear')
    svm.fit(X_train, y_train)

    # Step 5: Evaluate the model
    y_pred = svm.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print("Accuracy:", accuracy)


def predict_audio(test_audi):

    # Step 6: Real-time classification (assuming 'audio' contains real-time audio data)
    audio_features = extract_features(test_audi)
    prediction = svm.predict([audio_features])[0]
    print("Predicted class:", prediction)

    return prediction



train_svm()




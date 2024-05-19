import cv2
import numpy as np
from keras.models import model_from_json




emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}


json_file = open('face_imotion_model/emotion_model.json', 'r')
loaded_model_json = json_file.read()
json_file.close()
emotion_model = model_from_json(loaded_model_json)


emotion_model.load_weights("face_imotion_model/emotion_model.h5")
print("Loaded model from disk")

imotion_state = []

def imotion_assigmi(img, anotation = False):

    global imotion_state

    frame = img.copy()

    # Find haar cascade to draw bounding box around face
    frame = cv2.resize(frame, (1280, 720))

    face_detector = cv2.CascadeClassifier('face_imotion_haarcascades/haarcascade_frontalface_default.xml')
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # detect faces available on camera
    num_faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.3, minNeighbors=5)

    # take each face available on the camera and Preprocess it
    for (x, y, w, h) in num_faces:
        cv2.rectangle(frame, (x, y-50), (x+w, y+h+10), (0, 255, 0), 4)
        roi_gray_frame = gray_frame[y:y + h, x:x + w]
        cropped_img = np.expand_dims(np.expand_dims(cv2.resize(roi_gray_frame, (48, 48)), -1), 0)

        # predict the emotions
        emotion_prediction = emotion_model.predict(cropped_img)
        maxindex = int(np.argmax(emotion_prediction))
        cv2.putText(frame, emotion_dict[maxindex], (x+5, y-20), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)

        if emotion_dict[maxindex] in ['Happy', 'Surprised', 'Neutral']:
            imotion_state.append('good')

        if emotion_dict[maxindex] in ['Angry', 'Disgusted', 'Fearful', 'Sad']:
            imotion_state.append('bad')

    try:
        good_count = imotion_state.count('good')
        bad_count = imotion_state.count('bad')
        total_count = len(imotion_state)
        good_percentage = int((good_count / total_count) * 10)


    except:
        good_percentage = 0

    if anotation:
        cv2.imshow('Emotion Detection', frame)

    cv2.waitKey(1)

    return good_percentage






# cap = cv2.VideoCapture(0)
#
# while True:
#     ret, frame = cap.read()
#     marks = imotion_assigmi(frame,anotation=True)
#
#     print(marks)






















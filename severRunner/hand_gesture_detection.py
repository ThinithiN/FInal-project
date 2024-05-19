import cv2
import mediapipe as mp
from tensorflow import keras
import numpy as np

# Define the class names
class_names = ["0","1", "2", "3", "4"]
model = keras.models.load_model("hand_sign_model.h5")
mp_hands = mp.solutions.hands
hands = mp_hands.Hands()
cap = cv2.VideoCapture(0)


previous_value = None
current_count = 0
target_count = 2


def finger_number(image , anotation = False):

    frame = image
    results = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    finger_number = '0'

    if results.multi_hand_landmarks:
        landmarks = results.multi_hand_landmarks[0].landmark
        # data = [landmark.x for landmark in landmarks] + [landmark.y for landmark in landmarks]
        # data = np.array(data, dtype="float32").reshape(1, -1)

        for landmark in landmarks:
            h, w, _ = frame.shape
            x, y = int(landmark.x * w), int(landmark.y * h)
            cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)

        val1 = ((landmarks[0].y - landmarks[8].y) / (landmarks[0].y - landmarks[5].y)) / 2.1
        val2 = ((landmarks[0].y - landmarks[12].y) / (landmarks[0].y - landmarks[9].y)) / 2.1
        val3 = ((landmarks[0].y - landmarks[16].y) / (landmarks[0].y - landmarks[13].y)) / 2.1
        val4 = ((landmarks[0].y - landmarks[20].y) / (landmarks[0].y - landmarks[17].y)) / 2.1

        data = np.array([val1,val2,val3,val4], dtype="float32").reshape(1, -1)

        # Step 4: Predict sign using the trained model
        prediction = model.predict(data,verbose=0)
        sign_index = np.argmax(prediction)
        sign_text = class_names[sign_index]

        # Step 5: Display the predicted sign on the video feed
        cv2.putText(frame, f"Sign: {sign_text}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)





        value = sign_text
        global previous_value , current_count

        # Check if the current value is the same as the previous one
        if value == previous_value:
            current_count += 1
        else:
            current_count = 1  # Reset the count if the value changes
            previous_value = value  # Update the previous value

        # Print the value if it occurs consecutively 15 times
        if current_count == target_count:
            if anotation:
                print(f"Consecutively 15 times: {value}")
            finger_number = value

    if anotation:
        cv2.imshow("Hand Sign Recognition", frame)
    cv2.waitKey(1)

    return finger_number


# cap = cv2.VideoCapture(0)
#
# while True:
#     ret, frame = cap.read()
#     number = finger_number(frame, anotation=False)
#
#
#     if number != 'Zero':
#
#         print('number  - ',number)

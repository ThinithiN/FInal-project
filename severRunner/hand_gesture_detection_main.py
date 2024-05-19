
import cv2
from hand_gesture_detection import finger_number



cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    number = finger_number(frame, anotation=True)


    if number != 'Zero':

        print('number  - ',number)
import cv2
from face_imotion_marks import imotion_assigmi


cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    marks = imotion_assigmi(frame,anotation=True)

    print(marks)
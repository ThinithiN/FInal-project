from voice_comad import predict_audio
from hand_gesture_detection import finger_number
from face_imotion_marks import imotion_assigmi
from datetime import date
from datetime import datetime
from openpyxl import load_workbook
import pandas as pd
import re
from io import BytesIO
from PIL import Image
import cv2
from werkzeug.utils import secure_filename
import threading
import base64
import random
import math
from scipy.io.wavfile import write
import numpy as np
import librosa
# import datetime
import os
import uuid
import json
import time
from flask import Flask, jsonify, request, session, render_template
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit, join_room, leave_room
from threading import Thread

import requests

from chat_gpt_eng import ask_from_gpt
from text_base_command_TTS_all_formats import audio_to_text

from text_base_blind_ditect import GenericAssistant as fb_pb_blind
from text_base_command import GenericAssistant

fb_pb_blind_bot_q = fb_pb_blind(
    'text_base_blind_ditect_dataset.json', model_name="text_base_blind_ditect_dataset_model")
fb_pb_blind_bot_q.load_model()

interviewer = GenericAssistant(
    'text_base_command_dataset.json', model_name="text_base_command_model")
interviewer.load_model()


# Create a dictionary to store the locks for each file
file_locks = {}


#! FlASK  AND SOCKET-IO DEFINE
app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")
PORT = 5000


directory = os.getcwd()

storage_users_path = os.path.join(directory, 'StorageData/UsersDB')
storage_users_audio_files_data_path = os.path.join(
    directory, 'StorageData/AudiofilesDB')
storage_quections_data_path = os.path.join(
    directory, 'StorageData/QuectionfilesDB')


storage_users_chat_history_path = os.path.join(
    directory, 'StorageData/ChatHistoryDB')
storage_users_profile_pics_path = os.path.join(
    directory, 'StorageData/ProfilePicsDB')


#! ACCESSM FILES NAMES
users_db_file = "usersInfo.json"


#! ADMIN LOGINS
admin_email = "sliit@sliit.lk"
admin_pass = "1234"


#! Normal files handling

def createStorages():

    try:
        os.makedirs(storage_users_path)
    except OSError as error:
        print(error)
        pass

    try:
        os.makedirs(storage_users_chat_history_path)
    except OSError as error:
        print(error)
        pass

    try:
        os.makedirs(storage_users_profile_pics_path)
    except OSError as error:
        print(error)
        pass

    try:
        os.makedirs(storage_users_audio_files_data_path)
    except OSError as error:
        print(error)
        pass

    try:
        os.makedirs(storage_quections_data_path)
    except OSError as error:
        print(error)
        pass


def createFiles():

    #! create users save file
    try:

        user_file = os.path.join(storage_users_path, users_db_file)

        if os.path.exists(user_file):
            pass
        else:
            print("The file does not exist")
            try:

                with open(user_file, "w") as outfile:
                    json.dump([], outfile, indent=3)

            except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available

                print(' user  file create error ')
                pass

    except OSError as error:
        print(error)
        pass

    users_data = []

    user_file = os.path.join(storage_users_path, users_db_file)

    try:
        with open(user_file, "r") as infile:
            users_data = json.load(infile)

        if (not users_data):

            pass

        else:

            for user in users_data:

                temp_file_name = user["name"] + \
                    "_" + str(user["id"])+"_chat_history.json"
                temp_file = os.path.join(
                    storage_users_chat_history_path, temp_file_name)

                if os.path.exists(temp_file):
                    pass
                else:
                    print("The file does not exist")
                    try:

                        with open(temp_file, "w") as outfile:

                            temp = {
                                str(user["id"]): []
                            }
                            json.dump({}, outfile, indent=3)

                    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available

                        print(' temp chat history   file create error ')
                        pass

            for user in users_data:

                temp_folder_name = user["name"]
                temp_folder_path = os.path.join(
                    storage_users_audio_files_data_path, temp_folder_name)

                if os.path.exists(temp_folder_path):
                    print("The folder exist")
                    pass
                else:
                    print("The folder does not exist")
                    try:

                        os.makedirs(temp_folder_path)

                    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available

                        print(' temp user audio seperate folders create error ')
                        pass

    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available

        print('file handle error chat history fies save  ')


#!NEW
#! chat history files
# Create an empty dictionary to store the file contents
chat_file_contents = {}


def loadChatFiles():

    # Loop through each file in the directory
    for filename in os.listdir(storage_users_chat_history_path):

        # print(" hy ")
        # Check if the file is a JSON file
        if filename.endswith('.json') and filename not in chat_file_contents:
            # Open the JSON file and load its contents
            with open(os.path.join(storage_users_chat_history_path, filename)) as f:
                contents = json.load(f)
            # Add the file contents to the chat_file_contents dictionary
            chat_file_contents[filename] = contents


def messageIdGenerator():
    try:
        uuid_val = str(uuid.uuid4())
        uuid_parts = uuid_val.split("-")
        uuid_parts[2] = hex(int(uuid_parts[2], 16) & 0x0fff | 0x4000)[2:]
        uuid_parts[3] = hex(int(uuid_parts[3], 16) & 0x3fff | 0x8000)[2:]
        uuid_val = "-".join(uuid_parts)

        # uuid_val = None

        if not uuid_val:
            raise Exception('Failed to generate UUID')

        return uuid_val
    except Exception as error:
        # generates uuid.
        print(' error id creating ', str(error))
        return None


#!======================================================================================


#! Handle Quiz socket data


def camera_thread():
    global camera_open, cameraglobalRef, testnameglobalRef, testlevelglobalRef, qindexglobalRef, qindexpreviosRef, camera_room_contents

    while False:
        global camera_open, cameraglobalRef, testnameglobalRef, testlevelglobalRef, qindexglobalRef, qindexpreviosRef, camera_room_contents

        if camera_open:
            # Capture frame-by-frame
            ret, frame = cameraglobalRef.read()

            #! do something with frame

            # time.sleep(2)

            if qindexpreviosRef != qindexglobalRef:

                numbers = [1, 2, 3, 4]

                answerText = str(random.choice(numbers))

                socketio.emit('stream three q4 game', {'testnameglobalRef': testnameglobalRef, 'testlevelglobalRef': testlevelglobalRef,
                              'qindexglobalRef': qindexglobalRef, 'answerText': answerText}, to=camera_room_contents)

                qindexpreviosRef = qindexglobalRef

            # Encode frame to base64
            _, buffer = cv2.imencode('.jpg', frame)
            frame_encoded = base64.b64encode(buffer)

            # Send the frame to the frontend
            socketio.emit(
                'cam_image', {'image': frame_encoded.decode('utf-8')})
            time.sleep(0.2)


# Create an empty dictionary to store the streamid locks
stream_id_locks = {}


#! Gagan gesture game


def gesture_game_quiz(np_frame, rightAnswer):

    #! do processing the data

    # time.sleep(1)

    fnumb = finger_number(np_frame, anotation=False)

    print('------  ', np_frame.shape, 'f number - ', fnumb, '  rightAnswer  ',
          rightAnswer, '   ---------------------------------------')

    # cv2.imshow("live",np_frame)
    # cv2.waitKey(1)

    isAnswerOk = 0  # ! 0 or 1 depeneding on the frame
    numbers2 = '0'  # validation
    numbers = '0'

    if fnumb != '0':

        print('number  - ', fnumb, 'rightAnswer  - ', rightAnswer)

        if str(rightAnswer) == fnumb:

            numbers2 = '1'

        isAnswerOk = 1
        numbers = fnumb

    # * say mcq number
    # numbers = [1, 2, 3, 4]
    # answerText = str(random.choice(numbers))
    # numbers2 = [0, 1]
    # mark = str(random.choice(numbers2))

    answerText = numbers
    mark = numbers2

    sentences = [
        "This is the first sentence.",
        "Here is another sentence.",
        "A third sentence for demonstration.",
        "One more sentence to choose from.",
        "The final sentence in the array."
    ]

    aireply = random.choice(sentences)

    streamNumber = random.choice(numbers)

    #!===

    return answerText, mark, aireply, streamNumber, isAnswerOk


#! Gagan Emotion analysiz

def emotion_score(np_frame):
    #! do processing the data

    marks = imotion_assigmi(np_frame, anotation=True)
    marks_s = str(marks)+'/10'

    #! return  good ratio
    # return "2/10"
    return marks_s

# Socket IO handling


@socketio.on('connect')
def on_connect():
    print('New Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Crrunt Client disconnected')


#!NEW
# * Chat with AI

@socketio.on('join room chat')
def handle_join_chat_room(data):
    print('Client joined room with ',
          data['username'], data['userid'], data['userFile'])
    username = data['username']
    userid = data['userid']
    userFile = data['userFile']

    join_room(userFile)

    emit('bot response', welcome_note(userFile, userid, username), to=userFile)


@socketio.on('leave chat room')
def handle_leave_chat_room(data):
    print('Client leaved chat room with ',
          data['username'], data['userid'], data['userFile'])
    userFile = data['userFile']

    #   emit('camera room response', "camera room closed", to=userFile)
    leave_room(userFile)


def welcome_note(userFile, userid, username):

    temp_user_chat_file_name = userFile + ".json"

    response = "Hey "+username + " welcome to chat bot you can ask anything you like :)"

    if str(userid) in chat_file_contents[temp_user_chat_file_name]:

        msg = chat_file_contents[temp_user_chat_file_name][str(userid)]

        if len(msg):

            response = 'Welcome back ' + username + ' ask away anything from me '

    welcome_note_dict = {}

    welcome_note_dict['_id'] = str(uuid.uuid4())

    welcome_note_dict['text'] = response

    welcome_note_dict['createdAt'] = str(datetime.now())

    welcome_note_dict['user'] = {
        '_id': 2, 'name': 'Bot', 'avatar': 'https://picsum.photos/id/668/200/300'}

    welcome_note_dict['audio'] = ""

    welcome_note_dict['messageType'] = "message"

    return [welcome_note_dict]


@socketio.on('user message')
def handle_user_message(message):

    msg = message['messageObj']

    userName = message['username']
    user_id = message['userid']
    userFile = message['userFile']

    # * Check for msg type two type text and audio(tts)

    responseSave = None
    responseLive = None

    if msg['messageType'] == 'audio':
        audio_base64msg = message['audiobase64msg']

        responseSave = responseLive = generate_response_for_audio(
            msg, user_id, audio_base64msg)
        pass
    elif msg['messageType'] == 'message':

        responseSave = responseLive = generate_response_for_text(msg)
        pass

    emit('bot response', responseLive, to=userFile)

    #!========== SAVE USER AND BOT RESPONSE ================

    # temp_user_chat_file_name = userFile + ".json"

    # if str(user_id) not in chat_file_contents[temp_user_chat_file_name]:
    #     chat_file_contents[temp_user_chat_file_name][str(user_id)] = []

    # # * User mesage

    # user_dict = msg

    # user_dict['createdAt'] = str(datetime.now())

    # chat_file_contents[temp_user_chat_file_name][str(
    #     user_id)].append(user_dict)

    # # * Bot message

    # bot_dict = responseSave[0]

    # chat_file_contents[temp_user_chat_file_name][str(user_id)].append(bot_dict)

    # chat_file_temp = os.path.join(
    #     storage_users_chat_history_path, temp_user_chat_file_name)

    # with open(chat_file_temp, 'w') as f:
    #     json.dump(chat_file_contents[temp_user_chat_file_name], f)

    #!========== SAVE USER AND BOT RESPONSE ================


def make_dummy_request():
    try:
        # Replace 'https:// www.codecademy.com' with the URL of the sample website you want to request
        response = requests.get('https://www.codecademy.com')

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            print('Request successful!')
            # print('Response content:', response.text)
        else:
            print(f'Request failed with status code: {response.status_code}')

    except requests.RequestException as e:
        print(f'Error making request: {e}')


def generate_response_for_audio(message, user_id, audiobase64msg):

    global storage_users_audio_files_data_path

    # * create .mp3 file with incoming base64 string

    temp_user_audio = str(user_id) + "_temp_chat.wav"

    chat_audio_temp = os.path.join(
        storage_users_audio_files_data_path, temp_user_audio)

    with open(chat_audio_temp, 'wb') as f:
        f.write(base64.b64decode(audiobase64msg))

    parth = "StorageData/AudiofilesDB/"+str(temp_user_audio)
    text_over_voice = audio_to_text(parth)

    gpt_say = ask_from_gpt(text_over_voice)

    print("=============================", parth)

    income_mp3_audio = chat_audio_temp  # ! convert this wav for use

    # make_dummy_request()

    # socketio.sleep(2)

    # * then bot response

    paragraphs = [
        "The sun was shining brightly, casting a warm glow over the meadow.",
        "As she walked through the forest, she marveled at the tall trees towering above her.",
        "The ocean waves crashed against the shore, creating a soothing rhythm.",
        "He couldn't help but smile as he watched the children playing in the park.",
        "The aroma of freshly baked bread filled the air, making her stomach growl in anticipation.",
    ]

    index = random.randint(0, len(paragraphs) - 1)

    bot_response = gpt_say  # paragraphs[index]  #! Your response here

    bot_dict = {}

    bot_dict['_id'] = str(uuid.uuid4())

    bot_dict['text'] = bot_response

    bot_dict['createdAt'] = str(datetime.now())

    bot_dict['user'] = {'_id': 2, 'name': 'Bot',
                        'avatar': 'https://picsum.photos/id/668/200/300'}

    bot_dict['audio'] = ""

    bot_dict['messageType'] = "message"

    bot_dict['messageLive'] = True

    response = [bot_dict]

    return response


def generate_response_for_text(message):

    income_text = message['text']  # ! do somethig with this

    # * then bot response

    ss = ask_from_gpt(income_text)

    bot_response = ss

    bot_dict = {}

    bot_dict['_id'] = str(uuid.uuid4())

    bot_dict['text'] = bot_response

    bot_dict['createdAt'] = str(datetime.now())

    bot_dict['user'] = {'_id': 2, 'name': 'Bot',
                        'avatar': 'https://picsum.photos/id/668/200/300'}

    bot_dict['audio'] = ""

    bot_dict['messageType'] = "message"

    response = [bot_dict]

    return response


#!======================================================================================


# * Video stream recieving

@socketio.on('video stream')
def handle_stream(data):

    # print('Received data ', data)

    stream_id = data['name'] + "_" + str(data['id']) + "_id"

    if stream_id in stream_id_locks:

        if stream_id_locks[stream_id] == None:
            pass
        else:
            # print(' Here why ')
            return

    stream_id_locks[stream_id] = threading.current_thread().ident

    userCam = data['userCam']

    # * access the frame first

    frame_data = data['frame']

    # Decode base64 and convert to NumPy array
    decoded_frame = base64.b64decode(frame_data.split(',')[1])
    np_frame = np.frombuffer(decoded_frame, dtype=np.uint8)

    image = cv2.imdecode(np_frame, cv2.IMREAD_COLOR)

    # image_name = data['name'] + "_" + str(data['id'] )+ "_frame.jpg"

    # cv2.imwrite(image_name, image)

    # * Gesture Game Quiz
    if data['nameOftheTest'] == "StreamThree" and data['levelofmcq'] == "q4":

        answerText, mark, aireply, streamNumber, isAnswerOk = gesture_game_quiz(
            image, data['rightAnswer'])

        emit('gesture_game_quiz', {'answerText': answerText, 'mark': mark, 'aireply': aireply, 'nameOftheTest': data['nameOftheTest'],
                                   'levelofmcq': data['levelofmcq'], 'queindex': data['queindex'], 'isAnswerOk': isAnswerOk}, to=userCam)

        stream_id_locks[stream_id] = None

    elif data['nameOftheTest'] == "StreamTwo" and data['levelofmcq'] == "q4":

        answerText, mark, aireply, streamNumber, isAnswerOk = gesture_game_quiz(
            image, data['rightAnswer'])

        emit('gesture_game_quiz', {'answerText': answerText, 'mark': mark, 'aireply': aireply, 'nameOftheTest': data['nameOftheTest'],
                                   'levelofmcq': data['levelofmcq'], 'queindex': data['queindex'], 'isAnswerOk': isAnswerOk}, to=userCam)

        stream_id_locks[stream_id] = None

    elif data['nameOftheTest'] == "StreamOne" and data['levelofmcq'] == "q4":

        answerText, mark, aireply, streamNumber, isAnswerOk = gesture_game_quiz(
            image, data['rightAnswer'])

        emit('gesture_game_quiz', {'answerText': answerText, 'mark': mark, 'aireply': aireply, 'nameOftheTest': data['nameOftheTest'],
                                   'levelofmcq': data['levelofmcq'], 'queindex': data['queindex'], 'isAnswerOk': isAnswerOk}, to=userCam)

        stream_id_locks[stream_id] = None

    # * Final quiz
    elif data['nameOftheTest'] == "FinalQuection" and data['levelofmcq'] == "":

        emotionScore = emotion_score(image)

        emit('final_emotion_quiz', {'emotionScore': emotionScore, 'nameOftheTest': data['nameOftheTest'],
                                    'levelofmcq': data['levelofmcq'], 'queindex': data['queindex']}, to=userCam)

        stream_id_locks[stream_id] = None


@socketio.on('join camera room')
def handle_join_camera_room(data):
    print('Client joined camera room with ',
          data['username'], data['userid'], data['userCam'])
    userCam = data['userCam']
    join_room(userCam)
    emit('camera room response', "camera room opened", to=userCam)


@socketio.on('toggle_camera')
def toggle_camera(data):
    global camera_open

    print('Camera state ',
          data['open'])
    camera_open = data['open']


@socketio.on('leave camera room')
def handle_leave_camera_room(data):
    print('Client leaved camera room with ',
          data['username'], data['userid'], data['userCam'])
    userCam = data['userCam']

    emit('camera room response', "camera room closed", to=userCam)
    leave_room(userCam)


#! ================ normal  app routes ======================

@app.route('/')
@cross_origin()
def index():
    return render_template('index.html')


def is_duplicate(json_data, name, email):
    for entry in json_data:
        if entry['name'] == name or entry['email'] == email:
            return True
    return False

# *Register user


@app.route('/register_user', methods=['POST'])
@cross_origin()
def users_save_DB():
    global admin_email, admin_pass

    request_data = request.get_json()

    name = request_data["name"]
    email = request_data["email"]
    password = request_data["password"]

    # profile_pic = request_data["profile_pic"]

    # # process and save incoming profile pic
    # frame_ = str(profile_pic)
    # data = frame_.replace('data:image/jpeg;base64,', '')
    # data = data.replace(' ', '+')
    # imgdata_binary = base64.b64decode(data)
    # image = np.asarray(bytearray(imgdata_binary), dtype="uint8")
    # image = cv2.imdecode(image, cv2.IMREAD_COLOR)

    # if (os.path.exists(storage_users_profile_pics_path) == False):
    #     return jsonify(
    #         status=400,
    #         message="Profile Store folder not exxists"
    #     ), 400

    # image_name = "profile_pic_" + str(name) + "_.jpg"

    # profile_pic_path = os.path.join(
    #     storage_users_profile_pics_path, image_name)

    # cv2.imwrite(profile_pic_path, image)

    # now read  user file and creade id
    user_file = os.path.join(storage_users_path, users_db_file)

    # Check if the file is currently locked
    if user_file in file_locks:
        # Wait until the lock is released
        while file_locks[user_file]:
            time.sleep(1)

    # Lock the file and assign it to the current user
    file_locks[user_file] = threading.current_thread().ident

    try:

        json_data = []
        with open(user_file, "r") as infile:
            json_data = json.load(infile)

        if is_duplicate(json_data, name, email):
            print("Name or email already exists. Cannot add new data.")

            # Release the lock when finished
            file_locks[user_file] = None

            return jsonify(
                status=401,
                message="user already registered"
            ), 401

        # Find the last ID in the existing JSON data
        if json_data:
            # Find the last ID in the existing JSON data
            last_id = max(entry['id'] for entry in json_data)
        else:
            # If no existing entries, set last_id to 0
            last_id = 0
        # Create a new data entry
        new_data = {
            "id": last_id+1,
            "name": name,
            "email": email,
            "password": password,
            "profile_pic_path": "",
            "aiinterviewone_done": 0,
            "aiinterviewone_score": "0/10",
            "aiinterviewtwo_done": 0,
            "aiinterviewtwo_score": "0/10",
            "aione_aitwo_final_state": "bad",
            "stream_1_selection_points": 0,
            "stream_2_selection_points": 0,
            "stream_3_selection_points": 0,
            "stream_selected": "none",
            "stream_level_1_score": "0/10",
            "stream_level_2_score": "0/10",
            "stream_level_3_score": "0/10",
            "stream_level_4_score": "0/10",
            "stream_level_1_done": 0,
            "stream_level_2_done": 0,
            "stream_level_3_done": 0,
            "stream_level_4_done": 0,
            "stream_level_1_reward_unlocked": 0,
            "stream_level_2_reward_unlocked": 0,
            "stream_level_3_reward_unlocked": 0,
            "stream_level_4_reward_unlocked": 0,
            "final_exam_done": 0,
            "final_exam_score": "0/10",
            "final_exam_facial_expression_score": "0/10",
            "blind": 0,
        }

        # Append the new data to the existing JSON data
        json_data.append(new_data)

        # Write the updated JSON data back to the file
        with open(user_file, 'w') as outfile:
            json.dump(json_data, outfile, indent=2)

        createFiles()

        # Release the lock when finished
        file_locks[user_file] = None

        return jsonify(
            status=200,
            message="user added succesfully"
        ), 200

    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available
        # Release the lock when finished
        file_locks[user_file] = None
        print('file handle error users save db ')
        return jsonify(
            status=400,
            message="users file saving error"
        ), 400


# * login user


@app.route('/login_user', methods=['POST'])
@cross_origin()
def login_user():
    global admin_pass, admin_email

    #! do comparison for admin
    request_data = request.get_json()

    ask_email = request_data["email"]
    ask_passwrod = request_data["password"]

    if ask_email == admin_email and ask_passwrod == admin_pass:
        return jsonify(
            status=200,
            message="Admin Login Success",
            userId=999,
            userName="sliit",
            isAdmin=1
        ), 200

    # * Users read
    users_data = []

    user_file = os.path.join(storage_users_path, users_db_file)

    # Check if the file is currently locked
    if user_file in file_locks:
        # Wait until the lock is released
        while file_locks[user_file]:
            time.sleep(1)

    # Lock the file and assign it to the current user
    file_locks[user_file] = threading.current_thread().ident

    try:
        with open(user_file, "r") as infile:
            users_data = json.load(infile)

        # Release the lock when finished
        file_locks[user_file] = None

    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available
        # Release the lock when finished
        file_locks[user_file] = None
        print('file handle error login user')
        return jsonify(
            status=400,
            message="users file error"
        ), 400

    if (not users_data):
        return jsonify(
            status=400,
            message="No User data found"
        ), 400

    else:
        #! do comparison
        request_data = request.get_json()

        ask_email = request_data["email"]
        ask_passwrod = request_data["password"]

        for i in range(len(users_data)):
            userId = users_data[i]['id']
            nameChecker = users_data[i]['email']
            passChecker = users_data[i]['password']
            if (nameChecker == ask_email):
                if (passChecker == ask_passwrod):
                    return jsonify(
                        status=200,
                        message="User Login Success",
                        userId=userId,
                        userName=users_data[i]['name'],
                        isAdmin=0
                    ), 200
                else:
                    return jsonify(
                        status=401,
                        message="Incorrect password"
                    ), 401

        return jsonify(
            status=401,
            message="User Not Found"
        ), 401


# *GET USERS FROM DB
@app.route('/get_users', methods=['POST'])
@cross_origin()
def get_users():

    print("i was called")

    users_data = []

    user_file = os.path.join(storage_users_path, users_db_file)

    # Check if the file is currently locked
    if user_file in file_locks:
        # Wait until the lock is released
        while file_locks[user_file]:
            time.sleep(1)

    # Lock the file and assign it to the current user
    file_locks[user_file] = threading.current_thread().ident

    try:
        with open(user_file, "r") as infile:
            users_data = json.load(infile)

        # Release the lock when finished
        file_locks[user_file] = None

        if (not users_data):

            return jsonify(
                status=400,
                message="No User data found"
            ), 400

        else:
            return jsonify(
                status=200,
                message="Users data Found",
                userList=users_data
            ), 200

    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available
        # Release the lock when finished
        file_locks[user_file] = None
        print('file handle error users from db ')
        return jsonify(
            status=400,
            message="users file handle error"
        ), 400


# * ratings according to marks

def status_rating(score):
    # Parse the score
    # numerator, denominator = map(int, score.split("/"))

    # # Calculate the percentage
    # percentage = (numerator / denominator) * 100

    # # Determine the number of stars to display
    # num_stars = round((percentage / 100) * 3)  # Assuming you have 3 stars

    # return num_stars

    numerator, denominator = map(int, score.split("/"))
    numeratorx = int(numerator)

    if 0 <= numeratorx <= 2:
        return 0
    elif 2 < numeratorx <= 4:
        return 1
    elif 4 < numeratorx <= 7:
        return 2
    else:
        return 3


# * upload results


@app.route('/upload_results', methods=['POST'])
@cross_origin()
def upload_results():

    # * Users read
    users_data = []

    user_file = os.path.join(storage_users_path, users_db_file)

    # Check if the file is currently locked
    if user_file in file_locks:
        # Wait until the lock is released
        while file_locks[user_file]:
            time.sleep(1)

    # Lock the file and assign it to the current user
    file_locks[user_file] = threading.current_thread().ident

    try:
        with open(user_file, "r") as infile:
            users_data = json.load(infile)

        # Release the lock when finished
        file_locks[user_file] = None

    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available
        # Release the lock when finished
        file_locks[user_file] = None
        print('file handle error login user')
        return jsonify(
            status=400,
            message="users file error"
        ), 400

    if (not users_data):
        return jsonify(
            status=400,
            message="No User data found"
        ), 400

    else:
        #! do comparison
        request_data = request.get_json()

        name = request_data["name"]
        id = request_data["id"]
        nameOftheTest = request_data["nameOftheTest"]
        levelofmcq = request_data["levelofmcq"]
        results = request_data["results"]

        for i in range(len(users_data)):

            userId = users_data[i]['id']
            nameChecker = users_data[i]['name']

            if (nameChecker == name):
                if (userId == id):

                    if levelofmcq == "":
                        # Check if the key already exists in the dictionary
                        if nameOftheTest in users_data[i]:
                            # Key exists, update its value
                            users_data[i][nameOftheTest] = results

                            if nameOftheTest == "FinalQuection":

                                users_data[i]["final_exam_done"] = 1

                                users_data[i]["final_exam_score"] = results["Score"]

                            if nameOftheTest == "AIOneQuection":

                                users_data[i]["aiinterviewone_done"] = 1
                                users_data[i]["aiinterviewone_score"] = results["Score"]

                                users_data[i]["stream_1_selection_points"] = results["StreamOnePoints"]
                                users_data[i]["stream_2_selection_points"] = results["StreamTwoPoints"]
                                users_data[i]["stream_3_selection_points"] = results["StreamThreePoints"]

                                #! Select users stream based on points

                                winner_variables = ""

                                # Create a list with the variable names and values
                                variables = [('StreamOne',  users_data[i]["stream_1_selection_points"]), ('StreamTwo',  users_data[i]
                                                                                                          ["stream_2_selection_points"]), ('StreamThree',  users_data[i]["stream_3_selection_points"])]

                                # Sort the list based on variable values in descending order
                                variables.sort(
                                    key=lambda x: x[1], reverse=True)

                                # Check if two or more variables have the same value
                                if variables[0][1] == variables[1][1]:
                                    # Two or more variables are the same, return the variable names
                                    winner_variables = [variable[0]
                                                        for variable in variables[:2]]

                                # Return the variable name corresponding to the winning variable
                                winner_variables = variables[0][0]

                                selected_stream = ""

                                # more than one winners or winner
                                if isinstance(winner_variables, list):
                                    print(
                                        f"The winners are {', '.join(winner_variables)}")

                                    selected_stream = random.choice(
                                        winner_variables)
                                else:
                                    print(f"The winner is {winner_variables}")

                                    selected_stream = winner_variables

                                users_data[i]["stream_selected"] = selected_stream

                                pass

                            elif nameOftheTest == "AITwoQuection":

                                users_data[i]["aiinterviewtwo_done"] = 1
                                users_data[i]["aiinterviewtwo_score"] = results["Score"]

                                #! update rewards status if scored good
                                statusNumber = status_rating(results["Score"])

                                interview_status = "bad"

                                if statusNumber == 0:
                                    interview_status = "bad"
                                    pass
                                elif statusNumber == 1:
                                    interview_status = "bad"
                                    pass
                                elif statusNumber == 2:
                                    interview_status = "good"
                                    pass
                                elif statusNumber == 3:
                                    interview_status = "good"
                                    users_data[i]["stream_level_1_reward_unlocked"] = 1
                                    users_data[i]["stream_level_2_reward_unlocked"] = 1
                                    pass
                                else:
                                    pass

                                users_data[i]["aione_aitwo_final_state"] = interview_status

                                pass

                        else:
                            # Key doesn't exist, add a new key-value pair
                            users_data[i][nameOftheTest] = results

                            if nameOftheTest == "FinalQuection":

                                users_data[i]["final_exam_done"] = 1

                                users_data[i]["final_exam_score"] = results["Score"]

                            if nameOftheTest == "AIOneQuection":

                                users_data[i]["aiinterviewone_done"] = 1
                                users_data[i]["aiinterviewone_score"] = results["Score"]

                                users_data[i]["stream_1_selection_points"] = results["StreamOnePoints"]
                                users_data[i]["stream_2_selection_points"] = results["StreamTwoPoints"]
                                users_data[i]["stream_3_selection_points"] = results["StreamThreePoints"]

                                #! Select users stream based on points

                                winner_variables = ""

                                # Create a list with the variable names and values
                                variables = [('StreamOne',  users_data[i]["stream_1_selection_points"]), ('StreamTwo',  users_data[i]
                                                                                                          ["stream_2_selection_points"]), ('StreamThree',  users_data[i]["stream_3_selection_points"])]

                                # Sort the list based on variable values in descending order
                                variables.sort(
                                    key=lambda x: x[1], reverse=True)

                                # Check if two or more variables have the same value
                                if variables[0][1] == variables[1][1]:
                                    # Two or more variables are the same, return the variable names
                                    winner_variables = [variable[0]
                                                        for variable in variables[:2]]

                                # Return the variable name corresponding to the winning variable
                                winner_variables = variables[0][0]

                                selected_stream = ""

                                # more than one winners or winner
                                if isinstance(winner_variables, list):
                                    print(
                                        f"The winners are {', '.join(winner_variables)}")

                                    selected_stream = random.choice(
                                        winner_variables)
                                else:
                                    print(f"The winner is {winner_variables}")

                                    selected_stream = winner_variables

                                users_data[i]["stream_selected"] = selected_stream

                                pass

                            elif nameOftheTest == "AITwoQuection":

                                users_data[i]["aiinterviewtwo_done"] = 1
                                users_data[i]["aiinterviewtwo_score"] = results["Score"]

                                #! update rewards status if scored good
                                statusNumber = status_rating(results["Score"])

                                interview_status = "bad"

                                if statusNumber == 0:
                                    interview_status = "bad"
                                    pass
                                elif statusNumber == 1:
                                    interview_status = "bad"
                                    pass
                                elif statusNumber == 2:
                                    interview_status = "good"
                                    pass
                                elif statusNumber == 3:
                                    interview_status = "good"
                                    users_data[i]["stream_level_1_reward_unlocked"] = 1
                                    users_data[i]["stream_level_2_reward_unlocked"] = 1
                                    pass
                                else:
                                    pass

                                users_data[i]["aione_aitwo_final_state"] = interview_status

                                pass
                    else:

                        # Check if the key already exists in the dictionary
                        if nameOftheTest in users_data[i]:

                            if levelofmcq in users_data[i][nameOftheTest]:

                                # Key exists, update its value
                                users_data[i][nameOftheTest][levelofmcq] = results

                                #! update rewards status if scored good
                                statusNumber = status_rating(results["Score"])

                                if levelofmcq == "q1":

                                    if statusNumber == 3:

                                        users_data[i]["stream_level_1_reward_unlocked"] = 1

                                    users_data[i]["stream_level_1_done"] = 1
                                    users_data[i]["stream_level_1_score"] = results["Score"]

                                elif levelofmcq == "q2":

                                    if statusNumber == 3:

                                        users_data[i]["stream_level_2_reward_unlocked"] = 1

                                    users_data[i]["stream_level_2_done"] = 1
                                    users_data[i]["stream_level_2_score"] = results["Score"]

                                elif levelofmcq == "q3":

                                    if statusNumber == 3:

                                        users_data[i]["stream_level_3_reward_unlocked"] = 1

                                    users_data[i]["stream_level_3_done"] = 1
                                    users_data[i]["stream_level_3_score"] = results["Score"]

                                elif levelofmcq == "q4":

                                    if statusNumber == 3:

                                        users_data[i]["stream_level_4_reward_unlocked"] = 1

                                    users_data[i]["stream_level_4_done"] = 1
                                    users_data[i]["stream_level_4_score"] = results["Score"]

                            else:

                                users_data[i][nameOftheTest][levelofmcq] = results

                                #! update rewards status if scored good
                                statusNumber = status_rating(results["Score"])

                                if levelofmcq == "q1":

                                    if statusNumber == 3:

                                        users_data[i]["stream_level_1_reward_unlocked"] = 1

                                    users_data[i]["stream_level_1_done"] = 1
                                    users_data[i]["stream_level_1_score"] = results["Score"]

                                elif levelofmcq == "q2":

                                    if statusNumber == 3:

                                        users_data[i]["stream_level_2_reward_unlocked"] = 1

                                    users_data[i]["stream_level_2_done"] = 1
                                    users_data[i]["stream_level_2_score"] = results["Score"]

                                elif levelofmcq == "q3":

                                    if statusNumber == 3:

                                        users_data[i]["stream_level_3_reward_unlocked"] = 1

                                    users_data[i]["stream_level_3_done"] = 1
                                    users_data[i]["stream_level_3_score"] = results["Score"]

                                elif levelofmcq == "q4":

                                    if statusNumber == 3:

                                        users_data[i]["stream_level_4_reward_unlocked"] = 1

                                    users_data[i]["stream_level_4_done"] = 1
                                    users_data[i]["stream_level_4_score"] = results["Score"]

                        else:
                            # Key doesn't exist, create it and update the value
                            users_data[i][nameOftheTest] = {
                                levelofmcq: results}

                            #! update rewards status if scored good
                            statusNumber = status_rating(results["Score"])

                            if levelofmcq == "q1":

                                if statusNumber == 3:

                                    users_data[i]["stream_level_1_reward_unlocked"] = 1

                                users_data[i]["stream_level_1_done"] = 1
                                users_data[i]["stream_level_1_score"] = results["Score"]

                            elif levelofmcq == "q2":

                                if statusNumber == 3:

                                    users_data[i]["stream_level_2_reward_unlocked"] = 1

                                users_data[i]["stream_level_2_done"] = 1
                                users_data[i]["stream_level_2_score"] = results["Score"]

                            elif levelofmcq == "q3":

                                if statusNumber == 3:

                                    users_data[i]["stream_level_3_reward_unlocked"] = 1

                                users_data[i]["stream_level_3_done"] = 1
                                users_data[i]["stream_level_3_score"] = results["Score"]

                            elif levelofmcq == "q4":

                                if statusNumber == 3:

                                    users_data[i]["stream_level_4_reward_unlocked"] = 1

                                users_data[i]["stream_level_4_done"] = 1
                                users_data[i]["stream_level_4_score"] = results["Score"]

                    # Lock the file and assign it to the current user
                    file_locks[user_file] = threading.current_thread().ident

        try:
            with open(user_file, "w") as outfile:
                json.dump(users_data, outfile, indent=2)

            # Release the lock when finished
            file_locks[user_file] = None

            return jsonify(
                status=200,
                message="User Results Updated Success",

            ), 200

        except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available
            # Release the lock when finished
            file_locks[user_file] = None
            print('file handle error login user')
            return jsonify(
                status=400,
                message="users file error"
            ), 400

# * Get crrnt user profile


@app.route('/get_user_stat', methods=['POST'])
@cross_origin()
def get_user_stat():

    # * Users read
    users_data = []

    user_file = os.path.join(storage_users_path, users_db_file)

    # Check if the file is currently locked
    if user_file in file_locks:
        # Wait until the lock is released
        while file_locks[user_file]:
            time.sleep(1)

    # Lock the file and assign it to the current user
    file_locks[user_file] = threading.current_thread().ident

    try:
        with open(user_file, "r") as infile:
            users_data = json.load(infile)

        # Release the lock when finished
        file_locks[user_file] = None

    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available
        # Release the lock when finished
        file_locks[user_file] = None
        print('file handle error login user')
        return jsonify(
            status=400,
            message="users file error"
        ), 400

    if (not users_data):
        return jsonify(
            status=400,
            message="No User data found"
        ), 400

    else:
        #! do comparison
        request_data = request.get_json()

        ask_name = request_data["name"]
        ask_id = request_data["id"]

        for i in range(len(users_data)):
            userId = users_data[i]['id']
            nameChecker = users_data[i]['name']

            if (ask_name == nameChecker):
                if (userId == ask_id):
                    return jsonify(
                        status=200,
                        message="User Details Found",
                        userdata=users_data[i],
                    ), 200

        return jsonify(
            status=401,
            message="User Data Not Found"
        ), 401


#!  Gagan process the speech and reply
def process_speech_ai_ques(nameOftheTest, levelofmcq, rightAnswer, audiofilepath, speechtotext):

    #! Do processing

    def audio_fomated_wav(audiofilepath):

        filename = 'buffer_audio.wav'

        # formatted_path = nunformated_audio_parth.replace('/', '\\')
        data, sr = librosa.load(audiofilepath)
        normalized_data = (data / np.max(np.abs(data))
                           * 32767).astype(np.int16)
        write(filename, sr, normalized_data)

        return filename

    audiofilepath = audio_fomated_wav(audiofilepath)

    #! ai interviews
    if levelofmcq == "":

        if nameOftheTest == "FinalQuection":

            # * say mcq number
            numbers = [1, 2, 3, 4]

            answerText = str(random.choice(numbers))

            numbers2 = [0, 1]

            mark = str(random.choice(numbers2))

            sentences = [
                "This is the first sentence.",
                "Here is another sentence.",
                "A third sentence for demonstration.",
                "One more sentence to choose from.",
                "The final sentence in the array."
            ]

            aireply = random.choice(sentences)

            numbers3 = [1, 2, 3]

            streamNumber = random.choice(numbers3)

            #!===

            return answerText, mark, aireply, streamNumber

        if nameOftheTest == "AIOneQuection":
            # * converstaion text
            sentences = [
                "This is the first sentence.",
                "Here is another sentence.",
                "A third sentence for demonstration.",
                "One more sentence to choose from.",
                "The final sentence in the array."
            ]

            answerText = random.choice(sentences)

            numbers2 = [0, 1]

            mark = str(random.choice(numbers2))

            aireply = answerText

            numbers3 = [1, 2, 3]

            streamNumber = random.choice(numbers3)

            #!===

            return answerText, mark, aireply, streamNumber

        elif nameOftheTest == "AITwoQuection":

            # * say mcq number

            mcqanswe = predict_audio(audiofilepath)
            # path_audio_local = 'StorageData/AudiofilesDB/'+str(name)+'/'+str(id)+'_'+str(name)+'_voice.wav'
            # text = audio_to_text(audiofilepath)
            # print("aaaaaaaaaaaaaaaaaaaaaa   - ", text)

            answerText = '0'
            mark = '0'

            if mcqanswe == 'ansA':
                answerText = '1'
                if rightAnswer == '1':
                    mark = '1'

            if mcqanswe == 'ansB':
                answerText = '2'
                if rightAnswer == '2':
                    mark = '1'

            if mcqanswe == 'ansC':
                answerText = '3'
                if rightAnswer == '3':
                    mark = '1'

            if mcqanswe == 'ansD':
                answerText = '4'
                if rightAnswer == '4':
                    mark = '1'

            if mcqanswe == 'ansNOICE':
                answerText = '0'
                mark = '0'

            ############################################

            # * say mcq number
            # numbers = [1, 2, 3, 4]
            # answerText = str(random.choice(numbers))
            # numbers2 = [0, 1]
            # mark = str(random.choice(numbers2))

            sentences = [
                "This is the first sentence.",
                "Here is another sentence.",
                "A third sentence for demonstration.",
                "One more sentence to choose from.",
                "The final sentence in the array."
            ]

            aireply = random.choice(sentences)
            numbers3 = [1, 2, 3]
            streamNumber = random.choice(numbers3)
            return answerText, mark, aireply, streamNumber

        pass

    #! stream mcqs
    else:
        if nameOftheTest == "StreamOne":

            if levelofmcq == "q1":
                # * say mcq number

                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

            elif levelofmcq == "q2":

                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

            elif levelofmcq == "q3":
                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

            elif levelofmcq == "q4":
                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

        elif nameOftheTest == "StreamTwo":

            if levelofmcq == "q1":
                # * say mcq number

                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

            elif levelofmcq == "q2":

                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

            elif levelofmcq == "q3":
                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

            elif levelofmcq == "q4":
                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

        elif nameOftheTest == "StreamThree":

            if levelofmcq == "q1":
                # * say mcq number

                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)

                print('mcqanswe q1 inne retern eka ans text eka ---  - ', answerText)
                print('mcqanswe q1 inne retern eka marks eka ---  - ', mark)

                return answerText, mark, aireply, streamNumber

            elif levelofmcq == "q2":

                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

            elif levelofmcq == "q3":
                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber

            elif levelofmcq == "q4":
                mcqanswe = predict_audio(audiofilepath)

                answerText = '0'
                mark = '0'

                if mcqanswe == 'ansA':
                    answerText = '1'
                    if rightAnswer == '1':
                        mark = '1'

                if mcqanswe == 'ansB':
                    answerText = '2'
                    if rightAnswer == '2':
                        mark = '1'

                if mcqanswe == 'ansC':
                    answerText = '3'
                    if rightAnswer == '3':
                        mark = '1'

                if mcqanswe == 'ansD':
                    answerText = '4'
                    if rightAnswer == '4':
                        mark = '1'

                if mcqanswe == 'ansNOICE':
                    answerText = '0'
                    mark = '0'

                ############################################

                # * say mcq number
                # numbers = [1, 2, 3, 4]
                # answerText = str(random.choice(numbers))
                # numbers2 = [0, 1]
                # mark = str(random.choice(numbers2))

                sentences = [
                    "This is the first sentence.",
                    "Here is another sentence.",
                    "A third sentence for demonstration.",
                    "One more sentence to choose from.",
                    "The final sentence in the array."
                ]

                aireply = random.choice(sentences)
                numbers3 = [1, 2, 3]
                streamNumber = random.choice(numbers3)
                return answerText, mark, aireply, streamNumber


# * Answer By Speech GenralMCQ

@app.route('/answer_by_speech', methods=['POST'])
@cross_origin()
def answer_by_speech():

    name = request.form['name']
    id = request.form['id']

    nameOftheTest = request.form['nameOftheTest']
    levelofmcq = request.form['levelofmcq']
    qindex_temp = request.form['qindex_temp']
    rightanswer = request.form['r']
    userspeachtotext = request.form['userspeachtotext']
    uservoice = request.files['uservoice']

    # print("Test data -> ", name , id , qindex_temp , userspeachtotext , rightanswer , nameOftheTest ,levelofmcq )

    try:

        temp_folder_name = name
        # temp_folder_path = os.path.join(
        #     storage_users_audio_files_data_path, temp_folder_name)

        # if os.path.exists(temp_folder_path):
        #     # print("The folder exist")

        #     temp_audio_name = str(id)+"_"+str(name)+"_voice.wav"

        #     path_audio = f'{temp_folder_path}/{id}_{name}_voice.wav'

        temp_audio_name = str(id)+"_"+str(name)+"_voice.wav"

        path_audio = os.path.join(
            storage_users_audio_files_data_path, temp_audio_name)

        parth = "StorageData/AudiofilesDB/"+str(temp_audio_name)

        print("path audio 1 ", path_audio)
        print("path audio 2 ", parth)

        # f'{temp_folder_path}/{id}_{name}_voice.wav'

        uservoice.save(path_audio)

        # return jsonify(
        #         status=400,
        #         message="Audio path error"
        #     ), 400

        if os.path.exists(path_audio):

            answerProceesed, mark, aireply, streamNumber = process_speech_ai_ques(
                nameOftheTest, levelofmcq, rightanswer, parth, userspeachtotext)

            return jsonify(
                status=200,
                message="success",
                answerProceesed=answerProceesed,
                mark=mark,
                aireply=aireply,
                streamNumber=streamNumber,
                qindex=qindex_temp
            ), 200

        else:
            print("The folder does not exist")
            return jsonify(
                status=400,
                message="Audio path error"
            ), 400

        pass
        # else:
        #     print("The folder does not exist")
        #     return jsonify(
        #             status=404,
        #             message="Audio Error"
        #         ), 404

    except Exception as e:
        print('Error uploading audio:', e)
        return jsonify(
            status=400,
            message="Error"
        ), 500

#!NEW =======================================


def update_blind(qindex_temp, name, id, isblind):

    users_data = []

    user_file = os.path.join(storage_users_path, users_db_file)

    # Check if the file is currently locked
    if user_file in file_locks:
        # Wait until the lock is released
        while file_locks[user_file]:
            time.sleep(1)

    # Lock the file and assign it to the current user
    file_locks[user_file] = threading.current_thread().ident

    try:
        with open(user_file, "r") as infile:
            users_data = json.load(infile)

        # Release the lock when finished
        file_locks[user_file] = None

    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available
        # Release the lock when finished
        file_locks[user_file] = None
        print('file handle error login user')
        return jsonify(
            status=400,
            message="users file error"
        ), 400

    if (not users_data):
        return jsonify(
            status=400,
            message="No User data found"
        ), 400

    for i in range(len(users_data)):

        userId = users_data[i]['id']
        nameChecker = users_data[i]['name']

        if (nameChecker == name):
            if (userId == id):
                users_data[i]["blind"] = isblind

            # Lock the file and assign it to the current user
            file_locks[user_file] = threading.current_thread().ident

            try:
                with open(user_file, "w") as outfile:
                    json.dump(users_data, outfile, indent=2)

                # Release the lock when finished
                file_locks[user_file] = None

            except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available
                # Release the lock when finished
                file_locks[user_file] = None
                print('file handle error login user')

    pass

#!  Gagan process the speech and reply 2


def process_speech_ai_interviewone(nameOftheTest, levelofmcq, rightAnswer, audiofilepath, qindex_temp, name, id):

    print("q index", qindex_temp, name, id)

    #! Do processing

    #! ai interviews
    if levelofmcq == "":

        if nameOftheTest == "AIOneQuection":
            # * converstaion text
            sentences = [
                "This is the first sentence.",
                "Here is another sentence.",
                "A third sentence for demonstration.",
                "One more sentence to choose from.",
                "The final sentence in the array."
            ]

            answerText = 'gagan'  # random.choice(sentences) # ai meka ask
            # mark = str(random.choice([0, 1]))
            path_audio_local = 'StorageData/AudiofilesDB/' + \
                str(name)+'/'+str(id)+'_'+str(name)+'_voice.wav'
            text = audio_to_text(path_audio_local)
            print(text)
            # ans, detels = fb_pb_blind_bot_q.request(text)  #use modle ai
            # aireply = text # for testin hear things pring without send to bot
            # print("====================== blind detels - ",detels)
            # streamNumber = random.choice([1, 2 , 3])
            isNextQ = False

            # modle , its #############################################

            bot_reply, detels = interviewer.request(text)

            print('bot_reply  ---- ', bot_reply, 'detels   - ', detels)

            mark = '0'
            streamNumber = 1
            aireply = ''

            if int(qindex_temp) != 0:
                try:

                    stream = detels[0].split("_")[0]

                    print('try acsept - stream', stream,
                          '     detels - ', detels)

                    if stream == 'bs':
                        streamNumber = 2
                        mark = '1'
                        aireply = 'look likes you like business ok we move to next question'

                    if stream == 'it':
                        streamNumber = 3
                        mark = '1'
                        aireply = 'look likes you like programming ok we move to next question'

                    if stream == 'cs':
                        streamNumber = 1
                        mark = '1'
                        aireply = 'look likes you like ethical hacking ok things we move to next question'

                except:
                    print('except no match .......')
                    pass

                isNextQ = True

            ##########################################################
            #!===
            print('qindex_temp --- ', qindex_temp)
            if int(qindex_temp) == 0:

                # ['fully_blind', '0.50929743']

                blind_status_ans, detels = fb_pb_blind_bot_q.request(text)
                blid_status, blind_accu = detels

                print('blid_status - ', detels)

                if (float(blind_accu) > 0.7):

                    if blid_status == 'fully_blind':
                        print('yes t--------------------------------')
                        isblind = 1  # ! update this
                        update_blind(qindex_temp, name, id, isblind)
                        print('fully blind acsept')
                        isNextQ = True
                        aireply = blind_status_ans + " ok now we start this interview"

                    if blid_status == 'partially blind':
                        print('yes t--------------------------------')
                        isblind = 0  # ! update this
                        update_blind(qindex_temp, name, id, isblind)
                        print('pacially blind acsept')
                        isNextQ = True
                        aireply = blind_status_ans + " ok now we start this interview"

            return answerText, mark, aireply, streamNumber, isNextQ

        pass

# * Answer By Speech GenralMCQ 2


@app.route('/answer_by_speech_aiinterview', methods=['POST'])
@cross_origin()
def answer_by_speech_aiinterview():

    name = request.form['name']
    id = request.form['id']

    nameOftheTest = request.form['nameOftheTest']
    levelofmcq = request.form['levelofmcq']
    qindex_temp = request.form['qindex_temp']
    rightanswer = request.form['r']

    uservoice = request.files['uservoice']

    try:

        temp_folder_name = name
        temp_folder_path = os.path.join(
            storage_users_audio_files_data_path, temp_folder_name)

        if os.path.exists(temp_folder_path):
            # print("The folder exist")

            path_audio = f'{temp_folder_path}/{id}_{name}_voice.wav'

            uservoice.save(path_audio)

            if os.path.exists(path_audio):

                answerProceesed, mark, aireply, streamNumber, isNextQ = process_speech_ai_interviewone(
                    nameOftheTest, levelofmcq, rightanswer, path_audio, qindex_temp, name, id)

                return jsonify(
                    status=200,
                    message="success",
                    answerProceesed=answerProceesed,
                    mark=mark,
                    aireply=aireply,
                    streamNumber=streamNumber,
                    qindex=qindex_temp,
                    isNextQ=isNextQ
                ), 200

            else:
                print("The folder does not exist")
                return jsonify(
                    status=400,
                    message="Audio path error"
                ), 400

            pass
        else:
            print("The folder does not exist")
            return jsonify(
                status=404,
                message="Audio Error"
            ), 404

    except Exception as e:
        print('Error uploading audio:', e)
        return jsonify(
            status=400,
            message="Error"
        ), 500


#!=======================================

def generate_random_price(min_price, max_price):
    return round(random.uniform(min_price, max_price), 2)

#! Gagan Function to  process image


def do_face_id(constr_image):

    # Convert to NumPy array with RGB channels
    # np.array(image.convert("RGB")) #! numpy result should be here
    image_array = constr_image

    time.sleep(1)  # Simulate a long-running task

    return image_array

# *Chech for duplicate


# * face id user


@app.route('/auth_face', methods=['POST'])
@cross_origin()
def auth_face():

    # * Users read
    users_data = []

    user_file = os.path.join(storage_users_path, users_db_file)

    # Check if the file is currently locked
    if user_file in file_locks:
        # Wait until the lock is released
        while file_locks[user_file]:
            time.sleep(1)

    # Lock the file and assign it to the current user
    file_locks[user_file] = threading.current_thread().ident

    try:
        with open(user_file, "r") as infile:
            users_data = json.load(infile)

        # Release the lock when finished
        file_locks[user_file] = None

    except EnvironmentError:  # parent of IOError, OSError *and* WindowsError where available
        # Release the lock when finished
        file_locks[user_file] = None
        print('file handle error login user')
        return jsonify(
            status=400,
            message="users file error"
        ), 400

    if (not users_data):
        return jsonify(
            status=400,
            message="No User data found"
        ), 400

    else:
        #! do comparison
        request_data = request.get_json()

        ask_name = request_data["name"]
        ask_id = request_data["id"]
        ask_profile_pic = request_data["profile_pic"]

        for i in range(len(users_data)):
            userId = users_data[i]['id']
            username = users_data[i]['name']

            db_profile_pic_path = users_data[i]['profile_pic_path']

            if not os.path.exists(db_profile_pic_path):
                return jsonify(
                    status=400,
                    message="No refrence face id in databse"
                ), 400

            #!get db pic numpy array
            db_image = Image.open(db_profile_pic_path)

            # Convert the PIL image to a NumPy array
            db_image_array = np.array(db_image)

            #! get user input pic to array
            # process and save incoming profile pic
            frame_ = str(ask_profile_pic)
            data = frame_.replace('data:image/jpeg;base64,', '')
            data = data.replace(' ', '+')
            imgdata_binary = base64.b64decode(data)
            image = np.asarray(
                bytearray(imgdata_binary), dtype="uint8")
            input_image_array = cv2.imdecode(image, cv2.IMREAD_COLOR)

            if True:

                return jsonify(
                    status=200,
                    message="User Login Success",
                    userId=userId,
                    userName=username
                ), 200

            else:
                return jsonify(
                    status=401,
                    message="User Not found Login error"
                ), 401

        return jsonify(
            status=401,
            message="User Not Found"
        ), 401


if __name__ == '__main__':
    createStorages()
    createFiles()
    loadChatFiles()
    socketio.start_background_task(target=camera_thread)
    socketio.run(app, host='0.0.0.0', port=PORT, debug=True)

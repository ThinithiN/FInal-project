from text_base_command import GenericAssistant

learning_assistant = GenericAssistant('text_base_command_dataset.json', model_name="text_base_command_model")


# learning_assistant.load_model()

learning_assistant.train_model()
learning_assistant.save_model()

done = False

while not done:
    message = input("Enter a message: ")



    if message == "STOP":
        done = True
    else:
        ans, detels = learning_assistant.request(message)

        print(detels)
import openai
from dotenv import load_dotenv
import os
# Set your OpenAI API key
# Load environment variables from .env file
load_dotenv()

# Set your OpenAI API key from the environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

messages = [ {"role": "system", "content":"You are a intelligent assistant."} ]

def ask_from_gpt(user_msg):

    message = user_msg
    if message:
        messages.append({"role": "user", "content": message},)

        chat = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=messages)


    reply = chat.choices[0].message.content
    print(f"ChatGPT: {reply}")
    messages.append({"role": "assistant", "content": reply})

    return reply


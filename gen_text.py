import streamlit as st
import google.generativeai as genai
import os

api_key = os.getenv('API_KEY')
genai.configure(api_key=api_key)

generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

model = genai.GenerativeModel(
    model_name="gemini-1.0-pro", generation_config=generation_config,
)

# Streamlit app title
st.title("EduVerse HelpBot")

# Initialize conversation
convo = model.start_chat(history=[])

# Function to send message and get response
def send_message(message):
    convo.send_message(message)
    return convo.last.text

# Streamlit chat interface
user_input = st.text_input("Tell your doubt:", "")
if st.button("Send"):
    response = send_message(user_input)
    st.text_area("Bot:", value=response, height=200)

# Initial chat message
st.text_area("Eduverse Helpbot:", value="Hi! How can I help you today?", height=200)

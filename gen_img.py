import streamlit as st
from PIL import Image
from io import BytesIO
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('API_KEY')
genai.configure(api_key=api_key)

st.title('EduVerse Concept Explanation')

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption='Uploaded Image', use_column_width=True)

    if st.button('Explain this concept'):
        model = genai.GenerativeModel('gemini-pro-vision')
        response = model.generate_content(image)
        response.resolve()

        st.header('Generated Content')
        st.write(response.text)

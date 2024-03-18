import streamlit as st
import requests
import time
from dotenv import load_dotenv
import os

load_dotenv()

# Streamlit app title
st.title("3D Model Visualizer")

# Get user input for the API key
api_key = os.getenv('MESHY_KEY')

# Get user input for the conversion parameters
mode = st.selectbox("Mode", ["preview", "refine"])
prompt = st.text_input("Prompt", "a monster mask")
art_style = st.selectbox("Art Style", ["realistic", "cartoonish", "abstract"])
negative_prompt = st.text_input("Negative Prompt", "low quality, low resolution, low poly, ugly")

def convert_text_to_3d(api_key, mode, prompt, art_style, negative_prompt):
    url = "https://api.meshy.ai/v2/text-to-3d"
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {"mode": mode, "prompt": prompt, "art_style": art_style, "negative_prompt": negative_prompt}
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code in [200, 202]:
        result = response.json()
        task_id = result.get("result")
        st.write("Conversion request successful! Task ID:", task_id)
        return task_id
    else:
        st.error(f"Failed to convert text to 3D. Status code: {response.status_code}")
        return None

def refine_model(api_key, task_id):
    url = "https://api.meshy.ai/v2/text-to-3d"
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {"mode": "refine", "preview_task_id": task_id}
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code in [200, 202]:
        return True
    else:
        st.error(f"Failed to refine model. Status code: {response.status_code}")
        return False

if st.button("Convert Text to 3D"):
    task_id = convert_text_to_3d(api_key, mode, prompt, art_style, negative_prompt)
    if task_id:
        # refine_model(api_key, task_id)
        url_task = f"https://api.meshy.ai/v2/text-to-3d/{task_id}"
        while True:
            headers = {"Authorization": f"Bearer {api_key}"}
                
            response_task = requests.get(url_task, headers=headers)
            result_task = response_task.json()
            status = result_task.get("status")
            progress = result_task.get("progress")
            if status == "SUCCEEDED" and progress == 100:
                st.write("Conversion status:", status)
                glb_url = result_task["model_urls"]["glb"]
                st.markdown(f"[Download GLB file]({glb_url})")
                break
            elif status in ["PENDING", "IN_PROGRESS"]:
                st.write("Conversion in progress. Please wait...")
                st.write(f"Progress: {progress}%")
                time.sleep(5)
            else:
                st.error(f"Conversion failed. Status: {status}, Progress: {progress}")
                break

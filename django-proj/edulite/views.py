from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
from PIL import Image
from io import BytesIO
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
api_key = os.getenv('API_KEY')
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro-vision')

@csrf_exempt
def generative_ai_image_view(request):
    if request.method == 'GET':
        image_url = request.GET.get('image_url')
        response = requests.get(image_url)
        image = Image.open(BytesIO(response.content))
        genai_response = model.generate_content(image)
        genai_response.resolve()
        return JsonResponse({'result': genai_response.text})

@csrf_exempt
def generative_ai_text_view(request):
    if request.method == 'POST':
        text = request.POST.get('text')
        if text:
            genai_response = model.generate_content(text)
            genai_response.resolve()
            return JsonResponse({'result': genai_response.text})
        else:
            return JsonResponse({'error': 'Text content is empty'}, status=400)


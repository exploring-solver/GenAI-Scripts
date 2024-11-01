async function generateText() {
    const prompt = document.getElementById('textPrompt').value;
    const resultDiv = document.getElementById('textResult');
    
    try {
        const response = await fetch('/api/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        if (data.success) {
            resultDiv.innerHTML = data.data;
        } else {
            resultDiv.innerHTML = `Error: ${data.error}`;
        }
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
}

async function analyzeImage() {
    const imageFile = document.getElementById('imageInput').files[0];
    const prompt = document.getElementById('imagePrompt').value;
    const resultDiv = document.getElementById('imageResult');
    
    if (!imageFile) {
        resultDiv.innerHTML = 'Please select an image first';
        return;
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('prompt', prompt);
    
    try {
        const response = await fetch('/api/analyze-image', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.success) {
            resultDiv.innerHTML = data.data;
        } else {
            resultDiv.innerHTML = `Error: ${data.error}`;
        }
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
}

async function generateEmbedding() {
    const text = document.getElementById('embeddingText').value;
    const resultDiv = document.getElementById('embeddingResult');
    
    try {
        const response = await fetch('/api/generate-embedding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        if (data.success) {
            resultDiv.innerHTML = `Embedding generated and stored with ID: ${data.id}`;
        } else {
            resultDiv.innerHTML = `Error: ${data.error}`;
        }
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
}
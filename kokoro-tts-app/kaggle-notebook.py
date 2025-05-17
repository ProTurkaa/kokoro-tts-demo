# Kaggle Notebook Örneği
# Bu kodu Kaggle'da bir notebook olarak çalıştırmanız gerekecek

import torch
import numpy as np
import base64
import io
import json
from flask import Flask, request, jsonify
from pyngrok import ngrok
from scipy.io.wavfile import write as write_wav

# Kokoro TTS modelini yükleme
# NOT: Gerçek Kokoro TTS kurulumu ve kullanımı için ilgili kütüphaneyi import etmeniz gerekecek
# Bu sadece bir örnek şablondur

app = Flask(__name__)

@app.route('/generate-speech', methods=['POST'])
def generate_speech():
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Kokoro TTS ile ses oluşturma
        # Bu kısım gerçek Kokoro TTS implementasyonu ile değiştirilmelidir
        # Örnek:
        # audio = kokoro_tts_model.generate(text)
        
        # Örnek ses verisi oluşturma (gerçek implementasyonda değiştirilecek)
        sample_rate = 22050
        audio = np.random.uniform(-1, 1, size=(sample_rate * 5,))  # 5 saniyelik örnek ses
        
        # Ses verisini WAV formatına dönüştürme
        audio_bytes = io.BytesIO()
        write_wav(audio_bytes, sample_rate, audio.astype(np.float32))
        audio_bytes.seek(0)
        
        # Base64 kodlaması
        audio_base64 = base64.b64encode(audio_bytes.read()).decode('utf-8')
        
        # Data URL formatında döndürme
        audio_url = f"data:audio/wav;base64,{audio_base64}"
        
        return jsonify({'audioUrl': audio_url})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ngrok tüneli oluşturma
public_url = ngrok.connect(5000)
print(f"Public URL: {public_url}")

# Flask uygulamasını başlatma
app.run(port=5000)

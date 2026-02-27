import os
import sqlite3
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
# Permite que seu site na Vercel acesse a API
CORS(app)

# Na Vercel, o único lugar "escrevível" (temporário) é a pasta /tmp
# ATENÇÃO: Os dados sumirão se o servidor desligar. Para a apresentação, funciona!
BASE_DIR = "/tmp"
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
DB_PATH = os.path.join(BASE_DIR, 'tercefy.db')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS memorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            legenda TEXT,
            imagem_url TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Inicializa o banco toda vez que a função "acorda"
init_db()

@app.route('/api/memorias', methods=['GET'])
def get_memorias():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM memorias ORDER BY id ASC')
        rows = cursor.fetchall()
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route('/api/memorias', methods=['POST'])
def add_memoria():
    conn = None
    try:
        if 'foto' not in request.files:
            return jsonify({"erro": "Nenhuma foto enviada"}), 400
        
        file = request.files['foto']
        filename = secure_filename(file.filename)
        filename = f"{int(time.time())}_{filename}"
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # AJUSTE: O link agora é relativo à URL do site atual
        img_url = f"/api/uploads/{filename}"
        
        conn = get_db_connection()
        conn.execute('INSERT INTO memorias (legenda, imagem_url) VALUES (?, ?)', 
                    ("Memória Tercefy", img_url))
        conn.commit()
        return jsonify({"status": "sucesso", "url": img_url}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route('/api/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Necessário para a Vercel reconhecer o app
app.debug = False
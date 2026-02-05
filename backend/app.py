import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
DB_PATH = os.path.join(BASE_DIR, 'tercefy.db')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Inicializa o banco sem travas
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
        # Adiciona um timestamp no nome para evitar arquivos duplicados
        import time
        filename = f"{int(time.time())}_{filename}"
        
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        img_url = f"http://localhost:5000/uploads/{filename}"
        
        conn = get_db_connection()
        conn.execute('INSERT INTO memorias (legenda, imagem_url) VALUES (?, ?)', 
                    ("Memória Tercefy", img_url))
        conn.commit()
        return jsonify({"status": "sucesso"}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        if conn: conn.close() # ESSENCIAL: Libera o banco para a próxima foto

@app.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
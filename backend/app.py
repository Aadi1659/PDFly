from flask import Flask, request, jsonify, send_from_directory
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pdfplumber
import pytesseract
from PIL import Image
import os
import tempfile
from openai import OpenAI
from flask_cors import CORS
import uuid

if os.environ.get('RENDER'):
    pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'
else:
    pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'

# Initialize Flask application
app = Flask(__name__)
#CORS(app)  # Enable CORS for cross-origin requests

# Application configuration
app.config.update({
    'MAX_CONTENT_LENGTH': 10 * 1024 * 1024,  # 10MB file size limit
    'ALLOWED_EXTENSIONS': {'pdf'},
    'TEMP_UPLOAD_FOLDER': tempfile.gettempdir()
})

# Frontend configuration
frontend_folder = os.path.join(os.getcwd(), "..", "frontend")
dist_folder = os.path.join(frontend_folder, "dist")

# LLM configuration
SUMMARIZATION_PROMPT = """Analyze this PDF document and provide a structured summary including:
1. Key themes and topics
2. Important names, dates, and figures
3. Document purpose and intended audience
4. Notable tables/figures and their significance
5. Any recommendations or conclusions

Document content: {text}

Format your response using markdown headings and bullet points."""

def allowed_file(filename):
    """Check if the file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_text_with_ocr(page):
    """Extract text from scanned PDF page using OCR"""
    try:
        # Convert PDF page to image with high resolution
        img = page.to_image(resolution=300)
        
        # Enhance image for better OCR results
        img = img.original.convert('L')  # Convert to grayscale
        img = img.point(lambda x: 0 if x < 128 else 255)  # Increase contrast
        return pytesseract.image_to_string(img)
    except Exception as e:
        raise RuntimeError(f"OCR failed: {str(e)}")
    
def process_pdf(pdf_path):
    """
    Process PDF file to extract text, tables, and metadata
    Returns: dict containing extracted data
    """
    result = {
        'metadata': {},
        'text': '',
        'page_count': 0
    }

    try:
        with pdfplumber.open(pdf_path) as pdf:
            result['page_count'] = len(pdf.pages)
            result['metadata'] = pdf.metadata

            
            for page_num, page in enumerate(pdf.pages):
                
                page_text = page.extract_text(x_tolerance=1, y_tolerance=1)
                if not page_text.strip():
                    page_text = extract_text_with_ocr(page)
                
                result['text'] += f"\n--- Page {page_num+1} ---\n{page_text}\n"

    except Exception as e:
        raise RuntimeError(f"PDF processing failed: {str(e)}")

    return result

@app.route("/", defaults={"filename": ""})
@app.route("/<path:filename>")
def serve_frontend(filename):
    """Serve static frontend files from dist directory"""
    if not filename:
        filename = "index.html"
    return send_from_directory(dist_folder, filename)

@app.route("/api/process-pdf", methods=["POST"])
def process_pdf_endpoint():
    """Main PDF processing endpoint"""
    temp_path = None
    try:
        if 'pdf_file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
            
        pdf_file = request.files['pdf_file']
        if not pdf_file or pdf_file.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        if not allowed_file(pdf_file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        # Create unique temp file name
        temp_path = os.path.join(app.config['TEMP_UPLOAD_FOLDER'], f"upload_{uuid.uuid4().hex}.pdf")
        pdf_file.save(temp_path)

        # Process PDF
        pdf_data = process_pdf(temp_path)
        
        # Generate summary using LLM
        summary = ""
        api_key = request.form.get("api_key")

        if not api_key:
            summary = "To get an AI-generated summary, please provide an API key."
        else:
            try:
                client = OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=api_key,
                )
                response = client.chat.completions.create(
                    model="google/learnlm-1.5-pro-experimental:free",
                    messages=[{
                        "role": "user",
                        "content": SUMMARIZATION_PROMPT.format(text=pdf_data['text'])
                    }],
                    
                )
                
                if response:
                    summary = response.choices[0].message.content
                else:
                    summary = "Received empty response from API"
                    
            except Exception as e:
                if "401" in str(e):
                    summary = "Invalid API key provided. Please check your API key and try again."
                else:
                    summary = f"Summary generation failed: {str(e)}"
                app.logger.error(f"LLM Error: {str(e)}")

        return jsonify({
            "metadata": pdf_data['metadata'],
            "page_count": pdf_data['page_count'],
            "text": pdf_data['text'],
            "summary": summary,
            "word_count": len(pdf_data['text'].split())
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # temp file cleanup
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        

if __name__ == "__main__":
    app.run(debug=True)

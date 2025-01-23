# 📄 PDFly: Your Intelligent PDF Processing Solution

**PDFly** is a modern web application that transforms PDF documents into actionable insights. Combining robust text extraction with AI-powered analysis, it handles both digital and scanned PDFs through:

- **Optical Character Recognition (OCR)** for image-based documents  
- **LLM-Powered Summarization** via OpenRouter's model ecosystem  
- **Metadata & Structure Preservation** during processing  

![Xnip2025-01-23_22-41-41](https://github.com/user-attachments/assets/7b5abc2e-1862-430d-9640-dbefe92d4106)


### Demo Video


https://github.com/user-attachments/assets/1fcc71a9-4571-4abc-b5ed-e1a6706fd359



### ✨ Key Features

<ul>
  <li><strong>Universal PDF Processing</strong> - Extract text from both digital and scanned PDF documents</li>
  <li><strong>AI-Powered Insights</strong> - Generate structured summaries using cutting-edge LLMs via OpenRouter API</li>
  <li><strong>Smart OCR Integration</strong> - Automatic text recognition for image-based PDFs using Tesseract</li>
  <li><strong>Metadata Extraction</strong> - Retrieve document author, creation date, and other key metadata</li>
  <li><strong>Cross-Platform Ready</strong> - Optimized for macOS, Windows, and Linux deployments</li>
  <li><strong>Secure Processing</strong> - Temporary file handling and automatic cleanup after processing</li>
  <li><strong>Rate Limited API</strong> - Built-in protection against abuse with Flask-Limiter</li>
  <li><strong>Modern UI Support</strong> - Pre-configured to serve Vue/React frontends from /dist directory</li>
  <li><strong>Production-Ready</strong> - Dockerized configuration with proper dependency management</li>
  <li><strong>Hybrid Extraction</strong> - Combines native PDF parsing with OCR fallback for maximum compatibility</li>
</ul>

### How to Run?

Make sure you have npm installed and have an OpenRouter API key.

Steps: <br>
Download the source code <br>
```
cd frontend
npm install
npm run build
cd ..
cd backend
pip install -r requirements.txt
python app.py 
```
Note: Use a virtual env in backend folder and install all packages in the requirements.txt folder


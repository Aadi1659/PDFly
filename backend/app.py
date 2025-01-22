from flask import Flask, request, jsonify, send_from_directory
import PyPDF2
import os
from openai import OpenAI 
from flask_cors import CORS

app = Flask(__name__)
#Uncomment this while running locally
#CORS(app)

frontend_folder = os.path.join(os.getcwd(),"..","frontend")
dist_folder = os.path.join(frontend_folder,"dist")

# Server static files from the "dist" folder under the "frontend" directory
@app.route("/",defaults={"filename":""})
@app.route("/<path:filename>")
def index(filename):
  if not filename:
    filename = "index.html"
  return send_from_directory(dist_folder,filename)


@app.route("/upload", methods=["POST"])
def extract_text():
    pdf_file = request.files.get("pdf_file")
    api_key = request.form.get("api_key")

    if pdf_file:
        # Extract text from the PDF
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        extracted_text = ""
        summarised_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text()

        # Optionally process extracted text using an LLM (if API key is provided)
        if api_key:
            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key,
            )
            completion = client.chat.completions.create(
            model="google/gemini-2.0-flash-exp:free",
            messages=[
                {
                "role": "user",
                "content": [
                    {
                    "type": "text",
                    "text": "Whats in this PDF?" + extracted_text
                    },
                ]
                }
            ]
            )
            summarised_text = completion.choices[0].message.content

        return jsonify({"extracted_text": extracted_text, "summarised_text": summarised_text})

    return jsonify({"error": "No file uploaded"}), 400

if __name__ == "__main__":
    app.run(debug=True)

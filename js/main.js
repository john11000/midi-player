const url = new URL(window.location.href);
const params = url.searchParams;
const token = params.get('token');
const file = params.get('file');
const url_api =  'http://localhost:5000/admin/transcript'
async function sendRequest(textEditor) {
    const urlApiSave = `${url_api}/save`;
    const body = JSON.stringify({
        token,
        text: textEditor,
    })
    const responseApi = await fetch(urlApiSave, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body,
    })
    const data = await responseApi.json();
    swal("", data.data, data.isError ? "error" : "success");
}

async function editFileSendRequest(textEditor) {
    const urlApiEdit = `${url_api}/edit`;
    const body = JSON.stringify({
        file,
        text: textEditor,
    })
    const responseApi = await fetch(urlApiEdit, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body,
    })
    const data = await responseApi.json();
    swal("", data.data, data.isError ? "error" : "success");
}

async function getFileToEdit() {
    if (file) {
        const urlApiGetById = `${url_api}/list/${file}`;
        const responseApi = await fetch(urlApiGetById);
        const data = await responseApi.json();
        return data.data[0];
    }
}
async function initLogic() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'es-ES';
  
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');
        const continueButton = document.getElementById('continueButton');
        const editButton = document.getElementById('editButton');
        const clearButton = document.getElementById('clearButton');
        const downloadTextButton = document.getElementById('downloadTextButton');
        const downloadPdfButton = document.getElementById('downloadPdfButton');
        const saveButton = document.getElementById('saveButton');

        const editor = new Quill('#editor', {
          theme: 'snow',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['image', 'link'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              ['clean']
            ]
          }
        });
        editor.textContent = 'El';
        let recognitionIsRunning = false;
  
        const startRecognition = () => {
          recognition.start();
          recognitionIsRunning = true;
          startButton.disabled = true;
          stopButton.disabled = false;
          continueButton.disabled = true;
          editButton.disabled = true;
          clearButton.disabled = true;
          downloadTextButton.disabled = true;
          downloadPdfButton.disabled = true;
        };
  
        const stopRecognition = () => {
          recognition.stop();
          recognitionIsRunning = false;
          startButton.disabled = false;
          stopButton.disabled = true;
          continueButton.disabled = false;
          editButton.disabled = false;
          clearButton.disabled = false;
          downloadTextButton.disabled = false;
          downloadPdfButton.disabled = false;
        };
  
        const continueRecognition = () => {
          if (!recognitionIsRunning) {
            startRecognition();
          }
        };
  
        startButton.addEventListener('click', startRecognition);
        startButton.addEventListener('keydown', (e) => { if (e.key === 'Enter') startRecognition(); });
  
        stopButton.addEventListener('click', stopRecognition);
        stopButton.addEventListener('keydown', (e) => { if (e.key === 'Enter') stopRecognition(); });
  
        continueButton.addEventListener('click', continueRecognition);
        continueButton.addEventListener('keydown', (e) => { if (e.key === 'Enter') continueRecognition(); });
  
        editButton.addEventListener('click', () => {
          // Habilita/deshabilita la edición Quill
          editor.enable();
          editor.focus();
        });
  
        clearButton.addEventListener('click', () => {
          // Limpia el contenido de Quill
          editor.deleteText(0, editor.getLength());
          clearButton.disabled = true;
        });
  
        downloadTextButton.addEventListener('click', () => {
          const textContent = editor.getText();
          downloadFile('transcripcion.txt', textContent);
        });
  
        downloadPdfButton.addEventListener('click', () => {
          // Convierte el contenido de Quill a una imagen y descarga como PDF
          const quillContent = document.querySelector('.ql-editor');
          html2canvas(quillContent).then((canvas) => {
            const pdfContent = canvas.toDataURL('image/png');
            downloadFile('transcripcion.pdf', pdfContent);
          });
        });
  
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          // Agrega el texto al editor Quill
          editor.clipboard.dangerouslyPasteHTML(editor.getLength(), `<p>${transcript}</p>`);
          clearButton.disabled = false;
        };
  
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };
  
        recognition.onend = () => {
          recognitionIsRunning = false;
          continueButton.disabled = false;
          editButton.disabled = false;
          clearButton.disabled = false;
          downloadTextButton.disabled = false;
          downloadPdfButton.disabled = false;
        };
  
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            stopRecognition();
          }
        });
  
        function downloadFile(fileName, content) {
          const blob = new Blob([content], { type: 'text/plain' });
          saveAs(blob, fileName);
        }
  
        saveButton.addEventListener('click', () => {
          const textEditor = editor.getText().toString();
          if (textEditor.length > 3) {
            file ? editFileSendRequest(textEditor) : sendRequest(textEditor)
          } else {
            alert("No hay nada que guardar, el editor no puede estar vacio.")
          }
        })
        if (file) {
            const fileContent = await getFileToEdit();
            editor.setText(fileContent.text);
        }
      } else {
        alert('Speech recognition is not supported in your browser. Please use a modern browser like Chrome or Firefox.');
      }
}
function main() {
    if (!token) {
        alert("No token found");
        return;
    }
    initLogic();
}
main();
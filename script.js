/* ---------------------------------------
   CodeLab Pro v5 - Full Script
---------------------------------------- */

let editor;
let currentFile = null;
let files = JSON.parse(localStorage.getItem("files") || "{}");
let languages = [
  { name: "javascript", icon: "devicon-javascript-plain" },
  { name: "python", icon: "devicon-python-plain" },
  { name: "java", icon: "devicon-java-plain" },
  { name: "c", icon: "devicon-c-plain" },
  { name: "cpp", icon: "devicon-cplusplus-plain" },
  { name: "csharp", icon: "devicon-csharp-plain" },
  { name: "ruby", icon: "devicon-ruby-plain" },
  { name: "php", icon: "devicon-php-plain" },
  { name: "go", icon: "devicon-go-plain" },
  { name: "swift", icon: "devicon-swift-plain" },
  { name: "kotlin", icon: "devicon-kotlin-plain" },
  { name: "typescript", icon: "devicon-typescript-plain" },
  { name: "html", icon: "devicon-html5-plain" },
  { name: "css", icon: "devicon-css3-plain" },
  { name: "sql", icon: "devicon-mysql-plain" },
  { name: "bash", icon: "devicon-bash-plain" },
  { name: "rust", icon: "devicon-rust-plain" },
  { name: "dart", icon: "devicon-dart-plain" },
  { name: "r", icon: "devicon-r-plain" },
  { name: "lua", icon: "devicon-lua-plain" },
  { name: "json", icon: "bx bx-code" },
  { name: "xml", icon: "bx bx-code" },
  { name: "yaml", icon: "bx bx-code" },
  { name: "perl", icon: "devicon-perl-plain" },
  { name: "scala", icon: "devicon-scala-plain" },
  { name: "haskell", icon: "devicon-haskell-plain" },
  { name: "elixir", icon: "devicon-elixir-plain" },
  { name: "erlang", icon: "devicon-erlang-plain" },
  { name: "fortran", icon: "bx bx-code" },
  { name: "matlab", icon: "devicon-matlab-plain" },
  { name: "groovy", icon: "bx bx-code" },
  { name: "clojure", icon: "bx bx-code" },
  { name: "fsharp", icon: "bx bx-code" },
  { name: "objectivec", icon: "bx bx-code" },
  { name: "powershell", icon: "bx bx-code" },
  { name: "shell", icon: "bx bx-code" },
  { name: "vb", icon: "bx bx-code" },
  { name: "assembly", icon: "bx bx-code" },
  { name: "coffeescript", icon: "bx bx-code" },
  { name: "elm", icon: "bx bx-code" },
  { name: "nim", icon: "bx bx-code" },
  { name: "julia", icon: "bx bx-code" },
  { name: "solidity", icon: "bx bx-code" },
  { name: "graphql", icon: "bx bx-code" },
  { name: "protobuf", icon: "bx bx-code" },
  { name: "haxe", icon: "bx bx-code" },
  { name: "verilog", icon: "bx bx-code" },
  { name: "vhdl", icon: "bx bx-code" },
  { name: "plaintext", icon: "bx bx-code" }
];

// --------------------
// Initialize Monaco Editor
// --------------------
require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" } });
require(["vs/editor/editor.main"], function() {
      editor = monaco.editor.create(document.getElementById("editorContainer"), {
        value: "",
        language: "plaintext",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
        quickSuggestions: true,
        parameterHints: { enabled: true },
        suggestOnTriggerCharacters: true
      });
      
      editor.onDidChangeCursorPosition(updateStatusBar);
      editor.onDidChangeModelContent(() => {
            saveCurrentFile();
            clearTimeout(autoPreviewTimeout);
            autoPreviewTimeout = setTimeout(() => {
                  if(document.getElementById("previewPhone").classList.contains("active")){
        runProject();
      }
    }, 300); // debounce for auto-preview
  });

  loadFileTree();
  populateLanguageSelect();
  updateStatusBar();
  adjustEditorFont();
});

let autoPreviewTimeout;

// --------------------
// File System Functions
// --------------------
document.getElementById("newFolder").onclick = () => {
  const name = prompt("Folder name:");
  if (!name) return;
  files[name] = { type: "folder", children: {} };
  saveFiles(); loadFileTree();
};

document.getElementById("newFile").onclick = () => {
  const name = prompt("File name (with extension):");
  if (!name) return;
  files[name] = { type: "file", content: "" };
  saveFiles(); loadFileTree();
};

document.getElementById("renameItem").onclick = () => {
  const name = prompt("Current name:");
  const newName = prompt("New name:");
  if (files[name]) { files[newName] = files[name]; delete files[name]; saveFiles(); loadFileTree(); }
};

document.getElementById("deleteItem").onclick = () => {
  const name = prompt("Delete file/folder name:");
  if (files[name]) { delete files[name]; saveFiles(); loadFileTree(); }
};

// --------------------
// Import files from local computer
// --------------------
document.getElementById("importBtn").onclick = () => {
  document.getElementById("importInput").click();
};

document.getElementById("importInput").addEventListener("change", (event) => {
  const filesList = event.target.files;
  Array.from(filesList).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      files[file.name] = { type: "file", content: e.target.result };
      saveFiles();
      loadFileTree();
    };
    reader.readAsText(file);
  });
});

// --------------------
// Load File Tree
// --------------------
function loadFileTree() {
  const tree = document.getElementById("fileTree");
  tree.innerHTML = "";
  for (const name in files) {
    const item = document.createElement("div");
    item.className = "tree-item";
    item.textContent = name;
    item.onclick = () => openFile(name);
    tree.appendChild(item);
  }
}

// --------------------
// File Operations
// --------------------
function openFile(name) {
  const file = files[name]; if (!file) return;
  currentFile = name;
  editor.setValue(file.content || "");
  const lang = detectLanguage(name);
  monaco.editor.setModelLanguage(editor.getModel(), lang);
  updateLanguageLabel(lang);
  document.getElementById("statusFile").textContent = name;
  document.getElementById("statusLanguage").textContent = lang;
}

function saveCurrentFile() { 
  if (currentFile && files[currentFile]) { 
    files[currentFile].content = editor.getValue(); 
    saveFiles(); 
  } 
}
function saveFiles() { localStorage.setItem("files", JSON.stringify(files)); }

function detectLanguage(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const map = {
    js:"javascript", py:"python", java:"java", c:"c", cpp:"cpp", cs:"csharp",
    rb:"ruby", php:"php", go:"go", swift:"swift", kt:"kotlin", ts:"typescript",
    html:"html", css:"css", sql:"sql", sh:"bash", rs:"rust", dart:"dart", r:"r", lua:"lua",
    json:"json", xml:"xml", yaml:"yaml", pl:"perl", scala:"scala", hs:"haskell",
    ex:"elixir", erl:"erlang", f90:"fortran", m:"matlab", groovy:"groovy", clj:"clojure",
    fs:"fsharp", objc:"objectivec", ps1:"powershell", vb:"vb", asm:"assembly",
    coffee:"coffeescript", elm:"elm", nim:"nim", jl:"julia", sol:"solidity", gql:"graphql",
    proto:"protobuf", hx:"haxe", v:"verilog", vhdl:"vhdl"
  };
  return map[ext] || "plaintext";
}

// --------------------
// Language Selector + Icon
// --------------------
function populateLanguageSelect() {
  const sel = document.getElementById("languageSelect");
  languages.forEach(lang => {
    const option = document.createElement("option");
    option.value = lang.name;
    option.textContent = lang.name;
    sel.appendChild(option);
  });
  sel.onchange = () => {
    const lang = sel.value;
    monaco.editor.setModelLanguage(editor.getModel(), lang);
    updateLanguageLabel(lang);
    document.getElementById("statusLanguage").textContent = lang;
  };
}

function updateLanguageLabel(langName){
  const lang = languages.find(l=>l.name===langName);
  const iconEl = document.getElementById("languageIcon");
  if(lang && lang.icon.includes("devicon")) { iconEl.className = `devicon ${lang.icon}`; } 
  else { iconEl.className = `bx bx-code`; }
  document.getElementById("languageName").textContent = langName;
}

// --------------------
// Run / Preview all files
// --------------------
const previewFrame = document.getElementById("previewFrame");
document.getElementById("previewBtn").onclick = () => {
  document.getElementById("previewPhone").classList.toggle("active");
};
document.getElementById("refreshPreview").onclick = () => runProject();
document.getElementById("runBtn").onclick = () => runProject();

function runProject(){
  let html="", css="", js="";
  for(const fname in files){
    const f = files[fname];
    if(f.type==="file"){
      const lang = detectLanguage(fname);
      if(lang==="html") html += f.content;
      if(lang==="css") css += `<style>${f.content}</style>`;
      if(lang==="javascript") js += `<script>${f.content}<\/script>`;
    }
  }
  previewFrame.srcdoc = `${html}${css}${js}`;
}

// --------------------
// Export Project
// --------------------
document.getElementById("exportBtn").onclick = () => {
  const zip = new JSZip();
  for (const name in files) if(files[name].type==="file") zip.file(name, files[name].content);
  zip.generateAsync({type:"blob"}).then(blob=>{ saveAs(blob,"CodeLabProject.zip"); });
};

// --------------------
// Status Bar
// --------------------
function updateStatusBar() {
  const pos = editor.getPosition();
  document.getElementById("statusPosition").textContent =
    `Ln ${pos.lineNumber}, Col ${pos.column}`;
}

// --------------------
// Virtual Keyboard
// --------------------
const keypad = document.getElementById("keypad");
document.getElementById("keyboardToggle").onclick = () => keypad.classList.toggle("active");

const keys = "1234567890-=\nqwertyuiop[]\\\nasdfghjkl;'`\nzxcvbnm,./".split("");
keys.forEach(ch => {
  if(ch==="\n"){ const br=document.createElement("div"); br.style.width="100%"; keypad.appendChild(br); }
  else {
    const key = document.createElement("div"); key.className="key"; key.textContent=ch;
    key.onclick=()=>insertAtCursor(ch); keypad.appendChild(key);
  }
});

["Space","Tab","Enter","Backspace"].forEach(label=>{
  const key=document.createElement("div");
  key.className="key wide"; key.textContent=label;
  key.onclick=()=>handleSpecialKey(label); keypad.appendChild(key);
});

function insertAtCursor(ch){
  editor.focus();
  const pos = editor.getPosition();
  editor.executeEdits("",[{range:new monaco.Range(pos.lineNumber,pos.column,pos.lineNumber,pos.column),text:ch}]);
}
function handleSpecialKey(key){
  const pos = editor.getPosition();
  switch(key){
    case "Space": insertAtCursor(" "); break;
    case "Tab": insertAtCursor("    "); break;
    case "Enter": insertAtCursor("\n"); break;
    case "Backspace":
      editor.executeEdits("",[{range:new monaco.Range(pos.lineNumber,Math.max(1,pos.column-1),pos.lineNumber,pos.column),text:""}]);
      break;
  }
}

// --------------------
// Disable system keyboard, force virtual keyboard
// --------------------
document.getElementById("editorContainer").addEventListener("focus", (e)=>{ e.preventDefault(); keypad.classList.add("active"); });

// --------------------
// Dynamic font resizing for keyboard opening
// --------------------
const baseFontSize = 16;
function adjustEditorFont() {
  const editorHeight = document.getElementById("editorContainer").clientHeight;
  const windowHeight = window.innerHeight;
  const ratio = editorHeight / windowHeight;
  const newSize = Math.max(10, Math.min(baseFontSize, baseFontSize * ratio * 1.2));
  editor.updateOptions({ fontSize: newSize });
}
window.addEventListener("resize", adjustEditorFont);
adjustEditorFont();

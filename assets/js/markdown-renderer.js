// init marked
marked.setOptions({
    highlight: function (code, lang) {
        if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
        } else {
            return code;
        }
    }
});

function decodeContent(base64Str) {
    const binaryString = atob(base64Str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder =  new TextDecoder('UTF-8');
    return decoder.decode(bytes);
}


Prism.plugins.autoloader.languages_path = "/js/prism/";
const markdownContent = document.getElementById("md-content");
if (markdownContent) {
    const markdownBody = document.createElement("div")
    markdownBody.classList.add("markdown-body")
    const content = decodeContent(markdownContent.innerHTML)
    markdownBody.innerHTML = marked.parse(content)
    document.getElementById("docBlock").append(markdownBody)
    markdownContent.remove()
}

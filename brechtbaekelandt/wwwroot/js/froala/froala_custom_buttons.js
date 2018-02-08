$.FroalaEditor.DefineIconTemplate("c#ButtonIconTemplate", "<span class='text-center'>C#</span>");
$.FroalaEditor.DefineIcon("c#ButtonIcon", { NAME: "C#", template: "c#ButtonIconTemplate" });
$.FroalaEditor.RegisterCommand("insertC#", {
    title: "Insert C# code",
    icon: "c#ButtonIcon",
    undo: true,
    focus: true,
    refreshAfterCallback: false,
    callback: function () {
        this.html.insert(" <pre class=\"prettyprint lang-cs\"></pre>");
    }
});

$.FroalaEditor.DefineIconTemplate("htmlButtonIconTemplate", "<span class='text-center'>html</span>");
$.FroalaEditor.DefineIcon("htmlButtonIcon", { NAME: "HTML", template: "htmlButtonIconTemplate" });
$.FroalaEditor.RegisterCommand("insertHtml", {
    title: "Insert html code",
    icon: "htmlButtonIcon",
    undo: true,
    focus: true,
    refreshAfterCallback: false,
    callback: function () {
        this.html.insert(" <pre class=\"prettyprint lang-html\"></pre>");
    }
});

$.FroalaEditor.DefineIconTemplate("javascriptButtonIconTemplate", "<span class='text-center'>js</span>");
$.FroalaEditor.DefineIcon("javascriptButtonIcon", { NAME: "JS", template: "javascriptButtonIconTemplate" });
$.FroalaEditor.RegisterCommand("insertJavascript", {
    title: "Insert javascript code",
    icon: "javascriptButtonIcon",
    undo: true,
    focus: true,
    refreshAfterCallback: false,
    callback: function () {
        this.html.insert(" <pre class=\"prettyprint lang-js\"></pre>");
    }
});

$.FroalaEditor.DefineIconTemplate("cssButtonIconTemplate", "<span class='text-center'>css</span>");
$.FroalaEditor.DefineIcon("cssButtonIcon", { NAME: "CSS", template: "cssButtonIconTemplate" });
$.FroalaEditor.RegisterCommand("insertCss", {
    title: "Insert css code",
    icon: "cssButtonIcon",
    undo: true,
    focus: true,
    refreshAfterCallback: false,
    callback: function () {
        this.html.insert(" <pre class=\"prettyprint lang-css\"></pre>");
    }
})

$.FroalaEditor.DefineIconTemplate("xmlButtonIconTemplate", "<span class='text-center'>xml</span>");
$.FroalaEditor.DefineIcon("xmlButtonIcon", { NAME: "XML", template: "xmlButtonIconTemplate" });
$.FroalaEditor.RegisterCommand("insertXml", {
    title: "Insert xml code",
    icon: "xmlButtonIcon",
    undo: true,
    focus: true,
    refreshAfterCallback: false,
    callback: function () {
        this.html.insert(" <pre class=\"prettyprint lang-xml\"></pre>");
    }
})
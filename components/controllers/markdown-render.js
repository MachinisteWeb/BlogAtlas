module.exports = function markdownRender(data, marked) {
	var renderer = new marked.Renderer();

	renderer.codespan = function (text) { 
		return '<samp>' + text + '</samp>';
	};

	data = marked(data, { renderer: renderer });

	return data;
};
const FS = require('fs');
const JSDOM = require('jsdom');
const PATH = require('path');
const USER = require('username');

var dir = process.argv[2] || '.';

function createJs(path, content) {
	var paths = stripPath(path);
	var jsPath = paths.path + PATH.sep + paths.js;
	FS.writeFileSync(jsPath, content);
}

function stripPath(path) {
	var aPath = path.split(PATH.sep);
	var name = aPath.splice(-1,1)[0];
	return {
		path: aPath.join(PATH.sep),
		js: name.split('.')[0] + ".js"
	};
}

function parseFile(path) {

	JSDOM.env(
		path,
		{
			done: function (err, window) {
				if (err) {console.log("Ups sorry.");}
				const document = window.document;
				(Array.from(document.querySelectorAll('script'))).forEach(
					(script) => {
					if (!script.getAttribute('src')) {
						var paths = stripPath(path);
						script.setAttribute('src', paths.js);
						createJs(path, script.textContent);
						script.textContent = '';
						FS.truncateSync(path, 0);
						FS.writeFileSync(path, document.documentElement.innerHTML);
						// console.log(FS.readFileSync(path, 'utf-8'));
						// process.exit();
					}
				});
			}
	});
};

function parseFolder(folder) {
	
	var entities = FS.readdirSync(folder);
	entities.forEach((entitie) => {
		var curPath = folder + PATH.sep + entitie;

		var stat = FS.statSync(curPath);
		// var permission = '0' + (stat.mode & parseInt('777', 8)).toString(8);
		// console.log(curPath);
		if (stat.isDirectory()) {
			parseFolder(curPath);
		} else if( curPath.substr(-5) === ".html") {
			parseFile(curPath);
		}
	});
}


parseFolder(dir);

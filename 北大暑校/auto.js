var NodeFn = (function () {

	var dirName = process.platform == "win32" ? __dirname.toString().split('\\').pop() : __dirname.toString().split('/').pop(),
		os = require('os'),
		fs = require('fs'),
		path = require('path'),
		https = require('https'),
		cp = require('child_process'),
		interfaces = os.networkInterfaces(),
		IPv4 = null,
		firmNo = 0,
		ih = 0,
		im = 0,
		ic = 0,
		ij = 0,
		ah = 0,
		ac = 0,
		ip = 0,
		es6 = 0,
		confirm = [{
				title: 'isDefault',
				description: '是否使用默认配置？（y/n）：',
				defaults: 'y'
			},
			{
				title: 'isMobile',
				description: '是否使用移动端配置？（y/n）：',
				defaults: 'y'
			},
			{
				title: 'needHtml',
				description: '是否需要HTML文件夹？（y/n）：',
				defaults: 'n'
			},
			{
				title: 'needProxy',
				description: '是否启用代理服务器？（y/n）：',
				defaults: 'n'
			},
			{
				title: 'isScss',
				description: '是否使用Scss？（y/n）：',
				defaults: 'y'
			},
			{
				title: 'needJS',
				description: '是否需要预置JS库，包括：Jquery、TweenMax和Perload？（y/n）：',
				defaults: 'y'
			},
			{
				title: 'needES6',
				description: '是否需要启用ES6功能？（y/n）：',
				defaults: 'n'
			}
		],
		dir = [
			'./develop',
			'./develop/js',
			'./develop/js/es6',
			'./develop/css',
			'./develop/css/style',
			'./develop/images',
			'./online',
			'./online/js',
			'./online/css',
			'./online/images',
			'./online/html',
			'./develop/html'
		],
		remotePath = [{
				title: 'package',
				inputPath: 'https://raw.githubusercontent.com/CanonLs/RemoteFile/master/json/package.json',
				outPath: './package.json',
				console: '写入package成功！'
			},
			{
				title: 'gulpfile',
				inputPath: 'https://raw.githubusercontent.com/CanonLs/RemoteFile/master/gulpfile.js',
				outPath: './gulpfile.js',
				console: '写入gulpfile成功！'
			},
			{
				title: 'html',
				inputPath: 'https://raw.githubusercontent.com/CanonLs/RemoteFile/master/html/index.html',
				outPath: './develop/index.html',
				console: '写入html成功！'
			},
			{
				title: 'js',
				inputPath: '',
				outPath: './develop/js/main.js',
				console: '写入js成功！'
			},
			{
				title: 'imgjs',
				inputPath: '',
				outPath: './develop/js/img.js',
				console: '写入imgjs成功！'
			},
			{
				title: 'css',
				inputPath: 'https://raw.githubusercontent.com/CanonLs/RemoteFile/master/css/style.css',
				outPath: './develop/css/style/style.scss',
				console: '写入css成功！'
			},
			{
				title: 'jquery',
				inputPath: 'https://raw.githubusercontent.com/CanonLs/RemoteFile/master/scripts/jquery-2.2.4.min.js',
				outPath: './develop/js/JTP.min.js',
				console: '写入Jquery成功！'
			},
			{
				title: 'TweenMax',
				inputPath: 'https://raw.githubusercontent.com/CanonLs/RemoteFile/master/scripts/TweenMax.min.js',
				outPath: './develop/js/JTP.min.js',
				console: '写入TweenMax成功'
			},
			{
				title: 'preload',
				inputPath: 'https://raw.githubusercontent.com/CanonLs/RemoteFile/master/scripts/preloadjs-0.6.2.min.js',
				outPath: './develop/js/JTP.min.js',
				console: '写入preload成功！'
			},
		],
		data = [],
		htmlSrc = {
			y: './develop/html/index.html',
			n: './develop/index.html'
		},
		gulpHSrc = {
			y: 'develop/html/*.html',
			n: 'develop/*.html'
		},
		gulpBSrc = {
			y1: 'bs.init({\n\ropen: "external",\n\rhost: "' + IPv4 + '",\n\rproxy: "localhost/' + dirName + '/develop/",\n\ronline: true\n\r});',
			y2: 'bs.init({\n\ropen: "external",\n\rhost: "' + IPv4 + '",\n\rproxy: "localhost/' + dirName + '/develop/html/",\n\ronline: true\n\r});',
			n1: 'bs.init({\n\rserver: "./develop",\n\rindex: "index.html",\n\rport: "8222",\n\ropen: "external"\n\r});',
			n2: 'bs.init({\n\rserver: "./develop",\n\rindex: "html/index.html",\n\rport: "8222",\n\ropen: "external"\n\r});'
		},
		onlineSrc = {
			y: 'online/html',
			n: 'online',
		},
		devSrc = {
			y: 'develop/html',
			n: 'develop'
		}
	cssSrc = {
			y: './develop/css/style/style.scss',
			n: './develop/css/style.css'
		},
		jsSrc = {
			y: './develop/js/es6/main.js',
			n: './develop/js/main.js'
		},
		htmlRep = {
			y: '<meta name="apple-mobile-web-app-capable" content="yes">\n\r	<meta name="apple-mobile-web-app-status-bar-style" content="black">\n\r	<meta name="viewport" id="viewport" content="width=device-width">\n\r	<script>!function(){var e=screen.width/750;document.getElementById("viewport").content="width=750,initial-scale="+e+",minimum-scale="+e+",maximum-scale="+e+",user-scalable=no"}()</script>',
			n: '<meta content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" name="viewport">\n\r	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">'
		},
		jsRep = {
			y: '<script src="js/JTP.min.js"></script>\n\r<script src="js/img.js"></script>\n\r<script src="js/main.js"></script>',
			n: '<script src="js/img.js"></script>\n\r<script src="js/main.js"></script>'
		};

	for (var key in interfaces) {
		interfaces[key].forEach(function (details) {
			if (details.family == 'IPv4' && details.address != '127.0.0.1') {
				IPv4 = details.address;
			}
		});
	}

	function _confirmFn(v) {
		process.stdout.write(v.description); //输出信息
		process.stdin.resume(); //开启控制台可输入
		process.stdin.setEncoding('utf-8');
		process.stdin.on('data', function (chunk) {
			chunk = chunk.replace(/[\r]/, '').toString().replace(/[\n]/, '').toString().toLowerCase(); //去空格去回车

			if (firmNo == 0) {
				chunk == 'y' ? _confirmOver() : (confirm[firmNo].defaults = 'n', process.stdout.write(confirm[++firmNo].description));
			} else {
				chunk == 'y' ? confirm[firmNo].defaults = 'y' : confirm[firmNo].defaults = 'n';
				firmNo == confirm.length - 1 ? _confirmOver() : process.stdout.write(confirm[++firmNo].description);
			}
		});
	}

	function _confirmOver() {
		process.stdin.pause();
		ih = _getIndex(confirm, 'needHtml');
		im = _getIndex(confirm, 'isMobile');
		ic = _getIndex(confirm, 'isScss');
		ij = _getIndex(confirm, 'needJS');
		ip = _getIndex(confirm, 'needProxy');
		es6 = _getIndex(confirm, 'needES6');

		ah = _getIndex(remotePath, 'html');
		ac = _getIndex(remotePath, 'css');
		aj = _getIndex(remotePath, 'js');

		if (confirm[ih].defaults == 'n') {
			dir.length = dir.length - 2;
			remotePath[ah].outPath = htmlSrc.n;
		} else {
			remotePath[ah].outPath = htmlSrc.y;
		}

		if (confirm[ic].defaults == 'n') {
			remotePath[ac].outPath = cssSrc.n;
			dir.splice(4, 1)
		} else {
			remotePath[ac].outPath = cssSrc.y;
		}
		if (confirm[es6].defaults == 'n') {
			remotePath[aj].outPath = jsSrc.n;
			dir.splice(2, 1)

		} else {
			remotePath[aj].outPath = jsSrc.y;

		}
		if (confirm[ij].defaults == 'n') {
			remotePath.length = remotePath.length - 3;
		}
		_maDir(0);
	}

	function readRemoteFile(url, cb) {
		var callback = function () {
			callback = function () {};
			cb.apply(null, arguments);
		};
		var req = https.get(url, function (res) {
			var b = [];
			res.on('data', function (c) {
				b.push(c);
			});
			res.on('end', function () {
				callback(null, Buffer.concat(b));
			});
			res.on('error', callback);
		});
		req.on('error', callback);
	}

	function _maDir(i) {
		if (i < dir.length) {
			fs.mkdir(dir[i], function (ee) {
				console.log("创建 " + dir[i]);
				i++;
				_maDir(i);
			});
		} else {
			_remote(0);
		}
	}

	function _remote(i) {
		if (i < remotePath.length) {
			if (remotePath[i].inputPath != '') {
				readRemoteFile(remotePath[i].inputPath, function (err, buffer) {
					if (err) throw err;
					if (remotePath[i].title == 'html') {
						if (confirm[im].defaults == 'y') {
							buffer = buffer.toString().replace('|meta|', htmlRep.y).toString();
						} else {
							buffer = buffer.toString().replace('|meta|', htmlRep.n).toString();
						}

						if (confirm[ij].defaults == 'y') {
							buffer = buffer.replace('|script|', jsRep.y).toString();
						} else {
							buffer = buffer.replace('|script|', jsRep.n).toString();
						}
					}

					if (remotePath[i].title == 'gulpfile') {
						if (confirm[ih].defaults == 'y') {
							buffer = buffer.toString().replace('@html1@', "'" + gulpHSrc.y + "'").toString().replace('@html2@', "'" + gulpHSrc.y + "'").toString().replace('@html3@', "'" + onlineSrc.y + "'").toString().replace('@html4@', "'" + devSrc.y + "'").toString();
						} else {
							buffer = buffer.toString().replace('@html1@', "'" + gulpHSrc.n + "'").toString().replace('@html2@', "'" + gulpHSrc.n + "'").toString().replace('@html3@', "'" + onlineSrc.n + "'").toString().replace('@html4@', "'" + devSrc.n + "'").toString();
						}

						if (confirm[ip].defaults == 'y') {
							if (confirm[ih].defaults == 'y') {
								buffer = buffer.toString().replace('@server@', gulpBSrc.y2).toString();
							} else {
								buffer = buffer.toString().replace('@server@', gulpBSrc.y1).toString();
							}
						} else {
							if (confirm[ih].defaults == 'y') {
								buffer = buffer.toString().replace('@server@', gulpBSrc.n2).toString();
							} else {
								buffer = buffer.toString().replace('@server@', gulpBSrc.n1).toString();
							}
						}
					}

					if (remotePath[i].title == 'jquery' || remotePath[i].title == 'TweenMax') {
						buffer = buffer.toString() + '\n\r';
					}

					data.push({
						outPath: remotePath[i].outPath,
						content: buffer,
						console: remotePath[i].console
					});
					console.log(remotePath[i].title + "获取成功");
					i++;
					_remote(i);
				});
			} else {
				data.push({
					outPath: remotePath[i].outPath,
					content: '',
					console: remotePath[i].console
				});
				console.log(remotePath[i].title + "为空！");
				i++;
				_remote(i);
			}
		} else {
			_writeFile(0);
		}
	}

	function _writeFile(num) {
		if (num < data.length) {
			fs.writeFile(data[num].outPath, data[num].content, {
				flag: 'a'
			}, function (err) {
				if (err) {
					return console.error(err);
				}
				console.log(data[num].console);
				num++;
				_writeFile(num);
			});
		} else {
			_execNpm();
		}
	}

	function _execNpm() {
		console.log('文件写入完成，开始执行npm install');
		var child = cp.spawn('cnpm', ['install', '--save-dev', '--color'], {
			stdio: 'pipe',
			shell: true
		});

		child.stdout.on('data', function (data) {
			console.log(data.toString());
		});

		child.stderr.on('data', function (data) {
			console.log(data.toString());
		});

		child.on('close', function (code) {
			console.log('npm install 完成，开始运行Gulp');
			_execGulp();
		});
	}

	function _execGulp() {
		var child1 = cp.spawn('gulp', ['--color'], {
			stdio: 'pipe',
			shell: true
		});

		child1.stdout.on('data', function (data) {
			console.log(data.toString());
		});

		child1.stderr.on('data', function (data) {
			console.log(data.toString());
		});
	}

	function _getIndex(a, v) {
		var index = null;
		a.forEach(function (it, i, arr) {
			if (it.title == v) {
				index = i;
			}
		});
		return index;
	}

	return {
		init: function () {
			_confirmFn(confirm[0]);
		}
	}
})();

NodeFn.init();
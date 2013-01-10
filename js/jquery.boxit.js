(function ($) {
	var Helpers = function() { };
	Helpers.prototype.Spiralify = function(arr) {
		if(arr.length == 1) return arr[0];
		var firstRow = arr[0],
			rows = arr.length,
			ret = [],
			newRow,
			i,
			j = arr[1].length - 1;
		for(j; j >= 0; j--) {
			newRow = [];
			for(i = 1; i < rows; i++) newRow.push(arr[i][j]);
			ret.push(newRow);
		}
		firstRow.push.apply(firstRow, this.Spiralify(ret));
		return firstRow;
	};
	
	var Boxit = function(elem, options) {
		var defaultOptions = {
			startAt: 0,
			animation: {
				transition: "fade",
				speed: "fast"
			},
			weights: {
				rows: [ 1 ],
				columns: [ 1 ]
			},
			direction: "forward",
			loop: "circular"
		};
		
		var validModes = [ "disintegrate", "horizontal", "vertical", "spiral", "spiral-in", "spiral-out" ];
		var self = this;
		var original = $(elem);
		var timer;
		var options;
		var container;
		var children = [];
		var images = [];
		var calculations = { };
		var currentImageIndex = 0;
		
		var init = function(args) {
			options = $.extend(true, {}, defaultOptions, args);
			if(options.rows < 1) options.rows = 1;
			if(options.columns < 1) options.columns = 1;
			precalculate();
			
			container = $("<div>").addClass("boxit-container").addClass(original.attr("class")).attr("style", original.attr("style")).css({
				width: calculations.width,
				height: calculations.height
			});
			
			this.container = container;
			original.addClass("boxit-original").before(container);
			
			setupChildren();
			if(options.interval && options.interval > 0) {
				timer = setInterval(function() { original.boxit("next"); }, args.interval);
			}
			else if(typeof timer !== "undefined") clearInterval(timer);
		},
		precalculate = function() {
			var $self = original;
			var w = 0, h = 0;
			/*$.each(images, function(k, v) {
			})*/
			images = original.children("li").find("img:first");
			if(typeof options.width !== "undefined" && typeof options.height !== "undefined") {
				w = options.width;
				h = options.height;
			}
			else {
				images.each(function(k, v) {
					var oW = $(v).get(0).width, oH = $(v).get(0).height;
					if(oW >= w) w = oW;
					if(oH >= h) h = oH;
					$(v).data("boxit-size", { width: oW, height: oH });
				});
			}

			var wsW = 0, wsH = 0;
			
			if(!(options.weights.rows instanceof Array)) options.weights.rows = [ 1 ];
			if(!(options.weights.columns instanceof Array)) options.weights.columns = [ 1 ];
			extendWeights();
			$.each(options.weights.rows, function(k, v) { wsW += v; });
			$.each(options.weights.columns, function(k, v) { wsH += v; });
			//wsW *= options.rows;
			//wsH *= options.columns;
			calculations.weights = {
				rows: options.weights.rows.map(function(v) { return v / (wsW == 0 ? 1 : wsW); }),
				columns: options.weights.columns.map(function(v) { return v / (wsH == 0 ? 1 : wsH); })
			};	
			calculations.width = w;
			calculations.height = h;
			calculations.tileCount = options.rows * options.columns;
			calculations.actualAnimationSpeed = options.animation.speed;
			if(calculations.actualAnimationSpeed == "slow") calculations.actualAnimationSpeed = 200;
			else if(calculations.actualAnimationSpeed == "fast") calculations.actualAnimationSpeed = 800;
			calculations.tileAnimationSpeed = calculations.actualAnimationSpeed / (calculations.tileCount < 1 ? 1 : calculations.tileCount);
		},
		extendWeights = function() {
			var rows = options.rows, cols = options.columns;
			var wRows = options.weights.rows, wCols = options.weights.columns;
			while(wRows.length < rows) wRows = wRows.concat(wRows);
			while(wCols.length < cols) wCols = wCols.concat(wCols);
			options.weights.rows = wRows.slice(0, rows);
			options.weights.columns = wCols.slice(0, cols);
		},
		getCellSize = function(parent, row, col) {
			var cRW = options.weights.rows.length, cCW = options.weights.columns.length;
			var sC = calculations.weights.columns[col % cCW], sR = calculations.weights.rows[row % cRW];
			var cW = sC * calculations.width, cH = sR * calculations.height;
			return {
				wScale: sC,
				hScale: sR,
				w: cW,
				h: cH
			};
		},
		setupChildren = function() {
			if(children.length > 0) children.remove();
			children = [];
			images.each(function(k, v) {
				var child = setupTiles($(this));
				container.append(child);
			});
			children = container.children(".boxit-child");
		},
		setupTiles = function(image) {
			var imageUrl = image.attr("src");
			var originalSize = image.data("boxit-size");
			var child = $("<div>").addClass("boxit-child").css({ width: calculations.width, height: calculations.height });/*.css({
				width: originalSize.width,
				height: originalSize.height,
				'margin-left': originalSize.width / 2,
				'margin-top': originalSize.height / 2
			});*/
			var tiles = [];
			var offX = 0, offY = 0;
			var ind = 0;
			for(var i = 0; i < options.rows; i++) {
				var maxH = 0;
				offX = 0;
				for(var j = 0; j < options.columns; j++) {
					var size = getCellSize(child, i, j);
					var tile = $("<div>").addClass("boxit-tile").css({
						width: size.w,
						height: size.h,
						position: "absolute",
						left: offX,
						top: offY,
						"background-image": "url('" + imageUrl + "')",
						"background-position": "-" + offX + "px -" + offY + "px"
					}).data("boxit-size", size);
					if(size.h >= maxH) maxH = size.h;
					offX += size.w;
					//tiles.push(tile);
					child.append(tile);
				}
				offY += maxH;
			}
			/*var tileOrder = getTileOrder(tiles);
			for(var n = 0; n < tileOrder.length; n++) child.append(tiles[tileOrder[n]]);*/
			return child;
			//child.data("boxit-tiles", tiles)
		},
		getTile = function(i, j) {
			//if(typeof j === "undefined") return 
		},
		shuffleArray = function(o) {
			for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			return o;
		},
		generateTileOrder = function(limit) {
			var arr = [];
			var mode = options.mode;
			if(mode == "random") {
				mode = validModes[parseInt(Math.random() * validModes.length)];
				console.log("Choosing random mode: " + mode);
			}
			
			if(mode == "disintegrate") {
				for(var k = 0; k < limit; k++) arr.push(k);
				return shuffleArray(arr);
			}
			else if(mode == "horizontal") {
				for(var k = 0; k < limit; k++) arr.push(k);
				return arr;
			}
			else if(mode == "spiral" || mode == "spiral-out" || mode == "spiral-in") {
				for(var i = 0; i < options.rows; i++) {
					arr[i] = []
					for(var j = 0; j < options.columns; j++)
						arr[i][j] = i * options.columns + j;
				}
				arr = Helpers.prototype.Spiralify(arr);
				return mode == "spiral-out" ? arr.reverse() : arr;
			}
			else if(mode == "vertical") {
				for(var j = 0; j < options.columns; j++)
					for(var i = 0; i < options.rows; i++)
						arr.push(j * options.rows + i);
				
				return arr;
			}
		},
		hideCurrentImage = function() {
			var current = getCurrentImage();
			if(current.length > 0) {
				var tiles = current.children(".boxit-tile");
				tiles.hide();
			}
		},
		displayImage = function(child) {
			hideCurrentImage();
			child.addClass("current");
			var tiles = child.children(".boxit-tile");
			var arr = generateTileOrder(tiles.length);
			for(var i = 0; i < arr.length; i++) {
				var k = arr[i];
				var tile = tiles.eq(k);
				if(typeof options.animation !== "undefined") $(tile).stop(true, true).hide().delay(i * calculations.tileAnimationSpeed).fadeIn(options.animation.speed);
				else $(tile).show();
			}
		},
		getNextImage = function(prev, origin) {
			if(typeof origin === "undefined") origin = getCurrentImage();
			if(origin.length < 1) return getImageAt(0);
			var next = prev ? origin.prev() : origin.next();
			if(next.length < 1) {
				if(options.loop == "circular") return prev ? getLastImage() : getFirstImage(); // ret < 0 if prev, ret >= len if next
				else if(options.loop == "return") return getNextImage(!prev, origin); // go back
				else return origin; // return the same value when no loop is set
			}
			return next;
		},
		getImages = function() { return children; },
		getImageAt = function(i) { return getImages().eq(i); },
		getFirstImage = function() { return getImageAt(0); },
		getLastImage = function() { return getImages().last(); }
		getCurrentImage = function() {
			return getImages().filter(".current").first();
		};
		
		init(options);
		
		this.next = function() {
			var current = getCurrentImage();
			var next = getNextImage();
			var all = getImages();
			if(options.direction == "random") {
				if(all.length < 2) return;
				else while(next == current) next = all.eq(parseInt(Math.random() * all.length));
			}
			all.removeClass("current");
			displayImage(next);
		};
		this.show = function(index) {
			displayImage(getImageAt(index));
		};
		this.get = function() {
			return self;
		};
		
		/*if(typeof methods[method] !== "undefined") return methods[method].apply(self, Array.prototype.slice.call(arguments, 1));
		else if(method instanceof Object) {
			return methods.init.apply(self, arguments);
		}
		else $.error("Method " + method + " is not defined.");*/
	};
	
    $.fn.boxit = function (options) {
		return this.each(function() {
			var prev = $(this).data("boxit");
			if(prev) {
				if(typeof prev[options] === "function") prev[options].apply(this, Array.prototype.slice.call(1, arguments));
				else $.error("Method " + options + " is not defined.");
			}
			else {
				var boxit = new Boxit($(this), $.extend(true, {}, $.fn.boxit.defaults, options));
				$(this).data("boxit", boxit);;
			}
		});
    };
	
	$.fn.boxit.defaults = {
		rows: 10,
		columns: 10,
		weights: {
			rows: [ 1 ],
			columns: [ 1 ]
		},
		alignChildren: "center",
		/*margings: {
			rows: { top: 0px }
		},*/
		startAt: 0,
		interval: 3000,
		animation: {
			transition: "fade",
			speed: "fast"
		},
		direction: "forward",
		loop: "circular",
		mode: "horizontal"
	};
})(jQuery);
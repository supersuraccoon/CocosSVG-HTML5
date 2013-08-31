/*
 *  SVGPathUtil.js
 *
 *  Supportt Command:
 *
 *	(OK)		M		moveto								(x y)+
 * 	(OK)		Z		closepath							(none)
 *	(OK)		L		lineto								(x y)+
 *	(OK)		H		horizontal lineto					x+
 *	(OK)		V		vertical lineto						y+
 *	(OK)		C		curveto								(x1 y1 x2 y2 x y)+
 *	(OK)		S		smooth curveto						(x2 y2 x y)+
 *	(NO)		Q		Quadratic Bézier curveto			(x1 y1 x y)+
 *	(NO)		T		smooth quadratic Bézier curveto		(x y)+
 *	(NO)		A		elliptical arc						(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
 *	(NO)		R		Catmull-Rom curveto*				x1 y1 (x y)+
 *
 * */


 var SVG_PATH_DOT = 1;
 var SVG_PATH_LINE = 2;
 var SVG_PATH_CURVE_C = 3;
 var SVG_PATH_CURVE_S = 4;

var SVGPathElement = function (type, pointArray) {
	this._type = type;
	this._pointArray = pointArray;
};

var SVGPathUtil = function () {};

SVGPathUtil.pathStringToArray = function (pathString) {
	pathString = pathString.replace(/\s*([mlqczhvsMLQCZHVS])\s*/g, "\n$1 ")
						   .replace(/,/g, " ")
						   .replace(/-/g, " -")
						   .replace(/ +/g, " ");
	return pathString.split("\n");
};

SVGPathUtil.drawSVGPath = function (pathArray) {
	var svgPathElementArray = new Array();
	var x = 0, y = 0, px = 0, py = 0, ix = 0, iy = 0;
	for (var i = 1; i < pathArray.length; i++) {
		var instruction = pathArray[i];
		var cmd = instruction.substr(0, 1);
		var terms = (instruction.length > 1 ? instruction.substr(1).trim().split(" ") : "");

		// debug
//		cc.log("instruction: " + instruction);
//		cc.log("cmd: " + cmd);
//		cc.log("terms: " + terms);
		
		// M moveto (x y)+
		if(cmd == "m" || cmd == "M") {
			for (var j = 0; j < terms.length / 2; j++) {
				var _x = parseFloat(terms[j * 2]), _y = parseFloat(terms[j * 2 + 1]);
				px = x, py = y;
				(cmd == "m") ? (x += _x, y += _y) : (x = _x, y = _y);
				if (j == 0) {
					ix = x, iy = y;
					svgPathElementArray.push(new SVGPathElement(SVG_PATH_DOT, [cc.p(x,y)]));
				}
				else {
					// implict lineto command
					svgPathElementArray.push(new SVGPathElement(SVG_PATH_LINE, [cc.p(px,py), cc.p(x,y)]));
				}
			}
		}
		// L lineto (x y)+
		if(cmd == "l" || cmd == "L") {
			for (var j = 0; j < terms.length / 2; j++) {
				var _x = parseFloat(terms[j * 2]), _y = parseFloat(terms[j * 2 + 1]);
				px = x, py = y;
				(cmd == "l") ? (x += _x, y += _y) : (x = _x, y = _y);
				svgPathElementArray.push(new SVGPathElement(SVG_PATH_LINE, [cc.p(px,py), cc.p(x,y)]));	
			}
		}
		// H horizontal lineto x+
		if(cmd == "h" || cmd == "H") {
			for (var j = 0; j <= terms.length - 1; j++) {
				var _x = parseFloat(terms[j]);
				px = x, py = y;
				(cmd == "h") ? (x += _x) : (x = _x);
				svgPathElementArray.push(new SVGPathElement(SVG_PATH_LINE, [cc.p(px,py), cc.p(x,py)]));	
			}
		}
		// V vertical lineto y+
		if(cmd == "v" || cmd == "V") {
			for (var j = 0; j <= terms.length - 1; j++) {
				var _y = parseFloat(terms[j]);
				px = x, py = y;
				(cmd == "v") ? (y += _y) : (y = _y);
				svgPathElementArray.push(new SVGPathElement(SVG_PATH_LINE, [cc.p(px,py), cc.p(px,y)]));	
			}
		}
		// C curveto (x1 y1 x2 y2 x y)+
		if(cmd == "c" || cmd == "C") {
			for (var j = 0; j < terms.length / 6; j++) {
				// get first control point
				var _x = parseFloat(terms[j * 6]), _y = parseFloat(terms[j * 6 + 1]);
				var cx1 = 0, cy1 = 0;
				(cmd == "c") ? (cx1 = x + _x, cy1 = y + _y) : (cx1 = _x, cy1 = _y);
				
				// get second control point
				 _x = parseFloat(terms[j * 6 + 2]), _y = parseFloat(terms[j * 6 + 3]);
				var cx2 = 0, cy2 = 0;
				(cmd == "c") ? (cx2 = x + _x, cy2 = y + _y) : (cx2 = _x, cy2 = _y);
				
				// get des point
				px = x, py = y;
				_x = parseFloat(terms[j * 6 + 4]), _y = parseFloat(terms[j * 6 + 5]);
				(cmd == "c") ? (x += _x, y += _y) : (x = _x, y = _y);
				svgPathElementArray.push(new SVGPathElement(SVG_PATH_CURVE_C, [cc.p(px,py), cc.p(cx1,cy1), cc.p(cx2,cy2), cc.p(x,y)]));		
			}		
		}
		// S smooth curveto	(x2 y2 x y)+
		if(cmd == "s" || cmd == "S") {
			for (var j = 0; j < terms.length / 4; j++) {
				// get second control point
				var _x = parseFloat(terms[j * 4]), _y = parseFloat(terms[j * 4 + 1]);
				var cx2 = 0, cy2 = 0;
				(cmd == "s") ? (cx2 = x + _x, cy2 = y + _y) : (cx2 = _x, cy2 = _y);
				
				// get des point
				px = x, py = y;
				_x = parseFloat(terms[j * 4 + 2]), _y = parseFloat(terms[j * 4 + 3]);
				(cmd == "s") ? (x += _x, y += _y) : (x = _x, y = _y);

				// first control point is the reflection of the second one about the end one
				var cx1 = 2 * cx2 - x, cy1 = 2 * cy2 - y;

				svgPathElementArray.push(new SVGPathElement(SVG_PATH_CURVE_S, [cc.p(px,py), cc.p(cx1,cy1), cc.p(cx2,cy2), cc.p(x,y)]));		
			}		
		}
		// Z closepath (none)
		if(cmd == "z" || cmd == "Z") {
			svgPathElementArray.push(new SVGPathElement(SVG_PATH_LINE, [cc.p(x,y), cc.p(ix,iy)]));
		}
	}
	return svgPathElementArray
};

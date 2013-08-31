// SVGSprite.js

var SVGSprite = cc.Node.extend({
	init:function (pathString) {
    	this._super();
    	
    	this._flipX = false;
    	this._flipY = false;
    	this._color = cc.WHITE;
    	this._showControlPoint = false;
    	this._ignoreContentSize = false;
    	
        this._svgPathElementArray = SVGPathUtil.drawSVGPath(SVGPathUtil.pathStringToArray(pathString));
        
        this.setAnchorPoint(cc.p(0.5, 0.5));
        this._updateContentSize();
        
        return true;
	},
	appendPath:function (pathString) {
		this._svgPathElementArray = this._svgPathElementArray.concat(SVGPathUtil.drawSVGPath(SVGPathUtil.pathStringToArray(pathString)));
	},
	setFlipX:function (isFlip) {
		this._flipX = isFlip;
	},
	setFlipY:function (isFlip) {
		this._flipY = isFlip;
	},
	setColor:function (color) {
		this._color = color;
	},
	setShowControlPoint:function (isShowControlPoint) {
		this._showControlPoint = isShowControlPoint;
	},
	setIgnoreContentSize:function (isIgnoreContentSize) {
		this._ignoreContentSize = isIgnoreContentSize;
		this._updateContentSize();
		
	},
	_updateContentSize:function () {
		if (this._ignoreContentSize)
			this.setContentSize(new cc.Size(0, 0));
		else {
			var l = 99999, r = 0, t = 0, b = 99999;
			for (var i = 0; i < this._svgPathElementArray.length; i++) {
	    		var svgPathElement = this._svgPathElementArray[i];
	    		for (var j = 0; j < svgPathElement._pointArray.length; j++) {
	    			var pt = svgPathElement._pointArray[j];
	    			if (pt.x < l)
	    				l = pt.x;
	    			if (pt.x > r)
	    				r = pt.x;
	    			if (pt.y < b)
	    				b = pt.y;
	    			if (pt.y > t)
	    				t = pt.y;
	    		}
			}
			this.setContentSize(new cc.Size(r - l, t - b));	
		}
	},
	_pointTransformations:function (pointArray) {
		var resultArray = new Array();
		for (var i = 0; i < pointArray.length; i ++) {
			var point = Object.create(pointArray[i]);
			point = cc.p(this._flipX ? -point.x + this.getContentSize().width : point.x, 
						 this._flipY ? -point.y + this.getContentSize().height : point.y);
			resultArray.push(point);
		}
		return resultArray;
	},
	draw:function () {
		cc.drawingUtil.setLineWidth(5.0);
		cc.drawingUtil.setDrawColor4B(this._color.r, this._color.g, this._color.b, 255);
    	for (var i = 0; i < this._svgPathElementArray.length; i++) {
    		var svgPathElement = this._svgPathElementArray[i];
    		var svgPointArray = this._pointTransformations(svgPathElement._pointArray);
    		if (svgPathElement._type == SVG_PATH_DOT) {
    			if (this._showControlPoint)
    				cc.drawingUtil.drawCircle(svgPointArray[0], 1, 0, 50, false);
    		}
    		else if (svgPathElement._type == SVG_PATH_LINE) {
    			cc.drawingUtil.drawLine(svgPointArray[0], svgPointArray[1]);
    		}
    		else if (svgPathElement._type == SVG_PATH_CURVE_C || svgPathElement._type == SVG_PATH_CURVE_S) {
    			cc.drawingUtil.drawCubicBezier(svgPointArray[0], svgPointArray[1], svgPointArray[2], svgPointArray[3], 100);
    		}
    		else {
    			cc.log("ERROR TYPE");
    		}
    	}		
	}
});

SVGSprite.create = function (pathString) {
    var svgSprite = new SVGSprite();
    if (svgSprite && svgSprite.init(pathString)) 
		return svgSprite;
    return null;
};

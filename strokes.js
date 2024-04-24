"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToFile = exports.vectorToRasterScaling = exports.vectorToRaster = void 0;
var canvas_1 = require("canvas");
function vectorToRaster(_a) {
    var vectorImages = _a.vectorImages, _b = _a.side, side = _b === void 0 ? 28 : _b, _c = _a.lineDiameter, lineDiameter = _c === void 0 ? 16 : _c, _d = _a.padding, padding = _d === void 0 ? 16 : _d, _e = _a.bgColor, bgColor = _e === void 0 ? [0, 0, 0] : _e, _f = _a.fgColor, fgColor = _f === void 0 ? [255, 255, 255] : _f, _g = _a.resizeSize, resizeSize = _g === void 0 ? 28 : _g, _h = _a.saveImage, saveImage = _h === void 0 ? false : _h, prefix = _a.prefix;
    var originalSide = 256;
    var canvas = (0, canvas_1.createCanvas)(originalSide, originalSide);
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = lineDiameter;
    var totalPadding = padding * 2 + lineDiameter;
    var newScale = side / (originalSide + totalPadding);
    console.log('scale', newScale);
    // second canvas for resizing
    var resizedCanvas = (0, canvas_1.createCanvas)(resizeSize, resizeSize);
    var ctx2 = resizedCanvas.getContext('2d');
    var rasterImages = [];
    var index = 0;
    var _loop_1 = function (i) {
        ctx.clearRect(0, 0, originalSide, originalSide);
        var vectorImage = vectorImages[i];
        console.log("processing image ".concat(index++));
        ctx.fillStyle = "rgb(".concat(bgColor.toString(), ")");
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var bbox = vectorImage.reduce(function (a, b) {
            return [Math.max.apply(Math, __spreadArray([a[0]], b[0], false)), Math.max.apply(Math, __spreadArray([a[1]], b[1], false))];
        }, [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]);
        var offset = bbox.map(function (b) { return (256 - b) / 2; });
        var centered = vectorImage.map(function (a) { return a.map(function (a, i) { return a.map(function (e) { return e + offset[i]; }); }); });
        centered.forEach(function (_a) {
            var xv = _a[0], yv = _a[1];
            ctx.beginPath();
            ctx.strokeStyle = "rgb(".concat(fgColor.toString(), ")");
            ctx.moveTo(xv[0], yv[0]);
            ctx.strokeText("text ".concat(xv[0]), xv[0], yv[0]);
            xv.forEach(function (x, i) {
                var y = yv[i];
                ctx.lineTo(x, y);
            });
            ctx.stroke();
        });
        ctx2.drawImage(canvas, 0, 0, 256, 256, 0, 0, 28, 28);
        if (saveImage) {
            saveToFile(resizedCanvas, i, prefix);
        }
        rasterImages.push(Array.from(ctx2.getImageData(0, 0, resizeSize, resizeSize).data));
    };
    for (var i = 0; i < vectorImages.length; i++) {
        _loop_1(i);
    }
    return rasterImages;
}
exports.vectorToRaster = vectorToRaster;
function vectorToRasterScaling(_a) {
    var vectorImages = _a.vectorImages, _b = _a.side, side = _b === void 0 ? 28 : _b, _c = _a.lineDiameter, lineDiameter = _c === void 0 ? 16 : _c, _d = _a.padding, padding = _d === void 0 ? 16 : _d, _e = _a.bgColor, bgColor = _e === void 0 ? [0, 0, 0] : _e, _f = _a.fgColor, fgColor = _f === void 0 ? [255, 255, 255] : _f, _g = _a.resizeSize, resizeSize = _g === void 0 ? 28 : _g, _h = _a.saveImage, saveImage = _h === void 0 ? false : _h, prefix = _a.prefix;
    var originalSide = 256;
    var canvas = (0, canvas_1.createCanvas)(originalSide, originalSide);
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = lineDiameter;
    var totalPadding = padding * 2 + lineDiameter;
    var newScale = side / (originalSide + totalPadding);
    ctx.scale(newScale, newScale);
    ctx.translate(totalPadding / 2, totalPadding / 2);
    // second canvas for resizing
    var rasterImages = [];
    var _loop_2 = function (i) {
        ctx.clearRect(0, 0, originalSide, originalSide);
        var vectorImage = vectorImages[i];
        console.log("processing image ".concat(i));
        ctx.fillStyle = "rgb(".concat(bgColor.toString(), ")");
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var bbox = vectorImage.reduce(function (a, b) {
            return [Math.max.apply(Math, __spreadArray([a[0]], b[0], false)), Math.max.apply(Math, __spreadArray([a[1]], b[1], false))];
        }, [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]);
        var offset = bbox.map(function (b) { return (256 - b) / 2; });
        var centered = vectorImage.map(function (a) { return a.map(function (a, i) { return a.map(function (e) { return e + offset[i]; }); }); });
        centered.forEach(function (_a) {
            var xv = _a[0], yv = _a[1];
            ctx.beginPath();
            ctx.strokeStyle = "rgb(".concat(fgColor.toString(), ")");
            ctx.moveTo(xv[0], yv[0]);
            ctx.strokeText("text ".concat(xv[0]), xv[0], yv[0]);
            xv.forEach(function (x, i) {
                var y = yv[i];
                ctx.lineTo(x, y);
            });
            // ctx.closePath()
            ctx.stroke();
        });
        if (saveImage) {
            saveToFile(canvas, i, prefix);
        }
        rasterImages.push(ctx.getImageData(0, 0, resizeSize, resizeSize).data);
    };
    for (var i = 0; i < vectorImages.length; i++) {
        _loop_2(i);
    }
    return rasterImages;
}
exports.vectorToRasterScaling = vectorToRasterScaling;
/**
 *
 * @param canvas element to save to file
 * @param index name to give to save file
 * @param prefix will be added to begining of file or for creating path
 */
function saveToFile(canvas, index, prefix) {
    var fs = require('fs');
    var out = fs.createWriteStream(__dirname + "/image/".concat(prefix ? prefix : '').concat(index, ".png"));
    var stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', function () { return console.log('The PNG file was created.'); });
}
exports.saveToFile = saveToFile;
/*
generate sample image
vectorToRasterScaling({
    saveImage: true, prefix: 'benchmark',
    vectorImages: [[[[0, 15, 61, 99, 137, 143, 204, 199], [230, 195, 112, 50, 0, 33, 222, 221]], [[16, 19, 46, 56, 64, 66, 59, 86, 90, 176, 178, 173, 173, 201, 197, 197], [226, 224, 226, 213, 208, 218, 250, 255, 212, 216, 217, 225, 253, 253, 238, 215]], [[106, 106, 109], [49, 136, 198]], [[156, 158, 148, 153], [13, 36, 110, 222]], [[35, 57, 192], [117, 123, 130]], [[34, 105, 197], [149, 152, 165]], [[32, 125, 219], [170, 179, 179]]]]
})
 */

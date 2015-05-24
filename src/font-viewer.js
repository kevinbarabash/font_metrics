var $ = require('../node_modules/jquery/dist/jquery.js');

function toHex(number) {
    return "0x" + ("0000" + number.toString(16)).substr(-4);
}

CanvasRenderingContext2D.prototype.dot = function(x,y,r) {
    this.beginPath();
    this.arc(x, y, r, 0, 2 * Math.PI, false);
    this.fill();
};

var largeCanvas = document.createElement('canvas');
largeCanvas.width = 512;
largeCanvas.height = 512;
largeCanvas.style.position = 'absolute';
largeCanvas.style.left = '750px';
largeCanvas.style.top = '0px';

document.body.appendChild(largeCanvas);

function drawLargeGlyph(metrics, code) {
    var ctx = largeCanvas.getContext('2d');
    var size = 512;
    ctx.clearRect(0,0,size,size);
    ctx.fillStyle = 'black';

    var k = 0.6 * size / unit_per_em;

    // origin
    var x = size / 4;
    var y = 3 * size / 4;

    ctx.font = (0.6 * size) + 'px comic sans ms';
    ctx.fillText(String.fromCharCode(code), x, y);

    if (!metrics) {
        return;
    }

    // glyph bounding box
    ctx.strokeStyle = 'red';
    var width = k * metrics.width;
    var height = k * metrics.height;
    var bearingX = k * metrics.bearingX;
    var bearingY = k * metrics.bearingY;

    // - bearingY b/c the coordinate system if flipped
    ctx.strokeRect(x + bearingX, y - bearingY, width, height);

    // em bounding box
    ctx.strokeStyle = 'blue';
    var ascender = k * 2257;
    var descender = k * -597;
    ctx.strokeRect(x, y - ascender, k * 2048, ascender - descender);

    ctx.fillStyle = 'black';
    ctx.dot(x, y, 5);

    ctx.dot(x + k * metrics.advance, y, 5);
}

var container = document.getElementById('container');

function createCanvas(width, height, id) {
    var canvas = document.createElement('canvas');
    Object.assign(canvas, { width, height, id });
    return canvas;
}

function drawGlyphs(data) {
    // TODO: use react
    var size = 40;
    for (var i = 0x2200; i <= 0x22FF; i++) {
        if (i % 16 === 0) {
            var row = document.createElement('div');
            container.appendChild(row);
        }
        var id = toHex(i);
        var canvas = createCanvas(size, size, id);

        canvas.addEventListener('click', function (e) {
            console.log(this.id);
            var metrics = data[this.id];
            var code = parseInt(this.id, 16);
            drawLargeGlyph(metrics, code);
        });

        canvas.setAttribute("title", id);

        var ctx = canvas.getContext('2d');

        if (id in data) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = "gray";
        }
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = (0.6 * size) + 'px comic sans ms';
        ctx.fillText(String.fromCharCode(i), size / 2, size / 2);
        row.appendChild(canvas);
    }
}

var unit_per_em = 2048;

var cache = {};

async function get(url) {
    if (url in cache) {
        return cache[url];
    } else {
        return await $.getJSON(url);
    }
}

(async function() {
    var data = await get('../json/math-operators.json');
    drawGlyphs(data);
})();

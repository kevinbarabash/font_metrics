var React = require("react");
var PropTypes = React.PropTypes;


CanvasRenderingContext2D.prototype.dot = function(x,y,r) {
    this.beginPath();
    this.arc(x, y, r, 0, 2 * Math.PI, false);
    this.fill();
};


class GlyphView extends React.Component {
    static propTypes = {
        size: PropTypes.number.isRequired,
        glyph: PropTypes.string.isRequired,
        metrics: PropTypes.object,
        outlines: PropTypes.object
    };

    drawGlyph(props) {
        var canvas = React.findDOMNode(this);
        var ctx = canvas.getContext('2d');
        var code = props.glyph;
        var size = props.size;
        var unit_per_em = 2048;

        ctx.clearRect(0,0,size,size);
        ctx.fillStyle = 'black';

        var fontSize = 0.6 * size;
        var k = fontSize / unit_per_em;

        // origin
        var x = size / 4;
        var y = 3 * size / 4;

        ctx.font = fontSize + 'px comic sans ms';
        //ctx.fillText(String.fromCharCode(code), x, y);

        if (!props.metrics) {
            return;
        }

        var metrics = props.metrics[props.glyph];
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
        var xMin = k * -190;
        var yMin = k * -639;
        var xMax = k * 2430;
        var yMax = k * 2257;

        ctx.strokeStyle = 'blue';
        ctx.strokeRect(x + xMin, y - yMax, xMax - xMin, yMax - yMin);

        ctx.beginPath();
        this.props.outlines[code].forEach(outline => {
            var r = 255 * Math.random() | 0;
            var g = 255 * Math.random() | 0;
            var b = 255 * Math.random() | 0;
            var color = `rgb(${r}, ${g}, ${b})`;
            //ctx.save();
            ctx.fillStyle = color;
            //outline.forEach(point => {
            //    console.log(point);
            //    if (point[2] === 1) {
            //        ctx.dot(x + k * point[0], y - k * point[1], 3);
            //    }
            //});
            //ctx.restore();

            var point, nextPoint;
            var tag, nextTag;

            point = outline[0];

            ctx.moveTo(x + k * point[0], y - k * point[1]);

            var j = 1;
            while (j < outline.length - 1) {
                point = outline[j];
                tag = point[2];
                nextPoint = outline[j+1];
                nextTag = nextPoint[2];

                if (tag === 1) {
                    ctx.lineTo(x + k * point[0], y - k * point[1]);
                    j += 1;
                } else if (tag === 0) {
                    if (nextTag === 1) {
                        ctx.quadraticCurveTo(x + k * point[0], y - k * point[1], x + k * nextPoint[0], y - k * nextPoint[1]);
                        j += 2;
                    } else if (nextTag === 0) {
                        var onPoint = [];
                        onPoint[0] = (point[0] + nextPoint[0]) / 2;
                        onPoint[1] = (point[1] + nextPoint[1]) / 2;
                        ctx.quadraticCurveTo(x + k * point[0], y - k * point[1], x + k * onPoint[0], y - k * onPoint[1]);
                        j += 1;
                    } else {
                        throw "cubic tag";
                    }
                } else {
                    throw "cubic tag";
                }
            }
            if (j === outline.length - 1) {
                point = outline[j];
                tag = point[2];
                if (tag === 1) {
                    ctx.lineTo(x + k * point[0], y - k * point[1]);
                } else if (tag === 0) {
                    nextPoint = outline[0];
                    ctx.quadraticCurveTo(x + k * point[0], y - k * point[1], x + k * nextPoint[0], y - k * nextPoint[1]);
                } else {
                    throw "cubic tag";
                }
            }
        });
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'green';
        ctx.stroke();
    }

    componentDidMount() {
        if (this.props.glyph) {
            this.drawGlyph(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.glyph !== nextProps.glyph) {
            this.drawGlyph(nextProps);
        }
    }

    render() {
        var size = this.props.size;
        return <canvas width={size} height={size}/>;
    }
}

module.exports = GlyphView;

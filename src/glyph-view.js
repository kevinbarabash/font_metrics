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
        metrics: PropTypes.object
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
        ctx.fillText(String.fromCharCode(code), x, y);

        if (!props.data) {
            return;
        }

        var metrics = props.data[props.glyph];
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

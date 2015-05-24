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
        var code = parseInt(props.glyph, 16);
        var size = props.size;
        var unit_per_em = 2048;

        ctx.clearRect(0,0,size,size);
        ctx.fillStyle = 'black';

        var k = 0.6 * size / unit_per_em;

        // origin
        var x = size / 4;
        var y = 3 * size / 4;

        ctx.font = (0.6 * size) + 'px comic sans ms';
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
        ctx.strokeStyle = 'blue';
        var ascender = k * 2257;
        var descender = k * -597;
        ctx.strokeRect(x, y - ascender, k * 2048, ascender - descender);
    }

    componentDidMount() {
        if (this.props.glyph) {
            this.drawGlyph(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.drawGlyph(nextProps);
    }

    render() {
        var size = this.props.size;
        return <canvas width={size} height={size}/>;
    }
}

module.exports = GlyphView;

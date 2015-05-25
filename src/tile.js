var React = require('react');
var PropTypes = React.PropTypes;

class Tile extends React.Component {
    static propTypes = {
        size: PropTypes.number.isRequired,
        color: PropTypes.string,
        onClick: PropTypes.func
    };

    static defaultProps = {
        color: 'black'
    };

    drawTile(props) {
        var canvas = React.findDOMNode(this);
        var ctx = canvas.getContext('2d');
        var size = props.size;

        ctx.clearRect(0, 0, size, size);

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = '30px comic sans ms';
        ctx.fillStyle = props.color;

        ctx.fillText(props.children, size / 2, size / 2);
    }

    componentDidMount() {
        this.drawTile(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.children !== nextProps.children) {
            this.drawTile(nextProps);
        }
    }

    handleClick = () => {
        this.props.onClick(this.props.id);
    };

    render() {
        var size = this.props.size;
        return <canvas width={size} height={size} onClick={this.handleClick}/>;
    }
}

module.exports = Tile;

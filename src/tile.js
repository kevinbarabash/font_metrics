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

    componentDidMount() {
        var canvas = React.findDOMNode(this);
        var ctx = canvas.getContext('2d');

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = '30px comic sans ms';
        ctx.fillStyle = this.props.color;

        var size = this.props.size;
        ctx.fillText(this.props.children, size / 2, size / 2);
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

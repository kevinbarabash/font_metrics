var React = require("react");
var PropTypes = React.PropTypes;

class Grid extends React.Component {
    static propTypes = {
        columns: PropTypes.number.isRequired
    };

    render() {
        var rows = [];
        var row;
        this.props.children.forEach((child, i) => {
            if (i % this.props.columns === 0) {
                if (row) {
                    rows.push(<div>{row}</div>);
                }
                row = [];
            }
            row.push(child);
        });
        if (row) {
            rows.push(<div>{row}</div>);
        }

        return <div style={{lineHeight: 0}}>{rows}</div>;
    }
}

module.exports = Grid;

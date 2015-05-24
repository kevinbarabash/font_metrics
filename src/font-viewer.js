var React = require('react');
var Tile = require('./tile.js');
var Grid = require('./grid.js');
var GlyphView = require('./glyph-view.js');

var $ = require('../node_modules/jquery/dist/jquery.js');

function toHex(number) {
    return "0x" + ("0000" + number.toString(16)).substr(-4);
}

var cache = {};
async function get(url) {
    if (url in cache) {
        return cache[url];
    } else {
        return await $.getJSON(url);
    }
}

class FontViewer extends React.Component {

    state = {
        data: null,
        selectedGlyph: null
    };

    componentDidMount() {
        (async () => {
            var data = await get('../json/math-operators.json');
            this.setState({ data });
        })();
    }

    clickHandler = (id) => {
        this.setState({ selectedGlyph: id });
    };

    render() {

        var style = {
            display: 'flex',
            flexDirection: 'horizontal',
            alignItems: 'flex-start'
        };

        var tiles = [];

        if (this.state.data) {
            var data = this.state.data;

            for (var i = 0x2200; i <= 0x22FF; i++) {
                var id = toHex(i);
                var color = id in data ? 'black' : 'gray';
                tiles.push(<Tile id={id} size={50} color={color} onClick={this.clickHandler}>
                    {String.fromCodePoint(i)}
                </Tile>);
            }
        }

        return <div style={style}>
            <Grid columns={16}>{tiles}</Grid>
            <GlyphView size={512} glyph={this.state.selectedGlyph} data={this.state.data}/>
        </div>;
    }
}

var fontViewer = <FontViewer/>;
React.render(fontViewer, document.body);

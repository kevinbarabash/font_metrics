var React = require('react');
var Tile = require('./tile.js');
var Grid = require('./grid.js');
var GlyphView = require('./glyph-view.js');

var $ = require('../node_modules/jquery/dist/jquery.js');

var cache = {};
async function get(url) {
    if (url in cache) {
        return cache[url];
    } else {
        return await $.getJSON(url);
    }
}

var block_ranges = {
    'basic-latin': [0x0000, 0x007F],
    'latin-1': [0x0080, 0x00FF],
    'greek': [0x0370, 0x03FF],
    'math-operators': [0x2200, 0x22FF]
};

class FontViewer extends React.Component {

    // TODO: put outlines and metrics in a flux store?
    state = {
        metrics: null,
        outlines: null,
        selectedGlyph: null,
        begin: 0,
        end: 0
    };

    componentDidMount() {
        var block = 'basic-latin';
        (async () => {
            var metrics = await get(`../metrics/${block}.json`);
            var outlines = await get(`../outlines/${block}.json`);
            var [begin, end] = block_ranges[block];
            this.setState({ metrics, outlines, begin, end });
        })();
    }

    clickHandler = (id) => {
        this.setState({ selectedGlyph: id });
    };

    onChange = (e) => {
        var block = e.target.selectedOptions[0].value;
        (async () => {
            var metrics = await get(`../metrics/${block}.json`);
            var outlines = await get(`../outlines/${block}.json`);
            var [begin, end] = block_ranges[block];
            this.setState({ metrics, outlines, begin, end });
        })();
    };

    render() {

        var horizontalStyle = {
            display: 'flex',
            flexDirection: 'horizontal',
            alignItems: 'flex-start'
        };

        var verticalStyle = {
            flexDirection: 'vertical'
        };

        var labelStyle = {
            color: 'black',
            fontFamily: 'sans-serif',
            marginRight: 8
        };

        var tiles = [];

        if (this.state.metrics) {
            var { metrics, begin, end } = this.state;

            for (var i = begin; i <= end; i++) {
                var color = i in metrics ? 'black' : 'gray';
                tiles.push(<Tile key={i} id={i} size={50} color={color} onClick={this.clickHandler}>
                    {String.fromCodePoint(i)}
                </Tile>);
            }
        }

        return <div style={verticalStyle}>
            <div style={{display:'flex', marginBottom:16}}>
                <label style={labelStyle}>Unicode Block:</label>
                <select onChange={this.onChange}>
                    <option>basic-latin</option>
                    <option>latin-1</option>
                    <option>greek</option>
                    <option>math-operators</option>
                </select>
            </div>
            <div style={horizontalStyle}>
                <Grid columns={16}>{tiles}</Grid>
                <GlyphView
                    size={512}
                    glyph={this.state.selectedGlyph}
                    metrics={this.state.metrics}
                    outlines={this.state.outlines}/>
            </div>
        </div>;
    }
}

var fontViewer = <FontViewer/>;
React.render(fontViewer, document.body);

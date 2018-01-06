const React = require('react');

class CustomComponent extends React.Component {
  render() {
    const { hasError, updateProps, person, quote, filename, image, ...props } = this.props;
    return (
      <div className="audio-holder" style={{textAlign: 'left', cursor: 'pointer', marginTop: 60, width: '33%'}}>
        <div style={{height: '40vh', backgroundImage: `url(./images/audio/${image})`}} />

        <div style={{width: '75%', margin: '0 auto'}}>
          <audio controls style={{marginTop: 20, width: '100%'}}>
            <source src={filename} type="audio/mp4" />
            <p>Your browser does not support HTML5 audio.</p>
          </audio>

          <div style={{marginTop: 10, fontSize: '1.0rem', fontStyle: 'italic'}}>
            {quote}
          </div>
          <div style={{marginLeft: 10}}>
            — {person}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = CustomComponent;

import React from 'react';

class Header extends React.PureComponent {
  render() {
    return (
      <div className={'article-header'}>
        <h1 className={'hed'}>
          {this.props.title}
        </h1>
        {
          this.props.subtitle && (
            <h2 className={'dek'}>
              {this.props.subtitle}
            </h2>
          )
        }
        {
          this.props.author && (
            <div className={'byline'}>
              <span style={{fontWeight: 'normal'}}>By: </span><a target={"_blank"} href={this.props.authorLink}>{this.props.author}</a> <span style={{fontWeight: 'normal'}}>| November 15, 2017</span>
            </div>
          )
        }

      </div>
    );
  }
}

export default Header;

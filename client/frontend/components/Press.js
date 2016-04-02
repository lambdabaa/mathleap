/* @flow */

let React = require('react');
let Topbar = require('./Topbar');

function Press(props: Object): React.Element {
  setTimeout(props.onload, 0);
  return <div id="press">
    <Topbar headerText="Press" />
    <div className="view">
      <div className="citation">
        Turoczy, Rick. <a href="http://siliconflorist.com/2016/03/29/add-mathleap-offers-forehead-slappingly-awesome-algebra-tool-students-educators/">Add it up: MathLeap offers a forehead slappingly awesome algebra tool for students and educators</a>.
        <span style={{fontStyle: 'italic'}}> siliconflorist.com</span>. Silicon Florist, 19 Mar. 2016. Web.
      </div>
      <div className="citation">
        Willett, Hugh G. <a href="http://www.knoxnews.com/business/codeworks-demo-day-targeted-entrepreneurs-26f4656f-6b0a-084f-e053-0100007f0eca-362957231.html">CodeWorks Demo Day Targeted Entrepreneurs</a>.
        <span style={{fontStyle: 'italic'}}> knoxnews.com</span>. Knoxville News Sentinel, 18 Dec. 2015. Web.
      </div>
      <div className="citation">
        Aye, Gareth. <a href="http://knoxec.com/2015/11/05/go-big-start-here-a-guest-blog-by-gareth-aye/">Go Big. Start Here: A Guest Blog by Gareth Aye</a>.
        <span style={{fontStyle: 'italic'}}> knoxec.com</span>. 11 Nov. 2015. Web.
      </div>
    </div>
  </div>;
}

module.exports = Press;

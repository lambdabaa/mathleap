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
      <div className="press-release">
        <h2>Press Release</h2>
        <br />
        <p>
          MathLeap is a web application that automates student feedback for
          pre-algebra and algebra classes. What makes our software unique
          compared to other automated grading systems is that we allow students
          to show their work and provide personalized feedback that promotes
          learning. MathLeap was founded by Gareth Aye, a graduate of
          Middlebury College who spent three years building Firefox OS at
          Mozilla. He's building a team with expertise across education,
          design, and data science to take MathLeap to the next level.
        </p>
        <br />
        <h3>History</h3>
        <br />
        <p>
          After launching into beta with <a href="https://knoxschools.org/">Knox County Schools </a>
          at the end of January 2016, MathLeap won the
          <a href="https://demolicious.in"> demo competition</a> at Startup Week Portland
          and launched on the <a href="https://www.edmodo.com/store/app/mathleap">Edmodo
          marketplace</a> in February. In March, MathLeap became a featured app on Edmodo
          and grew to 3000 users. In April, the team is turning their focus to meeting 100%
          of the common core standards for US-based Algebra 1 classes by the 2016-17 school
          year.
        </p>
      </div>
    </div>
  </div>;
}

module.exports = Press;

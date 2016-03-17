/* @flow */

let React = require('react');
let Topbar = require('./Topbar');

function CommonCore(props: Object): React.Element {
  setTimeout(props.onload, 0);
  return <div id="common-core">
    <Topbar headerText="Common Core" actions={[]} />
    <div className="view">
      <p>
        Many school districts in the US are moving quickly to adopt common core standards
        and their state equivalents. In order to help districts and teachers understand
        the specific recommendations that MathLeap addresses, we have compiled a partial,
        growing list here. Please let us know if you're interested in testing MathLeap
        in your classes and need more information about our relationship to your
        district and regional standards.
      </p>
      <br />
      <h1>MathLeap Common Core Standards</h1>
      <br />
      <h3>
        <a href="http://www.corestandards.org/Math/Content/6/NS/">
          The Number System for Grade 6 (6.NS)
        </a>
      </h3>
      <br />
      <ul>
        <li><a href="http://www.corestandards.org/Math/Content/6/NS/A/1/">6.NS.A.1</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/6/NS/B/2/">6.NS.B.2</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/6/NS/B/2/">6.NS.B.3</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/6/NS/C/7/">6.NS.C.7</a></li>
      </ul>
      <br />
      <h3>
        <a href="http://www.corestandards.org/Math/Content/6/EE/">
          Expressions & Equations for Grade 6 (6.EE)
        </a>
      </h3>
      <br />
      <ul>
        <li><a href="http://www.corestandards.org/Math/Content/6/EE/A/1/">6.EE.A.1</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/6/EE/A/2/">6.EE.A.2</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/6/EE/A/2/c/">6.EE.A.2.c</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/6/EE/B/5/">6.EE.B.5</a></li>
      </ul>
      <br />
      <h3>
        <a href="http://www.corestandards.org/Math/Content/7/NS/">
          The Number System for Grade 7 (7.NS)
        </a>
      </h3>
      <br />
      <ul>
        <li><a href="http://www.corestandards.org/Math/Content/7/NS/A/1/">7.NS.A.1</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/7/NS/A/1/c/">7.NS.A.1.c</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/7/NS/A/1/d/">7.NS.A.1.d</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/7/NS/A/2/">7.NS.A.2</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/7/NS/A/2/c/">7.NS.A.2.c</a></li>
      </ul>
      <br />
      <h3>
        <a href="http://www.corestandards.org/Math/Content/7/EE/">
          Expressions & Equations for Grade 7 (7.EE)
        </a>
      </h3>
      <br />
      <ul>
        <li><a href="http://www.corestandards.org/Math/Content/7/EE/A/1/">7.EE.A.1</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/7/EE/A/2/">7.EE.A.2</a></li>
      </ul>
      <br />
      <h3>
        <a href="http://www.corestandards.org/Math/Content/8/EE/">
          Expressions & Equations for Grade 8 (7.EE)
        </a>
      </h3>
      <br />
      <ul>
        <li><a href="http://www.corestandards.org/Math/Content/8/EE/C/7/">8.EE.C.7</a></li>
      </ul>
      <br />
      <h3>
        <a href="http://www.corestandards.org/Math/Content/8/F/">
          Functions for Grade 8 (8.F)
        </a>
      </h3>
      <br />
      <ul>
        <li><a href="http://www.corestandards.org/Math/Content/8/F/A/3/">8.F.A.3</a></li>
      </ul>
      <br />
      <h3>
        <a href="http://www.corestandards.org/Math/Content/HSA/">
          High School Algebra (HSA)
        </a>
      </h3>
      <br />
      <ul>
        <li><a href="http://www.corestandards.org/Math/Content/HSA/SSE/A/2/">HSA.SSE.A.2</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/HSA/APR/A/1/">HSA.APR.A.1</a></li>
        <li><a href="http://www.corestandards.org/Math/Content/HSA/APR/B/3/">HSA.APR.B.3</a></li>
      </ul>
    </div>
  </div>;
}

module.exports = CommonCore;

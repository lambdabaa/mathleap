/* @flow */

let React = require('react');
let Topbar = require('./Topbar');

module.exports = function(): React.Element {
  return <div id="privacy">
    <Topbar headerText="Privacy Policy" actions={[]} />
    <div className="view">
      <h2>Updated January 4, 2016</h2>
      <br />
      <p>
        Your privacy is critically important to us. At MathLeap, we have a few fundamental principles:
      </p>
      <br />
      <ol>
        <li>We don’t ask you for personal information unless we truly need it.</li>
        <li>We don’t share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
        <li>We don’t store personal information on our servers unless required for the on-going operation of one of our services.</li>
        <li>We aim to make it as simple as possible for you to control what’s visible to the public, seen by search engines, kept private, and permanently deleted.</li>
      </ol>
      <br />
      <p>
        It is MathLeap's policy to respect your privacy regarding any information we may collect while operating our website.
      </p>
      <br />
      <p>
        This privacy statement describes how MathLeap Inc. ("<span className="emph">MathLeap</span>") collects and uses the personal information
        you provide on our website mathleap.org. It also describes the choices available to you regarding our
        use of your personal information and how you can access and update this information.
      </p>
      <br />
      <h3>Website Visitors</h3>
      <p>
        Like most website operators, MathLeap collects non-personally-identifying information of the sort
        that web browsers and servers typically make available, such as the browser type, language preference,
        referring site, and the date and time of each visitor request. MathLeap’s purpose in collecting
        non-personally-identifying information is to better understand how MathLeap’s visitors use its website.
        From time to time, MathLeap may release non-personally-identifying information in the aggregate,
        e.g., by publishing a report on trends in the usage of its website.
      </p>
      <br />
      <p>
        MathLeap also collects potentially personally-identifying information like Internet Protocol (IP)
        addresses. MathLeap does not use such information to identify its visitors, however,
        and does not disclose such information, other than under the same circumstances that it
        uses and discloses personally-identifying information, as described below.
      </p>
      <br />
      <h3>Gathering of Personally-Identifying Information</h3>
      <p>
        Certain visitors to MathLeap's website choose to interact with MathLeap in ways that require
        MathLeap to gather personally-identifying information. The amount and type of information
        that MathLeap gathers depends on the nature of the interaction. For example, we ask teachers
        who sign up for an account at MathLeap to provide their name and email address.
        In each case, MathLeap collects such information only insofar as is necessary or appropriate
        to fulfill the purpose of the visitor's interaction with MathLeap. MathLeap does not disclose
        personally-identifying information other than as described below. And visitors can always
        refuse to supply personally-identifying information, with the caveat that it may
        prevent them from engaging in certain website-related activities.
      </p>
      <br />
      <h3>Aggregated Statistics</h3>
      <p>
        MathLeap may collect statistics about the behavior of visitors to its website and mobile applications.
        For instance, MathLeap may monitor the most popular question types on the MathLeap site.
        MathLeap may display this information publicly or provide it to others. However,
        MathLeap does not disclose personally-identifying information other than as described below.
      </p>
      <br />
      <h3>How We Handle Personally Identifiable Information</h3>
      <p>
        MathLeap discloses potentially personally-identifying and personally-identifying information
        only to those of its employees, contractors and affiliated organizations that
        (i) need to know that information in order to process it on MathLeap's behalf or
        to provide services available at MathLeap's website, and
        (ii) that have agreed not to disclose it to others.
      </p>
      <br />
      <h3>Social Media Widgets</h3>
      <p>
        Our website includes Social Media Features, such as the Facebook Like button.
        These Features may collect your IP address, which page you are visiting on our site,
        and may set a cookie to enable the Feature to function properly.
        Social Media Features and Widgets are either hosted by a third party or hosted directly on our Site.
        Your interactions with these Features are governed by the privacy policy of the company providing it.
      </p>
      <br />
      <h3>Security</h3>
      <p>
        The security of your personal information is important to us. We follow generally accepted industry
        standards to protect the personal information submitted to us, both during transmission and
        once we receive it, and our website is protected by HTTPS encryption. No method of transmission
        over the Internet is 100% secure, however. Therefore, we cannot guarantee its absolute security.
        If you have any questions about security on our website, you can contact us at <a href="mailto:support@mathleap.org">support@mathleap.org</a>.
      </p>
      <br />
      <h3>Data Retention</h3>
      <p>
        We will retain your information for as long as your account is active or as needed to provide you services.
        If you wish to cancel your account or request that we no longer use your information to provide you services,
        contact us at <a href="mailto:support@mathleap.org">support@mathleap.org</a>. We will retain and use your information
        as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
      </p>
      <br />
      <h3>Contact Us</h3>
      <p>
        If you have questions or wish to send us comments about this Privacy Policy, please send an email to <a href="mailto:support@mathleap.org">support@mathleap.org</a>.
      </p>
      <br />
      <h3>Privacy Policy Changes</h3>
      <p>
        MathLeap reserves the right to modify this privacy statement at any time, so please review it frequently.
        If we change how we use your personally identifiable information, we will notify, by email,
        and/or by means of a notice on our website prior to the change becoming effective.
      </p>
    </div>
  </div>;
};

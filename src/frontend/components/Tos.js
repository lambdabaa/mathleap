let React = require('react');
let Topbar = require('./Topbar');

module.exports = React.createClass({
  displayName: 'Tos',

  render: function() {
    return <div id="tos">
      <Topbar headerText="Terms of Service" actions={[]} />
      <div className="view">
        <h2>Updated January 4, 2016</h2>
        <br />
        <p>
          The MathLeap website and all of its mobile versions ("<span className="emph">Service</span>")
          is a hosted service operated by MathLeap Inc. ("<span className="emph">MathLeap</span>").
          Any use of the Service is subject to the following Terms and Conditions of Use ("<span className="emph">Terms and Conditions"</span>),
          as well as to MathLeap's <a href="#!/privacy/">Privacy Policy</a>, all of which are incorporated by reference into these Terms and Conditions.
          Your use of the Service will constitute your acceptance of these terms and conditions.
        </p>
        <br />
        <p>
          1. <span className="emph">Elgibility.</span> Use of the service is void where prohibited.
          The Service is for users of all ages. By using the Service, you represent and warrant that
          (a) all registration information you submit is truthful and accurate;
          (b) you will maintain the accuracy of such information; and
          (c) your use of the Service does not violate any applicable law or regulation.
        </p>
        <br />
        <p>
          2. <span className="emph">Your MathLeap Account and Data.</span> If you create an account
          on the Service, you are responsible for maintaining the security of your account and data,
          and you are fully responsible for all activities that occur under the account.
          You must immediately notify MathLeap of any unauthorized uses of your data,
          your account or any other breaches of security. MathLeap will not be liable for any
          acts or omissions by You, including any damages of any kind incurred
          as a result of such acts or omissions. MathLeap may from time to time set storage limits
          for your data, or take any other measures MathLeap considers appropriate to manage the Service.
          MathLeap may also from time to time change its policies on offering commercial content or
          displaying advertising, and it may do this without notice.
        </p>
        <br />
        <p>
          3. <span className="emph">Responsibility of Service Visitors.</span> MathLeap has not reviewed,
          and cannot review, all of the material posted to the Service, and cannot therefore be responsible
          for that material's content, use or effects. By operating the Service, MathLeap does not represent
          or imply that it endorses the material there posted, or that it believes such material to be accurate,
          useful or non-harmful. You are responsible for taking precautions as necessary to protect yourself
          and your computer systems from viruses, worms, Trojan horses, and other harmful or destructive content.
          The Service may contain content that is offensive, indecent, or otherwise objectionable,
          as well as content containing technical inaccuracies, typographical mistakes, and other errors.
          The Service may also contain material that violates the privacy or publicity rights,
          or infringes the intellectual property and other proprietary rights, of third parties,
          or the downloading, copying or use of which is subject to additional terms and conditions,
          stated or unstated. MathLeap disclaims any responsibility for any harm resulting from the use
          by visitors of the Service, or from any downloading by those visitors of content there posted.
        </p>
        <br />
        <p>
          4. <span className="emph">Content Posted on Other Websites.</span> We have not reviewed,
          and cannot review, all of the material, including computer software,
          made available through the websites and webpages to which MathLeap links,
          and that link to MathLeap. MathLeap does not have any control over those non-MathLeap
          websites and webpages, and is not responsible for their contents or their use.
          By linking to a non-MathLeap website or webpage, MathLeap does not represent or imply
          that it endorses such website or webpage. You are responsible for taking precautions as necessary
          to protect yourself and your computer systems from viruses, worms, Trojan horses,
          and other harmful or destructive content. MathLeap disclaims any responsibility for any harm
          resulting from your use of non-MathLeap websites and webpages.
        </p>
        <br />
        <p>
          5. <span className="emph">Copyright Infringement and DMCA Policy.</span> As MathLeap asks others
          to respect its intellectual property rights, it respects the intellectual property rights of others.
          If you believe that material located on or linked to by MathLeap violates your copyright,
          you are encouraged to notify MathLeap by writing to <a href="mailto:support@mathleap.org">support@mathleap.org</a>.
          MathLeap will respond to all such notices, including as required or appropriate by removing the infringing material
          or disabling all links to the infringing material. In the case of a visitor who may infringe or repeatedly infringes
          the copyrights or other intellectual property rights of MathLeap or others, MathLeap may, in its discretion,
          terminate or deny access to and use of the Service. In the case of such termination, MathLeap will have no obligation
          to provide a refund of any amounts previously paid to MathLeap.
        </p>
        <br />
        <p>
          6. <span className="emph">Trademarks.</span> MathLeap, MathLeap.org, the MathLeap.org logo, and all other trademarks,
          service marks, graphics, and logos used in connection with MathLeap, or the Service are trademarks or
          registered trademarks of MathLeap or MathLeap's licensors. Other trademarks, service marks, graphics and logos
          used in connection with the Service may be the trademarks of other third parties. Your use of the Service grants you
          no right or license to reproduce or otherwise use any MathLeap or third-party trademarks. Audio files and software
          may not be sold or redistributed, nor offered as a service to others.
        </p>
        <br />
        <p>
          7. <span className="emph">Changes.</span> The Service, including without limitation all content there available
          and these Terms and Conditions, may be changed at the sole discretion of MathLeap and without notice.
          You are bound by any such updates or changes, including but not limited to those affecting these Terms and Conditions,
          and so should periodically review these Terms and Conditions.
        </p>
        <br />
        <p>
          8. <span className="emph">Limitation of warranties of MathLeap, its suppliers and its licensors.</span> Except as otherwise expressly stated,
          all content posted to or available from the Service is provided "as is", and MathLeap, its suppliers and its licensors make no
          representations or warranties, express or implied, including but not limited to warranties of merchantability,
          fitness for a particular purpose, title or non-infringement of proprietary rights. You understand and agree that you download from,
          or otherwise obtain content or services through, the Service at your own discretion and risk, and that MathLeap,
          its suppliers and its licensors will have no liability or responsibility for any damage to your computer system
          or data that results from the download or use of such content or services. Some jurisdictions may not allow
          the exclusion of implied warranties, so some of the above may not apply to you.
        </p>
        <br />
        <p>
          9. <span className="emph">Limitation of liability of MathLeap, its suppliers and its licensors.</span> Except as otherwise expressly stated,
          in no event will MathLeap, its suppliers or its licensors be liable to you or any other party for any direct,
          indirect, special, consequential or exemplary damages, regardless of the basis or nature of the claim,
          resulting from any use of the Service, or the contents thereof or of any hyperlinked website including without limitation any lost profits,
          business interruption, loss of data or otherwise, even if MathLeap, its suppliers or its licensors were expressly advised
          of the possibility of such damages. In no event will the aggregate liability for any and all of your claims against MathLeap,
          its suppliers and its licensors arising out of or related to use of the Service, or the contents thereof or of any hyperlinked website
          exceed the amounts actually paid by you to MathLeap during the 12-month period prior to the date a claim is made.
          Some jurisdictions may not allow the exclusion or limitation of liability for certain incidental or consequential damages,
          so some of the above limitations may not apply to you. The parties agree that this Section 9 represents a reasonable allocation of risk.
        </p>
        <br />
        <p>
          10. <span className="emph">General Representation and Warranty.</span> You represent and warrant that your use of the Service
          will be in accordance with <a href="#!/privacy/">MathLeap's Privacy Policy</a>, with these Terms and Conditions,
          with any applicable laws and regulations, including without limitation any local laws or regulations in your
          country, state, city, or other governmental area, regarding online conduct and acceptable content,
          and including all applicable laws regarding the transmission of technical data exported from the United States
          or the country in which you reside, and with any other applicable policy or terms and conditions.
        </p>
        <br />
        <p>
          11. <span className="emph">Indemnification.</span> You agree to defend, indemnify and hold harmless MathLeap,
          its suppliers, and its licensors, and their respective directors, officers, employees and agents from and against
          any and all claims and expenses, including attorneys’ fees, arising out of your use of the Service,
          including but not limited to out of your violation of any representation or warranty contained in these Terms and Conditions.
        </p>
        <br />
        <p>
          12. <span className="emph">Miscellaneous.</span> These Terms and Conditions constitute the entire agreement between
          MathLeap and you concerning the subject matter hereof, and they may only be modified by a written amendment
          signed by an authorized executive of MathLeap, or by the posting by MathLeap of a revised version.
          Except to the extent applicable law, if any, provides otherwise, these Terms and Conditions,
          any access to or use of the Service will be governed by the laws of the state of Oregon, U.S.A.,
          excluding its conflict of law provisions, and the proper venue for any disputes arising out of or
          relating to any of the same will be the state and federal courts located in Multnomah County, Oregon.
          If any part of these Terms and Conditions is held invalid or unenforceable, that part will be construed
          to reflect the parties’ original intent, and the remaining portions will remain in full force and effect.
          A waiver by either party of any term or condition of these Terms and Conditions or any breach thereof,
          in any one instance, will not waive such term or condition or any subsequent breach thereof.
          You may assign your rights under these Terms and Conditions to any party that consents to, and agrees to be bound by, its terms;
          MathLeap may assign its rights under these Terms and Conditions without condition.
          These Terms and Conditions will be binding upon and will inure to the benefit of the parties, their successors and permitted assigns.
        </p>
      </div>
    </div>;
  }
});

/*
        <p className="emph">
          Please be aware that your use of and access to our services
          (defined below) are subject to the following terms;
          if you do not agree to all of the following, you may not use
          or access the services in any manner.
        </p>
        <br />
        <p>
          Welcome to MathLeap, a web-based platform that provides users a fun
          way to solve math problems and get feedback on their work. We're
          excited for you to get started, but first we need you to agree to the
          rules and restrictions that govern your use of our website(s),
          products, services, and applications (the “Services”). If you have
          any questions, comments, or concerns regarding these terms or
          the Services, please contact us at
          <a href="mailto:support@mathleap.org">support@mathleap.org</a>.
        </p>
        <p>
          These Terms of Use (the “Terms”) are a binding contract between you and NoRedInk Corp. (“NoRedInk,” “we” and “us”). You must agree to and accept all of the Terms, or you don’t have the right to use the Services. Your using the Services in any way means that you agree to all of these Terms, and these Terms will remain in effect while you use the Services. These Terms include the provisions in this document, as well as those in the NoRedInk Privacy Policy, and Copyright Dispute Policy.
      </div>
    </div>;
  }
});
*/

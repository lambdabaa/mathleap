/* @flow */

let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let {isEditorSupported} = require('../../isBrowserSupported');
let {mapChar} = require('../../../common/string');
let users = require('../../store/users');

class FTUContainer extends React.Component {
  isBusy: boolean;

  constructor(props: Object) {
    super(props);

    [
      '_previous',
      '_next',
      '_selectQuestion',
      '_tick',
      '_advance',
      '_exitTutorial'
    ].forEach(handler => {
      this[handler] = this[handler].bind(this);
    });

    this.state = {
      num: 0,
      count: 0,
      step: 0
    };
  }

  componentDidMount() {
    setInterval(this._tick, 2500);
  }

  render(): React.Element {
    let {num} = this.state;
    let rows = this._getRows();
    this.props.onload();
    return <div id="submissions-edit">
      {
        isEditorSupported() ?
          '' :
          <div className="service-outage">
            Solving problems in this browser not supported. Please use an
            up-to-date version of a desktop browser like
            <a href="https://www.google.com/chrome/">Google Chrome</a>.
          </div>
      }
      <Topbar headerText={'Tutorial - solving problems'}
              actions={[]} />
      <div className="view">
        <div className="submissions-edit-workspace">
          <div className="submissions-edit-question-list">
            <Tabular className="dark"
                     cols={[
                       {content: 'Questions', width: 30},
                       {content: '', width: 220}
                     ]}
                     rows={[
                       [
                         <div key="tutorial-0"
                              className="clickable-text"
                              style={{fontWeight: 'bold'}}
                              onClick={() => this._selectQuestion(0)}>
                           1
                         </div>,
                         <div className="question-with-tag"
                              onClick={() => this._selectQuestion(0)}>
                           The basics
                         </div>
                       ],
                       [
                         <div key="tutorial-1"
                              className="clickable-text"
                              style={{fontWeight: 'bold'}}
                              onClick={() => this._selectQuestion(1)}>
                           2
                         </div>,
                         <div className="question-with-tag"
                              onClick={() => this._selectQuestion(1)}>
                           Keyboard shortcuts
                         </div>
                       ]
                     ]}
                     selected={num} />
            <div className="button-inverse" onClick={this._exitTutorial}>Move on</div>
          </div>
          <div className="submissions-edit-question">
            <Tabular className="dark"
                     cols={[
                       {content: 'History', width: 325},
                       {content: 'Results (select and edit here)', width: 325}
                     ]}
                     rows={rows} />
            <div className="next-and-previous">
              <div className="button" onClick={this._previous}>Previous</div>
              <div className="button-inverse" onClick={this._next}>Next</div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }

  _selectQuestion(num: number) {
    this.setState({num, count: 0, step: 0});
  }

  _previous() {
    let {num} = this.state;
    this._selectQuestion(num === 0 ? 1 : num - 1);
  }

  _next() {
    this._selectQuestion((this.state.num + 1) % 2);
  }

  _tick() {
    let {count} = this.state;
    count += 1;
    this.setState({count});
  }

  _advance() {
    let {step} = this.state;
    step += 1;
    this.setState({step});
  }

  _exitTutorial() {
    users.clearScratchpadFtu();
  }

  _getRows(): Array<React.Element | string> {
    let {num, count, step} = this.state;
    if (num === 0) {
      let rows = [
        [
          `This short tutorial will help you understand
           how to edit expressions and equations.`
        ],
        [
          'This side logs the steps you take.',
          <div style={{textAlign: 'center'}}>And this is where you make changes.</div>
        ]
      ];

      if (step === 0) {
        rows.push([
          '',
          <div className="button-inverse" onClick={this._advance}>Got it</div>
        ]);

        return rows;
      }

      rows.push([
        'On each line, MathLeap expects you to edit the active expression',
        <div style={{textAlign: 'center'}}>to take the next step through the problem.</div>
      ]);

      if (step !== 1) {
          rows.push([
            <div className="submissions-edit-changes unselectable">
              <div key="0" className="submissions-edit-character">x</div>
              <div key="1" className="submissions-edit-character">+</div>
              <div key="2" className="submissions-edit-character">1</div>
              <div key="3" className="submissions-edit-character">=</div>
              <div key="4" className="submissions-edit-character">3</div>
              <div key="5" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>
                +
              </div>
              <div key="6" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>
                5
              </div>
              <div key="7" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>
                -
              </div>
              <div key="8" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>
                5
              </div>
            </div>,
            <div className="submissions-edit-active unselectable">
              {
                mapChar('x+1=3', (chr, index) => {
                  return <div key={index}
                              className="submissions-edit-character unselectable">
                    {chr}
                  </div>;
                })
                .concat(<div key="cursor" className="submissions-edit-cursor unselectable"></div>)
              }
            </div>
          ]);
      } else {
        switch (count % 3) {
          case 0:
            rows.push([
              <div className="submissions-edit-changes unselectable">
                {
                  mapChar('x+1=3+5-5', (chr, index) => {
                    return <div key={index}
                                className="submissions-edit-character">
                      {chr}
                    </div>;
                  })
                }
              </div>,
              <div className="submissions-edit-active unselectable">
                <div key="0" className="submissions-edit-character unselectable">x</div>
                <div key="1" className="submissions-edit-character unselectable">+</div>
                <div key="2" className="submissions-edit-character unselectable">1</div>
                <div key="3" className="submissions-edit-character unselectable">=</div>
                <div key="4" className="submissions-edit-character unselectable">3</div>
                <div key="cursor" className="submissions-edit-cursor unselectable"></div>
                <div key="5" className="submissions-edit-character unselectable">+</div>
                <div key="6" className="submissions-edit-character unselectable">5</div>
                <div key="7" className="submissions-edit-character unselectable">-</div>
                <div key="8" className="submissions-edit-character unselectable">5</div>
              </div>
            ]);
            break;
          case 1:
            rows.push([
              <div className="submissions-edit-changes unselectable">
                {
                  mapChar('x+1=3+5-5', (chr, index) => {
                    return <div key={index}
                                className="submissions-edit-character">
                      {chr}
                    </div>;
                  })
                }
              </div>,
              <div className="submissions-edit-active unselectable">
                <div key="0" className="submissions-edit-character unselectable">x</div>
                <div key="1" className="submissions-edit-character unselectable">+</div>
                <div key="2" className="submissions-edit-character unselectable">1</div>
                <div key="3" className="submissions-edit-character unselectable">=</div>
                <div key="4" className="submissions-edit-character unselectable">3</div>
                <div key="5"
                     className="submissions-edit-character unselectable"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  +
                </div>
                <div key="6"
                     className="submissions-edit-character unselectable"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  5
                </div>
                <div key="7"
                     className="submissions-edit-character unselectable"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  -
                </div>
                <div key="8"
                     className="submissions-edit-character unselectable"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  5
                </div>
                <div key="cursor" className="submissions-edit-cursor unselectable"></div>
              </div>
            ]);
            break;
          case 2:
            rows.push([
              <div className="submissions-edit-changes unselectable">
                <div key="0" className="submissions-edit-character">x</div>
                <div key="1" className="submissions-edit-character">+</div>
                <div key="2" className="submissions-edit-character">1</div>
                <div key="3" className="submissions-edit-character">=</div>
                <div key="4" className="submissions-edit-character">3</div>
                <div key="5" className="submissions-edit-character"
                             style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>
                  +
                </div>
                <div key="6" className="submissions-edit-character"
                             style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>
                  5
                </div>
                <div key="7" className="submissions-edit-character"
                             style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>
                  -
                </div>
                <div key="8" className="submissions-edit-character"
                             style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>
                  5
                </div>
              </div>,
              <div className="submissions-edit-active unselectable">
                {
                  mapChar('x+1=3', (chr, index) => {
                    return <div key={index}
                                className="submissions-edit-character unselectable">
                      {chr}
                    </div>;
                  })
                  .concat(<div key="cursor" className="submissions-edit-cursor unselectable"></div>)
                }
              </div>
            ]);
            break;
        }
      }

      rows.push([
        <div>
          To <span className="emph">cancel</span> terms, highlight the terms
          to be cancelled and then press backspace.
        </div>,
        <div style={{textAlign: 'center'}}>
          {
            (() => {
              if (step !== 1) {
                return '';
              }

              switch (count % 3) {
                case 0:
                  return '1: Position cursor';
                case 1:
                  return '2: Highlight';
                case 2:
                  return '3: Backspace';
              }
            })()
          }
        </div>
      ]);

      if (step === 1) {
        rows.push([
          '',
          <div className="button-inverse" onClick={this._advance}>Got it</div>
        ]);

        return rows;
      }

      rows.push([
        '',
        <div>
          The action to <span className="emph">rewrite</span> a term is similar. Simply
          highlight the term to rewrite and type over it.
        </div>
      ]);

      if (step !== 2) {
        rows.push([
          <div className="submissions-edit-changes unselectable">
            <div key="0" className="submissions-edit-character">x</div>
            <div key="1" className="submissions-edit-character">+</div>
            <div key="2" className="submissions-edit-character">1</div>
            <div key="3" className="submissions-edit-character">=</div>
            <div key="4"
                 className="submissions-edit-character"
                 style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
              3
            </div>
            <div key="5"
                 className="submissions-edit-character"
                 style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
              +
            </div>
            <div key="6"
                 className="submissions-edit-character"
                 style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
              2
            </div>
            <div key="7"
                 className="submissions-edit-character"
                 style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
              -
            </div>
            <div key="8"
                 className="submissions-edit-character"
                 style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
              4
            </div>
          </div>,
          <div className="submissions-edit-active unselectable">
            {
              mapChar('x+1=1', (chr, index) => {
                return <div key={index}
                            className="submissions-edit-character unselectable">
                  {chr}
                </div>;
              })
              .concat(<div key="cursor" className="submissions-edit-cursor unselectable"></div>)
            }
          </div>
        ]);
      } else {
        switch (count % 3) {
          case 0:
            rows.push([
              <div className="submissions-edit-changes unselectable">
                {
                  mapChar('x+1=3+2-4', (chr, index) => {
                    return <div key={index}
                                className="submissions-edit-character">
                      {chr}
                    </div>;
                  })
                }
              </div>,
              <div className="submissions-edit-active unselectable">
                <div key="0" className="submissions-edit-character unselectable">x</div>
                <div key="1" className="submissions-edit-character unselectable">+</div>
                <div key="2" className="submissions-edit-character unselectable">1</div>
                <div key="3" className="submissions-edit-character unselectable">=</div>
                <div key="cursor" className="submissions-edit-cursor unselectable"></div>
                <div key="4" className="submissions-edit-character unselectable">3</div>
                <div key="5" className="submissions-edit-character unselectable">+</div>
                <div key="6" className="submissions-edit-character unselectable">2</div>
                <div key="7" className="submissions-edit-character unselectable">-</div>
                <div key="8" className="submissions-edit-character unselectable">4</div>
              </div>
            ]);
            break;
          case 1:
            rows.push([
              <div className="submissions-edit-changes unselectable">
                {
                  mapChar('x+1=3+2-4', (chr, index) => {
                    return <div key={index}
                                className="submissions-edit-character">
                      {chr}
                    </div>;
                  })
                }
              </div>,
              <div className="submissions-edit-active unselectable">
                <div key="0" className="submissions-edit-character unselectable">x</div>
                <div key="1" className="submissions-edit-character unselectable">+</div>
                <div key="2" className="submissions-edit-character unselectable">1</div>
                <div key="3" className="submissions-edit-character unselectable">=</div>
                <div key="4"
                     className="submissions-edit-character unselectable"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  3
                </div>
                <div key="5"
                     className="submissions-edit-character unselectable"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  +
                </div>
                <div key="6"
                     className="submissions-edit-character unselectable"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  2
                </div>
                <div key="7"
                     className="submissions-edit-character unselectable"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  -
                </div>
                <div key="8"
                     className="submissions-edit-character unselectable"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  4
                </div>
                <div key="cursor" className="submissions-edit-cursor unselectable"></div>
              </div>
            ]);
            break;
          case 2:
            rows.push([
              <div className="submissions-edit-changes unselectable">
                <div key="0" className="submissions-edit-character">x</div>
                <div key="1" className="submissions-edit-character">+</div>
                <div key="2" className="submissions-edit-character">1</div>
                <div key="3" className="submissions-edit-character">=</div>
                <div key="4"
                     className="submissions-edit-character"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  3
                </div>
                <div key="5"
                     className="submissions-edit-character"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  +
                </div>
                <div key="6"
                     className="submissions-edit-character"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  2
                </div>
                <div key="7"
                     className="submissions-edit-character"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  -
                </div>
                <div key="8"
                     className="submissions-edit-character"
                     style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                  4
                </div>
              </div>,
              <div className="submissions-edit-active unselectable">
                {
                  mapChar('x+1=1', (chr, index) => {
                    return <div key={index}
                                className="submissions-edit-character unselectable">
                      {chr}
                    </div>;
                  })
                  .concat(<div key="cursor" className="submissions-edit-cursor unselectable"></div>)
                }
              </div>
            ]);
            break;
        }
      }

      rows.push([
        'When you finish a single step, hit enter.',
        <div style={{textAlign: 'center'}}>
          {
            (() => {
              if (step !== 2) {
                return '';
              }

              switch (count % 3) {
                case 0:
                  return '1: Position cursor';
                case 1:
                  return '2: Highlight';
                case 2:
                  return '3: Enter new expression';
              }
            })()
          }
        </div>
      ]);

      if (step === 2) {
        rows.push([
          '',
          <div className="button-inverse" onClick={this._advance}>Got it</div>
        ]);

        return rows;
      }

      rows.push([
        <div>
          To perform a simple operation to <span className="emph">both sides</span>,
          simply type the operator and operand.
        </div>,
        <div>
          For instance, we can type <span className="emph">-1</span> to subtract
          one from each side.
        </div>
      ]);

      switch (count % 3) {
        case 0:
          rows.push([
            <div className="submissions-edit-changes unselectable">
              <div key="0" className="submissions-edit-character">x</div>
              <div key="1" className="submissions-edit-character">+</div>
              <div key="2" className="submissions-edit-character">1</div>
              <div key="3" className="submissions-edit-character">=</div>
              <div key="4" className="submissions-edit-character">0</div>
            </div>,
            <div className="submissions-edit-active unselectable">
              <div key="0" className="submissions-edit-character">x</div>
              <div key="1" className="submissions-edit-character">+</div>
              <div key="2" className="submissions-edit-character">1</div>
              <div key="3" className="submissions-edit-character">=</div>
              <div key="4" className="submissions-edit-character">0</div>
              <div key="cursor" className="submissions-edit-cursor unselectable"></div>
            </div>
          ]);
          break;
        case 1:
          rows.push([
            <div className="submissions-edit-changes unselectable">
              <div key="0" className="submissions-edit-character">x</div>
              <div key="1" className="submissions-edit-character">+</div>
              <div key="2" className="submissions-edit-character">1</div>
              <div key="3" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
                -
              </div>
              <div key="4" className="submissions-edit-character">=</div>
              <div key="5" className="submissions-edit-character">0</div>
              <div key="6" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
                -
              </div>
            </div>,
            <div className="submissions-edit-active unselectable">
              <div key="0" className="submissions-edit-character">x</div>
              <div key="1" className="submissions-edit-character">+</div>
              <div key="2" className="submissions-edit-character">1</div>
              <div key="3" className="submissions-edit-character">-</div>
              <div key="4" className="submissions-edit-character">=</div>
              <div key="5" className="submissions-edit-character">0</div>
              <div key="6" className="submissions-edit-character">-</div>
              <div key="cursor" className="submissions-edit-cursor unselectable"></div>
            </div>
          ]);
          break;
        case 2:
          rows.push([
            <div className="submissions-edit-changes unselectable">
              <div key="0" className="submissions-edit-character">x</div>
              <div key="1" className="submissions-edit-character">+</div>
              <div key="2" className="submissions-edit-character">1</div>
              <div key="3" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
                -
              </div>
              <div key="4" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
                1
              </div>
              <div key="5" className="submissions-edit-character">=</div>
              <div key="6" className="submissions-edit-character">0</div>
              <div key="7" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
                -
              </div>
              <div key="8" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
                1
              </div>
            </div>,
            <div className="submissions-edit-active unselectable">
              <div key="0" className="submissions-edit-character">x</div>
              <div key="1" className="submissions-edit-character">+</div>
              <div key="2" className="submissions-edit-character">1</div>
              <div key="3" className="submissions-edit-character">-</div>
              <div key="4" className="submissions-edit-character">1</div>
              <div key="5" className="submissions-edit-character">=</div>
              <div key="6" className="submissions-edit-character">0</div>
              <div key="7" className="submissions-edit-character">-</div>
              <div key="8" className="submissions-edit-character">1</div>
              <div key="cursor" className="submissions-edit-cursor unselectable"></div>
            </div>
          ]);
          break;
      }

      rows.push([
        '',
        <div style={{textAlign: 'center'}}>
          {
            (() => {
              switch (count % 3) {
                case 0:
                  return '';
                case 1:
                  return '1: Enter operator';
                case 2:
                  return '2: Enter operand';
              }
            })()
          }
        </div>
      ]);

      rows.push(['Click the Next button below to continue!']);

      return rows;
    }

    let rows: Array<React.Element | string> = [
      [
        'Showing your work is much easier with keyboard shortcuts.'
      ],
      [
        '',
        'MathLeap has shortcuts for moving the cursor, highlighting, and undo/redo.'
      ]
    ];

    if (step === 0) {
      rows.push([
        '',
        <div className="button-inverse" onClick={this._advance}>Got it</div>
      ]);

      return rows;
    }

    rows.push([
      <div className="submissions-edit-changes">
        <div key="0" className="submissions-edit-character">y</div>
        <div key="1" className="submissions-edit-character">=</div>
        <div key="2" className="submissions-edit-character">m</div>
        <div key="3" className="submissions-edit-character">x</div>
        <div key="4" className="submissions-edit-character">+</div>
        <div key="5" className="submissions-edit-character">b</div>
      </div>,
      (() => {
        if (step !== 1) {
          return <div className="submissions-edit-active">
            <div key="cursor" className="submissions-edit-cursor unselectable"></div>
            <div key="0" className="submissions-edit-character">y</div>
            <div key="1" className="submissions-edit-character">=</div>
            <div key="2" className="submissions-edit-character">m</div>
            <div key="3" className="submissions-edit-character">x</div>
            <div key="4" className="submissions-edit-character">+</div>
            <div key="5" className="submissions-edit-character">b</div>
          </div>;
        }

        switch (count % 4) {
          case 0:
            return <div className="submissions-edit-active">
              <div key="cursor" className="submissions-edit-cursor unselectable"></div>
              <div key="0" className="submissions-edit-character">y</div>
              <div key="1" className="submissions-edit-character">=</div>
              <div key="2" className="submissions-edit-character">m</div>
              <div key="3" className="submissions-edit-character">x</div>
              <div key="4" className="submissions-edit-character">+</div>
              <div key="5" className="submissions-edit-character">b</div>
            </div>;
          case 1:
            return <div className="submissions-edit-active">
              <div key="0" className="submissions-edit-character">y</div>
              <div key="1" className="submissions-edit-character">=</div>
              <div key="2" className="submissions-edit-character">m</div>
              <div key="3" className="submissions-edit-character">x</div>
              <div key="4" className="submissions-edit-character">+</div>
              <div key="5" className="submissions-edit-character">b</div>
              <div key="cursor" className="submissions-edit-cursor unselectable"></div>
            </div>;
          case 2:
            return <div className="submissions-edit-active">
              <div key="0" className="submissions-edit-character">y</div>
              <div key="1" className="submissions-edit-character">=</div>
              <div key="2" className="submissions-edit-character">m</div>
              <div key="3" className="submissions-edit-character">x</div>
              <div key="cursor" className="submissions-edit-cursor unselectable"></div>
              <div key="4" className="submissions-edit-character">+</div>
              <div key="5" className="submissions-edit-character">b</div>
            </div>;
          case 3:
            return <div className="submissions-edit-active">
              <div key="0" className="submissions-edit-character">y</div>
              <div key="1" className="submissions-edit-character">=</div>
              <div key="2" className="submissions-edit-character">m</div>
              <div key="3" className="submissions-edit-character">x</div>
              <div key="4" className="submissions-edit-character">+</div>
              <div key="5" className="submissions-edit-character">b</div>
              <div key="cursor" className="submissions-edit-cursor unselectable"></div>
            </div>;
        }
      })()
    ]);

    if (step !== 1) {
      rows.push([
        'Jump to the beginning of the statement.',
        <div className="submissions-edit-help-dialog-keycode-container">
          <div className="submissions-edit-help-dialog-keycode">
            ctrl a
          </div>
        </div>
      ]);
    } else {
      switch (count % 4) {
        case 0:
          rows.push([
            'Jump to the beginning of the statement.',
            <div className="submissions-edit-help-dialog-keycode-container">
              <div className="submissions-edit-help-dialog-keycode">
                ctrl a
              </div>
            </div>
          ]);
          break;
        case 1:
          rows.push([
            'Jump to the end of the statement.',
            <div className="submissions-edit-help-dialog-keycode-container">
              <div className="submissions-edit-help-dialog-keycode">
                ctrl e
              </div>
            </div>
          ]);
          break;
        case 2:
          rows.push([
            'Jump one term left.',
            <div className="submissions-edit-help-dialog-keycode-container">
              <div className="submissions-edit-help-dialog-keycode">
                ctrl ←
              </div>
            </div>
          ]);
          break;
        case 3:
          rows.push([
            'Jump one term right.',
            <div className="submissions-edit-help-dialog-keycode-container">
              <div className="submissions-edit-help-dialog-keycode">
                ctrl →
              </div>
            </div>
          ]);
          break;
      }
    }

    if (step === 1) {
      rows.push([
        '',
        <div className="button-inverse" onClick={this._advance}>Got it</div>
      ]);

      return rows;
    }

    rows.push([
      <div className="submissions-edit-changes">
        {
          mapChar('y=x^2+2x', (chr, index) => {
            return <div key={index} className="submissions-edit-character">{chr}</div>;
          })
        }
      </div>,
      (() => {
        if (step !== 2) {
          return <div className="submissions-edit-active">
            {
              mapChar('y=x^2+2x', (chr, index) => {
                return <div key={index} className="submissions-edit-character">{chr}</div>;
              })
            }
            <div key="cursor" className="submissions-edit-cursor"></div>
          </div>;
        }

        switch (count % 4) {
          case 0:
            return <div className="submissions-edit-active">
              <div key="cursor" className="submissions-edit-cursor"></div>
              {
                mapChar('y=x^2+2x', (chr, index) => {
                  return <div key={index} className="submissions-edit-character">{chr}</div>;
                })
              }
            </div>;
          case 1:
            return <div className="submissions-edit-active">
              <div key="7" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                y
              </div>
              <div key="cursor" className="submissions-edit-cursor"></div>
              {
                mapChar('=x^2+2x', (chr, index) => {
                  return <div key={index} className="submissions-edit-character">{chr}</div>;
                })
              }
            </div>;
          case 2:
            return <div className="submissions-edit-active">
              {
                mapChar('y=x^2+2x', (chr, index) => {
                  return <div key={index} className="submissions-edit-character">{chr}</div>;
                })
              }
              <div key="cursor" className="submissions-edit-cursor"></div>
            </div>;
          case 3:
            return <div className="submissions-edit-active">
              {
                mapChar('y=x^2+2', (chr, index) => {
                  return <div key={index} className="submissions-edit-character">{chr}</div>;
                })
              }
              <div key="cursor" className="submissions-edit-cursor"></div>
              <div key="7" className="submissions-edit-character"
                           style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>
                x
              </div>
            </div>;
        }
      })()
    ]);

    switch (count % 4) {
      case 0:
      case 1:
        rows.push([
          'Highlight the character to the right.',
          <div className="submissions-edit-help-dialog-keycode-container">
            <div className="submissions-edit-help-dialog-keycode">
              shift →
            </div>
          </div>
        ]);
        break;
      case 2:
      case 3:
        rows.push([
          'Highlight the character to the left.',
          <div className="submissions-edit-help-dialog-keycode-container">
            <div className="submissions-edit-help-dialog-keycode">
              shift ←
            </div>
          </div>
        ]);
        break;
    }

    if (step === 2) {
      rows.push([
        '',
        <div className="button-inverse" onClick={this._advance}>Got it</div>
      ]);

      return rows;
    }

    rows.push([
      'Now you\'re all set to get started!',
      'Click the Move on button below.'
    ]);

    return rows;
  }
}

module.exports = FTUContainer;

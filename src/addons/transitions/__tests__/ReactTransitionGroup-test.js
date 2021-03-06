/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails react-core
 */

'use strict';

var React;
var ReactDOM;
var ReactTransitionGroup;

// Most of the real functionality is covered in other unit tests, this just
// makes sure we're wired up correctly.
describe('ReactTransitionGroup', function() {
  var container;

  function normalizeCodeLocInfo(str) {
    return str.replace(/\(at .+?:\d+\)/g, '(at **)');
  }

  beforeEach(function() {
    React = require('React');
    ReactDOM = require('ReactDOM');
    ReactTransitionGroup = require('ReactTransitionGroup');

    container = document.createElement('div');
  });


  it('should handle willEnter correctly', function() {
    var log = [];

    var Child = React.createClass({
      componentDidMount: function() {
        log.push('didMount');
      },
      componentWillAppear: function(cb) {
        log.push('willAppear');
        cb();
      },
      componentDidAppear: function() {
        log.push('didAppear');
      },
      componentWillEnter: function(cb) {
        log.push('willEnter');
        cb();
      },
      componentDidEnter: function() {
        log.push('didEnter');
      },
      componentWillLeave: function(cb) {
        log.push('willLeave');
        cb();
      },
      componentDidLeave: function() {
        log.push('didLeave');
      },
      componentWillUnmount: function() {
        log.push('willUnmount');
      },
      render: function() {
        return <span />;
      },
    });

    var Component = React.createClass({
      getInitialState: function() {
        return {count: 1};
      },
      render: function() {
        var children = [];
        for (var i = 0; i < this.state.count; i++) {
          children.push(<Child key={i} />);
        }
        return <ReactTransitionGroup>{children}</ReactTransitionGroup>;
      },
    });

    var instance = ReactDOM.render(<Component />, container);
    expect(log).toEqual(['didMount', 'willAppear', 'didAppear']);

    log = [];
    instance.setState({count: 2}, function() {
      expect(log).toEqual(['didMount', 'willEnter', 'didEnter']);

      log = [];
      instance.setState({count: 1}, function() {
        expect(log).toEqual(['willLeave', 'didLeave', 'willUnmount']);
      });
    });
  });

  it('should handle enter/leave/enter/leave correctly', function() {
    var log = [];
    var willEnterCb;

    var Child = React.createClass({
      componentDidMount: function() {
        log.push('didMount');
      },
      componentWillEnter: function(cb) {
        log.push('willEnter');
        willEnterCb = cb;
      },
      componentDidEnter: function() {
        log.push('didEnter');
      },
      componentWillLeave: function(cb) {
        log.push('willLeave');
        cb();
      },
      componentDidLeave: function() {
        log.push('didLeave');
      },
      componentWillUnmount: function() {
        log.push('willUnmount');
      },
      render: function() {
        return <span />;
      },
    });

    var Component = React.createClass({
      getInitialState: function() {
        return {count: 1};
      },
      render: function() {
        var children = [];
        for (var i = 0; i < this.state.count; i++) {
          children.push(<Child key={i} />);
        }
        return <ReactTransitionGroup>{children}</ReactTransitionGroup>;
      },
    });

    var instance = ReactDOM.render(<Component />, container);
    expect(log).toEqual(['didMount']);
    instance.setState({count: 2});
    expect(log).toEqual(['didMount', 'didMount', 'willEnter']);
    for (var k = 0; k < 5; k++) {
      instance.setState({count: 2});
      expect(log).toEqual(['didMount', 'didMount', 'willEnter']);
      instance.setState({count: 1});
    }
    // other animations are blocked until willEnterCb is called
    willEnterCb();
    expect(log).toEqual([
      'didMount', 'didMount', 'willEnter',
      'didEnter', 'willLeave', 'didLeave', 'willUnmount',
    ]);
  });

  it('should handle enter/leave/enter correctly', function() {
    var log = [];
    var willEnterCb;

    var Child = React.createClass({
      componentDidMount: function() {
        log.push('didMount');
      },
      componentWillEnter: function(cb) {
        log.push('willEnter');
        willEnterCb = cb;
      },
      componentDidEnter: function() {
        log.push('didEnter');
      },
      componentWillLeave: function(cb) {
        log.push('willLeave');
        cb();
      },
      componentDidLeave: function() {
        log.push('didLeave');
      },
      componentWillUnmount: function() {
        log.push('willUnmount');
      },
      render: function() {
        return <span />;
      },
    });

    var Component = React.createClass({
      getInitialState: function() {
        return {count: 1};
      },
      render: function() {
        var children = [];
        for (var i = 0; i < this.state.count; i++) {
          children.push(<Child key={i} />);
        }
        return <ReactTransitionGroup>{children}</ReactTransitionGroup>;
      },
    });

    var instance = ReactDOM.render(<Component />, container);
    expect(log).toEqual(['didMount']);
    instance.setState({count: 2});
    expect(log).toEqual(['didMount', 'didMount', 'willEnter']);
    for (var k = 0; k < 5; k++) {
      instance.setState({count: 1});
      expect(log).toEqual(['didMount', 'didMount', 'willEnter']);
      instance.setState({count: 2});
    }
    willEnterCb();
    expect(log).toEqual([
      'didMount', 'didMount', 'willEnter', 'didEnter',
    ]);
  });

  it('should handle entering/leaving several elements at once', function() {
    var log = [];

    var Child = React.createClass({
      componentDidMount: function() {
        log.push('didMount' + this.props.id);
      },
      componentWillEnter: function(cb) {
        log.push('willEnter' + this.props.id);
        cb();
      },
      componentDidEnter: function() {
        log.push('didEnter' + this.props.id);
      },
      componentWillLeave: function(cb) {
        log.push('willLeave' + this.props.id);
        cb();
      },
      componentDidLeave: function() {
        log.push('didLeave' + this.props.id);
      },
      componentWillUnmount: function() {
        log.push('willUnmount' + this.props.id);
      },
      render: function() {
        return <span />;
      },
    });

    var Component = React.createClass({
      getInitialState: function() {
        return {count: 1};
      },
      render: function() {
        var children = [];
        for (var i = 0; i < this.state.count; i++) {
          children.push(<Child key={i} id={i} />);
        }
        return <ReactTransitionGroup>{children}</ReactTransitionGroup>;
      },
    });

    var instance = ReactDOM.render(<Component />, container);
    expect(log).toEqual(['didMount0']);
    log = [];

    instance.setState({count: 3});
    expect(log).toEqual([
      'didMount1', 'didMount2', 'willEnter1', 'didEnter1',
      'willEnter2', 'didEnter2',
    ]);
    log = [];

    instance.setState({count: 0});
    expect(log).toEqual([
      'willLeave0', 'didLeave0', 'willLeave1', 'didLeave1',
      'willLeave2', 'didLeave2', 'willUnmount0', 'willUnmount1', 'willUnmount2',
    ]);
  });

  it('should warn for duplicated keys with component stack info', function() {
    spyOn(console, 'error');

    var Component = React.createClass({
      render: function() {
        var children = [<div key="1"/>, <div key="1" />];
        return <ReactTransitionGroup>{children}</ReactTransitionGroup>;
      },
    });

    ReactDOM.render(<Component />, container);

    expect(console.error.calls.count()).toBe(2);
    expect(console.error.calls.argsFor(0)[0]).toBe(
      'Warning: flattenChildren(...): ' +
      'Encountered two children with the same key, `1`. ' +
      'Child keys must be unique; when two children share a key, ' +
      'only the first child will be used.'
    );
    expect(normalizeCodeLocInfo(console.error.calls.argsFor(1)[0])).toBe(
      'Warning: flattenChildren(...): ' +
      'Encountered two children with the same key, `1`. ' +
      'Child keys must be unique; when two children share a key, ' +
      'only the first child will be used.\n' +
      '    in ReactTransitionGroup (at **)\n' +
      '    in Component (at **)'
    );
  });
});

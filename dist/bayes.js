(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["bayesjs"] = factory();
	else
		root["bayesjs"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _BayesianNetwork = __webpack_require__(1);

	var _BayesianNetwork2 = _interopRequireDefault(_BayesianNetwork);

	exports['default'] = _BayesianNetwork2['default'];
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var BayesianNetwork = (function () {
	  function BayesianNetwork() {
	    _classCallCheck(this, BayesianNetwork);

	    this.nodes = [];
	    this.edges = [];
	  }

	  _createClass(BayesianNetwork, [{
	    key: "addNode",
	    value: function addNode(node) {
	      this.nodes.push(node);
	    }
	  }, {
	    key: "addEdge",
	    value: function addEdge(edge) {
	      this.edges.push(edge);
	    }
	  }, {
	    key: "findNodeById",
	    value: function findNodeById(nodeId) {
	      return this.nodes.find(function (x) {
	        return x.id === nodeId;
	      });
	    }
	  }, {
	    key: "findParentsByChildId",
	    value: function findParentsByChildId(nodeId) {
	      return this.edges.filter(function (e) {
	        return e.to === nodeId;
	      }).map(function (e) {
	        return e.from;
	      });
	    }
	  }, {
	    key: "infer",
	    value: function infer(nodeId, state) {
	      // TODO: NEED TO REFACTOR THIS!!!
	      var joint = [];

	      /*
	       * Build joint distribution
	       */
	      for (var i = 0; i < this.nodes.length; i++) {
	        var node = this.nodes[i];
	        var parents = this.findParentsByChildId(node.id);

	        var p = { node: node.id, state: null };
	        var q = parents.map(function (x) {
	          return { node: x, state: null };
	        });

	        joint.push({ p: p, q: q });
	      }

	      joint = [joint];

	      for (var i = 0; i < this.nodes.length; i++) {
	        var node = this.nodes[i];
	        var newJoint = [];

	        for (var j = 0; j < joint.length; j++) {
	          for (var s = 0; s < node.states.length; s++) {
	            var nr = [];

	            for (var x = 0; x < joint[j].length; x++) {
	              var p = {
	                node: joint[j][x].p.node,
	                state: joint[j][x].p.state
	              };

	              if (p.node === node.id) {
	                p.state = node.states[s];
	              }

	              var q = [];

	              for (var y = 0; y < joint[j][x].q.length; y++) {
	                var qq = {
	                  node: joint[j][x].q[y].node,
	                  state: joint[j][x].q[y].state
	                };

	                if (qq.node === node.id) {
	                  qq.state = node.states[s];
	                }

	                q.push(qq);
	              }

	              nr.push({ p: p, q: q });
	            }

	            newJoint.push(nr);
	          }
	        }

	        joint = newJoint;
	      }

	      /*
	       * Filter joint distribution
	       */
	      for (var i = joint.length - 1; i > -1; i--) {
	        var rem = false;

	        for (var j = 0; j < joint[i].length; j++) {
	          var ooo = joint[i][j].p;

	          if (ooo.node === nodeId && ooo.state !== state) {
	            rem = true;
	            break;
	          }
	        }

	        if (rem) {
	          joint.splice(i, 1);
	        }
	      }

	      /*
	       * Calculate probability
	       */
	      var prob = 0;

	      for (var i = 0; i < joint.length; i++) {
	        var aux = 1;

	        for (var j = 0; j < joint[i].length; j++) {
	          var ooo = joint[i][j];
	          var node = this.findNodeById(ooo.p.node);
	          var si = node.states.indexOf(ooo.p.state);

	          for (var c = 0; c < node.cpt.length; c++) {
	            var a = true;

	            for (var cc = 0; cc < ooo.q.length; cc++) {
	              for (var ccc = 0; ccc < node.cpt[c].conditions.length; ccc++) {
	                if (ooo.q[cc].node === node.cpt[c].conditions[ccc].parent && ooo.q[cc].state !== node.cpt[c].conditions[ccc].state) {
	                  a = false;
	                  break;
	                }
	              }

	              if (!a) {
	                break;
	              }
	            }

	            if (a) {
	              aux *= node.cpt[c].probabilities[si];
	              break;
	            }
	          }
	        }

	        prob += aux;
	      }

	      return prob;
	    }
	  }]);

	  return BayesianNetwork;
	})();

	exports["default"] = BayesianNetwork;
	module.exports = exports["default"];

/***/ }
/******/ ])
});
;
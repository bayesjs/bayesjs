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
	    key: "infer",
	    value: function infer(nodes) {
	      var giving = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

	      nodes = [].concat(nodes);
	      giving = [].concat(giving);

	      var joint = this._buildJointDistribution();
	      var probGiving = 1;

	      for (var i = 0; i < nodes.length; i++) {
	        joint = this._filterJointDistribution(joint, nodes[i].node, nodes[i].state);
	      }

	      if (giving.length > 0) {
	        for (var i = 0; i < giving.length; i++) {
	          joint = this._filterJointDistribution(joint, giving[i].node, giving[i].state);
	        }

	        probGiving = this.infer(giving);
	      }

	      return this._calculateProbability(joint) / probGiving;
	    }
	  }, {
	    key: "_buildJointDistribution",
	    value: function _buildJointDistribution() {
	      var joint = [];

	      for (var i = 0; i < this.nodes.length; i++) {
	        var node = this.nodes[i];
	        var parents = this._findParentsByChildId(node.id);

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

	      return joint;
	    }
	  }, {
	    key: "_filterJointDistribution",
	    value: function _filterJointDistribution(joint, nodeId, state) {
	      for (var i = joint.length - 1; i > -1; i--) {
	        var rem = false;

	        for (var j = 0; j < joint[i].length; j++) {
	          var p = joint[i][j].p;

	          if (p.node === nodeId && p.state !== state) {
	            rem = true;
	            break;
	          }
	        }

	        if (rem) {
	          joint.splice(i, 1);
	        }
	      }

	      return joint;
	    }
	  }, {
	    key: "_calculateProbability",
	    value: function _calculateProbability(joint) {
	      var _this = this;

	      var prob = 0;

	      for (var i = 0; i < joint.length; i++) {
	        var aux = 1;

	        var _loop = function (j) {
	          var ji = joint[i][j];
	          var node = _this.nodes.find(function (x) {
	            return x.id === ji.p.node;
	          });
	          var si = node.states.indexOf(ji.p.state);

	          for (var c = 0; c < node.cpt.length; c++) {
	            var a = true;

	            for (var cc = 0; cc < ji.q.length; cc++) {
	              for (var ccc = 0; ccc < node.cpt[c].conditions.length; ccc++) {
	                if (ji.q[cc].node === node.cpt[c].conditions[ccc].parent && ji.q[cc].state !== node.cpt[c].conditions[ccc].state) {
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
	        };

	        for (var j = 0; j < joint[i].length; j++) {
	          _loop(j);
	        }

	        prob += aux;
	      }

	      return prob;
	    }
	  }, {
	    key: "_findParentsByChildId",
	    value: function _findParentsByChildId(nodeId) {
	      return this.edges.filter(function (e) {
	        return e.to === nodeId;
	      }).map(function (e) {
	        return e.from;
	      });
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
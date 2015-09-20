export default class BayesianNetwork {
  constructor() {
    this.nodes = [];
    this.edges = [];
  }

  addNode(node) {
    this.nodes.push(node);
  }

  addEdge(edge) {
    this.edges.push(edge);
  }

  infer(nodes, giving = []) {
    nodes = [].concat(nodes);
    giving = [].concat(giving);

    let joint = this._buildJointDistribution();
    let probGiving = 1;

    for (let i = 0; i < nodes.length; i++) {
      joint = this._filterJointDistribution(joint, nodes[i].node, nodes[i].state);
    }

    if (giving.length > 0) {
      for (let i = 0; i < giving.length; i++) {
        joint = this._filterJointDistribution(joint, giving[i].node, giving[i].state);
      }

      probGiving = this.infer(giving);
    }

    return this._calculateProbability(joint) / probGiving;
  }

  _buildJointDistribution() {
    let joint = [];

    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      let parents = this._findParentsByChildId(node.id);

      let p = { node: node.id, state: null };
      let q = parents.map(x => ({ node: x, state: null }));

      joint.push({ p, q });
    }

    joint = [ joint ];

    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      let newJoint = [];

      for (let j = 0; j < joint.length; j++) {
        for (let s = 0; s < node.states.length; s++) {
          let nr = [];

          for (let x = 0; x < joint[j].length; x++) {
            let p = {
              node: joint[j][x].p.node,
              state: joint[j][x].p.state
            };

            if (p.node === node.id) {
              p.state = node.states[s];
            }

            let q = [];

            for (let y = 0; y < joint[j][x].q.length; y++) {
              let qq = {
                node: joint[j][x].q[y].node,
                state: joint[j][x].q[y].state
              };

              if (qq.node === node.id) {
                qq.state = node.states[s];
              }

              q.push(qq);
            }

            nr.push({ p, q });
          }

          newJoint.push(nr);
        }
      }

      joint = newJoint;
    }

    return joint;
  }

  _filterJointDistribution(joint, nodeId, state) {
    for (let i = joint.length - 1; i > -1; i--) {
      let rem = false;

      for (let j = 0; j < joint[i].length; j++) {
        let p = joint[i][j].p;

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

  _calculateProbability(joint) {
    let prob = 0;

    for (let i = 0; i < joint.length; i++) {
      let aux = 1;

      for (let j = 0; j < joint[i].length; j++) {
        let ji = joint[i][j];
        let node = this.nodes.find(x => x.id === ji.p.node);
        let si = node.states.indexOf(ji.p.state);

        for (let c = 0; c < node.cpt.length; c++) {
          let a = true;

          for (let cc = 0; cc < ji.q.length; cc++) {
            for (let ccc = 0; ccc < node.cpt[c].conditions.length; ccc++) {
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
      }

      prob += aux;
    }

    return prob;
  }

  _findParentsByChildId(nodeId) {
    return this.edges
      .filter(e => e.to === nodeId)
      .map(e => e.from);
  }
}

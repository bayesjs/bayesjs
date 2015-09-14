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

  findNodeById(nodeId) {
    return this.nodes.find(x => x.id === nodeId);
  }

  findParentsByChildId(nodeId) {
    return this.edges
      .filter(e => e.to === nodeId)
      .map(e => e.from);
  }

  infer(nodeId, state) {
    // TODO: NEED TO REFACTOR THIS!!!
    let joint = [];

    /*
     * Build joint distribution
     */
    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      let parents = this.findParentsByChildId(node.id);

      let p = { node: node.id, state: null };
      let q = parents.map(x => ({ node: x, state: null }));

      joint.push({ p: p, q: q });
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
    for (let i = joint.length - 1; i > -1; i--) {
      let rem = false;

      for (let j = 0; j < joint[i].length; j++) {
        let ooo = joint[i][j].p;

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
    let prob = 0;

    for (let i = 0; i < joint.length; i++) {
      let aux = 1;

      for (let j = 0; j < joint[i].length; j++) {
        let ooo = joint[i][j];
        let node = this.findNodeById(ooo.p.node);
        let si = node.states.indexOf(ooo.p.state);

        for (let c = 0; c < node.cpt.length; c++) {
          let a = true;

          for (let cc = 0; cc < ooo.q.length; cc++) {
            for (let ccc = 0; ccc < node.cpt[c].conditions.length; ccc++) {
              if (ooo.q[cc].node === node.cpt[c].conditions[ccc].parent && ooo.q[cc].state !==  node.cpt[c].conditions[ccc].state) {
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
}

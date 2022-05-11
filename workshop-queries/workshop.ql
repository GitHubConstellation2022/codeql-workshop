/**
 * @kind path-problem
 */

import javascript
import DataFlow::PathGraph

predicate isCondition(Expr expr) { exists(ConditionGuardNode cgn | expr = cgn.getTest()) }

class Config extends DataFlow::Configuration {
  Config() { this = "always true" }

  override predicate isSource(DataFlow::Node source) {
    source.asExpr() =
      any(ObjectExpr oe |
        oe.getEnclosingFunction().getName() = "verify" and oe.getAProperty().getName() = "verified"
      )
  }

  override predicate isSink(DataFlow::Node sink) { isCondition(sink.asExpr()) }
}

from Config config, DataFlow::PathNode source, DataFlow::PathNode sink
where config.hasFlowPath(source, sink)
select sink, source, sink, "always true"

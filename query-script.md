# Query script

## Problem description

[CVE-2021-32685](https://github.com/TogaTech/tEnvoy/security/advisories/GHSA-7r96-8g3x-g36m): Improper verification of a cryptographic signature in the JavaScript encryption library [tEnvoy](https://tenvoy.js.org/) (`< v7.0.3`).

A function called [`verify()`](https://github.com/TogaTech/tEnvoy/blob/4e7169cfa1107077a2d55eac8b03f9fce299783e/node/tenvoy.js#L2138) returns a dict with a field named [`verified`](https://github.com/TogaTech/tEnvoy/blob/4e7169cfa1107077a2d55eac8b03f9fce299783e/node/tenvoy.js#L2150) which in turn holds `true` if the SHA-512 signature stored within parameter [`signed`](https://github.com/TogaTech/tEnvoy/blob/4e7169cfa1107077a2d55eac8b03f9fce299783e/node/tenvoy.js#L2138) is valid. A second function, [`verifyWithMessage()`](https://github.com/TogaTech/tEnvoy/blob/4e7169cfa1107077a2d55eac8b03f9fce299783e/node/tenvoy.js#L2169), uses `verify()` to check the validity of a message's signature. Unfortunately, instead of checking the `verified` field, it uses `verify()`'s returned dict. A JavaScript dict interpreted as a boolean will always evaluate to `true`, thus rendering the check ineffectual.

[patch commit](https://github.com/TogaTech/tEnvoy/commit/a121b34a45e289d775c62e58841522891dee686b)

## 1 (Example)
To get an idea of "what's out there", let's try finding all functions named `verify()`:

```CodeQL
import javascript

from Function f
where f.getName() = "verify"
select f
```
(94 results)

## 2 (Warm-up)
Up until now, we merely found definitions of functions named "verify". However, the actual vulnerability manifests itself when those functions are called in "problematic" ways. We will later have to define what "problematic" means, but for now we are only interested in finding call sites.

<b>Warm-up challenge:</b>
Use [DataFlow::InvokeNode](https://codeql.github.com/codeql-standard-libraries/javascript/semmle/javascript/dataflow/Nodes.qll/type.Nodes$InvokeNode.html) and its member predicate [getACallee](https://codeql.github.com/codeql-standard-libraries/javascript/semmle/javascript/dataflow/Nodes.qll/predicate.Nodes$InvokeNode$getACallee.0.html) to find calls to functions named "verify".

<b>Solution:</b>
```CodeQL
import javascript

from Function f, DataFlow::InvokeNode call
where f.getName() = "verify" and call.getACallee() = f
select call, f
```
(12 results)

## 3
As we have seen in [section 1](#1) there are 94 functions named "verify". Not all of those trigger the vulnerability we are after, so we need to be a bit more specific. Let's find only those functions whose body contains an object expression with a field named `verified`. CodeQL ships with support for various syntactic JavaScript constructs. We may consult the [documentation](https://codeql.github.com/docs/codeql-language-guides/codeql-library-for-javascript/) to find out how we can reason about [object expressions](https://codeql.github.com/codeql-standard-libraries/javascript/semmle/javascript/Expr.qll/type.Expr$ObjectExpr.html). You may also find what you want by using autocompletion which will display some documentation...

<b>Challenge:</b>
```CodeQL
import javascript

from Function f, ObjectExpr oe
where
  f.getName() = "verify" and
  oe.getEnclosingFunction() = _ and  // TODO: replace `_` with the appropriate variable
  oe.getAProperty().getName() = _    // TODO: replace `_` with an appropriate string
select oe
```
<b>Solution:</b>
```CodeQL
import javascript

from Function f, ObjectExpr oe
where
  f.getName() = "verify" and
  oe.getEnclosingFunction() = f and
  oe.getAProperty().getName() = "verified"
select oe
```
(2 results)

## 4

Now that we have a more accurate description of our function we still have to define what it means to call said function in a "problematic" way. Recall that the vulnerability arose from the fact that a caller used its return value, an object expression, as if it was a boolean. More specifically, it was being used as if it was a condition variable with a boolean value. CodeQL's JavaScript library has a class which describes expressions which are used as conditions: the [ConditionGuardNode](https://codeql.github.com/codeql-standard-libraries/javascript/semmle/javascript/CFG.qll/type.CFG$ConditionGuardNode.html). This is a type of node in the Control Flow Graph which records that some condition is known to be truthy or falsy at the point in the program where it appears. Let's use it to define a predicate `isCondition()`. Make use of the [exists](https://codeql.github.com/docs/ql-language-reference/formulas/#exists) quantifier.

<b>Challenge:</b>
```CodeQL
import javascript

predicate isCondition(Expr expr) {
  // fill in the body of the predicate
  // Use Quick Evaluation to test the predicate
}

select 1  // stub query body
```

<b>Solution:</b>
```CodeQL
import javascript

predicate isCondition(Expr expr) { exists(ConditionGuardNode cgn | expr = cgn.getTest()) }

select 1  // stub query body
```

## 5

<b>Challenge:</b>
```CodeQL
/**
 * @kind path-problem
 */

import javascript
import DataFlow::PathGraph

class Config extends DataFlow::Configuration {
  Config() { this = "always true" }

  override predicate isSource(DataFlow::Node source) {
    // fill in the body of this member predicate
  }

  override predicate isSink(DataFlow::Node sink) {
    // fill in the body of this member predicate
    // you can use the isCondition() predicate we created earlier
  }
}

from Config config, DataFlow::PathNode source, DataFlow::PathNode sink
where            // fill in the where clause
select sink, source, sink, "always true"
```

<b>Solution:</b>
```CodeQL
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
```
(2 results)

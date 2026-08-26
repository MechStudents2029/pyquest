import type { HiddenTest } from "../domain/types";

export function buildPythonHarness(
  source: string,
  tests: readonly HiddenTest[],
): string {
  const sourceJson = JSON.stringify(source);
  const testsJson = JSON.stringify(tests);
  return `
import contextlib
import io
import json
import traceback

_source = json.loads(${JSON.stringify(sourceJson)})
_tests = json.loads(${JSON.stringify(testsJson)})
_stdout = io.StringIO()
_stderr = io.StringIO()
_results = []
_namespace = {}

with contextlib.redirect_stdout(_stdout), contextlib.redirect_stderr(_stderr):
    try:
        exec(_source, _namespace)
    except Exception:
        _trace = traceback.format_exc()
        for _case in _tests:
            _results.append({
                "kind": "error",
                "label": _case["label"],
                "traceback": _trace,
            })
    else:
        for _case in _tests:
            try:
                _actual = _namespace[_case["functionName"]](*_case["args"])
                _expected = _case["expected"]
                if bool(_actual == _expected):
                    _results.append({"kind": "passed", "label": _case["label"]})
                else:
                    _results.append({
                        "kind": "failed",
                        "label": _case["label"],
                        "expected": repr(_expected),
                        "actual": repr(_actual),
                    })
            except Exception:
                _results.append({
                    "kind": "error",
                    "label": _case["label"],
                    "traceback": traceback.format_exc(),
                })

json.dumps({
    "stdout": _stdout.getvalue(),
    "stderr": _stderr.getvalue(),
    "results": _results,
})
`;
}

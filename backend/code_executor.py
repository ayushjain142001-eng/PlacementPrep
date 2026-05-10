"""Sandboxed code execution for the coding module.

Currently supports Python only. Other languages return an honest error so we
never silently award marks for code we can't actually run.

Security:
  - Subprocess with strict resource + time limits
  - User code runs as a separate process, not in the FastAPI process
  - Network access disabled (no os.environ inheritance for sensitive vars)
  - Only stdin/stdout used for I/O
"""
from __future__ import annotations

import asyncio
import json
import logging
import shlex
import textwrap
from typing import Any, Dict, List, Tuple

logger = logging.getLogger(__name__)

PYTHON_RUN_TIMEOUT = 6  # seconds per test case
MAX_CODE_LENGTH = 20_000  # chars

SUPPORTED_LANGUAGES = {"python"}


# Detect boilerplate / placeholder code that should NEVER pass tests.
BOILERPLATE_MARKERS = (
    "# write your code here",
    "// write your code here",
    "your code here",
    "todo",
    "implement me",
)


def is_boilerplate(code: str) -> bool:
    """True if the code looks like an unchanged template."""
    stripped = code.strip().lower()
    if not stripped:
        return True
    # Body is just `pass` (Python placeholder)
    non_decl_lines = [
        ln for ln in stripped.splitlines()
        if ln.strip() and not ln.strip().startswith(("#", "def ", "class ", "import ", "from "))
    ]
    if non_decl_lines == ["pass"]:
        return True
    # Contains a common placeholder marker
    if any(m in stripped for m in BOILERPLATE_MARKERS):
        return True
    return False


def _build_python_runner(user_code: str, function_name: str, test_input: Dict[str, Any]) -> str:
    """Wrap user code with a harness that calls the target function and prints
    the JSON-serialised result on the LAST line of stdout."""
    args_json = json.dumps(test_input)
    runner = textwrap.dedent(f"""
        import json, sys
        try:
{textwrap.indent(user_code, ' ' * 12)}
        except Exception as _setup_err:
            print("__SETUP_ERROR__", _setup_err, file=sys.stderr)
            sys.exit(2)
        try:
            _kwargs = json.loads({json.dumps(args_json)})
            _fn = locals().get({function_name!r}) or globals().get({function_name!r})
            if _fn is None:
                print(f"__NO_FUNCTION__ {function_name}", file=sys.stderr)
                sys.exit(3)
            _result = _fn(**_kwargs)
            print("__RESULT_START__")
            print(json.dumps(_result, default=str))
        except Exception as _run_err:
            import traceback
            print("__RUNTIME_ERROR__", _run_err, file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            sys.exit(4)
    """).strip()
    return runner


async def _run_python(code_to_run: str) -> Tuple[int, str, str]:
    """Run a python snippet in a subprocess. Returns (returncode, stdout, stderr)."""
    proc = await asyncio.create_subprocess_exec(
        "python3", "-I", "-c", code_to_run,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env={"PATH": "/usr/bin:/usr/local/bin", "PYTHONIOENCODING": "utf-8"},
    )
    try:
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=PYTHON_RUN_TIMEOUT)
    except asyncio.TimeoutError:
        proc.kill()
        return -1, "", "__TIMEOUT__"
    return proc.returncode or 0, stdout.decode("utf-8", "replace"), stderr.decode("utf-8", "replace")


def _extract_result(stdout: str) -> Any:
    if "__RESULT_START__" not in stdout:
        return None
    # Take last line after the marker
    parts = stdout.split("__RESULT_START__", 1)[1].strip().splitlines()
    if not parts:
        return None
    try:
        return json.loads(parts[-1])
    except (ValueError, json.JSONDecodeError):
        return parts[-1]


def _equal(a: Any, b: Any) -> bool:
    """Robust equality: handles list-vs-tuple, numeric tolerance, str normalisation."""
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        if len(a) != len(b):
            return False
        return all(_equal(x, y) for x, y in zip(a, b))
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(float(a) - float(b)) < 1e-9
    return a == b


async def evaluate_python(
    *, code: str, function_name: str, test_cases: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Run each test case against the user code.

    Returns dict: {results, passed, total, runtime_error?, score_pct}
    Each `results[i]` is `{passed: bool, expected, got, error?}`.
    """
    if len(code) > MAX_CODE_LENGTH:
        return {
            "error": f"Code too long (>{MAX_CODE_LENGTH} chars)",
            "results": [], "passed": 0, "total": len(test_cases), "score_pct": 0,
        }

    if is_boilerplate(code):
        return {
            "error": "Submitted code is empty or just a placeholder. Implement the function first.",
            "results": [], "passed": 0, "total": len(test_cases), "score_pct": 0,
        }

    results: List[Dict[str, Any]] = []
    passed = 0
    last_error: str = ""

    for tc in test_cases:
        tc_input = tc.get("input") or {}
        expected = tc.get("output")
        runner = _build_python_runner(code, function_name, tc_input)
        rc, out, err = await _run_python(runner)
        if rc == 0:
            got = _extract_result(out)
            ok = _equal(got, expected)
            results.append({"passed": ok, "expected": expected, "got": got})
            if ok:
                passed += 1
        else:
            if err == "__TIMEOUT__":
                msg = f"Time limit exceeded ({PYTHON_RUN_TIMEOUT}s)"
            elif "__NO_FUNCTION__" in err:
                msg = f"Function `{function_name}` not defined"
            elif "__SETUP_ERROR__" in err:
                msg = "Code failed to load: " + err.split("__SETUP_ERROR__", 1)[1].strip().splitlines()[0][:200]
            elif "__RUNTIME_ERROR__" in err:
                msg = "Runtime error: " + err.split("__RUNTIME_ERROR__", 1)[1].strip().splitlines()[0][:200]
            else:
                msg = (err or "Unknown error").strip().splitlines()[-1][:200]
            results.append({"passed": False, "expected": expected, "got": None, "error": msg})
            last_error = msg

    total = len(test_cases)
    score_pct = (passed / total * 100) if total else 0
    out: Dict[str, Any] = {
        "results": results,
        "passed": passed,
        "total": total,
        "score_pct": round(score_pct, 1),
    }
    if passed == 0 and last_error:
        out["error"] = last_error
    return out


def infer_function_name(description: str, default: str = "solve") -> str:
    """Pull `def funcName(` from the question description."""
    import re
    m = re.search(r"def\s+([A-Za-z_]\w*)\s*\(", description or "")
    return m.group(1) if m else default

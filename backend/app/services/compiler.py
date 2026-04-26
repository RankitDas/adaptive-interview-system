import os
import shutil
import subprocess
import tempfile


def compile_and_run_c(code: str, stdin: str = ""):
    gcc_path = shutil.which("gcc")

    if not gcc_path:
        return {
            "compiled_successfully": False,
            "stdout": "",
            "stderr": "GCC is not available on this server.",
            "compile_stdout": "",
            "compile_stderr": "GCC is not available on this server.",
            "exit_code": None,
            "timed_out": False,
            "compiler_available": False,
            "language": "c",
        }

    if not code.strip():
        return {
            "compiled_successfully": False,
            "stdout": "",
            "stderr": "No code was provided.",
            "compile_stdout": "",
            "compile_stderr": "No code was provided.",
            "exit_code": None,
            "timed_out": False,
            "compiler_available": True,
            "language": "c",
        }

    with tempfile.TemporaryDirectory() as temp_dir:
        source_path = os.path.join(temp_dir, "main.c")
        binary_path = os.path.join(temp_dir, "main.exe")

        with open(source_path, "w", encoding="utf-8") as source_file:
            source_file.write(code)

        try:
            compile_process = subprocess.run(
                [gcc_path, source_path, "-std=c11", "-O2", "-Wall", "-Wextra", "-o", binary_path],
                capture_output=True,
                text=True,
                timeout=15,
                cwd=temp_dir,
            )
        except subprocess.TimeoutExpired:
            return {
                "compiled_successfully": False,
                "stdout": "",
                "stderr": "Compilation timed out.",
                "compile_stdout": "",
                "compile_stderr": "Compilation timed out.",
                "exit_code": None,
                "timed_out": True,
                "compiler_available": True,
                "language": "c",
            }

        if compile_process.returncode != 0:
            return {
                "compiled_successfully": False,
                "stdout": "",
                "stderr": compile_process.stderr.strip(),
                "compile_stdout": compile_process.stdout.strip(),
                "compile_stderr": compile_process.stderr.strip(),
                "exit_code": compile_process.returncode,
                "timed_out": False,
                "compiler_available": True,
                "language": "c",
            }

        try:
            run_process = subprocess.run(
                [binary_path],
                input=stdin,
                capture_output=True,
                text=True,
                timeout=5,
                cwd=temp_dir,
            )
        except subprocess.TimeoutExpired:
            return {
                "compiled_successfully": True,
                "stdout": "",
                "stderr": "Program execution timed out.",
                "compile_stdout": compile_process.stdout.strip(),
                "compile_stderr": compile_process.stderr.strip(),
                "exit_code": None,
                "timed_out": True,
                "compiler_available": True,
                "language": "c",
            }

        return {
            "compiled_successfully": True,
            "stdout": run_process.stdout.strip(),
            "stderr": run_process.stderr.strip(),
            "compile_stdout": compile_process.stdout.strip(),
            "compile_stderr": compile_process.stderr.strip(),
            "exit_code": run_process.returncode,
            "timed_out": False,
            "compiler_available": True,
            "language": "c",
        }

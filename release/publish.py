"""Контролируемая публикация реальных ZIP МГЛОТЕКА на GitHub Releases."""
import json
import os
import re
import subprocess
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REQUEST = HERE / "request.json"
SEMVER = re.compile(r"^[0-9]+\.[0-9]+\.[0-9]+$")
ARTIFACT = "MGLOTEK-Game-Windows"


def request():
    data = json.loads(REQUEST.read_text(encoding="utf-8"))
    mode = data.get("mode", "check")
    version = os.getenv("INPUT_VERSION") or data.get("version", "")
    run = os.getenv("INPUT_RUN") or data.get("source_run", "")
    if mode not in ("check", "publish"):
        raise ValueError("mode must be check or publish")
    if mode == "publish" or version or run:
        if not SEMVER.fullmatch(str(version)):
            raise ValueError("version must be X.Y.Z")
        if not str(run).isdigit() or int(run) <= 0:
            raise ValueError("source_run must be a positive numeric GitHub Actions run id")
    return {"mode": mode, "version": str(version), "source_run": str(run)}


def validate_game_zip(path):
    path = Path(path)
    if not path.is_file():
        raise ValueError("Missing game archive")
    if path.stat().st_size > 1_800_000_000:
        raise ValueError("Archive too large")
    with zipfile.ZipFile(path, "r") as z:
        if z.testzip() is not None:
            raise ValueError("Corrupted ZIP member")
        files = [i for i in z.infolist() if not i.is_dir()]
        if not files or len(files) > 20000:
            raise ValueError("Invalid number of files")
        if sum(i.file_size for i in files) > 2_500_000_000:
            raise ValueError("Excessive uncompressed size")
        names = set()
        for item in files:
            p = item.filename.replace("\\", "/")
            parts = p.split("/")
            if p.startswith("/") or ".." in parts or not p or ":" in p:
                raise ValueError("Unsafe ZIP path: " + p)
            if p in names:
                raise ValueError("Duplicate ZIP path: " + p)
            names.add(p)
        for required in ("main.py", "start_windows.bat", "requirements.txt"):
            if not any(n == required or n.endswith("/" + required) for n in names):
                raise ValueError("Missing required game file: " + required)
        if any(n.endswith("/data/meta.json") or n == "data/meta.json" for n in names):
            raise ValueError("Do not distribute a user's meta save")
    return len(files)


def gh(*args):
    proc = subprocess.run(["gh", *args], capture_output=True, text=True, check=False)
    if proc.returncode:
        raise RuntimeError("gh failed: " + (proc.stderr or proc.stdout)[-600:])
    return proc.stdout.strip()


def publish(spec):
    tag = "mglotek-v" + spec["version"]
    run = spec["source_run"]
    meta = json.loads(gh("api", "repos/" + os.environ["GH_REPO"] + "/actions/runs/" + run))
    if meta.get("conclusion") != "success":
        raise RuntimeError("Refusing an unverified or failed Actions run")
    if meta.get("repository", {}).get("full_name") != os.environ["GH_REPO"]:
        raise RuntimeError("Actions run belongs to a different repository")
    if meta.get("head_branch") != "mglotek-cloud-render":
        raise RuntimeError("Unexpected workflow branch")
    dst = Path("release_staging")
    dst.mkdir(exist_ok=True)
    gh("run", "download", run, "--repo", os.environ["GH_REPO"],
       "--name", ARTIFACT, "--dir", str(dst))
    found = list(dst.glob("*.zip"))
    if len(found) != 1:
        raise ValueError("Expected exactly one Windows game ZIP in the Actions artifact")
    count = validate_game_zip(found[0])
    output = dst / ("MGLOTEK_v" + spec["version"] + "_Windows.zip")
    if found[0] != output:
        found[0].rename(output)
    import hashlib
    checksum = hashlib.sha256(output.read_bytes()).hexdigest()
    checksums = dst / "SHA256SUMS.txt"
    checksums.write_text(checksum + "  " + output.name + "\n", encoding="ascii")
    # No accidental overwrite of an existing public release.
    exists = subprocess.run(["gh", "release", "view", tag, "--repo", os.environ["GH_REPO"]],
                            capture_output=True, text=True)
    if exists.returncode == 0:
        raise ValueError("Release already exists: " + tag)
    notes = dst / "RELEASE_NOTES.md"
    notes.write_text(
        "# МГЛОТЕК " + spec["version"] +
        "\n\nWindows ZIP. Python 3.11 + pygame.\n\n"
        + "Game files verified: " + str(count) + ".\n"
        + "Source GitHub Actions run: " + run + ".\n"
        + "This package does not install Blender or ComfyUI on the player's PC.\n",
        encoding="utf-8",
    )
    gh("release", "create", tag, str(output), str(checksums), "--repo",
       os.environ["GH_REPO"], "--target", os.environ["GITHUB_SHA"],
       "--title", "МГЛОТЕК v" + spec["version"] + " — Windows",
       "--notes-file", str(notes), "--latest")
    print("Release verified:", "https://github.com/" + os.environ["GH_REPO"] +
          "/releases/tag/" + tag)


if __name__ == "__main__":
    spec = request()
    print("Release request:", spec)
    if sys.argv[1:] == ["check"]:
        print("Validation OK; no release is created in check mode.")
    elif sys.argv[1:] == ["publish"]:
        if spec["mode"] == "publish" or os.getenv("INPUT_VERSION"):
            publish(spec)
        else:
            print("No publish request: setup checked only.")
    else:
        raise SystemExit("Usage: publish.py check|publish")

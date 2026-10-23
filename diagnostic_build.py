"""Approved one-shot synthetic Linux acceptance; original Node service unchanged."""
import hashlib
import os
from pathlib import Path
import platform
import subprocess
import sys
import tempfile
import time
import zipfile

EXPECTED = 'af3dbaf3bc4da54a63ad804cb598c98871c8ec8acc051ab93fb2bdec0de0dd4b'
repo = Path(__file__).resolve().parent
archive = repo / 'flower-isolation.zip'
assert platform.system() == 'Linux', 'Linux required'
assert sys.version_info >= (3, 10), 'Python >=3.10 required'
assert hashlib.sha256(archive.read_bytes()).hexdigest() == EXPECTED, 'archive mismatch'
deadline = time.monotonic() + 840
print('ACCEPTANCE archive_sha256=' + EXPECTED, flush=True)
print('ACCEPTANCE host_python=' + platform.python_version(), flush=True)

with tempfile.TemporaryDirectory(prefix='flower-acceptance-') as scratch:
    base = Path(scratch)
    clean = {'PATH': os.environ['PATH'], 'HOME': scratch, 'TMPDIR': scratch,
             'LANG': 'C.UTF-8', 'PYTHONDONTWRITEBYTECODE': '1',
             'PIP_CONFIG_FILE': '/dev/null', 'PIP_DISABLE_PIP_VERSION_CHECK': '1',
             'PIP_NO_CACHE_DIR': '1'}
    def run(argv, cwd, limit):
        left = min(limit, deadline-time.monotonic())
        if left <= 0:
            raise TimeoutError('acceptance deadline')
        subprocess.run(argv, cwd=cwd, env=clean, check=True, timeout=left)
    pack = base / 'pack'
    with zipfile.ZipFile(archive) as z:
        for item in z.infolist():
            target = (pack / item.filename).resolve()
            assert target.is_relative_to(pack.resolve()), 'invalid archive path'
        z.extractall(pack)
    for name in ('package.json','server.cjs','core.cjs','client.js','index.html','test.cjs'):
        assert (pack/name).read_bytes() == (repo/name).read_bytes(), name + ' differs'
    run(['npm', 'test'], repo, 60)
    venv = base / 'venv'
    run([sys.executable, '-m', 'venv', str(venv)], repo, 60)
    python = venv / 'bin/python3'
    run([str(python), '-m', 'pip', 'install', '--index-url', 'https://pypi.org/simple',
         '--only-binary=:all:', '--retries', '1', '--timeout', '30',
         '-r', str(pack/'verification/requirements-linux.txt')], repo, 300)
    clean['PATH'] = str(venv/'bin') + os.pathsep + clean['PATH']
    run(['sh', str(pack/'verification/run-linux.sh')], pack, 330)
    print('ACCEPTANCE PASS: packaged Linux integration and original diagnostic', flush=True)

"""Approved isolated Linux delta checks; no runtime or public endpoint changes."""
import os,sys,subprocess,tempfile,zipfile,hashlib,platform
from pathlib import Path
repo=Path(__file__).resolve().parent
assert platform.system()=='Linux'
archive=repo/'linux-quiescence.zip'
assert hashlib.sha256(archive.read_bytes()).hexdigest()=='a20e6bd938d44680b6c023794bbcf60149fde7c944efa85b14054d5b4e206c4c'
print('QUIESCENCE_ARCHIVE '+'a20e6bd938d44680b6c023794bbcf60149fde7c944efa85b14054d5b4e206c4c',flush=True)
with tempfile.TemporaryDirectory(prefix='flower-verification-build-') as scratch:
    base=Path(scratch);pack=base/'pack'
    with zipfile.ZipFile(archive) as z:
        for n in z.namelist():assert (pack/n).resolve().is_relative_to(pack.resolve())
        z.extractall(pack)
    clean={'PATH':os.environ['PATH'],'HOME':scratch,'TMPDIR':scratch,'LANG':'C.UTF-8','PYTHONDONTWRITEBYTECODE':'1','PIP_CONFIG_FILE':'/dev/null','PIP_DISABLE_PIP_VERSION_CHECK':'1','PIP_NO_CACHE_DIR':'1'}
    venv=base/'venv'
    subprocess.run([sys.executable,'-m','venv',str(venv)],env=clean,check=True,timeout=60)
    py=venv/'bin/python3'
    subprocess.run([str(py),'-m','pip','install','--index-url','https://pypi.org/simple','--only-binary=:all:','--retries','1','--timeout','30','-r',str(pack/'verification/requirements-linux.txt')],env=clean,check=True,timeout=300)
    clean['PATH']=str(venv/'bin')+os.pathsep+clean['PATH']
    clean['PYTHONPATH']=str(pack/'verification')+os.pathsep+str(pack/'verification/candidate')
    subprocess.run([str(py),str(pack/'verification/integrated_linux.py')],env=clean,check=True,timeout=120)

    subprocess.run([str(py),str(pack/"verification/delta_checks.py")],env=clean,check=True,timeout=120)

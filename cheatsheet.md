Generate requirements.txt

```
pip freeze > requirements.txt
```

Install dependencies

```
pip install -r requirements.txt
```

How to compile Python + Electron JS into desktop app (exe)
https://stackoverflow.com/questions/67146654/how-to-compile-python-electron-js-into-desktop-app-exe

Create a Virtual Environment

```
python -m venv venv
```

Activate the Virtual Environment

```
source venv/bin/activate
```

Install package

```
pip install translate
```

Verify Installation

```
pip list
```

Update requirements.txt:

```
pip freeze > requirements.txt
```

# build with quasar cli

-T Electron with default "@electron/packager" bundler (default: yours)
[darwin|win32|linux|mas|all]

-A App architecture (default: yours) - with default "@electron/packager" bundler:
[ia32|x64|armv7l|arm64|mips64el|all]

```
quasar build -m electron -T darwin -A arm64
```

ref: https://quasar.dev/quasar-cli-vite/commands-list#build

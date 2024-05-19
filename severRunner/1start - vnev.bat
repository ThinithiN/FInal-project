@echo off

REM Set the path to your virtual environment
set VENV_PATH=.\venv  REM Update with your virtual environment path

REM Activate the virtual environment
call myenv\Scripts\activate

REM Run the Python script
python severRunner.py

REM Deactivate the virtual environment
deactivate

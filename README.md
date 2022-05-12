# GitHub Constellation India CodeQL Workshop Starter

A starter workspace to for the GitHub Constellation India CodeQL workshop.

## Hardware Requirements

To make sure you can follow the workshop exercises we recommend a machine with

* recommended specs:
  * 4 cores
  * 16GB RAM
  * solid state disk with at least 5GB of free disk space

* minimal specs:
  * 2 cores
  * 8GB RAM
  * at least 5GB of free disk space

## Instructions

1. Install [Visual Studio Code](https://code.visualstudio.com).
1. Install the [CodeQL extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=github.vscode-codeql). Quick shortcut: Ctrl+P, paste `ext install GitHub.vscode-codeql` and press enter.
1. Clone this repository to your computer.
1. Open the `constellation-codeql-starter.code-workspace` in your favorite text editor and for the `codeQL.cli.executablePath` setting type the absolute path to the cli/codeql.exe file within your checkout, for example: `"codeQL.cli.executablePath": "C:/Users/michael/mycheckout/cli/codeql.exe"` on Windows or `"codeQL.cli.executablePath": "/home/michael/mycheckout/cli/codeql"` on MacOSX and Linux.
1. In VS Code, click `File` > `Open Workspace from File...` Select the file `vscode-codeql-starter.code-workspace` in your checkout of this repository.
1. You will see several folders open in the left sidebar:
    - The `workshop-queries` folder contains the `example.ql` and the `workshop.ql` query files. We will write all our code into the latter.
    - The `ql` folder contains the open-source CodeQL standard library for JavaScript.
1. Click the `QL` button on the sidebar on the left.
1. Within the `Databases` section (which should appear uncollapsed by default) click `From an archive`.
1. Give the path to the `tenvoy-db.zip` in your checkout.
1. This should mark the database as selected in the `Databases` section.
1. Switch to the CodeQL workspace by clicking the "two sheets button" on the sidebar.
1. Uncollapse the `Constellation-CodeQL-Starter` section.
1. Uncollapse the `workshop-queries` section.
1. Open `example.ql`.
1. Right-click and `CodeQL:Run Query` to see whether your setup works.
1. We will write our workshop queries into `workshop.ql`.

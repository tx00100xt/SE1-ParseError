## Serious Sam Classic Parse Error
![Build status](https://github.com/tx00100xt/SE1-ParseError/actions/workflows/cibuild.yml/badge.svg)
[![License: GPL v2](https://img.shields.io/badge/License-GPL_v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/tx00100xt/SE1-ParseError)

What is Parse Error?  
This is a modification for Serious Sam Classic The First Encounter and Serious Sam Classic The Second Encounter.  
This mod required https://github.com/tx00100xt/SeriousSamClassic or https://github.com/tx00100xt/SeriousSamClassic-VK to run.  
Parse Error was created by fans of the game Serious Sam Classic and is distributed for free.    

Description:  
Parse Error is a game Modification for Serious Sam Classic.  
Ton's of new game options allow you to create almost any type of Game Mode your little heart desires. New features include a Dual 
Mini, Da Bomb and an alternate fire on several of the weapons. Crank up the Enemy Max as high as you can and let the InSamnity begin!!!    

Author:  
DwK (Dance with Kleer) is author this mod for windows.

![PEFE](https://raw.githubusercontent.com/tx00100xt/SE1-ParseError/main/Images/pefe.png)

![PESE](https://raw.githubusercontent.com/tx00100xt/SE1-ParseError/main/Images/pese.png)


Download [SamTFE-ParseError.tar.xz] archive and unpack to  SeriousSamClassic/SamTFE/ directory.
Download [SamTSE-ParseError.tar.xz] archive and unpack to  SeriousSamClassic/SamTSE/ directory.
To start the modification, use the game menu - item Modification.

Building Serious Sam Classic Parse Error modification (for SS:TFE and for SS:TSE).
----------------------------------------------------------------------------------

### Linux

Type this in your terminal:

```
git clone https://github.com/tx00100xt/SE1-ParseError.git
cd SE1-ParseError/Sources
./build-linux64.sh              # use build-linux32.sh for 32-bits
./build-linux64xplus.sh         # use build-linux32xplus.sh for 32-bits
```
After that , libraries will be collected in the x32 or x64 directory . 
Copy them to SeriousSamClassic/SamTFE/Mods/PEFE2/Bin, SeriousSamClassic/SamTFE/Mods/PEFE2HD/Bin,
SeriousSamClassic/SamTSE/Mods/PESE2/Bin, SeriousSamClassic/SamTSE/Mods/PESE2HD/Bin folder.

### Gentoo

To build a game for gentoo, use a https://github.com/tx00100xt/serioussam-overlay containing ready-made ebuilds for building the game and add-ons.

### Arch Linux

To build a game under Arch Linux you can use the package from AUR: https://aur.archlinux.org/packages/serioussam

### Raspberry Pi

The build for raspberry pi is similar to the build for Linux, you just need to add an additional build key.

```
cd SE1-ParseError/Sources
./build-linux64.sh -DRPI4=TRUE             # use build-linux32.sh for 32-bits
./build-linux64xplus.sh -DRPI4=TRUE        # use build-linux32xplus.sh for 32-bits
```
### FreeBSD

Install bash. 
Type this in your terminal:

```
git clone https://github.com/tx00100xt/SE1-ParseError.git
cd SE1-ParseError/Sources
bash build-linux64.sh                     # use build-linux32.sh for 32-bits
bash build-linux64xplus.sh                # use build-linux32xplus.sh for 32-bits
```
After that , libraries will be collected in the x32 or x64 directory . 
Copy them to SeriousSamClassic/SamTFE/Mods/PEFE2/Bin, SeriousSamClassic/SamTFE/Mods/PEFE2HD/Bin,
SeriousSamClassic/SamTSE/Mods/PESE2/Bin, SeriousSamClassic/SamTSE/Mods/PESE2HD/Bin folder.

Windows
-------
* This project can be compiled starting from Windows 7 and higher.

1. Download and Install [Visual Studio 2015 Community Edition] or higher.
2. Download and Install [Windows 10 SDK 10.0.14393.795] or other.
3. Open the solution in the Sources folder, select Release x64 or Release Win32 and compile it.

Supported Architectures
----------------------
* `x86`
* `aarch64`
* `e2k` (elbrus)

Supported OS
-----------
* `Linux`
* `FreeBSD`
* `Windows`
* `Raspberry PI OS`

License
-------

* Serious Engine v1.10 is licensed under the GNU GPL v2 (see LICENSE file).


[SamTFE-ParseError.tar.xz]: https://drive.google.com/file/d/1oZG0kJYdlJQePfo5UN8_V6--JG0Ui0Kv/view?usp=sharing "Serious Sam Classic PEFE Mod"
[SamTSE-ParseError.tar.xz]: https://drive.google.com/file/d/1W4ykVtZY_8iUl1diZSgoB3oGZ48gbnIm/view?usp=sharing "Serious Sam Classic PESE Mod"
[Visual Studio 2015 Community Edition]: https://go.microsoft.com/fwlink/?LinkId=615448&clcid=0x409 "Visual Studio 2015 Community Edition"
[Windows 10 SDK 10.0.14393.795]: https://go.microsoft.com/fwlink/p/?LinkId=838916 "Windows 10 SDK 10.0.14393.795"

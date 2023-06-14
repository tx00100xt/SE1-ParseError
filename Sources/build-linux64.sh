#!/bin/bash

NCPU=`cat /proc/cpuinfo |grep vendor_id |wc -l`

if [[ $NCPU -eq 0 ]]
then
  let NCPU='4'
else
  let NCPU=$NCPU
fi

echo "Will build with 'make -j$NCPU' ... please edit this script if incorrect."

set -e
set -x

rm -rf build
mkdir build

# This is the eventual path for amd64.
cmake -B build -DCMAKE_BUILD_TYPE=Release $1 $2 $3 $4 $5 $6 $7 $8 $9
make -j$NCPU -C build
make install -C build

rm -rf build-xplus
mkdir build-xplus

# This is the eventual path for amd64.
cmake -B build-xplus -DCMAKE_BUILD_TYPE=Release -DXPLUS=TRUE $1 $2 $3 $4 $5 $6 $7 $8 $9
make -j$NCPU -C build-xplus
make install -C build-xplus

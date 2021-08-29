#!/usr/bin/env bash
start_hear=./sandbox
strip_cmd=./tools/strip_import_export.sh
echo  `basename \`pwd\``
if [ `basename \`pwd\`` != 'Snap' ]; then
    echo "execute only top directory"
    exit 1
fi  
find "$start_hear" -name "*.js" -exec "${strip_cmd}" \{\} \;